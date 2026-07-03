/**
 * billPage.test.js — T15/T16/T17 账单视图
 */
var api = require('../billPage');

test('buildPay / validatePay', function () {
  var p = api.buildPay({ paidAt: '2026-05-02', receiptFileID: 'att_x', receiptRefType: '微信转账' });
  expect(p.paidAt).toBe('2026-05-02');
  expect(api.validatePay(p)).toEqual({});
  expect(api.validatePay(api.buildPay({}))).toHaveProperty('paidAt');
});

test('billPageHtml 无租约时提示', function () {
  var html = api.billPageHtml({ _id: 'h' }, null, [], {});
  expect(html).toContain('尚未录入租约');
});

test('billPageHtml 渲染账单列表与生成按钮', function () {
  var lease = { _id: 'L1', rent: 680000, payCycle: 'month' };
  var bills = [{ _id: 'B1', period: '2026-05', dueDate: '2026-05-01', total: 680000, status: 'unpaid', items: [] }];
  var html = api.billPageHtml({ _id: 'h' }, lease, bills, {});
  expect(html).toContain('生成全部账单期次');
  expect(html).toContain('2026-05');
  expect(html).toContain('标记已缴');
});

test('billPageHtml 已缴账单显示凭证', function () {
  var lease = { _id: 'L1', rent: 680000, payCycle: 'month' };
  var bills = [{ _id: 'B1', period: '2026-05', dueDate: '2026-05-01', total: 680000, status: 'paid', paidAt: '2026-05-02', receiptRef: { fileID: 'att_x', refType: '微信转账' }, items: [] }];
  var html = api.billPageHtml({ _id: 'h' }, lease, bills, {});
  expect(html).toContain('已缴 2026-05-02');
  expect(html).toContain('att_x');
});

test('billPageHtml 标记已缴表单', function () {
  var lease = { _id: 'L1', rent: 680000, payCycle: 'month' };
  var bills = [{ _id: 'B1', period: '2026-05', dueDate: '2026-05-01', total: 680000, status: 'unpaid', items: [] }];
  var html = api.billPageHtml({ _id: 'h' }, lease, bills, { payId: 'B1' });
  expect(html).toContain('id="pay-form"');
});
