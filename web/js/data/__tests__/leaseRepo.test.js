/**
 * leaseRepo.test.js — T12 租约集合读写封装
 */
var store = require('../store').store;
var leaseRepo = require('../leaseRepo').leaseRepo;

beforeEach(function () {
  store._clearAll();
  leaseRepo.seed();
});

test('seed 注入示例租约', function () {
  expect(leaseRepo.list('house_demo_002').length).toBeGreaterThan(0);
});

test('list 按 houseId 过滤', function () {
  expect(leaseRepo.list('house_demo_001')).toEqual([]);
});

test('getByHouse 返回当前租约', function () {
  expect(leaseRepo.getByHouse('house_demo_002')._id).toBe('lease_demo_001');
});

test('create / get / update / remove', function () {
  var l = leaseRepo.create({ houseId: 'h_x', rent: 500000, deposit: 500000 });
  expect(l._id).toBeTruthy();
  leaseRepo.update(l._id, { rent: 600000 });
  expect(leaseRepo.get(l._id).rent).toBe(600000);
  expect(leaseRepo.remove(l._id)).toBe(true);
  expect(leaseRepo.get(l._id)).toBeNull();
});
