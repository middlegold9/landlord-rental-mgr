/**
 * repairRepo.test.js — T14 维修记录集合读写封装
 */
var store = require('../store').store;
var repairRepo = require('../repairRepo').repairRepo;

beforeEach(function () {
  store._clearAll();
  repairRepo.seed();
});

test('seed 注入示例维修记录', function () {
  expect(repairRepo.list('house_demo_001').length).toBeGreaterThan(0);
});

test('list 按 houseId 过滤并倒序', function () {
  var rows = repairRepo.list('house_demo_002');
  expect(rows.length).toBe(1);
  expect(rows[0]._id).toBe('rp_demo_002');
});

test('create / update / remove', function () {
  var r = repairRepo.create({ houseId: 'h_x', issue: '漏水', kind: 'in_unit', cost: 20000 });
  expect(r._id).toBeTruthy();
  repairRepo.update(r._id, { status: 'done' });
  expect(repairRepo.get(r._id).status).toBe('done');
  expect(repairRepo.remove(r._id)).toBe(true);
  expect(repairRepo.get(r._id)).toBeNull();
});
