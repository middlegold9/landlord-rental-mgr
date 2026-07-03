/**
 * status.js — 状态枚举与标签纯函数
 * UMD：浏览器挂到 window.LRM，Node/jest 走 module.exports。
 *
 * 枚举值对齐 data-model.md：
 *   house.status(vacant|rented) / bill.status(unpaid|paid|overdue)
 *   lease.status(active|expiring|ended) / showing.status(pending|done|cancelled|no_show)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LRM = Object.assign(root.LRM || {}, factory());
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ENUMS = {
    HOUSE_STATUS: { vacant: '空置', rented: '已租' },
    BILL_STATUS: { unpaid: '待缴', paid: '已缴', overdue: '逾期' },
    LEASE_STATUS: { active: '生效中', expiring: '即将到期', ended: '已退租' },
    SHOWING_STATUS: { pending: '待带看', done: '完成', cancelled: '取消', no_show: '爽约' },
    CHANNEL_TYPE: { agency: '中介', selfmedia: '自媒体', forum: '论坛', other: '其他' },
    SIGNING_STAGE: { talking: '洽谈', deposit: '意向金', signed: '签约', keys: '交钥匙', rented: '已租' },
    PAY_CYCLE: { month: '月付', quarter: '季付' },
    UTILITY_TYPE: { water: '水', electricity: '电', gas: '燃气', property: '物业', broadband: '宽带' },
    UTILITY_TRANSFER: { pending: '待过户', done: '已过户' },
    REPAIR_KIND: { in_unit: '户内', property: '物业公共' },
    REPAIR_STATUS: { pending: '待处理', doing: '处理中', done: '已完成', cancelled: '已取消' }
  };

  // 取值 → 中文标签；未知类型或值原样返回
  function labelOf(type, value) {
    var map = ENUMS[type];
    if (!map) return value;
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : value;
  }

  // 校验取值是否在该枚举内
  function isStatus(type, value) {
    var map = ENUMS[type];
    return !!map && Object.prototype.hasOwnProperty.call(map, value);
  }

  return { ENUMS: ENUMS, labelOf: labelOf, isStatus: isStatus };
});
