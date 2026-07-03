/**
 * utilityRepo.js — utility_account（费用账户）集合读写封装（T13）
 * 一户一租约下，通常有 5 类费用账户：水/电/燃气/物业/宽带。
 * 按 houseId 过滤；提供 upsertByType 便于「一户一套标准 5 类」的录入。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { utilityRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { utilityRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function genId() { return 'utility_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    var rows = store.all('utility_account');
    if (houseId) return rows.filter(function (u) { return u.houseId === houseId; });
    return rows;
  }
  function get(id) { return store.getById('utility_account', id); }
  function create(doc) {
    var d = Object.assign({}, doc);
    if (!d._id) d._id = genId();
    return store.insert('utility_account', d);
  }
  function update(id, patch) { return store.update('utility_account', id, patch); }
  function remove(id) { return store.remove('utility_account', id); }
  function seed() { return store.seedIfEmpty('utility_account', mockData.utilityAccounts); }

  return { list: list, get: get, create: create, update: update, remove: remove, seed: seed };
});
