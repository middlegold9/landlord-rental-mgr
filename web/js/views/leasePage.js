/**
 * leasePage.js — 租约信息 + 租客档案纯函数（T12）
 * - leasePageHtml(house, lease, tenant, ui)：摘要卡 + 合并表单（租约段 & 租客段）
 * - buildLease / validateLease、buildTenant / validateTenant：元→分、必填校验
 * 转义统一走 utils/dom.escapeHtml；金额以分存储。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = {
      leasePageHtml: api.leasePageHtml,
      buildLease: api.buildLease, validateLease: api.validateLease,
      buildTenant: api.buildTenant, validateTenant: api.validateTenant
    };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      leasePageHtml: a.leasePageHtml,
      buildLease: a.buildLease, validateLease: a.validateLease,
      buildTenant: a.buildTenant, validateTenant: a.validateTenant
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  function buildLease(values, base) {
    base = base || {};
    return {
      _id: base._id,
      houseId: base.houseId || values.houseId,
      tenantId: base.tenantId || values.tenantId,
      startDate: (values.startDate || '').trim(),
      endDate: (values.endDate || '').trim(),
      rent: amount.yuanToCents(values.rent),
      deposit: amount.yuanToCents(values.deposit),
      payCycle: values.payCycle || 'month',
      payMethod: (values.payMethod || '').trim(),
      status: values.status || 'active',
      renewed: !!values.renewed,
      contractRef: (values.contractFileID || values.contractRefType)
        ? { fileID: (values.contractFileID || '').trim(), refType: (values.contractRefType || '').trim() }
        : (base.contractRef || null)
    };
  }
  function validateLease(l) {
    var e = {};
    if (!l.startDate) e.startDate = '请选择起租日';
    if (!l.endDate) e.endDate = '请选择到期日';
    else if (l.startDate && l.endDate < l.startDate) e.endDate = '到期日需晚于起租日';
    if (l.rent == null || l.rent < 0) e.rent = '租金非法';
    if (l.deposit == null || l.deposit < 0) e.deposit = '押金非法';
    if (!status.isStatus('PAY_CYCLE', l.payCycle)) e.payCycle = '支付方式非法';
    if (!status.isStatus('LEASE_STATUS', l.status)) e.status = '租约状态非法';
    return e;
  }

  function buildTenant(values, base) {
    base = base || {};
    return {
      _id: base._id,
      leaseId: base.leaseId || values.leaseId,
      wechat: (values.wechat || '').trim(),
      phone: (values.phone || '').trim(),
      idCard: (values.idCard || '').trim(),
      householdReg: (values.householdReg || '').trim(),
      occupation: (values.occupation || '').trim(),
      income: Number(values.income) || 0,
      hasPet: !!values.hasPet,
      occupants: Number(values.occupants) || 0,
      emergencyContact: (values.emergencyContact || '').trim(),
      sourceChannel: (values.sourceChannel || '').trim()
    };
  }
  function validateTenant(t) {
    var e = {};
    if (!t.phone) e.phone = '请填写联系电话';
    if (!t.wechat) e.wechat = '请填写微信号';
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
  function opts(type, selected) {
    return Object.keys(status.ENUMS[type]).map(function (k) {
      var sel = k === selected ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS[type][k]) + '</option>';
    }).join('');
  }

  function summaryHtml(lease, tenant) {
    var rent = lease ? amount.formatCents(lease.rent) : '—';
    var deposit = lease ? amount.formatCents(lease.deposit) : '—';
    var period = lease ? (escapeHtml(lease.startDate) + ' ~ ' + escapeHtml(lease.endDate)) : '—';
    var cycle = lease ? escapeHtml(status.labelOf('PAY_CYCLE', lease.payCycle)) : '—';
    var lstatus = lease ? escapeHtml(status.labelOf('LEASE_STATUS', lease.status)) : '—';
    var leaseCard = ''
      + '<div class="card"><h2>租约信息</h2>'
      +   '<p>租期：' + period + '</p>'
      +   '<p>租金：' + rent + ' · 押金：' + deposit + '</p>'
      +   '<p>付租：' + cycle + ' · 方式：' + escapeHtml(lease ? (lease.payMethod || '—') : '—') + '</p>'
      +   '<p>状态：' + lstatus + (lease && lease.renewed ? ' · 已续租' : '') + '</p>'
      +   (lease && lease.contractRef ? '<p class="muted">合同：' + escapeHtml(lease.contractRef.refType) + '</p>' : '')
      + '</div>';

    var tenantCard = ''
      + '<div class="card"><h2>租客档案</h2>'
      +   (tenant
            ? '<p>微信：' + escapeHtml(tenant.wechat) + ' · 电话：' + escapeHtml(tenant.phone) + '</p>'
              + '<p>证件：' + escapeHtml(tenant.idCard || '—') + ' · ' + escapeHtml(tenant.householdReg || '—') + '</p>'
              + '<p>职业：' + escapeHtml(tenant.occupation || '—') + ' · 年入：' + (tenant.income ? amount.formatCents(tenant.income) : '—') + '</p>'
              + '<p>同住 ' + escapeHtml(tenant.occupants) + ' 人 · ' + (tenant.hasPet ? '养宠物' : '无宠物') + '</p>'
              + '<p class="muted">紧急联系人：' + escapeHtml(tenant.emergencyContact || '—') + ' · 来源：' + escapeHtml(tenant.sourceChannel || '—') + '</p>'
            : '<p class="muted">暂无租客档案。</p>')
      + '</div>';
    return leaseCard + tenantCard;
  }

  function formHtml(house, lease, tenant, errs) {
    errs = errs || {};
    var leaseIdHidden = lease && lease._id ? '<input type="hidden" name="leaseId" value="' + escapeHtml(lease._id) + '" />' : '';
    var tenantIdHidden = tenant && tenant._id ? '<input type="hidden" name="tenantId" value="' + escapeHtml(tenant._id) + '" />' : '';
    var rentYuan = lease && lease.rent != null ? Math.round(lease.rent / 100) : '';
    var depYuan = lease && lease.deposit != null ? Math.round(lease.deposit / 100) : '';
    var incomeYuan = tenant && tenant.income ? Math.round(tenant.income / 100) : '';

    var leaseSection = ''
      + '<h3 class="sub-h">租约信息</h3>'
      + '<div class="field-row">'
      +   fld('startDate', '起租日', lease && lease.startDate, 'date', errs)
      +   fld('endDate', '到期日', lease && lease.endDate, 'date', errs)
      + '</div>'
      + '<div class="field-row">'
      +   fld('rent', '租金(元/期) *', rentYuan, 'number', errs)
      +   fld('deposit', '押金(元) *', depYuan, 'number', errs)
      + '</div>'
      + '<div class="field-row">'
      +   '<label class="field"><span class="field__label">付租周期</span><select name="payCycle">' + opts('PAY_CYCLE', lease && lease.payCycle) + '</select></label>'
      +   '<label class="field"><span class="field__label">租约状态</span><select name="status">' + opts('LEASE_STATUS', lease && lease.status) + '</select></label>'
      + '</div>'
      + fld('payMethod', '收款方式', lease && lease.payMethod, 'text', errs)
      + '<div class="field-row">'
      +   fld('contractFileID', '合同文件ID', lease && lease.contractRef && lease.contractRef.fileID, 'text', errs)
      +   fld('contractRefType', '合同类型', lease && lease.contractRef && lease.contractRef.refType, 'text', errs)
      + '</div>'
      + '<label class="field field--inline"><input type="checkbox" name="renewed" ' + (lease && lease.renewed ? 'checked' : '') + ' /> 已续租</label>';

    var tenantSection = ''
      + '<h3 class="sub-h">租客档案</h3>'
      + '<div class="field-row">'
      +   fld('wechat', '微信号 *', tenant && tenant.wechat, 'text', errs)
      +   fld('phone', '联系电话 *', tenant && tenant.phone, 'text', errs)
      + '</div>'
      + '<div class="field-row">'
      +   fld('idCard', '证件号', tenant && tenant.idCard, 'text', errs)
      +   fld('householdReg', '户籍', tenant && tenant.householdReg, 'text', errs)
      + '</div>'
      + '<div class="field-row">'
      +   fld('occupation', '职业', tenant && tenant.occupation, 'text', errs)
      +   fld('income', '年收入(元)', incomeYuan, 'number', errs)
      + '</div>'
      + '<div class="field-row">'
      +   fld('occupants', '同住人数', tenant && tenant.occupants, 'number', errs)
      +   fld('emergencyContact', '紧急联系人', tenant && tenant.emergencyContact, 'text', errs)
      + '</div>'
      + fld('sourceChannel', '来源渠道', tenant && tenant.sourceChannel, 'text', errs)
      + '<label class="field field--inline"><input type="checkbox" name="hasPet" ' + (tenant && tenant.hasPet ? 'checked' : '') + ' /> 养宠物</label>';

    return ''
      + '<form id="lease-form" class="card form" data-house="' + escapeHtml(house._id) + '">'
      +   leaseIdHidden + tenantIdHidden
      +   leaseSection + tenantSection
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-lease-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">' + (lease ? '保存修改' : '保存租约') + '</button>'
      +   '</div>'
      + '</form>';
  }

  function leasePageHtml(house, lease, tenant, ui) {
    ui = ui || {};
    var editing = !!ui.editing;
    var body = editing
      ? formHtml(house, lease, tenant, ui.errors || {})
      : summaryHtml(lease, tenant)
        + '<button type="button" class="btn btn--new" id="edit-lease" data-house="' + escapeHtml(house._id) + '">'
        +   (lease ? '编辑租约 / 租客' : '+ 录入租约 / 租客') + '</button>';
    return body;
  }

  return {
    leasePageHtml: leasePageHtml,
    buildLease: buildLease, validateLease: validateLease,
    buildTenant: buildTenant, validateTenant: validateTenant
  };
});
