/**
 * repairPage.test.js — T14 维修记录时间线纯函数
 */
var api = require('../repairPage');

test('buildRepair 元→分，补全默认值', function () {
  var r = api.buildRepair({ issue: '漏水', cost: '200' }, { houseId: 'h_x' });
  expect(r.cost).toBe(20000);
  expect(r.status).toBe('pending');
  expect(r.kind).toBe('in_unit');
});

test('validateRepair 必填校验', function () {
  expect(api.validateRepair(api.buildRepair({}, {}))).toHaveProperty('issue');
  var good = api.buildRepair({ issue: '漏水', cost: '200' }, {});
  expect(api.validateRepair(good)).toEqual({});
});

test('repairPageHtml 渲染时间线与登记表单', function () {
  var repairs = [{ _id: 'r1', reportedAt: '2026-06-12T09:30:00.000Z', issue: '空调故障', kind: 'in_unit', handler: '李师傅', cost: 38000, status: 'done' }];
  var html = api.repairPageHtml({ _id: 'h_x' }, repairs, {});
  expect(html).toContain('维修');
  expect(html).toContain('空调故障');
  var ed = api.repairPageHtml({ _id: 'h_x' }, [], { editing: true });
  expect(ed).toContain('id="repair-form"');
});
