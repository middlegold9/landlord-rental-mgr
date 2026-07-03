/**
 * housesPage.js — 房源列表页纯函数（T5）
 * 顶部待租/已租分段控件 + 卡片列表，空态占位。
 * 依赖 houseCard.houseCardHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { houseCardHtml: require('./houseCard').houseCardHtml };
    module.exports = { housesPageHtml: factory(deps) };
  } else {
    deps = { houseCardHtml: root.LRM.houseCardHtml };
    root.LRM = Object.assign(root.LRM || {}, { housesPageHtml: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var houseCardHtml = deps.houseCardHtml;

  function segmentHtml(active) {
    return ''
      + '<div class="segment" id="house-segment">'
      +   '<button type="button" class="segment__item' + (active === 'vacant' ? ' is-active' : '') + '" data-seg="vacant">空置</button>'
      +   '<button type="button" class="segment__item' + (active === 'rented' ? ' is-active' : '') + '" data-seg="rented">已租</button>'
      + '</div>';
  }

  function housesPageHtml(houses, activeSeg) {
    activeSeg = activeSeg || 'vacant';
    var label = activeSeg === 'rented' ? '已租' : '空置';
    var listHtml;
    if (houses && houses.length) {
      listHtml = houses.map(function (h) { return houseCardHtml(h); }).join('');
    } else {
      listHtml = '<p class="empty muted">暂无' + label + '房源</p>';
    }
    return segmentHtml(activeSeg)
      + '<div class="house-list" id="house-list">' + listHtml + '</div>';
  }

  return housesPageHtml;
});
