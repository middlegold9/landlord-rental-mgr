/**
 * settlePage.test.js — T18 续租 / 退租清算视图
 */
var api = require('../settlePage');

test('buildRenew / validateRenew', function () {
  var r = api.buildRenew({ newEndDate: '2027-12-31' }, {});
  expect(r.newEndDate).toBe('2027-12-31');
  var lease = { endDate: '2027-04-30' };
  expect(api.validateRenew(r, lease)).toEqual({});
  var bad = api.buildRenew({ newEndDate: '2027-01-01' }, {});
  expect(api.validateRenew(bad, lease)).toHaveProperty('newEndDate');
});

test('buildSettle / validateSettle 元→分', function () {
  var items = [{ name: '钥匙归还', ok: true }];
  var s = api.buildSettle({ moveOutDate: '2027-05-01', depositDeductionYuan: '500', note: '划痕', items: items }, {});
  expect(s.depositDeduction).toBe(50000);
  expect(s.items[0].ok).toBe(true);
  expect(api.validateSettle(s)).toEqual({});
  var bad = api.buildSettle({ moveOutDate: '', depositDeductionYuan: '-1', items: [] }, {});
  var errs = api.validateSettle(bad);
  expect(errs).toHaveProperty('moveOutDate');
  expect(errs).toHaveProperty('depositDeductionYuan');
});

test('settlePageHtml 渲染续租/退租入口', function () {
  var lease = { _id: 'L1', endDate: '2027-04-30', deposit: 680000, status: 'active' };
  var html = api.settlePageHtml({ _id: 'h' }, lease, null, {});
  expect(html).toContain('续租');
  expect(html).toContain('退租清算');
});

test('settlePageHtml 续租表单', function () {
  var lease = { _id: 'L1', endDate: '2027-04-30', deposit: 680000, status: 'active' };
  var html = api.settlePageHtml({ _id: 'h' }, lease, null, { mode: 'renew' });
  expect(html).toContain('id="renew-form"');
});

test('settlePageHtml 退租清算表单含应退金额', function () {
  var lease = { _id: 'L1', endDate: '2027-04-30', deposit: 680000, status: 'active' };
  var html = api.settlePageHtml({ _id: 'h' }, lease, null, { mode: 'settle', settleDraft: { depositDeductionYuan: '500' } });
  expect(html).toContain('id="settle-form"');
  expect(html).toContain('应退');
});

test('settlePageHtml 已退租不显示操作按钮', function () {
  var lease = { _id: 'L1', endDate: '2027-04-30', deposit: 680000, status: 'ended', moveOutDate: '2027-05-01', settlement: { depositDeduction: 50000, refundAmount: 630000, note: '' } };
  var html = api.settlePageHtml({ _id: 'h' }, lease, null, {});
  expect(html).not.toContain('续租');
  expect(html).toContain('已退租清算');
});
