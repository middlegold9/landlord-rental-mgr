/**
 * attachmentRepo.js — attachment 集合读写封装（T4）
 * 包装 store，提供按房源过滤列表/增删改与示例数据 seed。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = { store: require('./store').store, mockData: require('./mockData').mockData };
    module.exports = { attachmentRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData };
    root.LRM = Object.assign(root.LRM || {}, { attachmentRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;

  function genId() { return 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function list(houseId) {
    var rows = store.all('attachment');
    if (houseId) return rows.filter(function (r) { return r.houseId === houseId; });
    return rows;
  }
  function get(fileID) { return store.getById('attachment', fileID); }
  function create(doc) {
    var d = Object.assign({}, doc);
    if (!d.fileID) d.fileID = genId();
    d._id = d.fileID; // 以 fileID 为主键，便于 get/remove 按 fileID 命中
    return store.insert('attachment', d);
  }
  function remove(fileID) { return store.remove('attachment', fileID); }
  function seed() { return store.seedIfEmpty('attachment', mockData.attachments); }

  return { list: list, get: get, create: create, remove: remove, seed: seed };
});
