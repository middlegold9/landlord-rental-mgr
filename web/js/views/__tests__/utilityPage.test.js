/**
 * utilityPage.test.js — T13 费用账户 + 入驻交接单纯函数
 */
var api = require('../utilityPage');

test('buildUtility 补全 readings 为 null', function () {
  var u = api.buildUtility({ type: 'water', accountNo: '水表 1' }, { houseId: 'h_x' });
  expect(u.moveInReading).toBeNull();
  expect(u.transferStatus).toBe('pending');
});

test('validateUtility 必填校验', function () {
  expect(api.validateUtility(api.buildUtility({}, {}))).toHaveProperty('accountNo');
  var good = api.buildUtility({ type: 'water', accountNo: '水表 1' }, {});
  expect(api.validateUtility(good)).toEqual({});
});

test('buildHandover / validateHandover', function () {
  var h = api.buildHandover({ handedAt: '2026-07-01' }, [{ name: '钥匙', ok: true }], {});
  expect(h.done).toBe(false);
  expect(api.validateHandover(h)).toEqual({});
  expect(api.validateHandover(api.buildHandover({}, [], {}))).toHaveProperty('handedAt');
});

test('DEFAULT_HANDOVER_ITEMS 为标准清单', function () {
  expect(api.DEFAULT_HANDOVER_ITEMS.length).toBeGreaterThan(0);
  expect(api.DEFAULT_HANDOVER_ITEMS[0]).toHaveProperty('name');
});

test('utilityPageHtml 渲染两个区块与表单', function () {
  var html = api.utilityPageHtml({ _id: 'h_x' }, [], null, {});
  expect(html).toContain('费用账户');
  expect(html).toContain('入驻交接单');
  var ed = api.utilityPageHtml({ _id: 'h_x' }, [], null, { editingUtility: {} });
  expect(ed).toContain('id="utility-form"');
});
