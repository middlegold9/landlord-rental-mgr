/**
 * tenantRepo.test.js — T12 租客档案集合读写封装
 */
var store = require('../store').store;
var tenantRepo = require('../tenantRepo').tenantRepo;

beforeEach(function () {
  store._clearAll();
  tenantRepo.seed();
});

test('seed 注入示例租客', function () {
  expect(tenantRepo.getByLease('lease_demo_001')).not.toBeNull();
});

test('getByLease 按租约取档案', function () {
  expect(tenantRepo.getByLease('lease_demo_001').phone).toBe('13900000002');
});

test('create / update / remove', function () {
  var t = tenantRepo.create({ leaseId: 'lease_x', phone: '13700000001', wechat: 'wx_x' });
  expect(t._id).toBeTruthy();
  tenantRepo.update(t._id, { phone: '13700000002' });
  expect(tenantRepo.getByLease('lease_x').phone).toBe('13700000002');
  expect(tenantRepo.remove(t._id)).toBe(true);
  expect(tenantRepo.getByLease('lease_x')).toBeNull();
});
