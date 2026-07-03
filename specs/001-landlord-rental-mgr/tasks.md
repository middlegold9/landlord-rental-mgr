# Tasks — 房东出租 / 收租管理小程序 (001)

> 前置：`constitution.md` ✅ / `spec.md` ✅ / `plan.md` ✅。
> 规则：TDD 优先（先写失败测试）；`[P]` 表示可并行；每个 Phase 末设 checkpoint。

## Phase 0 — 脚手架与安全基线
- [x] T1 确认 `.specify` / `CLAUDE.md` 就绪；建立 `web/` 工程骨架（index.html + 手机比例外壳 + TabBar）
- [x] T2 建立 `web/js/utils/` 纯函数骨架 + jest harness（金额÷100、日期、状态枚举）
- [x] T3 前端输入校验 / 防 XSS 转义封装（已收敛为 utils/dom，含单测）
- [x] checkpoint：浏览器打开可见手机比例列 + Tab 切换，工具单测全绿

## Phase 1 — 房源内核（MVP，Web）
- [x] T4 本地 Mock 数据层：`house` / `attachment` 读写封装（含单测）
- [x] T5 房源列表页（待租/已租 Segment）+ 房源卡片组件
- [x] T6 房源详情框架 + 基础信息表单（含图册，用 `<input type="file">` + 预览）
- [x] T7 文件附件（图片/PDF/Word 前端预览，挂载到房源） `[P]`
- [x] checkpoint：可新建房源并挂附件

## Phase 2 — 待租模块
- [x] T8 `channel` 集合 + 渠道管理页（联系人/价格/挂盘状态）
- [x] T9 `showing` 预约/记录 + 状态机（pending/done/cancel/no_show）
- [x] T10 价格策略 + 双向反馈录入
- [x] T11 签约流程状态机（洽谈→意向金→签约→交钥匙→转已租）
- [x] checkpoint：待租链路可走通

## Phase 3 — 已租 / 租约
- [x] T12 `lease` / `tenant` 集合 + 租约信息 / 租客档案（leasePage：租约+租客合并表单，元→分）
- [x] T13 费用账户（`utility_account`）+ 入驻交接单（`handover`，T13 任务要求的支撑结构，data-model 未单列）
- [x] T14 维修 / 物业维护记录（`repair`）时间线（倒序，状态/类别徽标）
- [x] checkpoint：已租链路可录入（详情页「已租管理」→ 租约/租客 + 费用/交接单；全房源「维修记录」）

## 全局调整
- [x] 删除「我的」Tab（index.html tabbar + app.js TABS/renderMine）

## Phase 4 — 收租与账单（核心）
- [x] T15 `bill` 集合 + 账单生成纯函数（utils/bill.js：listPeriods / generateBills，金额按分，含单测）
- [x] T16 账单生成逻辑（billRepo.generate 仅补缺失期次，月/季拆分；前端纯函数，后续平移云函数 `billGenerate`）
- [x] T17 缴费状态 / 凭证归档 / 逾期标记（markPaid 归档 receiptRef；refreshOverdue 将到期未缴置逾期；stats 统计）
- [x] T18 退租清算 + 续租流程（settlePage：续租顺延到期日；退租押金结算+费用账户过户+退租交接单 move_out）
- [x] checkpoint：收租闭环 + 退租/续租（详情页「已租管理 → 账单/收租」「退租/续租」均打通）

## Phase 5 — 全局与提醒
- [x] T19 概览首页 Dashboard（房源数/空置率 + 应收已收欠收 + 已缴/待缴/逾期笔数）
- [x] T20 提醒中心（待带看 / 逾期 / 7 日内应交 / 30 日内到期，本地红点 + 计数）
- [x] T21 搜索/筛选 + 数据导出（房源关键词搜索；台账打印导出 PDF）
- [x] checkpoint：MVP 完成、全量单测通过（128 用例）、代码评审通过

## 收尾
- [x] Web 阶段纯前端/本地数据，无云资源、无计费、无第三方资金（constitution 确认）；不发正式版；本期产出已提交归档
