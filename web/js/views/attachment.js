/**
 * attachment.js — 附件展示纯函数（T7）
 * attachmentItemHtml(att)：输出一个附件 chip（图标 + 名称），供详情页与表单复用。
 * 实际预览（图片缩略图/打开 blob）由 app.js 在详情页套上 <a> 完成（见 T7）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom') };
    module.exports = { attachmentItemHtml: factory(deps) };
  } else {
    deps = { dom: root.LRM };
    root.LRM = Object.assign(root.LRM || {}, { attachmentItemHtml: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;

  var ICONS = {
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    pdf: '📄', doc: '📝', docx: '📝', default: '📎'
  };
  function icon(ext) {
    return ICONS[(ext || '').toLowerCase()] || ICONS.default;
  }

  function attachmentItemHtml(att) {
    if (!att) return '';
    return ''
      + '<span class="att-chip" data-file="' + escapeHtml(att.fileID || '') + '">'
      +   '<span class="att-chip__icon">' + icon(att.ext) + '</span>'
      +   '<span class="att-chip__name">' + escapeHtml(att.name || '未命名') + '</span>'
      + '</span>';
  }

  return attachmentItemHtml;
});
