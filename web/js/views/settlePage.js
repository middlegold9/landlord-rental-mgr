/**
 * settlePage.js — 续租 / 退租清算 视图纯函数（T18）
 * - settlePageHtml(house, lease, tenant, ui)：租约生命周期入口（续租 / 退租清算）
 * - buildRenew / validateRenew：续租（顺延到期日）
 * - buildSettle / validateSettle：退租清算（扣款 + 应退押金 + 退租交接单清单）
 * 转义统一走 utils/dom.escapeHtml；金额以分存储。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = {
      settlePageHtml: api.settlePageHtml,
      buildRenew: api.buildRenew, validateRenew: api.validateRenew,
      buildSettle: api.buildSettle, validateSettle: api.validateSettle
    };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      settlePageHtml: a.settlePageHtml,
      buildRenew: a.buildRenew, validateRenew: a.validateRenew,
      buildSettle: a.buildSettle, validateSettle: a.validateSettle
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  var MOVE_OUT_ITEMS = ['钥匙归还', '门禁卡归还', '水表读数确认', '电表读数确认', '家具家电清点'];

  function buildRenew(values, base) {
    base = base || {};
    return { _id: base._id, newEndDate: (values.newEndDate || '').trim() };
  }
  function validateRenew(r, lease) {
    var e = {};
    if (!r.newEndDate) e.newEndDate = '请选择新的到期日';
    else if (lease && lease.endDate && r.newEndDate <= lease.endDate) e.newEndDate = '新到期日需晚于原到期日';
    return e;
  }

  function buildSettle(values, base) {
    base = base || {};
    var items = (values.items || []).map(function (it) {
      return { name: it.name, ok: !!it.ok, note: it.note || '' };
    });
    return {
      _id: base._id,
      moveOutDate: (values.moveOutDate || '').trim(),
      depositDeduction: amount.yuanToCents(values.depositDeductionYuan),
      note: (values.note || '').trim(),
      items: items
    };
  }
  function validateSettle(s) {
    var e = {};
    if (!s.moveOutDate) e.moveOutDate = '请选择退租日期';
    if (s.depositDeduction == null || s.depositDeduction < 0) e.depositDeductionYuan = '扣款金额非法';
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

  function leaseSummaryCard(lease) {
    if (!lease) return '<section class="card"><p class="empty muted">尚未录入租约。</p></section>';
    var deposit = lease.deposit != null ? amount.formatCents(lease.deposit) : '—';
    var st = escapeHtml(status.labelOf('LEASE_STATUS', lease.status));
    var ended = lease.status === 'ended';
    var card = ''
      + '<section class="card"><h2>租约状态</h2>'
      +   '<p>原到期日：' + escapeHtml(lease.endDate) + ' · 状态：' + st
      +     (lease.renewed ? ' · 已续租' : '') + '</p>'
      +   '<p>押金：' + deposit + (ended && lease.settlement ? ' · 已退租清算' : '') + '</p>';
    if (ended && lease.settlement) {
      var se = lease.settlement;
      card += '<p class="muted">退租日 ' + escapeHtml(lease.moveOutDate || '') + ' · 扣款 '
        + escapeHtml(amount.formatCents(se.depositDeduction)) + ' · 实退 '
        + escapeHtml(amount.formatCents(se.refundAmount)) + '</p>'
        + (se.note ? '<p class="muted">备注：' + escapeHtml(se.note) + '</p>' : '');
    } else {
      card += ''
        + '<div class="form__actions">'
        +   '<button type="button" class="btn btn--ghost" id="renew-lease" data-renew="1">续租</button>'
        +   '<button type="button" class="btn btn--ghost" id="settle-lease" data-settle="1">退租清算</button>'
        + '</div>';
    }
    return card + '</section>';
  }

  function renewFormHtml(lease, errs, draft) {
    errs = errs || {};
    draft = draft || {};
    return ''
      + '<form id="renew-form" class="card form">'
      +   '<h3 class="sub-h">续租（顺延到期日）</h3>'
      +   fld('newEndDate', '新到期日 *', draft.newEndDate || lease.endDate, 'date', errs)
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-settle-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">确认续租</button>'
      +   '</div>'
      + '</form>';
  }

  function settleFormHtml(lease, errs, draft) {
    errs = errs || {};
    draft = draft || {};
    var dedYuan = draft.depositDeductionYuan != null ? draft.depositDeductionYuan : '';
    var depositCents = lease && lease.deposit != null ? lease.deposit : 0;
    var dedCents = (draft.depositDeductionYuan != null && draft.depositDeductionYuan !== '')
      ? (amount.yuanToCents(draft.depositDeductionYuan) || 0) : 0;
    var refund = depositCents - dedCents;
    var itemsHtml = MOVE_OUT_ITEMS.map(function (name, i) {
      var checked = draft.items && draft.items[i] && draft.items[i].ok ? ' checked' : '';
      return '<label class="field field--inline"><input type="checkbox" name="mo_item_' + i + '" data-name="' + escapeHtml(name) + '"' + checked + ' /> ' + escapeHtml(name) + '</label>';
    }).join('');
    return ''
      + '<form id="settle-form" class="card form">'
      +   '<h3 class="sub-h">退租清算</h3>'
      +   fld('moveOutDate', '退租日期 *', draft.moveOutDate || '', 'date', errs)
      +   fld('depositDeductionYuan', '押金扣款(元)', dedYuan, 'number', errs)
      +   '<p class="muted">押金 ' + escapeHtml(amount.formatCents(depositCents)) + ' · 扣款 '
      +     escapeHtml(amount.formatCents(dedCents)) + ' · 应退 <strong>' + escapeHtml(amount.formatCents(refund)) + '</strong></p>'
      +   '<p class="muted">退租交接单清单</p>' + itemsHtml
      +   fld('note', '清算备注', draft.note || '', 'text', errs)
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-settle-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">确认退租清算</button>'
      +   '</div>'
      + '</form>';
  }

  function settlePageHtml(house, lease, tenant, ui) {
    ui = ui || {};
    var mode = ui.mode || null;
    var body = leaseSummaryCard(lease);
    if (mode === 'renew' && lease && lease.status !== 'ended') {
      body += renewFormHtml(lease, ui.errors || {}, ui.renewDraft || {});
    } else if (mode === 'settle' && lease && lease.status !== 'ended') {
      body += settleFormHtml(lease, ui.errors || {}, ui.settleDraft || {});
    }
    return body;
  }

  return {
    settlePageHtml: settlePageHtml,
    buildRenew: buildRenew, validateRenew: validateRenew,
    buildSettle: buildSettle, validateSettle: validateSettle
  };
});
