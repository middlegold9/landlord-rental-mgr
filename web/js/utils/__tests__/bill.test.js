/**
 * bill.test.js — T15/T16 账单生成纯函数
 */
var bill = require('../bill');

test('listPeriods 月付覆盖完整月份', function () {
  var ps = bill.listPeriods('2026-05-01', '2026-07-31', 'month');
  expect(ps.map(function (p) { return p.key; })).toEqual(['2026-05', '2026-06', '2026-07']);
  expect(ps[0].dueDate).toBe('2026-05-01');
});

test('listPeriods 季付按季度拆分', function () {
  var ps = bill.listPeriods('2026-05-01', '2026-11-30', 'quarter');
  expect(ps.map(function (p) { return p.key; })).toEqual(['2026-Q2', '2026-Q3', '2026-Q4']);
});

test('listPeriods 起止非法返回空', function () {
  expect(bill.listPeriods('2026-07-01', '2026-05-01', 'month')).toEqual([]);
  expect(bill.listPeriods('', '', 'month')).toEqual([]);
});

test('generateBills 月付每条一期、金额按分', function () {
  var lease = { _id: 'L1', startDate: '2026-05-01', endDate: '2026-07-31', rent: 680000, payCycle: 'month' };
  var bills = bill.generateBills(lease);
  expect(bills.length).toBe(3);
  expect(bills[0].period).toBe('2026-05');
  expect(bills[0].total).toBe(680000);
  expect(bills[0].leaseId).toBe('L1');
  expect(bills[0].status).toBe('unpaid');
});

test('generateBills 季付单期金额=月租×3', function () {
  var lease = { _id: 'L2', startDate: '2026-05-01', endDate: '2026-11-30', rent: 680000, payCycle: 'quarter' };
  var bills = bill.generateBills(lease);
  expect(bills.length).toBe(3);
  expect(bills[0].total).toBe(680000 * 3);
});

test('generateBills 租金缺失或周期非法返回空', function () {
  expect(bill.generateBills({ _id: 'L', startDate: '2026-05-01', endDate: '2026-06-01', rent: 0 })).toEqual([]);
  expect(bill.generateBills(null)).toEqual([]);
});
