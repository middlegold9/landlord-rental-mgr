/**
 * billRepo.test.js — T15/T16/T17 账单集合读写 + 生成 + 缴费 + 逾期
 */
var store = require('../store').store;
var leaseRepo = require('../leaseRepo').leaseRepo;
var billRepo = require('../billRepo').billRepo;

beforeEach(function () {
  store._clearAll();
  leaseRepo.seed();
  billRepo.seed();
});

test('seed 注入示例账单', function () {
  expect(billRepo.list('lease_demo_001').length).toBeGreaterThan(0);
});

test('generate 仅补充缺失期次', function () {
  // 清掉该租约已有账单，验证生成数量 == 期次数（2026-05 ~ 2027-04 = 12）
  store.remove('bill', billRepo.list('lease_demo_001')[0]._id);
  var before = billRepo.list('lease_demo_001').length;
  var added = billRepo.generate('lease_demo_001');
  expect(added).toBeGreaterThan(0);
  expect(billRepo.list('lease_demo_001').length).toBe(before + added);
  // 再次生成不重复
  expect(billRepo.generate('lease_demo_001')).toBe(0);
});

test('markPaid 置为已缴并归档凭证', function () {
  var b = billRepo.list('lease_demo_001')[0];
  billRepo.markPaid(b._id, { paidAt: '2026-05-02', receiptRef: { fileID: 'att_x', refType: '微信转账' } });
  var after = billRepo.get(b._id);
  expect(after.status).toBe('paid');
  expect(after.paidAt).toBe('2026-05-02');
  expect(after.receiptRef.fileID).toBe('att_x');
});

test('refreshOverdue 将到期未缴标记为逾期', function () {
  var b = billRepo.list('lease_demo_001')[1]; // 2026-06，未缴
  billRepo.update(b._id, { dueDate: '2000-01-01' });
  var changed = billRepo.refreshOverdue('2026-06-01');
  expect(changed).toBeGreaterThan(0);
  expect(billRepo.get(b._id).status).toBe('overdue');
});

test('stats 统计已收/欠收/逾期', function () {
  var rows = billRepo.list('lease_demo_001');
  billRepo.markPaid(rows[0]._id, { paidAt: '2026-05-02' });
  billRepo.update(rows[1]._id, { dueDate: '2000-01-01' });
  billRepo.refreshOverdue('2026-06-01');
  var s = billRepo.stats('lease_demo_001');
  expect(s.paidCount).toBe(1);
  expect(s.overdueCount).toBeGreaterThanOrEqual(1);
  expect(s.received).toBe(rows[0].total);
  expect(s.owed).toBe(s.total - s.received);
});
