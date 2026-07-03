/**
 * handoverRepo.test.js — T13 入驻交接单集合读写封装
 */
var store = require('../store').store;
var handoverRepo = require('../handoverRepo').handoverRepo;

beforeEach(function () {
  store._clearAll();
  handoverRepo.seed();
});

test('seed 注入示例交接单', function () {
  expect(handoverRepo.getByLease('lease_demo_001')).not.toBeNull();
});

test('save 按 leaseId 唯一：首次创建，再次更新同一条', function () {
  var h = handoverRepo.save('lease_x', { handedAt: '2026-07-01', items: [] });
  var id = h._id;
  var h2 = handoverRepo.save('lease_x', { handedAt: '2026-07-02', items: [] });
  expect(h2._id).toBe(id);
  expect(handoverRepo.getByLease('lease_x').handedAt).toBe('2026-07-02');
});

test('remove 删除交接单', function () {
  var h = handoverRepo.getByLease('lease_demo_001');
  expect(handoverRepo.remove(h._id)).toBe(true);
  expect(handoverRepo.getByLease('lease_demo_001')).toBeNull();
});
