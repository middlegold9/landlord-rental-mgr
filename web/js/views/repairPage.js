/**
 * repairPage.js — 维修 / 物业维护记录时间线纯函数（T14）
 * - repairPageHtml(house, repairs, ui)：时间线（倒序）+ 添加表单
 * - buildRepair / validateRepair：元→分，必填校验
 * 转义统一走 utils/dom.escapeHtml；金额以分存储。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = { repairPageHtml: api.repairPageHtml, buildRepair: api.buildRepair, validateRepair: api.validateRepair };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      repairPageHtml: a.repairPageHtml, buildRepair: a.buildRepair, validateRepair: a.validateRepair
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  function fmt(ts) {
    if (!ts) return '—';
    return String(ts).slice(0, 16).replace('T', ' ');
  }

  function buildRepair(values, base) {
    base = base || {};
    return {
      _id: base._id,
      houseId: base.houseId || values.houseId,
      kind: values.kind || 'in_unit',
      reportedAt: values.reportedAt || new Date().toISOString(),
      issue: (values.issue || '').trim(),
      handler: (values.handler || '').trim(),
      cost: amount.yuanToCents(values.cost),
      status: values.status || 'pending',
      proofRef: base.proofRef || { fileID: '', refType: '维修凭证' }
    };
  }
  function validateRepair(r) {
    var e = {};
    if (!r.issue) e.issue = '请填写报修问题';
    if (r.cost == null || r.cost < 0) e.cost = '费用非法';
    if (!status.isStatus('REPAIR_KIND', r.kind)) e.kind = '类别非法';
    if (!status.isStatus('REPAIR_STATUS', r.status)) e.status = '状态非法';
    return e;
  }

  function opts(type, selected) {
    return Object.keys(status.ENUMS[type]).map(function (k) {
      var sel = k === selected ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS[type][k]) + '</option>';
    }).join('');
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

  function repairItemHtml(r) {
    return ''
      + '<li class="tl-item">'
      +   '<div class="tl-item__time">' + escapeHtml(fmt(r.reportedAt)) + '</div>'
      +   '<div class="tl-item__body"><strong>' + escapeHtml(r.issue) + '</strong>'
      +     ' <span class="tag">' + escapeHtml(status.labelOf('REPAIR_KIND', r.kind)) + '</span>'
      +     ' <span class="tag tag--' + escapeHtml(r.status) + '">' + escapeHtml(status.labelOf('REPAIR_STATUS', r.status)) + '</span>'
      +     '<div class="muted">处理人：' + escapeHtml(r.handler || '—') + ' · 费用：' + escapeHtml(amount.formatCents(r.cost)) + '</div>'
      +   '</div>'
      + '</li>';
  }

  function repairFormHtml(house, r, errs) {
    r = r || {};
    errs = errs || {};
    var costYuan = r.cost != null ? Math.round(r.cost / 100) : '';
    return ''
      + '<form id="repair-form" class="card form" data-house="' + escapeHtml(house._id) + '">'
      +   fld('issue', '报修问题 *', r.issue, 'text', errs)
      +   '<div class="field-row">'
      +     '<label class="field"><span class="field__label">类别</span><select name="kind">' + opts('REPAIR_KIND', r.kind || 'in_unit') + '</select></label>'
      +     '<label class="field"><span class="field__label">状态</span><select name="status">' + opts('REPAIR_STATUS', r.status || 'pending') + '</select></label>'
      +   '</div>'
      +   '<div class="field-row">'
      +     fld('handler', '处理方', r.handler, 'text', errs)
      +     fld('cost', '费用(元)', costYuan, 'number', errs)
      +   '</div>'
      +   fld('reportedAt', '报修时间', (r.reportedAt || '').slice(0, 16), 'datetime-local', errs)
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-repair-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">提交报修</button>'
      +   '</div>'
      + '</form>';
  }

  function repairPageHtml(house, repairs, ui) {
    ui = ui || {};
    var editing = !!ui.editing;
    var list = (repairs && repairs.length)
      ? '<ul class="tl-list">' + repairs.map(repairItemHtml).join('') + '</ul>'
      : '<p class="empty muted">暂无维修 / 维护记录。</p>';
    var form = editing ? repairFormHtml(house, ui.repair || null, ui.errors || {}) : '';
    var addBtn = editing ? '' : '<button type="button" class="btn btn--new" id="add-repair" data-house="' + escapeHtml(house._id) + '">+ 登记维修</button>';
    return '<section class="card"><h2>维修 / 维护记录</h2>' + list + addBtn + '</section>' + form;
  }

  return { repairPageHtml: repairPageHtml, buildRepair: buildRepair, validateRepair: validateRepair };
});
