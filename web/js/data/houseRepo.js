/**
 * houseRepo.js — house 集合读写封装（T4）
 * 包装 store，提供列表/过滤/增删改与示例数据 seed。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { houseRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { houseRepo: factory(deps) });
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
  function genId() { return 'house_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(status) {
    var rows = byUpdatedDesc(store.all('house'));
    if (status) return rows.filter(function (h) { return h.status === status; });
    return rows;
  }
  function get(id) { return store.getById('house', id); }
  function count() { return store.all('house').length; }
  function countByStatus(status) {
    return store.all('house').filter(function (h) { return h.status === status; }).length;
  }
  function create(doc) {
    var now = new Date().toISOString();
    var d = Object.assign({ status: 'vacant', createdAt: now, updatedAt: now }, doc);
    if (!d._id) d._id = genId();
    return store.insert('house', d);
  }
  function update(id, patch) { return store.update('house', id, patch); }
  function remove(id) { return store.remove('house', id); }
  function seed() { return store.seedIfEmpty('house', mockData.houses); }

  return {
    list: list, get: get, count: count, countByStatus: countByStatus,
    create: create, update: update, remove: remove, seed: seed
  };
});
