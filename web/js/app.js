/**
 * app.js — 极简路由 / Tab 切换（T1 外壳）
 * 后续各 Phase 在 renderXxx 中替换真实页面；数据层接入见 tasks.md。
 */
(function () {
  'use strict';

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
    return '<section class="card"><h2>房源</h2><p class="muted">待租 / 已租 列表（Phase 1 实现）。</p></section>';
  }
  function renderReminders() {
    return '<section class="card"><h2>提醒</h2><p class="muted">带看 / 交租 / 到期 聚合（Phase 5 实现）。</p></section>';
  }
  function renderMine() {
    return '<section class="card"><h2>我的</h2><p class="muted">房东资料 / 数据导出（Phase 5 实现）。</p></section>';
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

  function init() {
    el('tabbar').addEventListener('click', function (e) {
      var btn = e.target.closest('.tabbar__item');
      if (btn) show(btn.getAttribute('data-tab'));
    });
    show('overview');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
