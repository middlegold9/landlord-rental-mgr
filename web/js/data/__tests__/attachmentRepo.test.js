var store = require('../store').store;
var houseRepo = require('../houseRepo').houseRepo;
var attachmentRepo = require('../attachmentRepo').attachmentRepo;

beforeEach(function () {
  store._clearAll();
  houseRepo.seed();
  attachmentRepo.seed();
});

describe('attachmentRepo（附件读写封装）', function () {
  test('seed 注入示例附件', function () {
    expect(attachmentRepo.list().length).toBeGreaterThanOrEqual(2);
  });

  test('list(houseId) 按房源过滤', function () {
    var firstHouse = store.all('house')[0]._id;
    var rows = attachmentRepo.list(firstHouse);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(function (r) { return r.houseId === firstHouse; })).toBe(true);
  });

  test('create 自动补 fileID', function () {
    var a = attachmentRepo.create({ houseId: 'h1', name: '合同.pdf', ext: 'pdf' });
    expect(typeof a.fileID).toBe('string');
    expect(attachmentRepo.get(a.fileID).name).toBe('合同.pdf');
  });

  test('remove 删除并查无', function () {
    var a = attachmentRepo.create({ houseId: 'h1', name: 'x' });
    expect(attachmentRepo.remove(a.fileID)).toBe(true);
    expect(attachmentRepo.get(a.fileID)).toBeNull();
  });
});
