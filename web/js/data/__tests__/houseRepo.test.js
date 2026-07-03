var store = require('../store').store;
var houseRepo = require('../houseRepo').houseRepo;

beforeEach(function () {
  store._clearAll();
  houseRepo.seed();
});

describe('houseRepo（房源读写封装）', function () {
  test('seed 注入示例房源，含空置与已租', function () {
    var houses = houseRepo.list();
    expect(houses.length).toBeGreaterThanOrEqual(3);
    expect(houseRepo.countByStatus('vacant')).toBeGreaterThan(0);
    expect(houseRepo.countByStatus('rented')).toBeGreaterThan(0);
  });

  test('list(状态) 正确过滤', function () {
    var vacant = houseRepo.list('vacant');
    expect(vacant.length).toBeGreaterThan(0);
    expect(vacant.every(function (h) { return h.status === 'vacant'; })).toBe(true);
  });

  test('create 默认 status=vacant 且带时间戳', function () {
    var h = houseRepo.create({ nickname: '新房', address: 'addr' });
    expect(h.status).toBe('vacant');
    expect(typeof h._id).toBe('string');
    expect(h.createdAt).toBeDefined();
    expect(houseRepo.get(h._id).nickname).toBe('新房');
  });

  test('update / remove 链路', function () {
    var h = houseRepo.create({ nickname: 'A' });
    houseRepo.update(h._id, { nickname: 'B', status: 'rented' });
    expect(houseRepo.get(h._id).nickname).toBe('B');
    expect(houseRepo.get(h._id).status).toBe('rented');
    expect(houseRepo.remove(h._id)).toBe(true);
    expect(houseRepo.get(h._id)).toBeNull();
  });

  test('list 按 updatedAt 倒序（新建两房源之间保序，不受 seed 干扰）', function () {
    houseRepo.create({ nickname: '老', updatedAt: '2026-01-01T00:00:00.000Z' });
    houseRepo.create({ nickname: '新', updatedAt: '2026-06-01T00:00:00.000Z' });
    var all = houseRepo.list();
    var iOld = all.findIndex(function (h) { return h.nickname === '老'; });
    var iNew = all.findIndex(function (h) { return h.nickname === '新'; });
    expect(iNew).toBeLessThan(iOld);
  });
});
