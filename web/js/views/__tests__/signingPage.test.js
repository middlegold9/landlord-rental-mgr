/**
 * signingPage.test.js — T11 签约时间轴纯函数（RED）
 */
var signingPage = require('../signingPage');

var signing = { _id: 'sg1', houseId: 'h1', stage: 'talking' };

test('渲染时间轴并显示当前阶段', function () {
  var html = signingPage.signingPageHtml({ _id: 'h1', status: 'vacant' }, signing);
  expect(html).toContain('洽谈');
  expect(html).toContain('交钥匙');
});

test('nextStage 映射', function () {
  expect(signingPage.nextStage('talking')).toBe('deposit');
  expect(signingPage.nextStage('rented')).toBeNull();
});

test('isRented', function () {
  expect(signingPage.isRented('rented')).toBe(true);
  expect(signingPage.isRented('talking')).toBe(false);
});
