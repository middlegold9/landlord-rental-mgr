/**
 * billRepo.js — bill（账单）集合读写封装（T15/T16/T17）
 * - 账单由租约按「月/季」期次生成（generateBills 纯函数，见 utils/bill.js）
 * - 提供：生成缺失期次、标记已缴（含凭证归档）、刷新逾期、租约维度统计
 * 金额以分存储（见 data-model.md）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = {
      store: require('./store').store,
      mockData: require('./mockData').mockData,
      billGen: require('../utils/bill'),
      leaseRepo: require('./leaseRepo').leaseRepo
    };
    module.exports = { billRepo: factory(deps) };
  } else {
    deps = {
      store: root.LRM.store,
      mockData: root.LRM.mockData,
      billGen: root.LRM.bill,
      leaseRepo: root.LRM.leaseRepo
    };
    root.LRM = Object.assign(root.LRM || {}, { billRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;
  var billGen = deps.billGen;
  var leaseRepo = deps.leaseRepo;

  function genId() { return 'bill_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function byDue(rows) { return rows.slice().sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); }); }

  function list(leaseId) {
    var rows = store.all('bill');
    if (leaseId) rows = rows.filter(function (b) { return b.leaseId === leaseId; });
    return byDue(rows);
  }
  function all() { return store.all('bill'); }
  function get(id) { return store.getById('bill', id); }
  function create(doc) {
    var d = Object.assign({}, doc);
    if (!d._id) d._id = genId();
    return store.insert('bill', d);
  }
  function update(id, patch) { return store.update('bill', id, patch); }
  function remove(id) { return store.remove('bill', id); }
  function seed() { return store.seedIfEmpty('bill', mockData.bills); }

  /** 仅补充缺失期次的账单；返回新增条数 */
  function generate(leaseId) {
    var lease = leaseRepo.get(leaseId);
    if (!lease) return 0;
    var drafts = billGen.generateBills(lease);
    var existing = list(leaseId).map(function (b) { return b.period; });
    var added = 0;
    drafts.forEach(function (d) {
      if (existing.indexOf(d.period) === -1) { create(d); added++; }
    });
    return added;
  }

  /** 标记某账单已缴，并归档凭证（attachmentRef） */
  function markPaid(id, info) {
    info = info || {};
    return store.update('bill', id, {
      status: 'paid',
      paidAt: info.paidAt || new Date().toISOString().slice(0, 10),
      receiptRef: info.receiptRef || { fileID: '', refType: '缴费凭证' }
    });
  }

  /** 将到期未缴的账单标记为逾期；返回变更条数 */
  function refreshOverdue(today) {
    today = today || new Date().toISOString().slice(0, 10);
    var rows = store.all('bill');
    var changed = 0;
    rows.forEach(function (b) {
      if (b.status === 'unpaid' && b.dueDate < today) { store.update('bill', b._id, { status: 'overdue' }); changed++; }
    });
    return changed;
  }

  /** 租约维度账单统计（金额均为分） */
  function stats(leaseId) {
    var rows = list(leaseId);
    var s = { count: rows.length, total: 0, received: 0, owed: 0, paidCount: 0, unpaidCount: 0, overdueCount: 0 };
    rows.forEach(function (b) {
      s.total += Number(b.total) || 0;
      if (b.status === 'paid') { s.paidCount++; s.received += Number(b.total) || 0; }
      else if (b.status === 'overdue') { s.overdueCount++; }
      else { s.unpaidCount++; }
    });
    s.owed = s.total - s.received;
    return s;
  }

  return {
    list: list, all: all, get: get, create: create, update: update, remove: remove, seed: seed,
    generate: generate, markPaid: markPaid, refreshOverdue: refreshOverdue, stats: stats
  };
});
