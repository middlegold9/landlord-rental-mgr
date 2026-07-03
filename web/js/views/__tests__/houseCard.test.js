var houseCardHtml = require('../houseCard').houseCardHtml;

describe('houseCardHtml（房源卡片纯函数）', function () {
  test('返回含昵称 / 地址 / 面积 / 状态的卡片 HTML', function () {
    var html = houseCardHtml({
      _id: 'h1', nickname: '阳光花园', address: '深圳南山', area: 89,
      layout: { bedrooms: 2, livingrooms: 1, bathrooms: 1 }, orientation: '南',
      status: 'vacant', tags: ['近地铁']
    });
    expect(html).toContain('阳光花园');
    expect(html).toContain('深圳南山');
    expect(html).toContain('89㎡');
    expect(html).toContain('空置');
    expect(html).toContain('data-id="h1"');
  });

  test('对非法输入返回空串', function () {
    expect(houseCardHtml(null)).toBe('');
    expect(houseCardHtml(undefined)).toBe('');
  });

  test('转义字段中的 HTML，防 XSS', function () {
    var html = houseCardHtml({ nickname: '<img src=x onerror=alert(1)>', address: 'a', area: 10, status: 'rented' });
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});
