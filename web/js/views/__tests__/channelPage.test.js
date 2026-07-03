/**
 * channelPage.test.js — T8 渠道管理页纯函数（RED）
 */
var channelPage = require('../channelPage');

test('渲染含「添加渠道」入口与空态', function () {
  var html = channelPage.channelPageHtml({ _id: 'h1', nickname: 'H' }, [], {});
  expect(html).toContain('添加渠道');
});

test('buildChannel 将元转换为分', function () {
  var c = channelPage.buildChannel(
    { type: 'agency', contact: '链家', listPrice: '3500', floorPrice: '3200', listed: 'on', exposure: '高' },
    { houseId: 'h1' }
  );
  expect(c.listPrice).toBe(350000);
  expect(c.floorPrice).toBe(320000);
  expect(c.listed).toBe(true);
  expect(c.houseId).toBe('h1');
});

test('validateChannel 缺联系人报错', function () {
  var c = channelPage.buildChannel({ type: 'agency', contact: '', listPrice: '3500' }, { houseId: 'h1' });
  expect(channelPage.validateChannel(c).contact).toBeTruthy();
});

test('validateChannel 非法挂牌价报错', function () {
  var c = channelPage.buildChannel({ type: 'agency', contact: 'x', listPrice: 'abc' }, { houseId: 'h1' });
  expect(channelPage.validateChannel(c).listPrice).toBeTruthy();
});
