/**
 * tenantRepo.js — tenant（租客档案）集合读写封装（T12）
 * 一条租约对应一份租客档案（1—1）。按 leaseId 存取。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { tenantRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { tenantRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function genId() { return 'tenant_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function getByLease(leaseId) {
    var rows = store.all('tenant');
    for (var i = 0; i < rows.length; i++) if (rows[i].leaseId === leaseId) return rows[i];
    return null;
  }
  function get(id) { return store.getById('tenant', id); }
  function create(doc) {
    var d = Object.assign({}, doc);
    if (!d._id) d._id = genId();
    return store.insert('tenant', d);
  }
  function update(id, patch) { return store.update('tenant', id, patch); }
  function remove(id) { return store.remove('tenant', id); }
  function seed() { return store.seedIfEmpty('tenant', mockData.tenants); }

  return { getByLease: getByLease, get: get, create: create, update: update, remove: remove, seed: seed };
});
