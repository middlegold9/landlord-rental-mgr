/**
 * showingRepo.js — showing（带看）集合读写封装（T9）
 * 包装 store，提供按 houseId 过滤的列表/增删改与示例数据 seed。
 * 字段对齐 data-model.md 的 showing 集合；含房东评价 landlordEval。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { showingRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { showingRepo: factory(deps) });
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
  function genId() { return 'showing_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    return byUpdatedDesc(store.all('showing').filter(function (s) { return s.houseId === houseId; }));
  }
  function get(id) { return store.getById('showing', id); }
  function create(doc) {
    var now = new Date().toISOString();
    var d = Object.assign({
      prospectTenant: '', sourceChannel: '', agent: '', appointmentAt: '',
      status: 'pending', tenantFeedback: '', landlordEval: { score: 0, note: '' },
      createdAt: now, updatedAt: now
    }, doc);
    if (!d._id) d._id = genId();
    return store.insert('showing', d);
  }
  function update(id, patch) { return store.update('showing', id, patch); }
  function remove(id) { return store.remove('showing', id); }
  function seed() { return store.seedIfEmpty('showing', mockData.showings); }

  return { list: list, get: get, create: create, update: update, remove: remove, seed: seed };
});
