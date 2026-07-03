/**
 * channelRepo.js — channel（挂盘渠道）集合读写封装（T8）
 * 包装 store，提供按 houseId 过滤的列表/增删改与示例数据 seed。
 * 字段对齐 data-model.md 的 channel 集合。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { channelRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { channelRepo: factory(deps) });
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
  function genId() { return 'channel_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    return byUpdatedDesc(store.all('channel').filter(function (c) { return c.houseId === houseId; }));
  }
  function get(id) { return store.getById('channel', id); }
  function create(doc) {
    var now = new Date().toISOString();
    var d = Object.assign({
      type: 'other', contact: '', commission: 0,
      listPrice: 0, floorPrice: 0, listed: false, exposure: '',
      createdAt: now, updatedAt: now
    }, doc);
    if (!d._id) d._id = genId();
    return store.insert('channel', d);
  }
  function update(id, patch) { return store.update('channel', id, patch); }
  function remove(id) { return store.remove('channel', id); }
  function seed() { return store.seedIfEmpty('channel', mockData.channels); }

  return { list: list, get: get, create: create, update: update, remove: remove, seed: seed };
});
