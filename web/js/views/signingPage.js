/**
 * signingPage.js — 签约流程时间轴纯函数（T11）
 * - signingPageHtml(house, signing)：阶段时间轴 + 推进/重置按钮
 * - nextStage(stage)：状态机下一阶段；终态返回 null
 * - isRented(stage)：是否已达已租（房源已出租）
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status') };
    var api = factory(deps);
    module.exports = { signingPageHtml: api.signingPageHtml, nextStage: api.nextStage, isRented: api.isRented };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, { signingPageHtml: a.signingPageHtml, nextStage: a.nextStage, isRented: a.isRented });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;

  var STAGES = ['talking', 'deposit', 'signed', 'keys', 'rented'];

  function nextStage(stage) {
    var i = STAGES.indexOf(stage);
    return (i >= 0 && i < STAGES.length - 1) ? STAGES[i + 1] : null;
  }
  function isRented(stage) { return stage === 'rented'; }

  function timelineHtml(signing) {
    var curIdx = signing ? STAGES.indexOf(signing.stage) : -1;
    var steps = STAGES.map(function (st, idx) {
      var state = idx < curIdx ? 'done' : (idx === curIdx ? 'current' : 'todo');
      var label = status.labelOf('SIGNING_STAGE', st);
      return '<div class="tl-step tl-step--' + state + '"><span class="tl-dot">' + (idx + 1) + '</span>'
        + '<span class="tl-label">' + escapeHtml(label) + '</span></div>';
    }).join('');
    return '<div class="timeline">' + steps + '</div>';
  }

  function signingPageHtml(house, signing) {
    var has = !!signing;
    var cur = has ? signing.stage : 'talking';
    var advanceDisabled = !has || isRented(cur);
    var resetDisabled = !has || cur === 'talking';
    return ''
      + '<section class="card">'
      +   '<h2>签约流程</h2>'
      +   (has
            ? timelineHtml(signing)
            : '<p class="muted">尚未开启签约流程。</p>')
      +   (has ? '<p class="muted">当前阶段：' + escapeHtml(status.labelOf('SIGNING_STAGE', cur)) + '</p>' : '')
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-reset-signing="1" ' + (resetDisabled ? 'disabled' : '') + '>重置流程</button>'
      +     '<button type="button" class="btn" data-advance-signing="1" ' + (advanceDisabled ? 'disabled' : '') + '>'
      +       (isRented(cur) ? '已完成' : '推进到「' + escapeHtml(status.labelOf('SIGNING_STAGE', nextStage(cur))) + '」')
      +     '</button>'
      +   '</div>'
      + '</section>';
  }

  return { signingPageHtml: signingPageHtml, nextStage: nextStage, isRented: isRented };
});
