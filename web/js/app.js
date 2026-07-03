/**
 * app.js — 极简路由 / Tab 切换（T1 外壳）
 * 后续各 Phase 在 renderXxx 中替换真实页面；数据层接入见 tasks.md。
 */
(function () {
  'use strict';

  var LRM = window.LRM || {};
  var houseState = { seg: 'vacant' };

  var TABS = {
    overview:   { title: '概览',  render: renderOverview },
    houses:     { title: '房源',  render: renderHouses },
    reminders:  { title: '提醒',  render: renderReminders },
    mine:       { title: '我的',  render: renderMine }
  };

  function el(id) { return document.getElementById(id); }

  function renderOverview() {
    return ''
      + '<section class="card"><h2>本月收租</h2><p class="muted">（Phase 1 起接入数据）</p></section>'
      + '<section class="card"><h2>房源概览</h2><p>待租 / 已租 统计将在此展示。</p></section>';
  }
  function renderHouses() {
    LRM.houseRepo.seed();
    LRM.attachmentRepo.seed();
    var houses = LRM.houseRepo.list(houseState.seg);
    return LRM.housesPageHtml(houses, houseState.seg);
  }
  function renderReminders() {
    return '<section class="card"><h2>提醒</h2><p class="muted">带看 / 交租 / 到期 聚合（Phase 5 实现）。</p></section>';
  }
  function renderMine() {
    return '<section class="card"><h2>我的</h2><p class="muted">房东资料 / 数据导出（Phase 5 实现）。</p></section>';
  }

  // 简易房源详情（T6 将扩展为完整编辑表单）
  function detailHtml(h) {
    var layout = h.layout
      ? (h.layout.bedrooms + '室' + (h.layout.livingrooms || 0) + '厅' + (h.layout.bathrooms || 0) + '卫')
      : '—';
    return ''
      + '<section class="card">'
      +   '<h2>' + esc(h.nickname) + '</h2>'
      +   '<p class="muted">' + esc(h.address || '') + '</p>'
      +   '<p>' + esc(h.area) + '㎡ · ' + esc(layout) + ' · ' + esc(h.orientation || '') + '向</p>'
      +   '<p>状态：' + esc(LRM.status.labelOf('HOUSE_STATUS', h.status)) + '</p>'
      +   '<button type="button" class="btn" id="back-to-list">← 返回列表</button>'
      + '</section>'
      + '<p class="muted card">完整编辑表单为 T6 实现。</p>';
  }

  function show(tab) {
    var cfg = TABS[tab] || TABS.overview;
    el('appbar-title').textContent = cfg.title;
    el('page').innerHTML = cfg.render();
    var items = document.querySelectorAll('.tabbar__item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-active', items[i].getAttribute('data-tab') === tab);
    }
  }

  function onPageClick(e) {
    if (!e.target) return;
    var seg = e.target.closest('[data-seg]');
    if (seg) {
      houseState.seg = seg.getAttribute('data-seg');
      el('page').innerHTML = LRM.housesPageHtml(LRM.houseRepo.list(houseState.seg), houseState.seg);
      return;
    }
    if (e.target.closest('#back-to-list')) {
      show('houses');
      return;
    }
    var card = e.target.closest('.house-card');
    if (card) {
      var h = LRM.houseRepo.get(card.getAttribute('data-id'));
      if (h) el('page').innerHTML = detailHtml(h);
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    el('tabbar').addEventListener('click', function (e) {
      var btn = e.target.closest('.tabbar__item');
      if (btn) show(btn.getAttribute('data-tab'));
    });
    el('page').addEventListener('click', onPageClick);
    show('overview');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
