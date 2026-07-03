/**
 * utilityRepo.test.js — T13 费用账户集合读写封装
 */
var store = require('../store').store;
var utilityRepo = require('../utilityRepo').utilityRepo;

beforeEach(function () {
  store._clearAll();
  utilityRepo.seed();
});

test('seed 注入示例费用账户', function () {
  expect(utilityRepo.list('house_demo_002').length).toBe(5);
});

test('list 按 houseId 过滤', function () {
  expect(utilityRepo.list('house_demo_001')).toEqual([]);
});

test('create / update / remove', function () {
  var u = utilityRepo.create({ houseId: 'h_x', type: 'water', accountNo: '水表 1' });
  expect(u._id).toBeTruthy();
  utilityRepo.update(u._id, { accountNo: '水表 2' });
  expect(utilityRepo.get(u._id).accountNo).toBe('水表 2');
  expect(utilityRepo.remove(u._id)).toBe(true);
  expect(utilityRepo.get(u._id)).toBeNull();
});
