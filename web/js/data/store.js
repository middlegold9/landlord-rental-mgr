/**
 * store.js — 通用集合持久化层
 * Web 版统一数据契约（见 data-model.md）在此落地：
 *   浏览器环境 → localStorage；Node/jest 环境 → 内存后端（自动回退）。
 * UMD：浏览器挂到 window.LRM.store，Node/jest 走 module.exports。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = { store: factory() };
  else root.LRM = Object.assign(root.LRM || {}, { store: factory() });
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var NS = 'lrm:';

  function hasLocalStorage() {
    try { return typeof localStorage !== 'undefined'; } catch (e) { return false; }
  }

  // jest / SSR 环境下无 localStorage，用进程内内存后端
  var mem = {};
  var memoryBackend = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; }
  };

  function backend() { return hasLocalStorage() ? localStorage : memoryBackend; }

  function read(col) {
    var raw = backend().getItem(NS + col);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { return []; }
  }
  function write(col, rows) {
    backend().setItem(NS + col, JSON.stringify(rows == null ? [] : rows));
    return rows;
  }
  function genId(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function nowIso() { return new Date().toISOString(); }

  var store = {
    NS: NS,

    /** 集合为空时写入种子；已存在则保留现有数据 */
    seedIfEmpty: function (col, seed) {
      var rows = read(col);
      if (!rows || rows.length === 0) { write(col, seed || []); return seed || []; }
      return rows;
    },

    all: function (col) { return read(col); },

    getById: function (col, id) {
      var rows = read(col);
      for (var i = 0; i < rows.length; i++) if (rows[i]._id === id) return rows[i];
      return null;
    },

    insert: function (col, doc) {
      var rows = read(col);
      var d = Object.assign({}, doc);
      if (!d._id) d._id = genId(col || 'doc');
      rows.push(d);
      write(col, rows);
      return d;
    },

    update: function (col, id, patch) {
      var rows = read(col);
      for (var i = 0; i < rows.length; i++) {
        if (rows[i]._id === id) {
          var merged = Object.assign({}, rows[i], patch, { _id: id });
          merged.updatedAt = nowIso();
          rows[i] = merged;
          write(col, rows);
          return merged;
        }
      }
      return null;
    },

    remove: function (col, id) {
      var rows = read(col);
      var next = rows.filter(function (r) { return r._id !== id; });
      var changed = next.length !== rows.length;
      write(col, next);
      return changed;
    },

    /** 测试辅助：清空本命名空间下的所有集合 */
    _clearAll: function () {
      if (backend() === memoryBackend) { mem = {}; return; }
      try {
        var b = backend();
        var keys = [];
        for (var i = 0; i < b.length; i++) {
          var k = b.key(i);
          if (k && k.indexOf(NS) === 0) keys.push(k);
        }
        keys.forEach(function (k) { b.removeItem(k); });
      } catch (e) { /* 忽略 */ }
    }
  };

  return store;
});
