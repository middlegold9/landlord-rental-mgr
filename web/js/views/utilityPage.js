/**
 * utilityPage.js — 费用账户 + 入驻交接单纯函数（T13）
 * - utilityPageHtml(house, utils, handover, ui)：费用账户列表/表单 + 交接单摘要/表单
 * - buildUtility / validateUtility（utility_account）
 * - buildHandover / validateHandover（handover），含 DEFAULT_HANDOVER_ITEMS 标准清单
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status') };
    var api = factory(deps);
    module.exports = {
      utilityPageHtml: api.utilityPageHtml,
      buildUtility: api.buildUtility, validateUtility: api.validateUtility,
      buildHandover: api.buildHandover, validateHandover: api.validateHandover,
      DEFAULT_HANDOVER_ITEMS: api.DEFAULT_HANDOVER_ITEMS
    };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      utilityPageHtml: a.utilityPageHtml,
      buildUtility: a.buildUtility, validateUtility: a.validateUtility,
      buildHandover: a.buildHandover, validateHandover: a.validateHandover,
      DEFAULT_HANDOVER_ITEMS: a.DEFAULT_HANDOVER_ITEMS
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;

  var DEFAULT_HANDOVER_ITEMS = [
    { name: '入户门钥匙', ok: false, note: '' },
    { name: '门禁卡', ok: false, note: '' },
    { name: '水表读数确认', ok: false, note: '' },
    { name: '电表读数确认', ok: false, note: '' },
    { name: '燃气表读数确认', ok: false, note: '' },
    { name: '家具家电清点', ok: false, note: '' }
  ];

  function buildUtility(values, base) {
    base = base || {};
    var mi = values.moveInReading;
    var mo = values.moveOutReading;
    return {
      _id: base._id,
      houseId: base.houseId || values.houseId,
      leaseId: base.leaseId || values.leaseId,
      type: values.type || 'water',
      accountNo: (values.accountNo || '').trim(),
      moveInReading: (mi === '' || mi == null) ? null : Number(mi),
      moveOutReading: (mo === '' || mo == null) ? null : Number(mo),
      transferStatus: values.transferStatus || 'pending'
    };
  }
  function validateUtility(u) {
    var e = {};
    if (!status.isStatus('UTILITY_TYPE', u.type)) e.type = '类型非法';
    if (!u.accountNo) e.accountNo = '请填写账户/表号';
    return e;
  }

  function buildHandover(values, items, base) {
    base = base || {};
    return {
      _id: base._id,
      houseId: base.houseId || values.houseId,
      leaseId: base.leaseId || values.leaseId,
      handedAt: (values.handedAt || '').trim(),
      note: (values.note || '').trim(),
      done: !!values.done,
      items: items || []
    };
  }
  function validateHandover(h) {
    var e = {};
    if (!h.handedAt) e.handedAt = '请选择交接日期';
    return e;
  }

  function fld(name, label, value, type) {
    var ev = value == null ? '' : value;
    return ''
      + '<label class="field"><span class="field__label">' + escapeHtml(label) + '</span>'
      +   '<input type="' + (type || 'text') + '" name="' + name + '" value="' + escapeHtml(ev) + '" /></label>';
  }
  function opts(type, selected) {
    return Object.keys(status.ENUMS[type]).map(function (k) {
      var sel = k === selected ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS[type][k]) + '</option>';
    }).join('');
  }

  function utilityRowHtml(u) {
    var mi = u.moveInReading != null ? u.moveInReading : '—';
    var mo = u.moveOutReading != null ? u.moveOutReading : '—';
    return ''
      + '<div class="ch-row">'
      +   '<div><strong>' + escapeHtml(status.labelOf('UTILITY_TYPE', u.type)) + '</strong>'
      +     ' <span class="muted">· ' + escapeHtml(status.labelOf('UTILITY_TRANSFER', u.transferStatus)) + '</span></div>'
      +   '<div class="muted">' + escapeHtml(u.accountNo || '') + '</div>'
      +   '<div class="muted">入住读数 ' + mi + ' · 退租读数 ' + mo + '</div>'
      +   '<div class="row-actions">'
      +     '<button type="button" class="link-btn" data-edit-utility="' + escapeHtml(u._id) + '">编辑</button>'
      +     '<button type="button" class="link-btn link-danger" data-del-utility="' + escapeHtml(u._id) + '">删除</button>'
      +   '</div>'
      + '</div>';
  }

  function utilityFormHtml(house, u, errs) {
    errs = errs || {};
    var hidden = u && u._id ? '<input type="hidden" name="_id" value="' + escapeHtml(u._id) + '" />' : '';
    return ''
      + '<form id="utility-form" class="card form" data-house="' + escapeHtml(house._id) + '">' + hidden
      +   '<label class="field"><span class="field__label">费用类型</span><select name="type">' + opts('UTILITY_TYPE', u && u.type) + '</select></label>'
      +   fld('accountNo', '账户 / 表号 *', u && u.accountNo)
      +   '<div class="field-row">'
      +     fld('moveInReading', '入住读数', u && (u.moveInReading != null ? u.moveInReading : ''), 'number')
      +     fld('moveOutReading', '退租读数', u && (u.moveOutReading != null ? u.moveOutReading : ''), 'number')
      +   '</div>'
      +   '<label class="field"><span class="field__label">过户状态</span><select name="transferStatus">' + opts('UTILITY_TRANSFER', u && u.transferStatus) + '</select></label>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-utility-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">' + (u ? '保存修改' : '添加账户') + '</button>'
      +   '</div>'
      + '</form>';
  }

  function handoverSummaryHtml(handover) {
    if (!handover) {
      return '<p class="empty muted">暂无入驻交接单。</p>';
    }
    var badge = handover.done ? '<span class="tag tag--ok">已完成</span>' : '<span class="tag">待确认</span>';
    var items = (handover.items || []).map(function (it) {
      return '<li class="' + (it.ok ? 'ok' : 'no') + '">' + escapeHtml(it.name) + (it.ok ? ' ✓' : ' ✗') + '</li>';
    }).join('');
    return ''
      + '<p>交接日期：' + escapeHtml(handover.handedAt || '—') + ' ' + badge + '</p>'
      + (handover.note ? '<p class="muted">' + escapeHtml(handover.note) + '</p>' : '')
      + '<ul class="ho-list">' + items + '</ul>';
  }

  function handoverFormHtml(house, leaseId, handover) {
    var items = (handover && handover.items) || DEFAULT_HANDOVER_ITEMS;
    var checks = items.map(function (it, i) {
      return '<label class="field field--inline"><input type="checkbox" name="item_ok_' + i + '" data-name="' + escapeHtml(it.name) + '" ' + (it.ok ? 'checked' : '') + ' /> '
        + escapeHtml(it.name) + '</label>';
    }).join('');
    var hidden = handover && handover._id ? '<input type="hidden" name="_id" value="' + escapeHtml(handover._id) + '" />' : '';
    return ''
      + '<form id="handover-form" class="card form" data-house="' + escapeHtml(house._id) + '">' + hidden
      +   (leaseId ? '<input type="hidden" name="leaseId" value="' + escapeHtml(leaseId) + '" />' : '')
      +   fld('handedAt', '交接日期 *', handover && handover.handedAt, 'date')
      +   fld('note', '备注', handover && handover.note)
      +   '<p class="field__label">物品清单</p>' + checks
      +   '<label class="field field--inline"><input type="checkbox" name="done" ' + (handover && handover.done ? 'checked' : '') + ' /> 交接已完成</label>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-handover-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">保存交接单</button>'
      +   '</div>'
      + '</form>';
  }

  function utilityPageHtml(house, utils, handover, ui) {
    ui = ui || {};
    var editingUtility = ui.editingUtility != null ? ui.editingUtility : null;
    var editingHandover = !!ui.editingHandover;

    var utilSection = '<section class="card"><h2>费用账户</h2>';
    if (editingUtility) {
      utilSection += utilityFormHtml(house, editingUtility, ui.errors || {});
    } else {
      utilSection += (utils && utils.length)
        ? utils.map(utilityRowHtml).join('')
        : '<p class="empty muted">暂无费用账户。</p>';
      utilSection += '<button type="button" class="btn btn--new" id="add-utility" data-house="' + escapeHtml(house._id) + '">+ 添加费用账户</button>';
    }
    utilSection += '</section>';

    var handoverSection = '<section class="card"><h2>入驻交接单</h2>';
    if (editingHandover) {
      handoverSection += handoverFormHtml(house, ui.leaseId, handover);
    } else {
      handoverSection += handoverSummaryHtml(handover);
      handoverSection += '<button type="button" class="btn btn--new" id="edit-handover" data-house="' + escapeHtml(house._id) + '">'
        + (handover ? '编辑交接单' : '+ 录入交接单') + '</button>';
    }
    handoverSection += '</section>';

    return utilSection + handoverSection;
  }

  return {
    utilityPageHtml: utilityPageHtml,
    buildUtility: buildUtility, validateUtility: validateUtility,
    buildHandover: buildHandover, validateHandover: validateHandover,
    DEFAULT_HANDOVER_ITEMS: DEFAULT_HANDOVER_ITEMS
  };
});
