var housesPageHtml = require('../housesPage').housesPageHtml;

describe('housesPageHtml（房源列表页纯函数）', function () {
  var houses = [
    { _id: 'a', nickname: '房A', address: 'addrA', area: 80, layout: { bedrooms: 2, livingrooms: 1, bathrooms: 1 }, orientation: '南', status: 'vacant', tags: [] },
    { _id: 'b', nickname: '房B', address: 'addrB', area: 60, layout: { bedrooms: 1, livingrooms: 1, bathrooms: 1 }, orientation: '北', status: 'rented', tags: [] }
  ];

  test('含分段控件与卡片列表', function () {
    var html = housesPageHtml(houses, 'vacant');
    expect(html).toContain('data-seg="vacant"');
    expect(html).toContain('data-seg="rented"');
    expect(html).toContain('房A');
    expect(html).toContain('房B');
    expect(html).toContain('house-card');
  });

  test('空列表显示占位文案', function () {
    var html = housesPageHtml([], 'rented');
    expect(html).toContain('暂无');
    expect(html).toContain('已租');
  });
});
