/**
 * repairRepo.js — repair（维修 / 物业维护）集合读写封装（T14）
 * 按 houseId 过滤，按 reportedAt 倒序展示为时间线。
 * 金额 cost 以分存储（见 data-model.md）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { repairRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { repairRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function byReportedDesc(rows) {
    return rows.slice().sort(function (a, b) {
      return (b.reportedAt || '').localeCompare(a.reportedAt || '');
    });
  }
  function genId() { return 'repair_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    var rows = byReportedDesc(store.all('repair'));
    if (houseId) return rows.filter(function (r) { return r.houseId === houseId; });
    return rows;
  }
  function get(id) { return store.getById('repair', id); }
  function create(doc) {
    var now = new Date().toISOString();
    var d = Object.assign({ createdAt: now, updatedAt: now }, doc);
    if (!d._id) d._id = genId();
    return store.insert('repair', d);
  }
  function update(id, patch) { return store.update('repair', id, patch); }
  function remove(id) { return store.remove('repair', id); }
  function seed() { return store.seedIfEmpty('repair', mockData.repairs); }

  return { list: list, get: get, create: create, update: update, remove: remove, seed: seed };
});
