# Constitution — 房东出租 / 收租管理小程序

> 项目治理原则（spec-kit `constitution`）。所有 spec / plan / tasks / 实现 都须遵循本文件。

## 一、项目身份

- **名称**：房东出租 / 收租管理小程序（代号 `landlord-rental-mgr`）
- **形态**：**先 Web 前端**（原生 HTML/CSS/JS，浏览器内运行，UI 采用手机比例 ~390×844 仿真小程序外观与底部 TabBar）；后台暂用前端本地数据/Mock，**后续再接入云开发（CloudBase）并据此移植到微信小程序**
- **使用者**：手握多套房源的**个人 / 家庭房东**（非中介、非公寓运营方）
- **范围**：单人使用；**仅测试、不正式上线**

## 二、开发治理原则（Governing Principles）

1. **规格驱动（Spec-Driven）**：严格 `constitution → spec → plan → tasks → implement`。
   在 spec.md 与 plan.md 就绪前，**禁止**编写实现代码。
2. **安全优先（Safe Code）**——遵循最小权限与防御式编程：
   - 输入校验与转义（防 XSS / 注入）；云函数入参严格校验（防越权 AuthZ）。
   - 密钥、敏感信息仅存环境变量或云函数配置，**不落代码、不落前端**。
   - 文件上传走云存储鉴权；下载域名白名单，禁止任意 SSRF / 越权读取。
   - 反序列化只信安全解析；任何外部请求先确认内网/外部边界。
3. **TDD（superpowers）**：先写失败测试，再实现（RED → GREEN → REFACTOR）；
   删除无测试保护的代码。
4. **系统化而非临时拼凑**：每步有验证证据，声明完成前先验证（evidence over claims）。
5. **YAGNI / DRY**：仅实现规格内所需，避免超前设计与重复。
6. **复杂度优先降低**：以简单为首要目标。
7. **技能自检**：每个任务前先检查是否有相关 skill（brainstorming / writing-plans /
   test-driven-development / requesting-code-review / using-git-worktrees）。

## 三、质量门槛

- 所有核心逻辑（数据校验、账单计算，及后续云函数）须有单元测试。
- 实现过程设 checkpoint，并通过代码评审（critical issue 阻断推进）。
- **阶段区分**：
  - **Web 阶段**（当前）：浏览器本地运行 + Mock，不涉及云资源、不产生任何计费，无"正式版/环境名额"概念。
  - **小程序 / 云开发阶段**（后续）：不发布正式版（避免计费）；免费体验环境名额不误删、不点"转为付费"。

## 四、约束

- **Web 阶段**（当前）：纯前端、本地数据，**无云资源、无计费、无第三方资金**。
- **小程序 / 云开发阶段**（后续）：免费体验环境 3000 资源点 / 月，资源克制使用；不上线、不接真实支付、不处理真实第三方资金。

## 五、工作流绑定

本仓库采用 **spec-kit（规格驱动）+ superpowers（agentic 技能）** 双框架：
- 规格与计划产物存放于 `specs/001-landlord-rental-mgr/`。
- agent 行为约束见根目录 `CLAUDE.md`（superpowers 强制工作流）。
