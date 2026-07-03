/**
 * houseCard.js — 房源卡片纯函数（T5）
 * 入参 house（对齐 data-model 的 house 集合），输出安全 HTML 字符串。
 * 转义统一走 utils/dom.escapeHtml（T3 收敛）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { status: require('../utils/status'), dom: require('../utils/dom') };
    module.exports = { houseCardHtml: factory(deps) };
  } else {
    deps = { status: root.LRM.status, dom: root.LRM };
    root.LRM = Object.assign(root.LRM || {}, { houseCardHtml: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var status = deps.status;
  var escapeHtml = deps.dom.escapeHtml;

  function houseCardHtml(house) {
    if (!house) return '';

    var label = status ? status.labelOf('HOUSE_STATUS', house.status) : house.status;
    var badgeClass = house.status === 'rented' ? 'badge--rented' : 'badge--vacant';
    var layout = house.layout
      ? (house.layout.bedrooms + '室' + (house.layout.livingrooms || 0) + '厅' + (house.layout.bathrooms || 0) + '卫')
      : '';

    var tagsHtml = '';
    if (house.tags && house.tags.length) {
      tagsHtml = house.tags.map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + '</span>';
      }).join('');
    }

    return ''
      + '<article class="card house-card" data-id="' + escapeHtml(house._id) + '">'
      +   '<div class="house-card__top">'
      +     '<h3 class="house-card__title">' + escapeHtml(house.nickname) + '</h3>'
      +     '<span class="badge ' + badgeClass + '">' + escapeHtml(label) + '</span>'
      +   '</div>'
      +   '<p class="house-card__addr">' + escapeHtml(house.address || '') + '</p>'
      +   '<p class="house-card__meta">' + escapeHtml(house.area) + '㎡ · ' + escapeHtml(layout)
      +     ' · ' + escapeHtml(house.orientation || '') + '向</p>'
      +   (tagsHtml ? '<p class="house-card__tags">' + tagsHtml + '</p>' : '')
      + '</article>';
  }

  return houseCardHtml;
});
