(function () {
  'use strict';

  var LRM = window.LRM || {};
  var houseState = { seg: 'vacant' };
  var formState = { house: null, gallery: [] };
  var currentHouseId = null;

  var TABS = {
    overview:   { title: '概览',  render: renderOverview },
    houses:     { title: '房源',  render: renderHouses },
    reminders:  { title: '提醒',  render: renderReminders },
    mine:       { title: '我的',  render: renderMine }
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return LRM.escapeHtml(s); }

  function seedWorkflow() {
    LRM.channelRepo.seed();
    LRM.showingRepo.seed();
    LRM.signingRepo.seed();
  }

  function backBar() {
    return '<div class="subhead"><button type="button" class="link-btn" data-back-detail="1">← 返回详情</button></div>';
  }

  function renderOverview() {
    return ''
      + '<section class="card"><h2>本月收租</h2><p class="muted">（Phase 1 起接入数据）</p></section>'
      + '<section class="card"><h2>房源概览</h2><p>空置 / 已租 统计将在此展示。</p></section>';
  }
  function renderHouses() {
    LRM.houseRepo.seed();
    LRM.attachmentRepo.seed();
    seedWorkflow();
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

  // 详情页（只读 + 编辑入口 + 附件列表 + 出房工作台入口）
  function detailHtml(h) {
    var layout = h.layout ? (h.layout.bedrooms + '室' + (h.layout.livingrooms || 0) + '厅' + (h.layout.bathrooms || 0) + '卫') : '—';
    var tags = (h.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    var atts = LRM.attachmentRepo.list(h._id);
    var attHtml = atts.length
      ? atts.map(function (a) {
          var chip = LRM.attachmentItemHtml(a);
          if (a._blobUrl) return '<a class="att-item" href="' + a._blobUrl + '" target="_blank">' + chip + '</a>';
          return '<span class="att-item">' + chip + '</span>';
        }).join('')
      : '<p class="muted">暂无附件；编辑时可上传图册。</p>';

    var workflow = '';
    if (h.status === 'vacant') {
      var sg = LRM.signingRepo.getByHouse(h._id);
      var stageText = sg ? ('当前签约：' + esc(LRM.status.labelOf('SIGNING_STAGE', sg.stage))) : '尚未开启签约流程';
      workflow = '<section class="card"><h2>出房工作台</h2>'
        +   '<div class="grid-2">'
        +     '<button type="button" class="btn btn--ghost" id="open-channels">渠道管理</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-showings">带看记录</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-price">价格策略</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-signing">签约流程</button>'
        +   '</div>'
        +   '<p class="muted">' + stageText + '</p></section>';
    }

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
      + workflow
      + '<section class="card"><h2>图册 / 附件</h2>' + attHtml + '</section>';
  }

  function openDetail(id) {
    currentHouseId = id;
    var h = LRM.houseRepo.get(id);
    seedWorkflow();
    el('page').innerHTML = h ? detailHtml(h) : '';
  }

  // ——— T8 渠道管理 ———
  function renderChannels(houseId, editing, errors) {
    LRM.channelRepo.seed();
    var house = LRM.houseRepo.get(houseId);
    var channels = LRM.channelRepo.list(houseId);
    el('page').innerHTML = backBar()
      + LRM.channelPageHtml(house, channels, { editing: editing || null, errors: errors || {} });
  }
  function readChannelValues(form) {
    var f = form.elements;
    return {
      contact: f.contact ? f.contact.value : '',
      type: f.type ? f.type.value : 'other',
      commission: f.commission ? f.commission.value : 0,
      listPrice: f.listPrice ? f.listPrice.value : '',
      floorPrice: f.floorPrice ? f.floorPrice.value : '',
      exposure: f.exposure ? f.exposure.value : '',
      listed: f.listed ? f.listed.checked : false
    };
  }
  function saveChannel(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var id = form.elements['_id'] ? form.elements['_id'].value : '';
    var base = id ? { _id: id, houseId: houseId } : { houseId: houseId };
    var values = readChannelValues(form);
    var c = LRM.buildChannel(values, base);
    var errs = LRM.validateChannel(c);
    if (Object.keys(errs).length) { renderChannels(houseId, c, errs); return; }
    if (id) { LRM.channelRepo.update(id, c); } else { LRM.channelRepo.create(c); }
    renderChannels(houseId);
  }

  // ——— T9 带看记录 ———
  function renderShowings(houseId, editing, errors) {
    LRM.showingRepo.seed();
    var house = LRM.houseRepo.get(houseId);
    var showings = LRM.showingRepo.list(houseId);
    el('page').innerHTML = backBar()
      + LRM.showingPageHtml(house, showings, { editing: editing || null, errors: errors || {} });
  }
  function readShowingValues(form) {
    var f = form.elements;
    return {
      prospectTenant: f.prospectTenant ? f.prospectTenant.value : '',
      sourceChannel: f.sourceChannel ? f.sourceChannel.value : '',
      agent: f.agent ? f.agent.value : '',
      appointmentAt: f.appointmentAt ? f.appointmentAt.value : '',
      status: f.status ? f.status.value : 'pending',
      tenantFeedback: f.tenantFeedback ? f.tenantFeedback.value : '',
      landlordScore: f.landlordScore ? f.landlordScore.value : '',
      landlordNote: f.landlordNote ? f.landlordNote.value : ''
    };
  }
  function saveShowing(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var id = form.elements['_id'] ? form.elements['_id'].value : '';
    var base = id ? { _id: id, houseId: houseId } : { houseId: houseId };
    var values = readShowingValues(form);
    var s = LRM.buildShowing(values, base);
    var errs = LRM.validateShowing(s);
    if (Object.keys(errs).length) { renderShowings(houseId, s, errs); return; }
    if (id) { LRM.showingRepo.update(id, s); } else { LRM.showingRepo.create(s); }
    renderShowings(houseId);
  }

  // ——— T10 价格策略 + 双向反馈 ———
  function renderPrice(houseId) {
    LRM.channelRepo.seed();
    LRM.showingRepo.seed();
    var house = LRM.houseRepo.get(houseId);
    var channels = LRM.channelRepo.list(houseId);
    var showings = LRM.showingRepo.list(houseId);
    el('page').innerHTML = backBar() + LRM.priceStrategyPageHtml(house, channels, showings);
  }
  function readCardValue(card, name) {
    var node = card.querySelector('[name="' + name + '"]');
    return node ? node.value : '';
  }
  function savePrice(chId, card) {
    var p = LRM.buildPrice({
      listPrice: readCardValue(card, 'listPrice'),
      floorPrice: readCardValue(card, 'floorPrice'),
      exposure: readCardValue(card, 'exposure')
    });
    var errs = LRM.validatePrice(p);
    if (Object.keys(errs).length) { renderPrice(currentHouseId); return; }
    LRM.channelRepo.update(chId, p);
    renderPrice(currentHouseId);
  }
  function saveFeedback(shId, card) {
    var f = LRM.buildFeedback({
      tenantFeedback: readCardValue(card, 'tenantFeedback'),
      landlordScore: readCardValue(card, 'landlordScore'),
      landlordNote: readCardValue(card, 'landlordNote')
    });
    var errs = LRM.validateFeedback(f);
    if (Object.keys(errs).length) { renderPrice(currentHouseId); return; }
    LRM.showingRepo.update(shId, f);
    renderPrice(currentHouseId);
  }

  // ——— T11 签约流程 ———
  function renderSigning(houseId) {
    LRM.signingRepo.seed();
    var house = LRM.houseRepo.get(houseId);
    var sg = LRM.signingRepo.getByHouse(houseId);
    el('page').innerHTML = backBar() + LRM.signingPageHtml(house, sg);
  }
  function advanceSigning(houseId) {
    var sg = LRM.signingRepo.getByHouse(houseId) || LRM.signingRepo.createOrGet(houseId);
    if (sg) LRM.signingRepo.advance(sg._id);
    renderSigning(houseId);
  }
  function resetSigning(houseId) {
    var sg = LRM.signingRepo.getByHouse(houseId);
    if (sg) LRM.signingRepo.reset(sg._id);
    renderSigning(houseId);
  }

  // ——— T6 房源表单 ———
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
  function saveHouse(e) {
    e.preventDefault();
    var form = e.target;
    var base = formState.house || {};
    var values = readFormValues(form);
    var h = LRM.buildHouse(values, base);
    var errs = LRM.validateHouse(h);
    if (Object.keys(errs).length) {
      el('page').innerHTML = LRM.houseFormHtml(h, errs);
      return;
    }
    var saved;
    if (base._id) { LRM.houseRepo.update(base._id, h); saved = LRM.houseRepo.get(base._id); }
    else { saved = LRM.houseRepo.create(h); }

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
    var t = e.target;

    // 返回详情
    if (t.closest('[data-back-detail]')) { openDetail(currentHouseId); return; }
    // 出房工作台入口
    if (t.closest('#open-channels')) { renderChannels(currentHouseId); return; }
    if (t.closest('#open-showings')) { renderShowings(currentHouseId); return; }
    if (t.closest('#open-price')) { renderPrice(currentHouseId); return; }
    if (t.closest('#open-signing')) { renderSigning(currentHouseId); return; }

    // 渠道：添加 / 编辑 / 删除 / 取消
    if (t.closest('#add-channel')) { renderChannels(currentHouseId); return; }
    var editCh = t.closest('[data-edit-channel]');
    if (editCh) {
      var ch = LRM.channelRepo.get(editCh.getAttribute('data-edit-channel'));
      renderChannels(currentHouseId, ch);
      return;
    }
    var delCh = t.closest('[data-del-channel]');
    if (delCh) { LRM.channelRepo.remove(delCh.getAttribute('data-del-channel')); renderChannels(currentHouseId); return; }
    if (t.closest('[data-ch-cancel]')) { renderChannels(currentHouseId); return; }

    // 带看：添加 / 编辑 / 删除 / 置状态 / 取消
    if (t.closest('#add-showing')) { renderShowings(currentHouseId); return; }
    var editSh = t.closest('[data-edit-showing]');
    if (editSh) {
      var sh = LRM.showingRepo.get(editSh.getAttribute('data-edit-showing'));
      renderShowings(currentHouseId, sh);
      return;
    }
    var delSh = t.closest('[data-del-showing]');
    if (delSh) { LRM.showingRepo.remove(delSh.getAttribute('data-del-showing')); renderShowings(currentHouseId); return; }
    var setSh = t.closest('[data-set-showing]');
    if (setSh) {
      LRM.showingRepo.update(setSh.getAttribute('data-set-showing'), { status: setSh.getAttribute('data-status') });
      renderShowings(currentHouseId);
      return;
    }
    if (t.closest('[data-sh-cancel]')) { renderShowings(currentHouseId); return; }

    // 价格 / 反馈保存
    var savePriceBtn = t.closest('[data-save-price]');
    if (savePriceBtn) { savePrice(savePriceBtn.getAttribute('data-save-price'), savePriceBtn.closest('.price-card')); return; }
    var saveFeedBtn = t.closest('[data-save-feedback]');
    if (saveFeedBtn) { saveFeedback(saveFeedBtn.getAttribute('data-save-feedback'), saveFeedBtn.closest('.price-card')); return; }

    // 签约：推进 / 重置
    if (t.closest('[data-advance-signing]')) { advanceSigning(currentHouseId); return; }
    if (t.closest('[data-reset-signing]')) { resetSigning(currentHouseId); return; }

    // 房源相关（详情 / 列表 / 表单）
    if (t.closest('#back-to-list')) { show('houses'); return; }
    if (t.closest('#new-house')) { renderHouseForm({}, {}); return; }
    if (t.closest('#edit-house')) {
      var id = t.closest('#edit-house').getAttribute('data-id');
      var hh = LRM.houseRepo.get(id);
      renderHouseForm(hh || {}, {});
      return;
    }
    if (t.closest('#form-cancel')) {
      if (formState.house && formState.house._id) {
        var d = LRM.houseRepo.get(formState.house._id);
        if (d) { el('page').innerHTML = detailHtml(d); return; }
      }
      show('houses');
      return;
    }
    var card = t.closest('.house-card');
    if (card) {
      var hc = LRM.houseRepo.get(card.getAttribute('data-id'));
      if (hc) openDetail(hc._id);
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
      var form = e.target;
      if (!form || !form.id) return;
      if (form.id === 'house-form') saveHouse(e);
      else if (form.id === 'channel-form') saveChannel(e);
      else if (form.id === 'showing-form') saveShowing(e);
    });
    show('overview');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
