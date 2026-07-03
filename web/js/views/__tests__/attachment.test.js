var attachment = require('../attachment');

describe('attachment（附件展示，T7）', function () {
  test('attachmentItemHtml 显示名称与扩展类型', function () {
    var html = attachment.attachmentItemHtml({ name: '房产证.jpg', ext: 'jpg', refType: '房产证' });
    expect(html).toContain('房产证.jpg');
    expect(html).toContain('jpg');
  });

  test('未知扩展给出默认图标', function () {
    var html = attachment.attachmentItemHtml({ name: 'x.bin', ext: 'bin' });
    expect(html).toContain('📎');
  });

  test('空值返回空串', function () {
    expect(attachment.attachmentItemHtml(null)).toBe('');
  });
});
