/**
 * leaseRepo.js — lease（租约）集合读写封装（T12）
 * 一条房源可有多条历史租约；当前租约取列表第一条。
 * 金额 rent / deposit 以分存储（见 data-model.md）。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { leaseRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { leaseRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function byUpdatedDesc(rows) {
    return rows.slice().sort(function (a, b) {
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }
  function genId() { return 'lease_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    var rows = byUpdatedDesc(store.all('lease'));
    if (houseId) return rows.filter(function (l) { return l.houseId === houseId; });
    return rows;
  }
  function get(id) { return store.getById('lease', id); }
  function getByHouse(houseId) {
    var rows = list(houseId);
    return rows.length ? rows[0] : null;
  }
  function create(doc) {
    var now = new Date().toISOString();
    var d = Object.assign({ createdAt: now, updatedAt: now }, doc);
    if (!d._id) d._id = genId();
    return store.insert('lease', d);
  }
  function update(id, patch) { return store.update('lease', id, patch); }
  function remove(id) { return store.remove('lease', id); }
  function seed() { return store.seedIfEmpty('lease', mockData.leases); }

  return { list: list, get: get, getByHouse: getByHouse, create: create, update: update, remove: remove, seed: seed };
});
