/**
 * handoverRepo.js — handover（入驻交接单）集合读写封装（T13）
 * 一条租约对应一份入驻交接单（1—1）：移交日期 + 物品清单 + 备注。
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

  function getByLease(leaseId) {
    var rows = store.all('handover');
    for (var i = 0; i < rows.length; i++) if (rows[i].leaseId === leaseId) return rows[i];
    return null;
  }
  function get(id) { return store.getById('handover', id); }
  // 按 leaseId 唯一：已存在则更新，否则新建
  function save(leaseId, doc) {
    var ex = getByLease(leaseId);
    if (ex) {
      return store.update('handover', ex._id, Object.assign({ leaseId: leaseId }, doc));
    }
    var now = new Date().toISOString();
    var d = Object.assign({ _id: genId(), leaseId: leaseId, createdAt: now, updatedAt: now }, doc);
    return store.insert('handover', d);
  }
  function remove(id) { return store.remove('handover', id); }
  function seed() { return store.seedIfEmpty('handover', mockData.handovers); }

  return { getByLease: getByLease, get: get, save: save, remove: remove, seed: seed };
});
