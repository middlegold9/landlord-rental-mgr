const { ENUMS, labelOf, isStatus } = require('../status');

test('labelOf 返回中文标签', () => {
  expect(labelOf('HOUSE_STATUS', 'vacant')).toBe('空置');
  expect(labelOf('HOUSE_STATUS', 'rented')).toBe('已租');
  expect(labelOf('BILL_STATUS', 'overdue')).toBe('逾期');
});

test('labelOf 未知枚举类型返回原值', () => {
  expect(labelOf('NOT_EXIST', 'x')).toBe('x');
});

test('labelOf 未知值返回原值', () => {
  expect(labelOf('HOUSE_STATUS', 'weird')).toBe('weird');
});

test('isStatus 校验取值是否合法', () => {
  expect(isStatus('BILL_STATUS', 'unpaid')).toBe(true);
  expect(isStatus('BILL_STATUS', 'nope')).toBe(false);
  expect(isStatus('NOT_EXIST', 'unpaid')).toBe(false);
});

test('ENUMS 包含全部状态枚举', () => {
  expect(Object.keys(ENUMS).sort()).toEqual(
    ['BILL_ITEM_TYPE', 'BILL_STATUS', 'CHANNEL_TYPE', 'HANDOVER_KIND', 'HOUSE_STATUS', 'LEASE_STATUS',
     'PAY_CYCLE', 'REPAIR_KIND', 'REPAIR_STATUS', 'SHOWING_STATUS', 'SIGNING_STAGE', 'UTILITY_TRANSFER',
     'UTILITY_TYPE'].sort()
  );
});
