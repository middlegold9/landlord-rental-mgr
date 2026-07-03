/**
 * showingPage.test.js — T9 带看记录页纯函数（RED）
 */
var showingPage = require('../showingPage');

test('渲染含「添加带看」入口', function () {
  expect(showingPage.showingPageHtml({ _id: 'h1', nickname: 'H' }, [], {})).toContain('添加带看');
});

test('buildShowing 映射字段', function () {
  var s = showingPage.buildShowing(
    { prospectTenant: '张三', sourceChannel: 'agency', agent: '李四', appointmentAt: '2026-07-10T10:00', tenantFeedback: 'ok', landlordScore: '4', landlordNote: '不错' },
    {}
  );
  expect(s.prospectTenant).toBe('张三');
  expect(s.landlordEval.score).toBe(4);
});

test('validateShowing 缺意向租客报错', function () {
  var s = showingPage.buildShowing({ prospectTenant: '', appointmentAt: '2026-07-10T10:00' }, {});
  expect(showingPage.validateShowing(s).prospectTenant).toBeTruthy();
});

test('advanceStatus pending→done，终态为 null', function () {
  expect(showingPage.advanceStatus('pending')).toBe('done');
  expect(showingPage.advanceStatus('done')).toBeNull();
});
