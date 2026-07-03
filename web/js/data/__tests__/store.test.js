var store = require('../store').store;

beforeEach(function () { store._clearAll(); });

describe('store（通用集合持久化）', function () {
  test('seedIfEmpty 在空集合写入种子并返回', function () {
    var seed = [{ _id: 'a', name: 'x' }, { _id: 'b', name: 'y' }];
    var r = store.seedIfEmpty('house', seed);
    expect(r).toEqual(seed);
    expect(store.all('house')).toEqual(seed);
  });

  test('seedIfEmpty 在已有数据时不再覆盖', function () {
    store.seedIfEmpty('house', [{ _id: 'a' }]);
    var r = store.seedIfEmpty('house', [{ _id: 'z' }]);
    expect(r.map(function (x) { return x._id; })).toEqual(['a']);
  });

  test('insert 自动补 _id 并持久化', function () {
    var d = store.insert('house', { nickname: '测试房' });
    expect(typeof d._id).toBe('string');
    expect(store.getById('house', d._id).nickname).toBe('测试房');
  });

  test('getById 命中 / 未命中', function () {
    var d = store.insert('house', { nickname: 'h1' });
    expect(store.getById('house', d._id).nickname).toBe('h1');
    expect(store.getById('house', 'nope')).toBeNull();
  });

  test('update 合并字段并刷新 updatedAt', function () {
    var d = store.insert('house', { nickname: '旧', status: 'vacant' });
    var u = store.update('house', d._id, { status: 'rented' });
    expect(u.status).toBe('rented');
    expect(u.nickname).toBe('旧');
    expect(typeof u.updatedAt).toBe('string');
    expect(store.getById('house', d._id).status).toBe('rented');
  });

  test('update 对不存在的 id 返回 null', function () {
    expect(store.update('house', 'x', { a: 1 })).toBeNull();
  });

  test('remove 删除成功 / 失败', function () {
    var d = store.insert('house', {});
    expect(store.remove('house', d._id)).toBe(true);
    expect(store.remove('house', d._id)).toBe(false);
    expect(store.getById('house', d._id)).toBeNull();
  });

  test('_clearAll 清空命名空间', function () {
    store.seedIfEmpty('house', [{ _id: 'a' }]);
    store.seedIfEmpty('attachment', [{ _id: 'b' }]);
    store._clearAll();
    expect(store.all('house')).toEqual([]);
    expect(store.all('attachment')).toEqual([]);
  });
});
