/**
 * priceStrategyPage.test.js — T10 价格策略 + 双向反馈（RED）
 */
var pricePage = require('../priceStrategyPage');

var channel = { _id: 'c1', type: 'agency', contact: '链家', listPrice: 350000, floorPrice: 320000, exposure: '高' };
var showing = { _id: 's1', prospectTenant: '张三', status: 'done', tenantFeedback: '满意', landlordEval: { score: 4, note: '不错' } };

test('渲染含定价与双向反馈区块', function () {
  var html = pricePage.priceStrategyPageHtml({ _id: 'h1', nickname: 'H' }, [channel], [showing]);
  expect(html).toContain('挂牌价');
  expect(html).toContain('双向反馈');
});

test('buildPrice 元转分', function () {
  var p = pricePage.buildPrice({ listPrice: '3500', floorPrice: '3200' });
  expect(p.listPrice).toBe(350000);
  expect(p.floorPrice).toBe(320000);
});

test('validatePrice 非法挂牌价报错', function () {
  expect(pricePage.validatePrice(pricePage.buildPrice({ listPrice: 'x' })).listPrice).toBeTruthy();
});

test('buildFeedback 映射评分', function () {
  var f = pricePage.buildFeedback({ tenantFeedback: '好', landlordScore: '5', landlordNote: '优' });
  expect(f.tenantFeedback).toBe('好');
  expect(f.landlordEval.score).toBe(5);
});

test('validateFeedback 评分需在 1-5', function () {
  expect(pricePage.validateFeedback(pricePage.buildFeedback({ landlordScore: '9' })).landlordScore).toBeTruthy();
});
