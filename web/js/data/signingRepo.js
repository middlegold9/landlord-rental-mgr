/**
 * signingRepo.js — signing（签约流程状态机）集合读写封装（T11）
 * 一条房源对应一条签约记录。阶段：talking→deposit→signed→keys→rented。
 * 推进到 rented 时，联动把对应房源 status 翻为 rented。
 */
(function (root, factory) {
  var deps;
  if (typeof module === 'object' && module.exports) {
    deps = {
      store: require('./store').store,
      mockData: require('./mockData').mockData,
      houseRepo: require('./houseRepo').houseRepo
    };
    module.exports = { signingRepo: factory(deps) };
  } else {
    deps = { store: root.LRM.store, mockData: root.LRM.mockData, houseRepo: root.LRM.houseRepo };
    root.LRM = Object.assign(root.LRM || {}, { signingRepo: factory(deps) });
  }
})(typeof self !== 'undefined' ? self : this, function (deps) {
  'use strict';

  var store = deps.store;
  var mockData = deps.mockData;
  var houseRepo = deps.houseRepo;

  // 状态机阶段顺序
  var STAGES = ['talking', 'deposit', 'signed', 'keys', 'rented'];

  function genId() { return 'signing_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function getByHouse(houseId) {
    var rows = store.all('signing');
    for (var i = 0; i < rows.length; i++) if (rows[i].houseId === houseId) return rows[i];
    return null;
  }

  function create(houseId) {
    var now = new Date().toISOString();
    var d = { _id: genId(), houseId: houseId, stage: 'talking', createdAt: now, updatedAt: now };
    return store.insert('signing', d);
  }

  function createOrGet(houseId) {
    var ex = getByHouse(houseId);
    return ex || create(houseId);
  }

  function nextStage(stage) {
    var i = STAGES.indexOf(stage);
    return (i >= 0 && i < STAGES.length - 1) ? STAGES[i + 1] : null;
  }

  // 推进到下一阶段；到 rented 时联动翻转房源状态
  function advance(id) {
    var s = store.getById('signing', id);
    if (!s) return null;
    var ns = nextStage(s.stage);
    if (!ns) return null;
    if (ns === 'rented') {
      var h = houseRepo.get(s.houseId);
      if (h) houseRepo.update(s.houseId, { status: 'rented' });
    }
    return store.update('signing', id, { stage: ns });
  }

  function reset(id) { return store.update('signing', id, { stage: 'talking' }); }
  function update(id, patch) { return store.update('signing', id, patch); }
  function remove(id) { return store.remove('signing', id); }
  function seed() { return store.seedIfEmpty('signing', mockData.signings); }

  return {
    STAGES: STAGES,
    getByHouse: getByHouse,
    create: create,
    createOrGet: createOrGet,
    nextStage: nextStage,
    advance: advance,
    reset: reset,
    update: update,
    remove: remove,
    seed: seed
  };
});
