/**
 * date.js — 日期纯函数
 * UMD：浏览器挂到 window.LRM，Node/jest 走 module.exports。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LRM = Object.assign(root.LRM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function pad(n) { return String(n).padStart(2, '0'); }

  function toDate(v) {
    if (v instanceof Date) return v;
    if (typeof v === 'string' || typeof v === 'number') return new Date(v);
    return new Date();
  }

  // 默认 YYYY-MM-DD，可指定分隔符
  function formatDate(v, sep) {
    sep = sep || '-';
    var d = toDate(v);
    return d.getFullYear() + sep + pad(d.getMonth() + 1) + sep + pad(d.getDate());
  }

  // YYYY-MM（账单周期）
  function formatMonth(v) {
    var d = toDate(v);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  }

  // 两日期相差天数（b - a）
  function daysBetween(a, b) {
    var da = toDate(a).getTime();
    var db = toDate(b).getTime();
    return Math.round((db - da) / 86400000);
  }

  return { formatDate: formatDate, formatMonth: formatMonth, daysBetween: daysBetween };
});
