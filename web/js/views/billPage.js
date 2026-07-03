/**
 * billPage.js — 账单 / 收租 视图纯函数（T15/T16/T17）
 * - billPageHtml(house, lease, bills, ui)：账单列表（期次/应缴日/金额/状态）+ 生成 + 标记已缴
 * - buildPay / validatePay：实缴日期与凭证归档
 * 转义统一走 utils/dom.escapeHtml；金额以分存储。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = { billPageHtml: api.billPageHtml, buildPay: api.buildPay, validatePay: api.validatePay };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      billPageHtml: a.billPageHtml, buildPay: a.buildPay, validatePay: a.validatePay
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  function buildPay(values) {
    return {
      paidAt: (values.paidAt || '').trim(),
      receiptFileID: (values.receiptFileID || '').trim(),
      receiptRefType: (values.receiptRefType || '').trim()
    };
  }
  function validatePay(p) {
    var e = {};
    if (!p.paidAt) e.paidAt = '请选择实缴日期';
    return e;
  }

  function fld(name, label, value, type, errs) {
    var err = errs && errs[name];
    var ev = value == null ? '' : value;
    return ''
      + '<label class="field' + (err ? ' field--invalid' : '') + '">'
      +   '<span class="field__label">' + escapeHtml(label) + '</span>'
      +   '<input type="' + (type || 'text') + '" name="' + name + '" value="' + escapeHtml(ev) + '" />'
      +   (err ? '<span class="field__err">' + escapeHtml(err) + '</span>' : '')
      + '</label>';
  }

  function statusTag(s) {
    return '<span class="tag tag--' + escapeHtml(s) + '">' + escapeHtml(status.labelOf('BILL_STATUS', s)) + '</span>';
  }

  function summary(bills) {
    var total = 0, received = 0;
    bills.forEach(function (b) {
      total += Number(b.total) || 0;
      if (b.status === 'paid') received += Number(b.total) || 0;
    });
    var owed = total - received;
    return ''
      + '<div class="card"><h2>收租概览</h2>'
      +   '<p>应收合计：' + escapeHtml(amount.formatCents(total)) + '</p>'
      +   '<p>已收：' + escapeHtml(amount.formatCents(received)) + ' · 欠收：' + escapeHtml(amount.formatCents(owed)) + '</p>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" id="generate-bills" data-generate-bills="1">生成全部账单期次</button>'
      +   '</div>'
      + '</div>';
  }

  function billRowHtml(b) {
    var right = (b.status === 'paid')
      ? '<span class="muted">已缴 ' + escapeHtml(b.paidAt || '') + '</span>'
      : '<button type="button" class="btn btn--sm" data-pay-bill="' + escapeHtml(b._id) + '">标记已缴</button>';
    var receipt = (b.status === 'paid' && b.receiptRef && b.receiptRef.fileID)
      ? '<div class="muted">凭证：' + escapeHtml(b.receiptRef.refType) + ' · ' + escapeHtml(b.receiptRef.fileID) + '</div>'
      : '';
    return ''
      + '<li class="bill-row">'
      +   '<div class="bill-row__main">'
      +     '<strong>' + escapeHtml(b.period) + '</strong>'
      +     ' <span class="muted">应缴 ' + escapeHtml(b.dueDate) + '</span>'
      +     '<div class="muted">金额 ' + escapeHtml(amount.formatCents(b.total)) + '</div>'
      +     receipt
      +   '</div>'
      +   '<div class="bill-row__side">' + statusTag(b.status) + right + '</div>'
      + '</li>';
  }

  function billListHtml(bills) {
    return (bills && bills.length)
      ? '<ul class="bill-list">' + bills.map(billRowHtml).join('') + '</ul>'
      : '<p class="empty muted">暂无账单；点击上方「生成全部账单期次」。</p>';
  }

  function payFormHtml(bill, errs) {
    errs = errs || {};
    return ''
      + '<form id="pay-form" class="card form" data-bill="' + escapeHtml(bill._id) + '">'
      +   '<h3 class="sub-h">标记已缴 · ' + escapeHtml(bill.period) + '</h3>'
      +   fld('paidAt', '实缴日期 *', bill.paidAt || new Date().toISOString().slice(0, 10), 'date', errs)
      +   '<div class="field-row">'
      +     fld('receiptFileID', '凭证文件ID', '', 'text', errs)
      +     fld('receiptRefType', '凭证类型', '微信转账', 'text', errs)
      +   '</div>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-pay-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">确认已缴</button>'
      +   '</div>'
      + '</form>';
  }

  function billPageHtml(house, lease, bills, ui) {
    ui = ui || {};
    if (!lease) {
      return '<section class="card"><p class="empty muted">尚未录入租约，请先在「租约 / 租客」中创建租约后生成账单。</p></section>';
    }
    var genResult = ui.genResult ? '<p class="muted">' + escapeHtml(ui.genResult) + '</p>' : '';
    var form = ui.payId ? (function () {
      var b = bills.filter(function (x) { return x._id === ui.payId; })[0];
      return b ? payFormHtml(b, ui.errors || {}) : '';
    })() : '';
    return summary(bills) + genResult
      + '<section class="card"><h2>账单列表</h2>' + billListHtml(bills) + '</section>'
      + form;
  }

  return { billPageHtml: billPageHtml, buildPay: buildPay, validatePay: validatePay };
});
