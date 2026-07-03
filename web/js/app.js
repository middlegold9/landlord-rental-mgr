(function () {
  'use strict';

  var LRM = window.LRM || {};
  var houseState = { seg: 'vacant' };
  var formState = { house: null, gallery: [] };

  var TABS = {
    overview:   { title: '概览',  render: renderOverview },
    houses:     { title: '房源',  render: renderHouses },
    reminders:  { title: '提醒',  render: renderReminders },
    mine:       { title: '我的',  render: renderMine }
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return LRM.escapeHtml(s); }

  function renderOverview() {
    return ''
      + '<section class="card"><h2>本月收租</h2><p class="muted">（Phase 1 起接入数据）</p></section>'
      + '<section class="card"><h2>房源概览</h2><p>待租 / 已租 统计将在此展示。</p></section>';
  }
  function renderHouses() {
    LRM.houseRepo.seed();
    LRM.attachmentRepo.seed();
    var houses = LRM.houseRepo.list(houseState.seg);
    var head = '<button type="button" class="btn btn--new" id="new-house">+ 新建房源</button>';
    return head + LRM.housesPageHtml(houses, houseState.seg);
  }
  function renderReminders() {
    return '<section class="card"><h2>提醒</h2><p class="muted">带看 / 交租 / 到期 聚合（Phase 5 实现）。</p></section>';
  }
  function renderMine() {
    return '<section class="card"><h2>我的</h2><p class="muted">房东资料 / 数据导出（Phase 5 实现）。</p></section>';
  }

  // 详情页（只读 + 编辑入口 + 附件列表）
  function detailHtml(h) {
    var layout = h.layout ? (h.layout.bedrooms + '室' + (h.layout.livingrooms || 0) + '厅' + (h.layout.bathrooms || 0) + '卫') : '—';
    var tags = (h.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    var atts = LRM.attachmentRepo.list(h._id);
    var attHtml = atts.length
      ? atts.map(function (a) {
          var chip = LRM.attachmentItemHtml(a);
          // T7：图片/文档用 blob URL 提供前端预览与打开
          if (a._blobUrl) return '<a class="att-item" href="' + a._blobUrl + '" target="_blank">' + chip + '</a>';
          return '<span class="att-item">' + chip + '</span>';
        }).join('')
      : '<p class="muted">暂无附件；编辑时可上传图册。</p>';

    return ''
      + '<section class="card">'
      +   '<h2>' + esc(h.nickname) + '</h2>'
      +   '<p class="muted">' + esc(h.titleDeed || '') + '</p>'
      +   '<p>' + esc(h.address || '') + '</p>'
      +   '<p>' + esc(h.area) + '㎡ · ' + esc(layout) + ' · ' + esc(h.orientation || '') + '向</p>'
      +   '<p>楼层 ' + esc(h.floor || '-') + '/' + esc(h.totalFloors || '-') + ' · ' + (h.hasElevator ? '有电梯' : '无电梯') + '</p>'
      +   '<p>状态：' + esc(LRM.status.labelOf('HOUSE_STATUS', h.status)) + '</p>'
      +   (tags ? '<p class="house-card__tags">' + tags + '</p>' : '')
      +   '<div class="form__actions">'
      +     '<button type="button" class="btn btn--ghost" id="back-to-list">← 返回列表</button>'
      +     '<button type="button" class="btn" id="edit-house" data-id="' + esc(h._id) + '">编辑资料</button>'
      +   '</div>'
      + '</section>'
      + '<section class="card"><h2>图册 / 附件</h2>' + attHtml + '</section>';
  }

  function renderHouseForm(house, errors) {
    formState.house = house || null;
    formState.gallery = [];
    el('page').innerHTML = LRM.houseFormHtml(house, errors);
  }

  function readFormValues(form) {
    var names = ['nickname', 'titleDeed', 'address', 'area', 'bedrooms', 'livingrooms',
      'bathrooms', 'floor', 'totalFloors', 'orientation', 'decoration', 'tags'];
    var v = {};
    names.forEach(function (n) { v[n] = form.elements[n] ? form.elements[n].value : ''; });
    v.status = form.elements['status'] ? form.elements['status'].value : 'vacant';
    v.hasElevator = form.elements['hasElevator'] ? form.elements['hasElevator'].checked : false;
    return v;
  }

  // T6 保存：buildHouse + validateHouse + 落库；图册附件落库（attachmentRepo）
  function saveHouse(e) {
    e.preventDefault();
    var form = e.target;
    var base = formState.house || {};
    var values = readFormValues(form);
    var h = LRM.buildHouse(values, base);
    var errs = LRM.validateHouse(h);
    if (Object.keys(errs).length) {
      el('page').innerHTML = LRM.houseFormHtml(h, errs); // 回填 + 错误
      return;
    }
    var saved;
    if (base._id) { LRM.houseRepo.update(base._id, h); saved = LRM.houseRepo.get(base._id); }
    else { saved = LRM.houseRepo.create(h); }

    // 本次会话新上传的图册 → 创建附件记录并挂到房源
    if (formState.gallery.length) {
      saved.gallery = saved.gallery || [];
      formState.gallery.forEach(function (g) {
        LRM.attachmentRepo.create({
          houseId: saved._id, name: g.name, ext: g.ext, size: g.size,
          refType: '图册', _blobUrl: g.blobUrl, fileID: g.fileID
        });
        saved.gallery.push({ fileID: g.fileID, refType: '图册' });
      });
      LRM.houseRepo.update(saved._id, { gallery: saved.gallery });
    }
    show('houses');
  }

  // T6 图册上传：生成 blob URL 预览缩略图并暂存，待保存时落库
  function onPageChange(e) {
    if (!e.target || e.target.id !== 'gallery-input') return;
    var files = e.target.files || [];
    var preview = el('gallery-preview');
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var fileID = 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var blobUrl = URL.createObjectURL(f);
      formState.gallery.push({
        fileID: fileID, name: f.name,
        ext: (f.name.split('.').pop() || '').toLowerCase(), size: f.size, blobUrl: blobUrl
      });
      var img = document.createElement('img');
      img.src = blobUrl; img.alt = f.name; img.className = 'gallery-thumb';
      if (preview) preview.appendChild(img);
    }
  }

  function onPageClick(e) {
    if (!e.target) return;
    if (e.target.closest('#back-to-list')) { show('houses'); return; }
    if (e.target.closest('#new-house')) { renderHouseForm({}, {}); return; }
    if (e.target.closest('#edit-house')) {
      var id = e.target.closest('#edit-house').getAttribute('data-id');
      var hh = LRM.houseRepo.get(id);
      renderHouseForm(hh || {}, {});
      return;
    }
    if (e.target.closest('#form-cancel')) {
      if (formState.house && formState.house._id) {
        var d = LRM.houseRepo.get(formState.house._id);
        if (d) { el('page').innerHTML = detailHtml(d); return; }
      }
      show('houses');
      return;
    }
    var card = e.target.closest('.house-card');
    if (card) {
      var h = LRM.houseRepo.get(card.getAttribute('data-id'));
      if (h) el('page').innerHTML = detailHtml(h);
    }
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
    el('page').addEventListener('click', onPageClick);
    el('page').addEventListener('change', onPageChange);
    el('page').addEventListener('submit', function (e) {
      if (e.target && e.target.id === 'house-form') saveHouse(e);
    });
    show('overview');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
