/**
 * signingRepo.test.js — T11 签约状态机读写（RED）
 */
var store = require('../store').store;
var houseRepo = require('../houseRepo').houseRepo;
var signingRepo = require('../signingRepo').signingRepo;

beforeEach(function () {
  store._clearAll();
  houseRepo.seed();
  signingRepo.seed();
});

test('createOrGet 首次返回 talking', function () {
  var s = signingRepo.createOrGet('house_demo_001');
  expect(s.stage).toBe('talking');
});

test('createOrGet 同房源复用同一条', function () {
  var a = signingRepo.createOrGet('h_x');
  var b = signingRepo.createOrGet('h_x');
  expect(a._id).toBe(b._id);
});

test('advance 依次推进，终态翻转房源为已租', function () {
  var s = signingRepo.createOrGet('house_demo_001');
  s = signingRepo.advance(s._id); expect(s.stage).toBe('deposit');
  s = signingRepo.advance(s._id); expect(s.stage).toBe('signed');
  s = signingRepo.advance(s._id); expect(s.stage).toBe('keys');
  s = signingRepo.advance(s._id); expect(s.stage).toBe('rented');
  expect(houseRepo.get('house_demo_001').status).toBe('rented');
});

test('nextStage 映射', function () {
  expect(signingRepo.nextStage('talking')).toBe('deposit');
  expect(signingRepo.nextStage('rented')).toBeNull();
});

test('已到已租再 advance 返回 null', function () {
  var s = signingRepo.createOrGet('h_y');
  ['deposit', 'signed', 'keys', 'rented'].forEach(function () { s = signingRepo.advance(s._id); });
  expect(signingRepo.advance(s._id)).toBeNull();
});
