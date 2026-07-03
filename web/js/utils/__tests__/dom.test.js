var dom = require('../dom');

describe('dom（XSS 转义 + 输入校验，T3）', function () {
  test('escapeHtml 转义 < > & " \'', function () {
    expect(dom.escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    expect(dom.escapeHtml('a&b"c\'d')).toBe('a&amp;b&quot;c&#39;d');
  });

  test('escapeHtml 对 null/undefined 返回空串', function () {
    expect(dom.escapeHtml(null)).toBe('');
    expect(dom.escapeHtml(undefined)).toBe('');
  });

  test('validateRequired', function () {
    expect(dom.validateRequired('  ')).toBe(false);
    expect(dom.validateRequired('x')).toBe(true);
    expect(dom.validateRequired('')).toBe(false);
  });

  test('validateNonNegInt', function () {
    expect(dom.validateNonNegInt('89')).toBe(true);
    expect(dom.validateNonNegInt('0')).toBe(true);
    expect(dom.validateNonNegInt('-1')).toBe(false);
    expect(dom.validateNonNegInt('1.5')).toBe(false);
    expect(dom.validateNonNegInt('abc')).toBe(false);
  });

  test('validateCents（复用 amount.yuanToCents）', function () {
    expect(dom.validateCents('3,200.5')).toBe(true);
    expect(dom.validateCents('abc')).toBe(false);
    expect(dom.validateCents('')).toBe(false);
  });
});
