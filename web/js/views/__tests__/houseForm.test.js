var hf = require('../houseForm');

describe('houseForm（详情/编辑表单，T6）', function () {
  test('houseFormHtml 含关键字段且预填昵称', function () {
    var html = hf.houseFormHtml({
      nickname: '阳光花园', address: '路1号', area: 89, status: 'vacant',
      layout: { bedrooms: 2, livingrooms: 1, bathrooms: 1 }
    }, {});
    expect(html).toContain('name="nickname"');
    expect(html).toContain('name="address"');
    expect(html).toContain('name="area"');
    expect(html).toContain('阳光花园');
    expect(html).toContain('id="gallery-input"');
  });

  test('houseFormHtml 渲染字段级错误', function () {
    var html = hf.houseFormHtml({}, { nickname: '必填', area: '需大于0' });
    expect(html).toContain('必填');
    expect(html).toContain('需大于0');
  });

  test('buildHouse 将表单值映射为 house 对象', function () {
    var h = hf.buildHouse({
      nickname: 'N', address: 'A', area: '89',
      bedrooms: '2', livingrooms: '1', bathrooms: '1',
      floor: '3', totalFloors: '18', orientation: '南', decoration: '精装',
      hasElevator: 'on', status: 'rented', tags: '近地铁, 安静'
    }, { _id: 'x' });
    expect(h._id).toBe('x');
    expect(h.area).toBe(89);
    expect(h.layout).toEqual({ bedrooms: 2, livingrooms: 1, bathrooms: 1 });
    expect(h.hasElevator).toBe(true);
    expect(h.status).toBe('rented');
    expect(h.tags).toEqual(['近地铁', '安静']);
  });

  test('validateHouse：缺必填返回错误映射，齐全返回空', function () {
    expect(hf.validateHouse({ nickname: '', address: '', area: 0 })).toHaveProperty('nickname');
    expect(hf.validateHouse({ nickname: 'N', address: 'A', area: 90, status: 'vacant' })).toEqual({});
  });
});
