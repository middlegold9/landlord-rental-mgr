/**
 * leasePage.test.js — T12 租约 + 租客纯函数
 */
var api = require('../leasePage');

test('buildLease 元→分，补全默认值', function () {
  var l = api.buildLease({ rent: '6800', deposit: '6800', startDate: '2026-05-01', endDate: '2027-04-30' }, { houseId: 'h_x' });
  expect(l.rent).toBe(680000);
  expect(l.deposit).toBe(680000);
  expect(l.payCycle).toBe('month');
  expect(l.status).toBe('active');
  expect(l.renewed).toBe(false);
});

test('validateLease 必填校验', function () {
  var bad = api.buildLease({}, {});
  var e = api.validateLease(bad);
  expect(e.startDate).toBeTruthy();
  expect(e.endDate).toBeTruthy();
  expect(e.rent).toBeTruthy();
  var good = api.buildLease({ startDate: '2026-01-01', endDate: '2026-12-31', rent: '3000', deposit: '3000' }, {});
  expect(Object.keys(api.validateLease(good)).length).toBe(0);
});

test('buildTenant / validateTenant', function () {
  var t = api.buildTenant({ wechat: 'wx_a', phone: '139' }, {});
  expect(t.hasPet).toBe(false);
  expect(api.validateTenant(t)).toEqual({});
  expect(api.validateTenant(api.buildTenant({}, {}))).toEqual({ phone: expect.anything(), wechat: expect.anything() });
});

test('leasePageHtml 渲染摘要与表单', function () {
  var lease = { startDate: '2026-05-01', endDate: '2027-04-30', rent: 680000, deposit: 680000, payCycle: 'month', payMethod: 'x', status: 'active', renewed: false };
  var tenant = { wechat: 'wx_a', phone: '139' };
  var html = api.leasePageHtml({ _id: 'h_x' }, lease, tenant, {});
  expect(html).toContain('租约信息');
  expect(html).toContain('租客档案');
  var edHtml = api.leasePageHtml({ _id: 'h_x' }, lease, tenant, { editing: true });
  expect(edHtml).toContain('id="lease-form"');
});
