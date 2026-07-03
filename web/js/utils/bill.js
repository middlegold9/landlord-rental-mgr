/**
 * bill.js — 账单生成纯函数（T15/T16 核心）
 * 给定租约（起止日 / 租金 / 付租周期），生成按「月」或「季」拆分的账单期次。
 * 金额以「分」存储，杜绝浮点误差。纯函数，可单元测试，后续可平移为云函数 billGenerate。
 * UMD：浏览器挂到 window.LRM，Node/jest 走 module.exports。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LRM = Object.assign(root.LRM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function parseYM(d) {
    var m = /^(\d{4})-(\d{2})/.exec(d || '');
    if (!m) return null;
    return { y: +m[1], m: +m[2] };
  }
  function cmp(a, b) { return a.y !== b.y ? a.y - b.y : a.m - b.m; }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function keyOf(y, m) { return y + '-' + pad2(m); }
  function dueDateOf(y, m) { return keyOf(y, m) + '-01'; }

  /**
   * 列出租约覆盖的期次：月付 -> 每月一期；季付 -> 每季度一期。
   * @returns {Array<{key:string, dueDate:string}>}
   */
  function listPeriods(startDate, endDate, cycle) {
    var s = parseYM(startDate), e = parseYM(endDate);
    if (!s || !e || cmp(s, e) > 0) return [];
    var quarter = cycle === 'quarter';
    var out = [];
    if (quarter) {
      var cur = { y: s.y, q: Math.floor((s.m - 1) / 3) };
      var guard = 0;
      while (guard++ < 100) {
        var qStartM = cur.q * 3 + 1;
        var item = { y: cur.y, m: qStartM };
        if (cmp(item, e) > 0) break;
        out.push({ key: cur.y + '-Q' + (cur.q + 1), dueDate: dueDateOf(cur.y, qStartM) });
        if (cur.q === 3) { cur.y += 1; cur.q = 0; } else { cur.q += 1; }
      }
    } else {
      var c = { y: s.y, m: s.m };
      var g = 0;
      while (cmp(c, e) <= 0 && g++ < 240) {
        out.push({ key: keyOf(c.y, c.m), dueDate: dueDateOf(c.y, c.m) });
        c.m += 1;
        if (c.m > 12) { c.m = 1; c.y += 1; }
      }
    }
    return out;
  }

  /**
   * 依据租约生成账单草稿（不含 _id）。
   * 季付时单期租金 = 月租金 × 3；期次金额均为「分」。
   * @returns {Array<object>}
   */
  function generateBills(lease) {
    lease = lease || {};
    var rent = Number(lease.rent) || 0;
    if (!lease._id || !lease.startDate || !lease.endDate || rent <= 0) return [];
    var quarter = lease.payCycle === 'quarter';
    var factor = quarter ? 3 : 1;
    return listPeriods(lease.startDate, lease.endDate, lease.payCycle).map(function (p) {
      var rentAmt = rent * factor;
      return {
        leaseId: lease._id,
        period: p.key,
        dueDate: p.dueDate,
        items: [{ type: 'rent', amount: rentAmt }],
        total: rentAmt,
        status: 'unpaid',
        paidAt: null,
        receiptRef: null
      };
    });
  }

  return { listPeriods: listPeriods, generateBills: generateBills };
});
