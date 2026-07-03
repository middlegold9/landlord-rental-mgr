# CLAUDE.md — Agent 工作流约束（superpowers + spec-kit）

本仓库开发**强制**遵循 superpowers 技能工作流，并与 spec-kit 规格驱动结合。
任何写代码动作前，先核对本文件与本仓库 `.specify/memory/constitution.md`。

## 强制工作流（superpowers）

1. **Brainstorming（已部分完成）**：需求已在 `功能点.md`、`specs/001-landlord-rental-mgr/spec.md`
   沉淀；新需求先在此阶段收敛，再进入下一步。
2. **Using Git Worktrees**：实现前基于特性分支（如 `001-landlord-rental-mgr`）开 worktree，
   隔离主树，先验证可编译/可测试基线再动手。
3. **Writing Plans**：实现前必须有 `specs/.../plan.md` 与 `tasks.md`（已具备）。
4. **Test-Driven Development**：**先写失败测试，再实现**（RED→GREEN→REFACTOR）；
   删除无测试保护的代码。核心逻辑下沉到可单测的纯函数 / 云函数。
5. **Executing Plans / 子 agent**：按 `tasks.md` 逐任务执行，关键任务走两阶段评审
   （规格合规 → 代码质量），或分批 + 人工 checkpoint。
6. **Requesting Code Review**：任务间评审；critical issue 阻断推进。
7. **Finishing a Development Branch**：验证测试 → 给出 合并/PR/保留/丢弃 选项 → 清理 worktree。

## 规格驱动（spec-kit）

命令顺序：`constitution → specify → clarify → plan → tasks → analyze → implement`。
- 当前已就绪：`constitution.md`、`spec.md`、`plan.md`、`data-model.md`、`research.md`、`tasks.md`。
- **在 spec.md / plan.md / tasks.md 未就绪前，禁止写实现代码。**
- `/speckit.analyze` 应在 tasks 之后、implement 之前执行一次交叉一致性检查。

## 技能自检（每任务前）

开始前确认是否命中以下 skill，命中则必须按其流程走：
brainstorming · writing-plans · test-driven-development · systematic-debugging ·
requesting-code-review · using-git-worktrees · dispatching-parallel-agents。

## 安全规则（宪法 §二.2，强制）

- 输入校验与转义（防 XSS / 注入）；云函数入参严格校验（防越权 AuthZ）。
- 密钥/敏感信息仅存环境变量或云函数配置，**不落代码、不落前端**。
- 文件上传走云存储鉴权；下载域名白名单，禁止任意 SSRF / 越权读。
- 反序列化只信安全解析；外部请求先确认边界。
- 金额以**分（整数）**存储与计算。

## 项目约束

- **先 Web 前端**（手机比例仿真小程序），后续再做微信小程序；均为仅测试、不正式上线、不接真实支付。
- Web 版浏览器本地运行；小程序版用云开发免费体验环境（3000 资源点/月），资源克制、不删环境、不点"转为付费"。
