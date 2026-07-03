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

  return { houses: houses, attachments: attachments, channels: channels, showings: showings, signings: signings };
});
