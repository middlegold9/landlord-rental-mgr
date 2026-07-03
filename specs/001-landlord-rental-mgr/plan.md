# Implementation Plan: 房东出租 / 收租管理小程序

> 技术栈与落地方案（spec-kit `plan`）。前置：`constitution.md` ✅ / `spec.md` ✅。

## Tech Stack

- **前端（先）**：原生 **HTML / CSS / JS**（无构建，浏览器直接打开），外层套手机比例（~390×844）仿真外壳 + 底部 TabBar，视觉对齐微信小程序。
- **前端逻辑**：金额/日期/校验等下沉到 `utils/` 纯函数（jest 单测），组件按页面/模块拆分。
- **后端（后）**：微信云开发（CloudBase）—— 文档库 + 云存储 + 云函数；Web 端通过 CloudBase Web SDK 调用。首版可用前端本地数据 / Mock，后端后续接入。
- **运行**：Web 版浏览器本地运行（仅测试）；小程序版用免费体验环境（3000 资源点/月）。

## Architecture（Web 优先）

```
Web 端 (web/)
  ├─ 手机比例外壳 + 底部 TabBar（仿真小程序导航）
  ├─ 概览 / 房源(待租|已租) / 提醒 / 我的
  └─ 房源详情（Tab：基础信息 | 放租/租约 | 账单收租 | 费用账户 | 维修 | 文件）
        │ 调用（后续接入云开发；首版用本地 Mock）
        ▼
[后续] 云函数 (cloudfunctions/) + 云数据库 collections ── 云存储 (attachments)
```

## File Layout（目标，按 tasks.md 落地）

```
web/                         # ★ Web 前端（手机比例仿真小程序）
├─ index.html                # 手机比例外壳 + TabBar 挂载点
├─ css/                      # 全局样式 + 手机外壳
├─ js/
│   ├─ app.js                # 路由/Tab 切换
│   ├─ pages/                # overview / houses / reminders / mine
│   ├─ components/           # 房源卡片 / 时间线 / 步骤条
│   └─ utils/                # 金额计算 / 日期 / 校验（纯函数，可单测）
└─ data/                     # 本地 Mock 数据
miniprogram/                 # 后续：微信小程序版（含已搭上传原型）
cloudfunctions/              # 后续：云函数（账单生成 / 订阅消息）
specs/001-landlord-rental-mgr/  # 本文档集
```

## Implementation Phasing（对应 tasks.md）

- **P0 脚手架 + 安全基线**：环境配置、入参校验封装、可编译运行。
- **P1 房源内核 (MVP)**：house/attachment 集合、列表、详情框架、文件附件。
- **P2 待租**：channel、showing、价格、签约状态机。
- **P3 已租/租约**：lease、tenant、费用账户与交接单、维修。
- **P4 收租与账单**：bill 生成、缴费、退租清算 + 续租。
- **P5 全局**：概览、提醒订阅、搜索/导出。

## Risks / 注意事项

- 小程序无内置 UI 单测：核心逻辑下沉到 `utils/` 纯函数 + 云函数 jest 单测。
- 订阅消息需提前在公众平台配置模板并获取下发权限。
- 免费环境资源克制：账单生成按月触发，避免高频定时。
- 金额计算须带定点/分单位，杜绝浮点误差（见 data-model.md）。
