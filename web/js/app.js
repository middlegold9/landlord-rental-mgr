(function () {
  'use strict';

  var LRM = window.LRM || {};
  var houseState = { seg: 'vacant' };
  var formState = { house: null, gallery: [] };
  var currentHouseId = null;

  var TABS = {
    houses:     { title: '房源',  render: renderHouses },
    reminders:  { title: '提醒',  render: renderReminders }
  };

  function el(id) { return document.getElementById(id); }
  function esc(s) { return LRM.escapeHtml(s); }

  function seedWorkflow() {
    LRM.channelRepo.seed();
    LRM.showingRepo.seed();
    LRM.signingRepo.seed();
  }
  function seedTenancy() {
    LRM.leaseRepo.seed();
    LRM.tenantRepo.seed();
    LRM.utilityRepo.seed();
    LRM.handoverRepo.seed();
    LRM.repairRepo.seed();
  }
  function seedBilling() { LRM.billRepo.seed(); }
  function seedAll() {
    LRM.houseRepo.seed();
    LRM.attachmentRepo.seed();
    seedWorkflow();
    seedTenancy();
    seedBilling();
  }
  function daysBetween(a, b) {
    var da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
  }

  function backBar() {
    return '<div class="subhead"><button type="button" class="link-btn" data-back-detail="1">← 返回详情</button></div>';
  }

  function renderHouses() {
    LRM.houseRepo.seed();
    LRM.attachmentRepo.seed();
    seedWorkflow();
    var houses = LRM.houseRepo.list(houseState.seg).filter(matchesHouseKw);
    var searchBox = '<div class="search-wrap">'
      + '<input type="search" id="house-search" class="search" placeholder="搜索昵称 / 地址 / 标签" value="' + esc(houseState.search || '') + '" />'
      + '</div>';
    var head = '<div class="toolbar">'
      + '<button type="button" class="btn btn--new" id="new-house">+ 新建房源</button>'
      + '<button type="button" class="btn" id="export-ledger">导出台账 (PDF)</button>'
      + '</div>';
    return head + searchBox + LRM.housesPageHtml(houses, houseState.seg);
  }
  function matchesHouseKw(h) {
    var kw = (houseState.search || '').trim().toLowerCase();
    if (!kw) return true;
    var hay = [h.nickname, h.address, h.titleDeed, (h.tags || []).join(' ')].join(' ').toLowerCase();
    return hay.indexOf(kw) !== -1;
  }
  function renderHouseListOnly() {
    var listEl = el('house-list');
    if (!listEl) return;
    var houses = LRM.houseRepo.list(houseState.seg).filter(matchesHouseKw);
    var label = houseState.seg === 'rented' ? '已租' : '空置';
    listEl.innerHTML = houses.length
      ? houses.map(LRM.houseCardHtml).join('')
      : '<p class="empty muted">暂无匹配' + label + '房源</p>';
  }
  function exportLedger() {
    var w = window.open('', '_blank');
    if (!w) return;
    w.document.write(buildLedgerHtml());
    w.document.close();
    w.focus();
    setTimeout(function () { w.print(); }, 300);
  }
  function buildLedgerHtml() {
    seedAll();
    var rows = LRM.houseRepo.list().map(function (h) {
      var lease = LRM.leaseRepo.getByHouse(h._id);
      var tenant = lease ? LRM.tenantRepo.getByLease(lease._id) : null;
      var bills = lease ? LRM.billRepo.list(lease._id) : [];
      var received = 0, due = 0;
      bills.forEach(function (b) { due += Number(b.total) || 0; if (b.status === 'paid') received += Number(b.total) || 0; });
      return {
        name: esc(h.nickname), status: esc(LRM.status.labelOf('HOUSE_STATUS', h.status)),
        tenant: tenant ? esc(tenant.wechat) : '—',
        rent: lease ? (esc(LRM.amount.formatCents(lease.rent)) + ' / ' + esc(LRM.status.labelOf('PAY_CYCLE', lease.payCycle))) : '—',
        received: esc(LRM.amount.formatCents(received)), owed: esc(LRM.amount.formatCents(due - received))
      };
    });
    var thead = '<tr><th>房源</th><th>状态</th><th>租客</th><th>租金/周期</th><th>已收</th><th>欠收</th></tr>';
    var tbody = rows.map(function (r) {
      return '<tr><td>' + r.name + '</td><td>' + r.status + '</td><td>' + r.tenant + '</td><td>' + r.rent
        + '</td><td>' + r.received + '</td><td>' + r.owed + '</td></tr>';
    }).join('');
    return '<!doctype html><html><head><meta charset="utf-8"><title>收租台账</title>'
      + '<style>body{font-family:sans-serif;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:12px}'
      + 'th,td{border:1px solid #ddd;padding:6px 8px;font-size:13px;text-align:left}</style></head>'
      + '<body><h1>收租台账 · 生成于 ' + new Date().toLocaleString() + '</h1>'
      + '<table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></body></html>';
  }
  function renderReminders() {
    seedAll();
    var today = new Date().toISOString().slice(0, 10);
    function inRange(d) { var n = daysBetween(today, d); return n >= 0 && n <= 7; }
    var showings = LRM.showingRepo.list().filter(function (s) { return s.status === 'pending'; });
    var bills = LRM.billRepo.all();
    var overdueBills = bills.filter(function (b) { return b.status === 'overdue'; });
    var dueSoon = bills.filter(function (b) { return b.status === 'unpaid' && inRange(b.dueDate); });
    var leases = LRM.leaseRepo.list();
    var expiring = leases.filter(function (l) { return l.status !== 'ended' && inRange(l.endDate); });

    function dot(n) { return n ? '<span class="dot dot--bad"></span>' : '<span class="dot"></span>'; }
    function rowHtml(title, n) { return '<p>' + dot(n) + ' ' + esc(title) + '：' + n + '</p>'; }

    return ''
      + '<section class="card"><h2>提醒中心</h2>'
      +   rowHtml('待带看', showings.length)
      +   rowHtml('逾期账单', overdueBills.length)
      +   rowHtml('7 日内应交', dueSoon.length)
      +   rowHtml('30 日内到期', expiring.length)
      +   (showings.length + overdueBills.length + dueSoon.length + expiring.length === 0
            ? '<p class="muted">暂无待办提醒。</p>' : '')
      + '</section>';
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

    // 已租房源：租约概要（点击卡片进入详情后可见的更多信息）
    var summary = '';
    if (h.status === 'rented') {
      var sumLease = LRM.leaseRepo.getByHouse(h._id);
      if (sumLease) {
        var sumTenant = LRM.tenantRepo.getByLease(sumLease._id);
        var sumBills = LRM.billRepo.list(sumLease._id);
        var next = null;
        sumBills.forEach(function (b) { if (b.status !== 'paid') { if (!next || b.dueDate < next.dueDate) next = b; } });
        var nextTxt = next
          ? (next.period + ' 期 · ' + esc(LRM.amount.formatCents(next.total)) + ' · ' + esc(LRM.status.labelOf('BILL_STATUS', next.status)))
          : '已全部缴清';
        summary = '<section class="card"><h2>租约概要</h2>'
          + '<p>租客：' + (sumTenant ? esc(sumTenant.wechat) : '—') + (sumTenant && sumTenant.phone ? '（' + esc(sumTenant.phone) + '）' : '') + '</p>'
          + '<p>租金：' + esc(LRM.amount.formatCents(sumLease.rent)) + ' / ' + esc(LRM.status.labelOf('PAY_CYCLE', sumLease.payCycle)) + ' · 押金 ' + esc(LRM.amount.formatCents(sumLease.deposit)) + '</p>'
          + '<p>租期：' + esc(sumLease.startDate) + ' ~ ' + esc(sumLease.endDate) + '</p>'
          + '<p>下一期应交：' + nextTxt + '</p>'
          + '</section>';
      }
    }

    var tenancy = '';
    if (h.status === 'rented') {
      tenancy = '<section class="card"><h2>已租管理</h2>'
        +   '<div class="grid-2">'
        +     '<button type="button" class="btn btn--ghost" id="open-lease">租约 / 租客</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-utility">费用 / 交接单</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-bills">账单 / 收租</button>'
        +     '<button type="button" class="btn btn--ghost" id="open-settle">退租 / 续租</button>'
        +   '</div></section>';
    }

    var maintenance = '<section class="card"><h2>维护</h2>'
      +   '<button type="button" class="btn btn--ghost" id="open-repair">维修记录</button>'
      + '</section>';

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
      + summary
      + tenancy
      + maintenance
      + '<section class="card"><h2>图册 / 附件</h2>' + attHtml + '</section>';
  }

  function openDetail(id) {
    currentHouseId = id;
    seedAll();
    var h = LRM.houseRepo.get(id);
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

  // ——— T12 租约 / 租客 ———
  function renderLease(houseId, draftLease, draftTenant, errors) {
    seedTenancy();
    var house = LRM.houseRepo.get(houseId);
    var lease = draftLease || LRM.leaseRepo.getByHouse(houseId) || null;
    var tenant = draftTenant || (lease ? LRM.tenantRepo.getByLease(lease._id) : null);
    el('page').innerHTML = backBar() + LRM.leasePageHtml(house, lease, tenant, { editing: true, errors: errors || {} });
  }
  function readLeaseValues(form) {
    var f = form.elements;
    var v = {};
    ['startDate', 'endDate', 'rent', 'deposit', 'payCycle', 'payMethod', 'status', 'contractFileID', 'contractRefType',
      'wechat', 'phone', 'idCard', 'householdReg', 'occupation', 'income', 'occupants', 'emergencyContact', 'sourceChannel']
      .forEach(function (n) { v[n] = f[n] ? f[n].value : ''; });
    v.renewed = f.renewed ? f.renewed.checked : false;
    v.hasPet = f.hasPet ? f.hasPet.checked : false;
    return v;
  }
  function saveLease(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var leaseIdEl = form.elements['leaseId'];
    var tenantIdEl = form.elements['tenantId'];
    var vals = readLeaseValues(form);

    var leaseBase = leaseIdEl && leaseIdEl.value ? { _id: leaseIdEl.value, houseId: houseId } : { houseId: houseId };
    var lease = LRM.buildLease(vals, leaseBase);
    var leaseErrs = LRM.validateLease(lease);

    var tenantBase = tenantIdEl && tenantIdEl.value ? { _id: tenantIdEl.value } : {};
    var tenant = LRM.buildTenant(vals, tenantBase);
    var tenantErrs = LRM.validateTenant(tenant);

    var allErrs = Object.assign({}, leaseErrs, tenantErrs);
    if (Object.keys(allErrs).length) { renderLease(houseId, lease, tenant, allErrs); return; }

    var savedLease = leaseBase._id ? LRM.leaseRepo.update(leaseBase._id, lease) : LRM.leaseRepo.create(lease);
    tenant.leaseId = savedLease._id;
    if (tenantBase._id) LRM.tenantRepo.update(tenantBase._id, tenant);
    else LRM.tenantRepo.create(tenant);
    openDetail(houseId);
  }

  // ——— T13 费用账户 / 入驻交接单 ———
  function renderUtility(houseId, opts) {
    opts = opts || {};
    seedTenancy();
    var house = LRM.houseRepo.get(houseId);
    var utils = LRM.utilityRepo.list(houseId);
    var lease = LRM.leaseRepo.getByHouse(houseId);
    var handover = opts.handoverDraft || (lease ? LRM.handoverRepo.getByLease(lease._id) : null);
    el('page').innerHTML = backBar() + LRM.utilityPageHtml(house, utils, handover, {
      editingUtility: opts.editingUtility != null ? opts.editingUtility : null,
      editingHandover: !!opts.editingHandover,
      leaseId: lease ? lease._id : null,
      errors: opts.errors || {}
    });
  }
  function readUtilityValues(form) {
    var f = form.elements;
    return {
      type: f.type ? f.type.value : 'water',
      accountNo: f.accountNo ? f.accountNo.value : '',
      moveInReading: f.moveInReading ? f.moveInReading.value : '',
      moveOutReading: f.moveOutReading ? f.moveOutReading.value : '',
      transferStatus: f.transferStatus ? f.transferStatus.value : 'pending'
    };
  }
  function saveUtility(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var id = form.elements['_id'] ? form.elements['_id'].value : '';
    var base = id ? { _id: id, houseId: houseId } : { houseId: houseId };
    var u = LRM.buildUtility(readUtilityValues(form), base);
    var errs = LRM.validateUtility(u);
    if (Object.keys(errs).length) { renderUtility(houseId, { editingUtility: u, errors: errs }); return; }
    if (id) LRM.utilityRepo.update(id, u); else LRM.utilityRepo.create(u);
    renderUtility(houseId);
  }
  function saveHandover(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var leaseId = form.elements['leaseId'] ? form.elements['leaseId'].value : '';
    var items = [];
    var checks = form.querySelectorAll('[name^="item_ok_"]');
    for (var i = 0; i < checks.length; i++) {
      items.push({ name: checks[i].getAttribute('data-name'), ok: checks[i].checked, note: '' });
    }
    var values = {
      handedAt: form.elements['handedAt'] ? form.elements['handedAt'].value : '',
      note: form.elements['note'] ? form.elements['note'].value : '',
      done: form.elements['done'] ? form.elements['done'].checked : false
    };
    var handover = LRM.buildHandover(values, items, { leaseId: leaseId });
    var errs = LRM.validateHandover(handover);
    if (Object.keys(errs).length) { renderUtility(houseId, { editingHandover: true, errors: errs, handoverDraft: handover }); return; }
    LRM.handoverRepo.save(leaseId, handover);
    renderUtility(houseId);
  }

  // ——— T14 维修 / 维护记录 ———
  function renderRepair(houseId, draftRepair, errors) {
    seedTenancy();
    var house = LRM.houseRepo.get(houseId);
    var repairs = LRM.repairRepo.list(houseId);
    el('page').innerHTML = backBar() + LRM.repairPageHtml(house, repairs, { editing: !!draftRepair, repair: draftRepair || null, errors: errors || {} });
  }
  function readRepairValues(form) {
    var f = form.elements;
    return {
      issue: f.issue ? f.issue.value : '',
      kind: f.kind ? f.kind.value : 'in_unit',
      handler: f.handler ? f.handler.value : '',
      cost: f.cost ? f.cost.value : '',
      reportedAt: f.reportedAt ? f.reportedAt.value : ''
    };
  }
  function saveRepair(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house');
    var r = LRM.buildRepair(readRepairValues(form), { houseId: houseId });
    var errs = LRM.validateRepair(r);
    if (Object.keys(errs).length) { renderRepair(houseId, r, errs); return; }
    LRM.repairRepo.create(r);
    renderRepair(houseId);
  }

  // ——— T15/T16/T17 账单 / 收租 ———
  function renderBill(houseId, ui) {
    seedTenancy();
    seedBilling();
    var lease = LRM.leaseRepo.getByHouse(houseId);
    var bills = lease ? LRM.billRepo.list(lease._id) : [];
    if (lease) LRM.billRepo.refreshOverdue(new Date().toISOString().slice(0, 10));
    el('page').innerHTML = backBar() + LRM.billPageHtml(LRM.houseRepo.get(houseId), lease, bills, ui || {});
  }
  function generateBillsAction() {
    var lease = LRM.leaseRepo.getByHouse(currentHouseId);
    if (!lease) { renderBill(currentHouseId); return; }
    var added = LRM.billRepo.generate(lease._id);
    renderBill(currentHouseId, { genResult: added ? ('已生成 ' + added + ' 期账单') : '账单期次已齐全' });
  }
  function readPayValues(form) {
    var f = form.elements;
    return {
      paidAt: f.paidAt ? f.paidAt.value : '',
      receiptFileID: f.receiptFileID ? f.receiptFileID.value : '',
      receiptRefType: f.receiptRefType ? f.receiptRefType.value : ''
    };
  }
  function saveBillPayment(e) {
    e.preventDefault();
    var form = e.target;
    var id = form.getAttribute('data-bill');
    var vals = readPayValues(form);
    var p = LRM.buildPay(vals);
    var errs = LRM.validatePay(p);
    if (Object.keys(errs).length) {
      var lease = LRM.leaseRepo.getByHouse(currentHouseId);
      var bills = LRM.billRepo.list(lease._id);
      el('page').innerHTML = backBar() + LRM.billPageHtml(LRM.houseRepo.get(currentHouseId), lease, bills, { payId: id, errors: errs });
      return;
    }
    LRM.billRepo.markPaid(id, { paidAt: p.paidAt, receiptRef: { fileID: p.receiptFileID, refType: p.receiptRefType } });
    renderBill(currentHouseId);
  }

  // ——— T18 退租清算 / 续租 ———
  function renderSettle(houseId, ui) {
    seedTenancy();
    var lease = LRM.leaseRepo.getByHouse(houseId);
    var tenant = lease ? LRM.tenantRepo.getByLease(lease._id) : null;
    el('page').innerHTML = backBar() + LRM.settlePageHtml(LRM.houseRepo.get(houseId), lease, tenant, ui || {});
  }
  function readRenewValues(form) {
    var f = form.elements;
    return { newEndDate: f.newEndDate ? f.newEndDate.value : '' };
  }
  function saveRenew(e) {
    e.preventDefault();
    var form = e.target;
    var lease = LRM.leaseRepo.getByHouse(currentHouseId);
    var vals = readRenewValues(form);
    var r = LRM.buildRenew(vals, lease ? { _id: lease._id } : {});
    var errs = LRM.validateRenew(r, lease);
    if (Object.keys(errs).length) { renderSettle(currentHouseId, { mode: 'renew', errors: errs, renewDraft: r }); return; }
    LRM.leaseRepo.renew(lease._id, r.newEndDate);
    LRM.billRepo.generate(lease._id);
    openDetail(currentHouseId);
  }
  function readSettleValues(form) {
    var f = form.elements;
    var items = [];
    var checks = form.querySelectorAll('[name^="mo_item_"]');
    for (var i = 0; i < checks.length; i++) {
      items.push({ name: checks[i].getAttribute('data-name'), ok: checks[i].checked, note: '' });
    }
    return {
      moveOutDate: f.moveOutDate ? f.moveOutDate.value : '',
      depositDeductionYuan: f.depositDeductionYuan ? f.depositDeductionYuan.value : '',
      note: f.note ? f.note.value : '',
      items: items
    };
  }
  function saveSettle(e) {
    e.preventDefault();
    var form = e.target;
    var houseId = form.getAttribute('data-house') || currentHouseId;
    var lease = LRM.leaseRepo.getByHouse(houseId);
    var vals = readSettleValues(form);
    var s = LRM.buildSettle(vals, lease ? { _id: lease._id } : {});
    var errs = LRM.validateSettle(s);
    if (Object.keys(errs).length) { renderSettle(houseId, { mode: 'settle', errors: errs, settleDraft: vals }); return; }
    var deposit = lease.deposit || 0;
    var deduction = s.depositDeduction || 0;
    LRM.leaseRepo.settle(lease._id, {
      moveOutDate: s.moveOutDate,
      depositDeduction: deduction,
      refundAmount: deposit - deduction,
      note: s.note
    });
    LRM.handoverRepo.save(lease._id, { handedAt: s.moveOutDate, note: s.note, items: s.items, done: true }, 'move_out');
    LRM.utilityRepo.list(houseId).forEach(function (u) { LRM.utilityRepo.update(u._id, { transferStatus: 'done' }); });
    openDetail(houseId);
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
    // 空置 / 已租 分段切换
    var segBtn = t.closest('.segment__item');
    if (segBtn) { houseState.seg = segBtn.getAttribute('data-seg'); renderHouses(); return; }
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

    // T12 租约 / 租客：进入 / 编辑
    if (t.closest('#open-lease')) { renderLease(currentHouseId); return; }
    if (t.closest('#edit-lease')) { renderLease(currentHouseId); return; }
    if (t.closest('[data-lease-cancel]')) { openDetail(currentHouseId); return; }

    // T13 费用账户 / 交接单：进入 / 增删改
    if (t.closest('#open-utility')) { renderUtility(currentHouseId); return; }
    if (t.closest('#add-utility')) { renderUtility(currentHouseId, { editingUtility: {} }); return; }
    var editUa = t.closest('[data-edit-utility]');
    if (editUa) {
      var ua = LRM.utilityRepo.get(editUa.getAttribute('data-edit-utility'));
      renderUtility(currentHouseId, { editingUtility: ua || {} });
      return;
    }
    var delUa = t.closest('[data-del-utility]');
    if (delUa) { LRM.utilityRepo.remove(delUa.getAttribute('data-del-utility')); renderUtility(currentHouseId); return; }
    if (t.closest('[data-utility-cancel]')) { renderUtility(currentHouseId); return; }
    if (t.closest('#edit-handover')) { renderUtility(currentHouseId, { editingHandover: true }); return; }
    if (t.closest('[data-handover-cancel]')) { renderUtility(currentHouseId); return; }

    // T14 维修记录：进入 / 登记 / 取消
    if (t.closest('#open-repair')) { renderRepair(currentHouseId, null, null); return; }
    if (t.closest('#add-repair')) { renderRepair(currentHouseId, {}, null); return; }
    if (t.closest('[data-repair-cancel]')) { renderRepair(currentHouseId, null, null); return; }

    // T15/T16/T17 账单 / 收租
    if (t.closest('#open-bills')) { renderBill(currentHouseId); return; }
    if (t.closest('[data-generate-bills]')) { generateBillsAction(); return; }
    var payB = t.closest('[data-pay-bill]');
    if (payB) {
      var leaseB = LRM.leaseRepo.getByHouse(currentHouseId);
      var billsB = LRM.billRepo.list(leaseB._id);
      el('page').innerHTML = backBar() + LRM.billPageHtml(LRM.houseRepo.get(currentHouseId), leaseB, billsB, { payId: payB.getAttribute('data-pay-bill') });
      return;
    }
    if (t.closest('[data-pay-cancel]')) { renderBill(currentHouseId); return; }

    // T18 退租清算 / 续租
    if (t.closest('#open-settle')) { renderSettle(currentHouseId); return; }
    if (t.closest('[data-renew]')) { renderSettle(currentHouseId, { mode: 'renew' }); return; }
    if (t.closest('[data-settle]')) { renderSettle(currentHouseId, { mode: 'settle' }); return; }
    if (t.closest('[data-settle-cancel]')) { renderSettle(currentHouseId); return; }

    // T19 概览：导出台账
    if (t.closest('#export-ledger')) { exportLedger(); return; }

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
    var cfg = TABS[tab] || TABS.houses;
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
    el('page').addEventListener('input', function (e) {
      if (e.target && e.target.id === 'house-search') { houseState.search = e.target.value; renderHouseListOnly(); }
    });
    el('page').addEventListener('submit', function (e) {
      var form = e.target;
      if (!form || !form.id) return;
      if (form.id === 'house-form') saveHouse(e);
      else if (form.id === 'channel-form') saveChannel(e);
      else if (form.id === 'showing-form') saveShowing(e);
      else if (form.id === 'lease-form') saveLease(e);
      else if (form.id === 'utility-form') saveUtility(e);
      else if (form.id === 'handover-form') saveHandover(e);
      else if (form.id === 'repair-form') saveRepair(e);
      else if (form.id === 'pay-form') saveBillPayment(e);
      else if (form.id === 'renew-form') saveRenew(e);
      else if (form.id === 'settle-form') saveSettle(e);
    });
    show('houses');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
