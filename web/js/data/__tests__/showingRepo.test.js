/**
 * showingRepo.test.js — T9 带看集合读写封装（RED）
 */
var store = require('../store').store;
var showingRepo = require('../showingRepo').showingRepo;

beforeEach(function () {
  store._clearAll();
  showingRepo.seed();
});

test('seed 注入示例带看', function () {
  expect(showingRepo.list('house_demo_001').length).toBeGreaterThan(0);
});

test('create 默认 pending 且含 landlordEval', function () {
  var s = showingRepo.create({ houseId: 'h_x', prospectTenant: '张三' });
  expect(s.status).toBe('pending');
  expect(s.landlordEval && typeof s.landlordEval === 'object').toBe(true);
});

test('get / update / remove', function () {
  var s = showingRepo.create({ houseId: 'h_x', prospectTenant: '张三' });
  showingRepo.update(s._id, { status: 'done' });
  expect(showingRepo.get(s._id).status).toBe('done');
  expect(showingRepo.remove(s._id)).toBe(true);
  expect(showingRepo.get(s._id)).toBeNull();
});
