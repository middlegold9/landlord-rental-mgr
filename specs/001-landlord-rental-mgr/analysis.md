# Spec Analysis — 001-landlord-rental-mgr

> `/speckit.analyze` 交叉一致性检查报告。范围：`constitution.md` / `spec.md` / `plan.md` / `data-model.md` / `research.md` / `tasks.md`。
> 分支：`001-landlord-rental-mgr`（已 `git init` 并切到本特性分支）。

## 一、总体结论

**可进入 implement。** 规格链条自洽，无阻塞级（blocker）矛盾；发现 1 处需求覆盖缺口（中）、2 处 NFR 口径需微调（低），均不阻断 Phase 0 启动。

## 二、一致性核对

### 2.1 FR → Task 覆盖（逐项）
| 需求 | 覆盖任务 | 结论 |
|------|----------|------|
| FR-1xx 基础信息 | T4-T6 | ✅ |
| FR-102 图册/户型**视觉化** | T6（仅"表单+预览"，视觉化呈现未单列） | ⚠️ 见 §三 |
| FR-2xx 待租（ch/showing/价格/反馈/签约） | T8-T11 | ✅ |
| **FR-206 空置与定价分析** | T19 仅含空置率；渠道转化/同小区参考无显式任务 | ❌ 覆盖缺口 见 §三 |
| FR-3xx 已租/租约/退租/续租 | T12-T14、T18 | ✅ |
| FR-4xx 收租账单 | T15-T17 | ✅ |
| FR-5xx 费用/交接单 | T13、T18 | ✅ |
| FR-6xx 维修 | T14 | ✅ |
| FR-7xx 文件附件 | T7 | ✅ |
| FR-8xx 概览/提醒/搜索/导出 | T19-T21 | ✅ |

### 2.2 data-model ↔ spec 字段一致
- `house.layout/gallery/status`、`channel.listPrice/floorPrice`、`showing.status`、`lease.payCycle/renewed`、`tenant.emergencyContact/sourceChannel`、`bill.items/status`、`utility_account`、`repair`、`attachment` —— 与 FR 定义**逐一吻合**。✅

### 2.3 plan ↔ tasks 阶段一致
- plan P0–P5 与 tasks Phase 0–5 **一一对应**。✅
- File Layout 中 `web/`、`miniprogram/`、`cloudfunctions/` 与 tasks 落点一致。✅

### 2.4 Edge Cases 覆盖
- EC-1 状态闭环（T11→已租、T18→退租→T4 状态）✅
- EC-2 押金不足抵损→欠房东款（T18 押金结算）✅（概念）
- EC-3 多渠道成交仅一下架（T11 + `channel.listed`）— 依赖实现，建议实现时显式处理 ⚠️
- EC-4 账单重算（T15/T16）✅
- EC-5 上传校验（T3 + T7）✅

### 2.5 Open Questions
- OQ-1/2/3 均已裁决，无遗留歧义。✅

## 三、需处理项（按严重度）

### 🟡 中：FR-206 空置与定价分析缺显式任务
- spec 列为缺失点#4（核心分析能力）：空置天数/成本、同小区租金参考、**渠道转化分析**。
- tasks 仅在 T19 Dashboard 含"空置率"，**渠道转化/同小区参考无落点**。
- 建议二选一：① 在 Phase 5 增任务 `T22 渠道转化与定价分析`；② 在 spec 明确"本期仅空置率，渠道转化/同小区参考延后"。
- 不阻断 Phase 0；建议在 Phase 2 起前定夺。

### 🟢 低：NFR-1 / NFR-2 / NFR-4 含云开发概念，Web 阶段措辞
- NFR-1 "数据隔离到 openid"、NFR-2 "免费环境资源克制"、NFR-4 "附件走鉴权/下载域名" —— 均为**云开发阶段**约束。
- Web 版为本地单用户，NFR-1 自然满足、NFR-2/4 不适用。
- constitution.md 已正确按阶段拆分，但 spec.md NFR 仍无条件陈述。建议给 NFR-1/2/4 标注"（云开发阶段；Web 版本地单用户自然满足）"。
- 不阻断开发。

### 🟢 低：FR-102 视觉化呈现未单列任务
- T6 仅"图册表单+预览"。图册轮播/户型可视化作为独立呈现项，建议实现时在 T6 内明确子目标，或补一句到 tasks。

## 四、前置就绪度判定

| 门禁 | 状态 |
|------|------|
| constitution ✅ | 通过 |
| spec ✅（OQ 全裁决） | 通过 |
| plan ✅ | 通过 |
| tasks ✅ | 通过 |
| analyze（本报告） | ✅ 已执行，无 blocker |
| git 隔离（worktree 等价） | ✅ 已 init + 特性分支 001-landlord-rental-mgr |
| **implement 准入** | **✅ 允许进入 Phase 0** |

## 五、给实现阶段的建议
1. Phase 0 T2 需先建 `package.json` + jest harness（当前无，属预期）。
2. 进入 Phase 2 前先定 FR-206 取舍（§三 🟡）。
3. 实现时把 §三 🟢 两处口径差异顺手合入 spec，保持文档单向一致。
