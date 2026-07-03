/**
 * priceStrategyPage.js — 价格策略 + 双向反馈录入（T10）
 * 复用 channel（定价 listPrice/floorPrice）与 showing（双向反馈）两类数据：
 * - priceStrategyPageHtml(house, channels, showings)：每个渠道一个定价卡，每条带看一个反馈卡
 * - buildPrice(values) / validatePrice(p)：元→分，必填校验
 * - buildFeedback(values) / validateFeedback(f)：租客反馈 + 房东评分(1-5)
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = {
      priceStrategyPageHtml: api.priceStrategyPageHtml,
      buildPrice: api.buildPrice, validatePrice: api.validatePrice,
      buildFeedback: api.buildFeedback, validateFeedback: api.validateFeedback
    };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      priceStrategyPageHtml: a.priceStrategyPageHtml,
      buildPrice: a.buildPrice, validatePrice: a.validatePrice,
      buildFeedback: a.buildFeedback, validateFeedback: a.validateFeedback
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  function buildPrice(values) {
    return {
      listPrice: amount.yuanToCents(values.listPrice),
      floorPrice: amount.yuanToCents(values.floorPrice),
      exposure: (values.exposure || '').trim()
    };
  }
  function validatePrice(p) {
    var e = {};
    if (p.listPrice == null || p.listPrice < 0) e.listPrice = '挂牌价非法';
    return e;
  }

  function buildFeedback(values) {
    var score = Number(values.landlordScore);
    return {
      tenantFeedback: (values.tenantFeedback || '').trim(),
      landlordEval: { score: Number.isFinite(score) ? score : 0, note: (values.landlordNote || '').trim() }
    };
  }
  function validateFeedback(f) {
    var e = {};
    var sc = f.landlordEval && f.landlordEval.score;
    if (!sc || sc < 1 || sc > 5) e.landlordScore = '评分需 1-5';
    return e;
  }

  function priceCardHtml(ch) {
    var listVal = ch.listPrice != null ? Math.round(ch.listPrice / 100) : '';
    var floorVal = ch.floorPrice != null ? Math.round(ch.floorPrice / 100) : '';
    return ''
      + '<div class="price-card">'
      +   '<div class="price-card__head"><strong>' + escapeHtml(ch.contact || '未命名渠道') + '</strong>'
      +     ' <span class="muted">' + escapeHtml(status.labelOf('CHANNEL_TYPE', ch.type)) + '</span></div>'
      +   '<div class="field-row">'
      +     '<label class="field"><span class="field__label">挂牌价(元)</span><input type="number" name="listPrice" data-price-for="' + escapeHtml(ch._id) + '" value="' + escapeHtml(listVal) + '" /></label>'
      +     '<label class="field"><span class="field__label">底价(元)</span><input type="number" name="floorPrice" data-price-for="' + escapeHtml(ch._id) + '" value="' + escapeHtml(floorVal) + '" /></label>'
      +   '</div>'
      +   '<label class="field"><span class="field__label">曝光度</span><input type="text" name="exposure" data-price-for="' + escapeHtml(ch._id) + '" value="' + escapeHtml(ch.exposure || '') + '" /></label>'
      +   '<button type="button" class="btn" data-save-price="' + escapeHtml(ch._id) + '">保存定价</button>'
      + '</div>';
  }

  function feedbackCardHtml(s) {
    return ''
      + '<div class="price-card">'
      +   '<div class="price-card__head"><strong>' + escapeHtml(s.prospectTenant || '带看') + '</strong>'
      +     ' <span class="muted">' + escapeHtml(status.labelOf('SHOWING_STATUS', s.status)) + '</span></div>'
      +   '<label class="field"><span class="field__label">租客反馈</span><input type="text" name="tenantFeedback" data-feed-for="' + escapeHtml(s._id) + '" value="' + escapeHtml(s.tenantFeedback || '') + '" /></label>'
      +   '<div class="field-row">'
      +     '<label class="field"><span class="field__label">房东评分(1-5)</span><input type="number" name="landlordScore" data-feed-for="' + escapeHtml(s._id) + '" min="1" max="5" value="' + escapeHtml(s.landlordEval ? s.landlordEval.score : '') + '" /></label>'
      +     '<label class="field"><span class="field__label">房东备注</span><input type="text" name="landlordNote" data-feed-for="' + escapeHtml(s._id) + '" value="' + escapeHtml(s.landlordEval ? s.landlordEval.note : '') + '" /></label>'
      +   '</div>'
      +   '<button type="button" class="btn" data-save-feedback="' + escapeHtml(s._id) + '">保存反馈</button>'
      + '</div>';
  }

  function priceStrategyPageHtml(house, channels, showings) {
    var priceCards = (channels && channels.length)
      ? channels.map(priceCardHtml).join('')
      : '<p class="empty muted">暂无渠道定价。</p>';
    var feedbackCards = (showings && showings.length)
      ? showings.map(feedbackCardHtml).join('')
      : '<p class="empty muted">暂无带看反馈。</p>';
    return ''
      + '<section class="card"><h2>价格策略</h2>' + priceCards + '</section>'
      + '<section class="card"><h2>双向反馈</h2>' + feedbackCards + '</section>';
  }

  return {
    priceStrategyPageHtml: priceStrategyPageHtml,
    buildPrice: buildPrice, validatePrice: validatePrice,
    buildFeedback: buildFeedback, validateFeedback: validateFeedback
  };
});
