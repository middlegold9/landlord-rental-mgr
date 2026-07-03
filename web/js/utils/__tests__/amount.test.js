const { formatCents, yuanToCents, addCents } = require('../amount');

test('formatCents 分转元，带千分位与两位小数', () => {
  expect(formatCents(123456)).toBe('¥1,234.56');
  expect(formatCents(0)).toBe('¥0.00');
  expect(formatCents(500)).toBe('¥5.00');
  expect(formatCents(-300)).toBe('-¥3.00');
});

test('formatCents 支持自定义货币符号', () => {
  expect(formatCents(100, '￥')).toBe('￥1.00');
  expect(formatCents(0, '')).toBe('0.00');
});

test('formatCents 非法输入按 0 处理', () => {
  expect(formatCents(undefined)).toBe('¥0.00');
  expect(formatCents(NaN)).toBe('¥0.00');
});

test('yuanToCents 元字符串转分（整数）', () => {
  expect(yuanToCents('1234.56')).toBe(123456);
  expect(yuanToCents('12.3')).toBe(1230);
  expect(yuanToCents(12.3)).toBe(1230);
});

test('yuanToCents 非法输入返回 null', () => {
  expect(yuanToCents('')).toBe(null);
  expect(yuanToCents('abc')).toBe(null);
  expect(yuanToCents(null)).toBe(null);
});

test('addCents 整数相加，避免浮点误差', () => {
  expect(addCents(1, 2, 3)).toBe(6);
  expect(addCents(999, 1)).toBe(1000);
  expect(addCents(0)).toBe(0);
});
