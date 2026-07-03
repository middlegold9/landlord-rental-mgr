/**
 * houseForm.js — 房源详情 / 编辑表单纯函数（T6）
 * - houseFormHtml(house, errors)：输出表单 HTML，支持预填值与字段级错误展示
 * - buildHouse(values, base)：把表单值映射为 data-model 的 house 对象（纯函数，便于测试）
 * - validateHouse(house)：必填校验，返回 { 字段: 错误 }（空对象表示通过）
 * 转义统一走 utils/dom.escapeHtml。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { dom: require('../utils/dom'), status: require('../utils/status') };
    var api = factory(deps);
    module.exports = { houseFormHtml: api.houseFormHtml, buildHouse: api.buildHouse, validateHouse: api.validateHouse };
  } else {
    deps = { dom: root.LRM, status: root.LRM.status };
    var a = factory(deps);
    root.LRM = Object.assign(root.LRM || {}, { houseFormHtml: a.houseFormHtml, buildHouse: a.buildHouse, validateHouse: a.validateHouse });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var escapeHtml = deps.dom.escapeHtml;
  var status = deps.status;

  function field(name, label, value, type, errors) {
    var err = errors && errors[name];
    var errHtml = err ? '<span class="field__err">' + escapeHtml(err) + '</span>' : '';
    var val = value == null ? '' : value;
    var ctrl = type === 'checkbox'
      ? '<input type="checkbox" id="f_' + name + '" name="' + name + '"' + (value ? ' checked' : '') + ' />'
      : '<input type="' + type + '" id="f_' + name + '" name="' + name + '" value="' + escapeHtml(val) + '" />';
    return ''
      + '<label class="field' + (err ? ' field--invalid' : '') + '">'
      +   '<span class="field__label">' + escapeHtml(label) + '</span>'
      +   ctrl
      +   errHtml
      + '</label>';
  }

  function houseFormHtml(house, errors) {
    house = house || {};
    var layout = house.layout || {};
    var errs = errors || {};
    var statusOpts = Object.keys(status.ENUMS.HOUSE_STATUS).map(function (k) {
      var sel = house.status === k ? ' selected' : '';
      return '<option value="' + k + '"' + sel + '>' + escapeHtml(status.ENUMS.HOUSE_STATUS[k]) + '</option>';
    }).join('');
    var tagsVal = Array.isArray(house.tags) ? house.tags.join(',') : (house.tags || '');

    return ''
      + '<form id="house-form" class="card form">'
      +   field('nickname', '自定义昵称 *', house.nickname, 'text', errs)
      +   field('titleDeed', '房产证全称', house.titleDeed, 'text', errs)
      +   field('address', '地址 *', house.address, 'text', errs)
      +   field('area', '面积(㎡) *', house.area, 'number', errs)
      +   '<div class="field-row">'
      +     field('bedrooms', '卧室数', layout.bedrooms, 'number', errs)
      +     field('livingrooms', '客厅数', layout.livingrooms, 'number', errs)
      +     field('bathrooms', '卫生间数', layout.bathrooms, 'number', errs)
      +   '</div>'
      +   '<div class="field-row">'
      +     field('floor', '所在楼层', house.floor, 'number', errs)
      +     field('totalFloors', '总楼层', house.totalFloors, 'number', errs)
      +   '</div>'
      +   field('orientation', '朝向', house.orientation, 'text', errs)
      +   field('decoration', '装修', house.decoration, 'text', errs)
      +   field('hasElevator', '有电梯', house.hasElevator, 'checkbox', errs)
      +   '<label class="field"><span class="field__label">状态</span>'
      +     '<select id="f_status" name="status">' + statusOpts + '</select></label>'
      +   field('tags', '标签（逗号分隔）', tagsVal, 'text', errs)
      +   '<div class="field"><span class="field__label">图册</span>'
      +     '<input type="file" id="gallery-input" name="gallery" '
      +       'accept="image/*,application/pdf,.doc,.docx" multiple />'
      +     '<div id="gallery-preview" class="gallery-preview"></div>'
      +   '</div>'
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" id="form-cancel">取消</button>'
      +     '<button type="submit" class="btn">保存</button>'
      +   '</div>'
      + '</form>';
  }

  // 把普通表单值对象映射为 house（base 用于保留 _id 等既有字段）
  function buildHouse(values, base) {
    base = base || {};
    var h = Object.assign({}, base);
    h.nickname = (values.nickname || '').trim();
    h.titleDeed = (values.titleDeed || '').trim();
    h.address = (values.address || '').trim();
    h.area = Number(values.area) || 0;
    h.layout = {
      bedrooms: Number(values.bedrooms) || 0,
      livingrooms: Number(values.livingrooms) || 0,
      bathrooms: Number(values.bathrooms) || 0
    };
    h.floor = Number(values.floor) || 0;
    h.totalFloors = Number(values.totalFloors) || 0;
    h.orientation = (values.orientation || '').trim();
    h.decoration = (values.decoration || '').trim();
    h.hasElevator = !!values.hasElevator;
    h.status = values.status === 'rented' ? 'rented' : 'vacant';
    h.tags = (values.tags || '').split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);
    return h;
  }

  function validateHouse(h) {
    var errs = {};
    if (!h.nickname || !String(h.nickname).trim()) errs.nickname = '请填写昵称';
    if (!h.address || !String(h.address).trim()) errs.address = '请填写地址';
    if (!(Number(h.area) > 0)) errs.area = '面积需大于 0';
    if (h.status !== 'vacant' && h.status !== 'rented') errs.status = '状态非法';
    return errs;
  }

  return { houseFormHtml: houseFormHtml, buildHouse: buildHouse, validateHouse: validateHouse };
});
