/**
 * channelRepo.test.js — T8 渠道集合读写封装（RED）
 */
var store = require('../store').store;
var channelRepo = require('../channelRepo').channelRepo;

beforeEach(function () {
  store._clearAll();
  channelRepo.seed();
});

test('seed 注入示例渠道', function () {
  expect(channelRepo.list('house_demo_001').length).toBeGreaterThan(0);
});

test('list 按 houseId 过滤', function () {
  expect(channelRepo.list('house_demo_002')).toEqual([]);
});

test('create 补全默认值并落到 store', function () {
  var c = channelRepo.create({ houseId: 'h_x', type: 'agency', contact: '链家' });
  expect(c._id).toBeTruthy();
  expect(c.listed).toBe(false);
  expect(channelRepo.get(c._id).contact).toBe('链家');
});

test('get / update / remove', function () {
  var c = channelRepo.create({ houseId: 'h_x', contact: 'a' });
  channelRepo.update(c._id, { contact: 'b' });
  expect(channelRepo.get(c._id).contact).toBe('b');
  expect(channelRepo.remove(c._id)).toBe(true);
  expect(channelRepo.get(c._id)).toBeNull();
});
