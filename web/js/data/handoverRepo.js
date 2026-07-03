/**
 * handoverRepo.js — handover（入驻 / 退租交接单）集合读写封装（T13 / T18）
 * 一条租约可有「入驻」「退租」两份交接单：按 (leaseId, kind) 存取。
 * 立项为 data-model T13 的「入驻交接单」支撑结构（data-model 未单列，按任务要求新增）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { handoverRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { handoverRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function genId() { return 'handover_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function find(leaseId, kind) {
    var rows = store.all('handover');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].leaseId === leaseId && (rows[i].kind || 'move_in') === kind) return rows[i];
    }
    return null;
  }
  function getByLease(leaseId) { return find(leaseId, 'move_in'); }
  function getByLeaseKind(leaseId, kind) { return find(leaseId, kind); }
  function get(id) { return store.getById('handover', id); }
  // 按 (leaseId, kind) 唯一：已存在则更新，否则新建
  function save(leaseId, doc, kind) {
    kind = kind || 'move_in';
    var ex = find(leaseId, kind);
    if (ex) {
      return store.update('handover', ex._id, Object.assign({ leaseId: leaseId, kind: kind }, doc));
    }
    var now = new Date().toISOString();
    var d = Object.assign({ _id: genId(), leaseId: leaseId, kind: kind, createdAt: now, updatedAt: now }, doc);
    return store.insert('handover', d);
  }
  function remove(id) { return store.remove('handover', id); }
  function seed() { return store.seedIfEmpty('handover', mockData.handovers); }

  return { getByLease: getByLease, getByLeaseKind: getByLeaseKind, get: get, save: save, remove: remove, seed: seed };
});
