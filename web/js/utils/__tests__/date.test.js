const { formatDate, formatMonth, daysBetween } = require('../date');

test('formatDate 默认 YYYY-MM-DD', () => {
  expect(formatDate(new Date(2026, 6, 3))).toBe('2026-07-03');
});

test('formatDate 支持自定义分隔符', () => {
  expect(formatDate('2026-01-05', '/')).toBe('2026/01/05');
});

test('formatDate 补零', () => {
  expect(formatDate(new Date(2026, 0, 9))).toBe('2026-01-09');
});

test('formatMonth 输出 YYYY-MM', () => {
  expect(formatMonth(new Date(2026, 0, 31))).toBe('2026-01');
  expect(formatMonth(new Date(2026, 11, 1))).toBe('2026-12');
});

test('daysBetween 计算天数差', () => {
  expect(daysBetween('2026-07-01', '2026-07-04')).toBe(3);
  expect(daysBetween('2026-07-04', '2026-07-01')).toBe(-3);
  expect(daysBetween('2026-07-01', '2026-07-01')).toBe(0);
});
