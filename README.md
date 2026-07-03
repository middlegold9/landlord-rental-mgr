# 房东出租 / 收租管理 · 开发记录

本文件夹记录该产品的开发过程与决策。

## 当前定位

- **交付顺序**：**先 Web 前端**（手机比例、仿真小程序外观，浏览器直接运行）；**后续再做微信小程序**。
- **产品**：面向手握多套房源的房东的出租 / 收租 / 费用 / 事务一站式管理（详见 [功能点.md](./功能点.md)）。
- **两大板块**：`待租` 与 `已租` 房源，覆盖收房 → 挂盘 → 签约 → 收租 → 退租全生命周期。
- **仅测试、不正式上线**：Web 版本地浏览器运行；小程序版用云开发免费体验环境（0 元）。
- **单人使用**，规模很小。

## 文件索引

| 文件 | 内容 |
|------|------|
| [功能点.md](./功能点.md) | 产品功能点与端到端头脑风暴（核心需求文档） |
| [开发环境.md](./开发环境.md) | 云开发免费体验环境规则与"只测试不上线可一直免费用"的结论 |
| [CLAUDE.md](./CLAUDE.md) | 工作流约束（superpowers + spec-kit + 安全规则） |
| [.specify/memory/constitution.md](./.specify/memory/constitution.md) | 项目治理原则 |
| [specs/001-landlord-rental-mgr/](./specs/001-landlord-rental-mgr/) | 规格 / 计划 / 数据模型 / 调研 / 任务 |
| [项目结构](#项目结构) | 当前工程目录与说明 |
| [运行步骤](#运行步骤web-版) | 在浏览器中运行 Web 版的步骤 |

## 项目结构

```
微信小程序开发记录/
├── CLAUDE.md                    # superpowers + spec-kit 工作流约束
├── .specify/                    # spec-kit 治理（constitution）
├── specs/001-landlord-rental-mgr/  # 规格 / 计划 / 任务 / 数据模型
├── web/                         # ★ Web 前端（手机比例仿真小程序，浏览器直接打开；待建）
├── miniprogram/                 # 后续：微信小程序版（含已搭的上传原型）
│   ├── app.js / app.json / app.wxss / config.js / project.config.json / sitemap.json
│   ├── pages/index/
│   └── cloudfunctions/
├── 功能点.md
├── 开发环境.md
└── README.md
```

> Web 版采用原生 HTML/CSS/JS（无构建），外层套手机比例（~390×844）外壳 + 底部 TabBar，视觉对齐微信小程序。小程序原型已移至 `miniprogram/`，待后续阶段复用。

## 运行步骤（Web 版）

1. 用浏览器直接打开 `web/index.html`（手机比例外壳会自动渲染）。
2. 本地预览即可；数据先用前端 Mock，后续再接入云开发。
3. 小程序版（后续）：用微信开发者工具打开 `miniprogram/`，填 `appid` 与 `config.js` 的 env。

> ⚠️ 小程序版只要不发"正式版"就不触发计费（见 [开发环境.md](./开发环境.md)）。

## 后续待补（路线图）

- [x] 规格驱动底座：constitution / spec / plan / tasks（已建）
- [ ] Web 前端骨架（手机比例 + TabBar 仿真小程序）
- [ ] 房源基础信息 + 待租 / 已租 分区列表
- [ ] 收租与账单模块（周期性账单、逾期提醒、凭证归档）
- [ ] 费用账户交接、维修 / 物业记录
- [ ] 退租清算、续租流程
- [ ] 提醒中心、数据导出
- [ ] 接入云开发，并据此移植到微信小程序
