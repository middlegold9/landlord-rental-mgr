/**
 * showingPage.js — 带看记录页纯函数（T9）
 * - showingPageHtml(house, showings, ui)：列表 + 添加/编辑表单
 * - buildShowing(values, base)：表单值 → showing 对象（含 landlordEval）
 * - validateShowing(s)：必填校验
 * - advanceStatus(status)：状态机 pending→done，其余终态返回 null
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status') };
    var api = factory(deps);
    module.exports = {
      showingPageHtml: api.showingPageHtml, buildShowing: api.buildShowing,
      validateShowing: api.validateShowing, advanceStatus: api.advanceStatus
    };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, {
      showingPageHtml: a.showingPageHtml, buildShowing: a.buildShowing,
      validateShowing: a.validateShowing, advanceStatus: a.advanceStatus
    });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;

  function buildShowing(values, base) {
    base = base || {};
    var s = {};
    s._id = base._id;
    s.houseId = base.houseId || values.houseId;
    s.prospectTenant = (values.prospectTenant || '').trim();
    s.sourceChannel = (values.sourceChannel || '').trim();
    s.agent = (values.agent || '').trim();
    s.appointmentAt = (values.appointmentAt || '').trim();
    s.status = values.status || 'pending';
    s.tenantFeedback = (values.tenantFeedback || '').trim();
    var score = Number(values.landlordScore);
    s.landlordEval = { score: Number.isFinite(score) ? score : 0, note: (values.landlordNote || '').trim() };
    return s;
  }

  function validateShowing(s) {
    var e = {};
    if (!s.prospectTenant) e.prospectTenant = '请填写意向租客';
    if (!s.appointmentAt) e.appointmentAt = '请填写预约时间';
    return e;
  }

  function advanceStatus(s) { return s === 'pending' ? 'done' : null; }

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

  function showingRowHtml(s) {
    var badgeClass = s.status === 'done' ? 'badge--rented'
      : (s.status === 'pending' ? 'badge--vacant' : 'badge--muted');
    var badge = '<span class="badge ' + badgeClass + '">' + escapeHtml(status.labelOf('SHOWING_STATUS', s.status)) + '</span>';
    var actions;
    if (s.status === 'pending') {
      actions = '<div class="row-actions">'
        + '<button type="button" class="link-btn" data-set-showing="' + escapeHtml(s._id) + '" data-status="done">完成</button>'
        + '<button type="button" class="link-btn" data-set-showing="' + escapeHtml(s._id) + '" data-status="cancelled">取消</button>'
        + '<button type="button" class="link-btn link-danger" data-set-showing="' + escapeHtml(s._id) + '" data-status="no_show">爽约</button>'
        + '<button type="button" class="link-btn" data-edit-showing="' + escapeHtml(s._id) + '">编辑</button>'
        + '<button type="button" class="link-btn link-danger" data-del-showing="' + escapeHtml(s._id) + '">删除</button>'
        + '</div>';
    } else {
      actions = '<div class="row-actions">'
        + '<button type="button" class="link-btn" data-edit-showing="' + escapeHtml(s._id) + '">编辑</button>'
        + '<button type="button" class="link-btn link-danger" data-del-showing="' + escapeHtml(s._id) + '">删除</button>'
        + '</div>';
    }
    return ''
      + '<div class="sh-row">'
      +   '<div><strong>' + escapeHtml(s.prospectTenant || '带看') + '</strong> ' + badge
      +     ' <span class="muted">' + escapeHtml(s.appointmentAt || '') + '</span></div>'
      +   (s.tenantFeedback ? '<div class="muted">租客反馈：' + escapeHtml(s.tenantFeedback) + '</div>' : '')
      +   (s.landlordEval && s.landlordEval.note ? '<div class="muted">评价：' + escapeHtml(s.landlordEval.note) + '（★' + escapeHtml(s.landlordEval.score) + '）</div>' : '')
      +   actions
      + '</div>';
  }

  function showingFormHtml(houseId, editing, errs) {
    errs = errs || {};
    var statusOpts = Object.keys(status.ENUMS.SHOWING_STATUS).map(function (k) {
      var sel = editing && editing.status === k ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS.SHOWING_STATUS[k]) + '</option>';
    }).join('');
    return ''
      + '<form id="showing-form" class="card form" data-house="' + escapeHtml(houseId) + '">'
      +   (editing && editing._id ? '<input type="hidden" name="_id" value="' + escapeHtml(editing._id) + '" />' : '')
      +   fld('prospectTenant', '意向租客 *', editing && editing.prospectTenant, 'text', errs)
      +   fld('sourceChannel', '来源渠道', editing && editing.sourceChannel, 'text', errs)
      +   fld('agent', '带看人', editing && editing.agent, 'text', errs)
      +   fld('appointmentAt', '预约时间 *', editing && editing.appointmentAt, 'datetime-local', errs)
      +   '<label class="field"><span class="field__label">状态</span><select name="status">' + statusOpts + '</select></label>'
      +   fld('tenantFeedback', '租客反馈', editing && editing.tenantFeedback, 'text', errs)
      +   fld('landlordScore', '房东评分(1-5)', editing && editing.landlordEval ? editing.landlordEval.score : '', 'number', errs)
      +   fld('landlordNote', '房东备注', editing && editing.landlordEval ? editing.landlordEval.note : '', 'text', errs)
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-sh-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">' + (editing ? '保存修改' : '添加带看') + '</button>'
      +   '</div>'
      + '</form>';
  }

  function showingPageHtml(house, showings, ui) {
    ui = ui || {};
    var editing = ui.editing || null;
    var rows = (showings && showings.length)
      ? showings.map(showingRowHtml).join('')
      : '<p class="empty muted">暂无带看记录。</p>';
    return ''
      + '<section class="card"><h2>带看记录</h2>' + rows
      +   '<button type="button" class="btn btn--new" id="add-showing" data-house="' + escapeHtml(house._id) + '">+ 添加带看</button>'
      + '</section>'
      + (editing ? showingFormHtml(house._id, editing, ui.errors || {}) : showingFormHtml(house._id, null, ui.errors || {}));
  }

  return { showingPageHtml: showingPageHtml, buildShowing: buildShowing, validateShowing: validateShowing, advanceStatus: advanceStatus };
});
