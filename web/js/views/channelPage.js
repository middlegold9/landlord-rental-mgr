/**
 * channelPage.js — 渠道管理页纯函数（T8）
 * - channelPageHtml(house, channels, ui)：列表 + 添加/编辑表单（支持 pre-fill 与字段错误）
 * - buildChannel(values, base)：表单值 → channel 对象（元→分），纯函数
 * - validateChannel(c)：必填校验，返回 { 字段: 错误 }
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status'), amount: require('../utils/amount') };
    var api = factory(deps);
    module.exports = { channelPageHtml: api.channelPageHtml, buildChannel: api.buildChannel, validateChannel: api.validateChannel };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status, amount: root.LRM.amount };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, { channelPageHtml: a.channelPageHtml, buildChannel: a.buildChannel, validateChannel: a.validateChannel });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;
  var amount = deps.amount;

  function buildChannel(values, base) {
    base = base || {};
    var c = {};
    c._id = base._id;
    c.houseId = base.houseId || values.houseId;
    c.type = values.type || 'other';
    c.contact = (values.contact || '').trim();
    c.commission = Number(values.commission) || 0;
    c.listPrice = amount.yuanToCents(values.listPrice);
    c.floorPrice = amount.yuanToCents(values.floorPrice);
    c.listed = !!values.listed;
    c.exposure = (values.exposure || '').trim();
    return c;
  }

  function validateChannel(c) {
    var e = {};
    if (!c.contact) e.contact = '请填写联系人';
    if (c.listPrice == null || c.listPrice < 0) e.listPrice = '挂牌价非法';
    if (c.floorPrice != null && c.floorPrice < 0) e.floorPrice = '底价非法';
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

  function channelRowHtml(ch) {
    var typeLabel = status.labelOf('CHANNEL_TYPE', ch.type);
    var listed = ch.listed ? '· 挂盘中' : '· 未挂盘';
    return ''
      + '<div class="ch-row">'
      +   '<div><strong>' + escapeHtml(ch.contact || '未命名渠道') + '</strong> '
      +     '<span class="muted">' + escapeHtml(typeLabel) + ' ' + escapeHtml(listed) + '</span></div>'
      +   '<div class="muted">挂牌 ' + escapeHtml(amount.formatCents(ch.listPrice))
      +     ' / 底价 ' + escapeHtml(amount.formatCents(ch.floorPrice)) + '</div>'
      +   '<div class="row-actions">'
      +     '<button type="button" class="link-btn" data-edit-channel="' + escapeHtml(ch._id) + '">编辑</button>'
      +     '<button type="button" class="link-btn link-danger" data-del-channel="' + escapeHtml(ch._id) + '">删除</button>'
      +   '</div>'
      + '</div>';
  }

  function channelFormHtml(houseId, editing, errs) {
    errs = errs || {};
    var typeOpts = Object.keys(status.ENUMS.CHANNEL_TYPE).map(function (k) {
      var sel = editing && editing.type === k ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS.CHANNEL_TYPE[k]) + '</option>';
    }).join('');
    var listPriceVal = editing && editing.listPrice != null ? Math.round(editing.listPrice / 100) : '';
    var floorPriceVal = editing && editing.floorPrice != null ? Math.round(editing.floorPrice / 100) : '';
    return ''
      + '<form id="channel-form" class="card form" data-house="' + escapeHtml(houseId) + '">'
      +   (editing && editing._id ? '<input type="hidden" name="_id" value="' + escapeHtml(editing._id) + '" />' : '')
      +   fld('contact', '联系人 *', editing && editing.contact, 'text', errs)
      +   '<label class="field"><span class="field__label">渠道类型</span><select name="type">' + typeOpts + '</select></label>'
      +   fld('commission', '佣金(元)', editing && editing.commission, 'number', errs)
      +   fld('listPrice', '挂牌价(元) *', listPriceVal, 'number', errs)
      +   fld('floorPrice', '底价(元)', floorPriceVal, 'number', errs)
      +   fld('exposure', '曝光度', editing && editing.exposure, 'text', errs)
      +   '<label class="field field--inline"><input type="checkbox" name="listed" ' + (editing && editing.listed ? 'checked' : '') + ' /> 已挂盘</label>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" data-ch-cancel="1">取消</button>'
      +     '<button type="submit" class="btn">' + (editing ? '保存修改' : '添加渠道') + '</button>'
      +   '</div>'
      + '</form>';
  }

  function channelPageHtml(house, channels, ui) {
    ui = ui || {};
    var editing = ui.editing || null;
    var rows = (channels && channels.length)
      ? channels.map(channelRowHtml).join('')
      : '<p class="empty muted">暂无渠道，添加挂盘渠道以加速出租。</p>';
    return ''
      + '<section class="card"><h2>渠道管理</h2>' + rows
      +   '<button type="button" class="btn btn--new" id="add-channel" data-house="' + escapeHtml(house._id) + '">+ 添加渠道</button>'
      + '</section>'
      + channelFormHtml(house._id, editing, ui.errors || {});
  }

  return { channelPageHtml: channelPageHtml, buildChannel: buildChannel, validateChannel: validateChannel };
});
