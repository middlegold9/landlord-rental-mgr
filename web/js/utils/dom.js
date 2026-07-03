/**
 * dom.js — 前端 XSS 转义 + 输入校验（T3）
 * 统一收敛 houseCard / app / 表单里的转义和校验，避免重复实现。
 * UMD：浏览器挂到 window.LRM（escapeHtml 等），Node/jest 走 module.exports。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { amount: require('./amount') };
    module.exports = factory(deps);
  } else {
    deps = { amount: root.LRM.amount };
    root.LRM = Object.assign(root.LRM || {}, factory(deps));
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var amount = deps.amount;

  // HTML 文本转义，防止注入到 innerHTML 时触发 XSS
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // 必填：去掉首尾空白后非空
  function validateRequired(v) {
    return typeof v === 'string' && v.trim().length > 0;
  }

  // 非负整数（楼层 / 面积数 / 数量）
  function validateNonNegInt(v) {
    if (v === null || v === undefined || v === '') return false;
    var n = Number(v);
    return Number.isInteger(n) && n >= 0;
  }

  // 金额（元字符串）合法性：复用 amount.yuanToCents，解析失败即非法
  function validateCents(v) {
    var c = amount ? amount.yuanToCents(v) : null;
    return c !== null && c !== undefined;
  }

  return {
    escapeHtml: escapeHtml,
    validateRequired: validateRequired,
    validateNonNegInt: validateNonNegInt,
    validateCents: validateCents
  };
});
