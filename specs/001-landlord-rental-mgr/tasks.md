# Tasks — 房东出租 / 收租管理小程序 (001)

> 前置：`constitution.md` ✅ / `spec.md` ✅ / `plan.md` ✅。
> 规则：TDD 优先（先写失败测试）；`[P]` 表示可并行；每个 Phase 末设 checkpoint。

## Phase 0 — 脚手架与安全基线
- [x] T1 确认 `.specify` / `CLAUDE.md` 就绪；建立 `web/` 工程骨架（index.html + 手机比例外壳 + TabBar）
- [x] T2 建立 `web/js/utils/` 纯函数骨架 + jest harness（金额÷100、日期、状态枚举）
- [ ] T3 前端输入校验 / 防 XSS 转义封装（含单测）
- [x] checkpoint：浏览器打开可见手机外壳 + Tab 切换，工具单测全绿

## Phase 1 — 房源内核（MVP，Web）
- [x] T4 本地 Mock 数据层：`house` / `attachment` 读写封装（含单测）
- [x] T5 房源列表页（待租/已租 Segment）+ 房源卡片组件
- [ ] T6 房源详情框架 + 基础信息表单（含图册，用 `<input type="file">` + 预览）
- [ ] T7 文件附件（图片/PDF/Word 前端预览，挂载到房源） `[P]`
- [ ] checkpoint：可新建房源并挂附件

## Phase 2 — 待租模块
- [ ] T8 `channel` 集合 + 渠道管理页（联系人/价格/挂盘状态）
- [ ] T9 `showing` 预约/记录 + 状态机（pending/done/cancel/no_show）
- [ ] T10 价格策略 + 双向反馈录入
- [ ] T11 签约流程状态机（洽谈→意向金→签约→交钥匙→转已租）
- [ ] checkpoint：待租链路可走通

## Phase 3 — 已租 / 租约
- [ ] T12 `lease` / `tenant` 集合 + 租约信息 / 租客档案
- [ ] T13 费用账户（`utility_account`）+ 入驻交接单
- [ ] T14 维修 / 物业维护记录（`repair`）时间线
- [ ] checkpoint：已租链路可录入

## Phase 4 — 收租与账单（核心）
- [ ] T15 `bill` 集合 + 账单生成纯函数（金额按分计算，含单测）
- [ ] T16 账单生成逻辑（首版前端纯函数，后续迁移云函数 `billGenerate`）
- [ ] T17 缴费状态 / 凭证归档 / 逾期标记
- [ ] T18 退租清算 + 续租流程（押金结算、账户过户、交接单）
- [ ] checkpoint：收租闭环 + 退租/续租

## Phase 5 — 全局与提醒
- [ ] T19 概览首页 Dashboard（房源数/应收已收欠收/空置率）
- [ ] T20 提醒中心（本地红点 + 订阅消息增强）
- [ ] T21 搜索/筛选 + 数据导出（PDF 台账）
- [ ] checkpoint：MVP 完成、全量单测通过、代码评审通过

## 收尾
- [ ] 验证免费环境未触发计费；确认不发正式版；归档本期产出
