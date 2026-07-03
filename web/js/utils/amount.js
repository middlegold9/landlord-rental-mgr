/**
 * amount.js — 金额纯函数（金额以"分"为整数存储，杜绝浮点误差）
 * UMD：浏览器挂到 window.LRM，Node/jest 走 module.exports。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LRM = Object.assign(root.LRM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 分 → 展示字符串（带千分位与两位小数）
  function formatCents(cents, symbol) {
    symbol = symbol == null ? '¥' : symbol;
    var c = Math.round(Number(cents) || 0);
    var neg = c < 0;
    var abs = Math.abs(c);
    var yuan = Math.floor(abs / 100);
    var fen = abs % 100;
    var yuanStr = String(yuan).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + symbol + yuanStr + '.' + String(fen).padStart(2, '0');
  }

  // 元（字符串/数字）→ 分（整数）；非法返回 null
  function yuanToCents(yuan) {
    if (yuan === null || yuan === undefined || yuan === '') return null;
    var n = typeof yuan === 'number' ? yuan : parseFloat(String(yuan).replace(/[¥￥,\s]/g, ''));
    if (isNaN(n)) return null;
    return Math.round(n * 100);
  }

  // 多参数整数相加（金额累加）
  function addCents() {
    var args = Array.prototype.slice.call(arguments);
    return args.reduce(function (acc, v) { return acc + Math.round(Number(v) || 0); }, 0);
  }

  return { formatCents: formatCents, yuanToCents: yuanToCents, addCents: addCents };
});
