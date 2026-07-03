/**
 * mockData.js — Web 版示例数据（T4）
 * 字段严格对齐 data-model.md 的 house / attachment 集合。
 * 用于 seed 本地 Mock，便于首屏即有可浏览的真实感内容。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = { mockData: factory() };
  else root.LRM = Object.assign(root.LRM || {}, { mockData: factory() });
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var houses = [
    {
      _id: 'house_demo_001',
      ownerOpenid: 'o_demo_landlord',
      nickname: '阳光花园 3-101',
      titleDeed: '阳光花园 3 栋 101 室',
      address: '深圳市南山区科技园路 18 号阳光花园 3 栋 101',
      area: 89,
      layout: { bedrooms: 2, livingrooms: 1, bathrooms: 1 },
      floor: 1, totalFloors: 18, orientation: '南', decoration: '精装', hasElevator: true,
      status: 'vacant',
      tags: ['近地铁', '可短租', '拎包入住'],
      gallery: [{ fileID: 'att_demo_001', refType: '房产证' }],
      createdAt: '2026-06-01T08:00:00.000Z',
      updatedAt: '2026-06-20T10:30:00.000Z'
    },
    {
      _id: 'house_demo_002',
      ownerOpenid: 'o_demo_landlord',
      nickname: '海岸城 Loft A-2203',
      titleDeed: '海岸城 A 座 2203',
      address: '深圳市南山区文心五路 33 号海岸城 A 座 2203',
      area: 56,
      layout: { bedrooms: 1, livingrooms: 1, bathrooms: 1 },
      floor: 22, totalFloors: 32, orientation: '东南', decoration: '简装', hasElevator: true,
      status: 'rented',
      tags: ['Loft', '通燃气'],
      gallery: [{ fileID: 'att_demo_003', refType: '房产证' }],
      createdAt: '2026-03-12T08:00:00.000Z',
      updatedAt: '2026-05-02T09:00:00.000Z'
    },
    {
      _id: 'house_demo_003',
      ownerOpenid: 'o_demo_landlord',
      nickname: '学府雅居 6-503',
      titleDeed: '学府雅居 6 栋 503',
      address: '深圳市南山区学府路 9 号学府雅居 6 栋 503',
      area: 120,
      layout: { bedrooms: 3, livingrooms: 2, bathrooms: 2 },
      floor: 5, totalFloors: 11, orientation: '南北', decoration: '豪装', hasElevator: true,
      status: 'vacant',
      tags: ['学位房', '南北通透', '可长租'],
      gallery: [],
      createdAt: '2026-04-18T08:00:00.000Z',
      updatedAt: '2026-06-22T14:00:00.000Z'
    },
    {
      _id: 'house_demo_004',
      ownerOpenid: 'o_demo_landlord',
      nickname: '前海公馆 2-706',
      titleDeed: '前海公馆 2 栋 706',
      address: '深圳市南山区前海路 66 号前海公馆 2 栋 706',
      area: 75,
      layout: { bedrooms: 2, livingrooms: 1, bathrooms: 1 },
      floor: 7, totalFloors: 26, orientation: '南', decoration: '精装', hasElevator: true,
      status: 'rented',
      tags: ['近地铁', '采光好', '可长租'],
      gallery: [{ fileID: 'att_demo_004', refType: '房产证' }],
      createdAt: '2026-03-10T08:00:00.000Z',
      updatedAt: '2026-03-15T09:00:00.000Z'
    },
    {
      _id: 'house_demo_005',
      ownerOpenid: 'o_demo_landlord',
      nickname: '科技园 1-1502',
      titleDeed: '科技园 1 栋 1502',
      address: '深圳市南山区高新中一道 9 号科技园 1 栋 1502',
      area: 110,
      layout: { bedrooms: 3, livingrooms: 2, bathrooms: 2 },
      floor: 15, totalFloors: 30, orientation: '东南', decoration: '豪装', hasElevator: true,
      status: 'rented',
      tags: ['大平层', '带车位', '拎包入住'],
      gallery: [{ fileID: 'att_demo_005', refType: '房产证' }],
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-01-10T09:00:00.000Z'
    }
  ];

  var attachments = [
    {
      _id: 'att_demo_001',
      fileID: 'att_demo_001',
      houseId: 'house_demo_001',
      refType: '房产证',
      name: '阳光花园3栋101-房产证.jpg',
      ext: 'jpg',
      size: 482000
    },
    {
      _id: 'att_demo_002',
      fileID: 'att_demo_002',
      houseId: 'house_demo_001',
      refType: '户型图',
      name: '阳光花园3栋101-户型图.pdf',
      ext: 'pdf',
      size: 129000
    },
    {
      _id: 'att_demo_003',
      fileID: 'att_demo_003',
      houseId: 'house_demo_002',
      refType: '房产证',
      name: '海岸城A座2203-房产证.jpg',
      ext: 'jpg',
      size: 511000
    },
    {
      _id: 'att_demo_004',
      fileID: 'att_demo_004',
      houseId: 'house_demo_004',
      refType: '房产证',
      name: '前海公馆2栋706-房产证.jpg',
      ext: 'jpg',
      size: 503000
    },
    {
      _id: 'att_demo_005',
      fileID: 'att_demo_005',
      houseId: 'house_demo_005',
      refType: '房产证',
      name: '科技园1栋1502-房产证.jpg',
      ext: 'jpg',
      size: 521000
    }
  ];

  var channels = [
    {
      _id: 'ch_demo_001',
      houseId: 'house_demo_001',
      type: 'agency',
      contact: '链家·王经理 13800000001',
      commission: 3500,
      listPrice: 350000,
      floorPrice: 320000,
      listed: true,
      exposure: '高',
      createdAt: '2026-06-10T08:00:00.000Z',
      updatedAt: '2026-06-20T10:00:00.000Z'
    },
    {
      _id: 'ch_demo_002',
      houseId: 'house_demo_001',
      type: 'selfmedia',
      contact: '小红书@深圳租房日记',
      commission: 0,
      listPrice: 360000,
      floorPrice: 330000,
      listed: false,
      exposure: '中',
      createdAt: '2026-06-12T08:00:00.000Z',
      updatedAt: '2026-06-18T10:00:00.000Z'
    },
    {
      _id: 'ch_demo_003',
      houseId: 'house_demo_003',
      type: 'forum',
      contact: '业主论坛·版主',
      commission: 0,
      listPrice: 520000,
      floorPrice: 480000,
      listed: true,
      exposure: '低',
      createdAt: '2026-06-15T08:00:00.000Z',
      updatedAt: '2026-06-19T10:00:00.000Z'
    }
  ];

  var showings = [
    {
      _id: 'sh_demo_001',
      houseId: 'house_demo_001',
      prospectTenant: '张先生',
      sourceChannel: '中介',
      agent: '王经理',
      appointmentAt: '2026-06-25T10:00:00.000Z',
      status: 'done',
      tenantFeedback: '采光不错，考虑中',
      landlordEval: { score: 4, note: '租客素质高' },
      createdAt: '2026-06-25T08:00:00.000Z',
      updatedAt: '2026-06-25T12:00:00.000Z'
    },
    {
      _id: 'sh_demo_002',
      houseId: 'house_demo_001',
      prospectTenant: '李女士',
      sourceChannel: '自媒体',
      agent: '',
      appointmentAt: '2026-06-28T15:00:00.000Z',
      status: 'pending',
      tenantFeedback: '',
      landlordEval: { score: 0, note: '' },
      createdAt: '2026-06-28T08:00:00.000Z',
      updatedAt: '2026-06-28T08:00:00.000Z'
    }
  ];

  var signings = [
    {
      _id: 'sg_demo_001',
      houseId: 'house_demo_001',
      stage: 'talking',
      createdAt: '2026-06-20T08:00:00.000Z',
      updatedAt: '2026-06-20T08:00:00.000Z'
    }
  ];

  // T12 租约 / 租客（house_demo_002 已租）
  var leases = [
    {
      _id: 'lease_demo_001',
      houseId: 'house_demo_002',
      tenantId: 'tenant_demo_001',
      startDate: '2026-05-01',
      endDate: '2027-04-30',
      rent: 680000,
      deposit: 680000,
      payCycle: 'month',
      payMethod: '微信零钱 / 招商银行尾号6688',
      status: 'active',
      renewed: false,
      contractRef: { fileID: 'att_demo_003', refType: '租赁合同' },
      createdAt: '2026-05-01T08:00:00.000Z',
      updatedAt: '2026-05-01T08:00:00.000Z'
    },
    {
      _id: 'lease_demo_002',
      houseId: 'house_demo_004',
      tenantId: 'tenant_demo_002',
      startDate: '2026-03-15',
      endDate: '2027-03-14',
      rent: 520000,
      deposit: 520000,
      payCycle: 'month',
      payMethod: '支付宝 / 工行尾号8821',
      status: 'active',
      renewed: false,
      contractRef: { fileID: 'att_demo_004', refType: '租赁合同' },
      createdAt: '2026-03-15T08:00:00.000Z',
      updatedAt: '2026-03-15T08:00:00.000Z'
    },
    {
      _id: 'lease_demo_003',
      houseId: 'house_demo_005',
      tenantId: 'tenant_demo_003',
      startDate: '2026-01-10',
      endDate: '2026-12-31',
      rent: 980000,
      deposit: 980000,
      payCycle: 'month',
      payMethod: '微信零钱 / 招行尾号3312',
      status: 'active',
      renewed: false,
      contractRef: { fileID: 'att_demo_005', refType: '租赁合同' },
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z'
    }
  ];

  var tenants = [
    {
      _id: 'tenant_demo_001',
      leaseId: 'lease_demo_001',
      wechat: 'wxid_tenant_a',
      phone: '13900000002',
      idCard: '4403**********1234',
      householdReg: '深户',
      occupation: '互联网 · 产品',
      income: 250000,
      hasPet: false,
      occupants: 2,
      emergencyContact: '配偶 13800000003',
      sourceChannel: '中介'
    },
    {
      _id: 'tenant_demo_002',
      leaseId: 'lease_demo_002',
      wechat: 'wxid_tenant_b',
      phone: '13900000012',
      idCard: '4403**********5678',
      householdReg: '非深户',
      occupation: '金融 · 风控',
      income: 320000,
      hasPet: true,
      occupants: 3,
      emergencyContact: '配偶 13800000013',
      sourceChannel: '中介'
    },
    {
      _id: 'tenant_demo_003',
      leaseId: 'lease_demo_003',
      wechat: 'wxid_tenant_c',
      phone: '13900000022',
      idCard: '4403**********9012',
      householdReg: '深户',
      occupation: '教育 · 教师',
      income: 180000,
      hasPet: false,
      occupants: 2,
      emergencyContact: '父母 13800000023',
      sourceChannel: '自媒体'
    }
  ];

  // T13 费用账户（house_demo_002 / lease_demo_001）+ 入驻交接单
  var utilityAccounts = [
    { _id: 'ua_demo_001', houseId: 'house_demo_002', leaseId: 'lease_demo_001', type: 'water', accountNo: '水表 0218-334', moveInReading: 1820, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_002', houseId: 'house_demo_002', leaseId: 'lease_demo_001', type: 'electricity', accountNo: '电表 0218-335', moveInReading: 9640, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_003', houseId: 'house_demo_002', leaseId: 'lease_demo_001', type: 'gas', accountNo: '燃气 0218-336', moveInReading: 305, moveOutReading: null, transferStatus: 'pending' },
    { _id: 'ua_demo_004', houseId: 'house_demo_002', leaseId: 'lease_demo_001', type: 'property', accountNo: '物业 海岸城物业', moveInReading: null, moveOutReading: null, transferStatus: 'pending' },
    { _id: 'ua_demo_005', houseId: 'house_demo_002', leaseId: 'lease_demo_001', type: 'broadband', accountNo: '宽带 电信 100M', moveInReading: null, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_006', houseId: 'house_demo_004', leaseId: 'lease_demo_002', type: 'water', accountNo: '水表 0732-118', moveInReading: 2240, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_007', houseId: 'house_demo_004', leaseId: 'lease_demo_002', type: 'electricity', accountNo: '电表 0732-119', moveInReading: 12340, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_008', houseId: 'house_demo_004', leaseId: 'lease_demo_002', type: 'gas', accountNo: '燃气 0732-120', moveInReading: 512, moveOutReading: null, transferStatus: 'pending' },
    { _id: 'ua_demo_009', houseId: 'house_demo_005', leaseId: 'lease_demo_003', type: 'water', accountNo: '水表 1102-778', moveInReading: 990, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_010', houseId: 'house_demo_005', leaseId: 'lease_demo_003', type: 'electricity', accountNo: '电表 1102-779', moveInReading: 22100, moveOutReading: null, transferStatus: 'done' },
    { _id: 'ua_demo_011', houseId: 'house_demo_005', leaseId: 'lease_demo_003', type: 'gas', accountNo: '燃气 1102-780', moveInReading: 188, moveOutReading: null, transferStatus: 'done' }
  ];

  var handovers = [
    {
      _id: 'ho_demo_001',
      houseId: 'house_demo_002',
      leaseId: 'lease_demo_001',
      handedAt: '2026-05-01',
      note: '钥匙 2 把、门禁卡 1 张、已拍照留底',
      items: [
        { name: '入户门钥匙', ok: true, note: '' },
        { name: '门禁卡', ok: true, note: '' },
        { name: '水表读数确认', ok: true, note: '1820' },
        { name: '电表读数确认', ok: true, note: '9640' },
        { name: '家具家电清点', ok: false, note: '空调遥控器缺失 1 个' }
      ],
      done: false,
      createdAt: '2026-05-01T08:00:00.000Z',
      updatedAt: '2026-05-01T08:00:00.000Z'
    },
    {
      _id: 'ho_demo_002',
      houseId: 'house_demo_004',
      leaseId: 'lease_demo_002',
      handedAt: '2026-03-15',
      note: '钥匙 3 把、门禁卡 2 张、已拍视频留底',
      items: [
        { name: '入户门钥匙', ok: true, note: '' },
        { name: '门禁卡', ok: true, note: '' },
        { name: '水表读数确认', ok: true, note: '2240' },
        { name: '电表读数确认', ok: true, note: '12340' },
        { name: '家具家电清点', ok: true, note: '空调 2 台正常' }
      ],
      done: true,
      createdAt: '2026-03-15T08:00:00.000Z',
      updatedAt: '2026-03-15T08:00:00.000Z'
    },
    {
      _id: 'ho_demo_003',
      houseId: 'house_demo_005',
      leaseId: 'lease_demo_003',
      handedAt: '2026-01-10',
      note: '钥匙 2 把、已交钥匙密码盒',
      items: [
        { name: '入户门钥匙', ok: true, note: '' },
        { name: '门禁卡', ok: true, note: '' },
        { name: '水表读数确认', ok: true, note: '990' },
        { name: '电表读数确认', ok: false, note: '电表异常需复核' },
        { name: '家具家电清点', ok: true, note: '齐全' }
      ],
      done: true,
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z'
    }
  ];

  // T14 维修 / 维护记录
  var repairs = [
    {
      _id: 'rp_demo_001',
      houseId: 'house_demo_001',
      kind: 'in_unit',
      reportedAt: '2026-06-12T09:30:00.000Z',
      issue: '主卧空调不制冷',
      handler: '售后 · 格力 李师傅',
      cost: 38000,
      status: 'done',
      proofRef: { fileID: '', refType: '维修凭证' }
    },
    {
      _id: 'rp_demo_002',
      houseId: 'house_demo_002',
      kind: 'property',
      reportedAt: '2026-06-20T14:00:00.000Z',
      issue: '楼道感应灯常亮',
      handler: '物业 · 工程部',
      cost: 0,
      status: 'doing',
      proofRef: { fileID: '', refType: '维修凭证' }
    },
    {
      _id: 'rp_demo_003',
      houseId: 'house_demo_004',
      kind: 'property',
      reportedAt: '2026-04-02T11:00:00.000Z',
      issue: '电梯间感应灯常亮',
      handler: '物业 · 工程部',
      cost: 0,
      status: 'done',
      proofRef: { fileID: '', refType: '维修凭证' }
    },
    {
      _id: 'rp_demo_004',
      houseId: 'house_demo_005',
      kind: 'in_unit',
      reportedAt: '2026-05-18T16:20:00.000Z',
      issue: '厨房下水管渗水',
      handler: '售后 · 管道 周师傅',
      cost: 22000,
      status: 'done',
      proofRef: { fileID: '', refType: '维修凭证' }
    }
  ];

  // T15/T16/T17 账单（lease_demo_001，租金 ¥6800/月，月付）
  // 覆盖状态：已缴 / 逾期（未缴且到期） / 未缴；其余期次由「生成全部账单期次」补齐
  var bills = [
    { _id: 'bill_demo_001', leaseId: 'lease_demo_001', period: '2026-05', dueDate: '2026-05-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'paid', paidAt: '2026-05-02', receiptRef: { fileID: 'att_demo_003', refType: '微信转账' } },
    { _id: 'bill_demo_002', leaseId: 'lease_demo_001', period: '2026-06', dueDate: '2026-06-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_003', leaseId: 'lease_demo_001', period: '2026-07', dueDate: '2026-07-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_004', leaseId: 'lease_demo_001', period: '2026-08', dueDate: '2026-08-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_005', leaseId: 'lease_demo_001', period: '2026-09', dueDate: '2026-09-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_006', leaseId: 'lease_demo_001', period: '2026-10', dueDate: '2026-10-01', items: [{ type: 'rent', amount: 680000 }], total: 680000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_007', leaseId: 'lease_demo_002', period: '2026-03', dueDate: '2026-03-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'paid', paidAt: '2026-03-16', receiptRef: { fileID: 'att_demo_004', refType: '微信转账' } },
    { _id: 'bill_demo_008', leaseId: 'lease_demo_002', period: '2026-04', dueDate: '2026-04-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_009', leaseId: 'lease_demo_002', period: '2026-05', dueDate: '2026-05-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_010', leaseId: 'lease_demo_002', period: '2026-06', dueDate: '2026-06-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_011', leaseId: 'lease_demo_002', period: '2026-07', dueDate: '2026-07-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_012', leaseId: 'lease_demo_002', period: '2026-08', dueDate: '2026-08-15', items: [{ type: 'rent', amount: 520000 }], total: 520000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_013', leaseId: 'lease_demo_003', period: '2026-01', dueDate: '2026-01-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'paid', paidAt: '2026-01-11', receiptRef: { fileID: 'att_demo_005', refType: '微信转账' } },
    { _id: 'bill_demo_014', leaseId: 'lease_demo_003', period: '2026-02', dueDate: '2026-02-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'paid', paidAt: '2026-02-12', receiptRef: { fileID: 'att_demo_005', refType: '支付宝' } },
    { _id: 'bill_demo_015', leaseId: 'lease_demo_003', period: '2026-03', dueDate: '2026-03-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_016', leaseId: 'lease_demo_003', period: '2026-04', dueDate: '2026-04-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_017', leaseId: 'lease_demo_003', period: '2026-05', dueDate: '2026-05-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'unpaid', paidAt: null, receiptRef: null },
    { _id: 'bill_demo_018', leaseId: 'lease_demo_003', period: '2026-06', dueDate: '2026-06-10', items: [{ type: 'rent', amount: 980000 }], total: 980000, status: 'unpaid', paidAt: null, receiptRef: null }
  ];

  return {
    houses: houses, attachments: attachments, channels: channels, showings: showings,
    signings: signings, leases: leases, tenants: tenants, utilityAccounts: utilityAccounts,
    handovers: handovers, repairs: repairs, bills: bills
  };
});
