# Research — 房东出租 / 收租管理小程序

## 1. 云开发免费体验环境（已核实，见 开发环境.md）
- 仅"发布正式版"触发计费；体验版/本地测试不触发。
- 3000 资源点/月；手动续期 6 个月/次；不删环境、不点"转为付费"即可长期免费用。

## 2. 文件上传（Web 版方案）
- **Web 版**：用 `<input type="file" accept="image/*,.pdf,.doc,.docx">` 选文件；预览用 `URL.createObjectURL` / `<iframe>`（PDF、Word）。
- **小程序版（后续）**：沿用已搭原型 —— `wx.chooseMessageFile({type:'all'})` 选文件，`wx.cloud.uploadFile` 上传，图片 `wx.previewImage`、PDF/Word `wx.openDocument`。原型保留于 `miniprogram/`。
- 安全：上传仅前端预览/暂存本地，接入云开发后再落云存储；前端不做鉴权信任。

## 3. 测试策略（无内置 UI 单测）
- Web / 小程序均**无内置 UI 单测框架**。对策：
  - 金额/日期/校验等核心逻辑下沉到 `utils/` 纯函数，用 jest 在本地 harness 单测。
  - 小程序侧云函数用 jest 单测（Node 环境，mock 云 SDK）。
  - Web 侧核心纯函数同样走 jest；DOM 交互以手动验证为辅助。
- 这是 TDD 能落地的关键约束，决定 tasks.md 的测试先行策略。

## 4. 提醒（订阅消息）
- **Web 版（首版）**：应用内提醒/红点 + 浏览器 Notification（需用户授权），先本地实现。
- **小程序版（后续）**：微信订阅消息 —— 公众平台配置模板，前端 `wx.requestSubscribeMessage` 授权，云函数 `subscribeMessage.send`。
- 提醒类：交租日、合同到期、带看、欠缴。

## 5. 金额精度
- 所有金额以**分（整数）**存储与计算，展示时 ÷100 格式化，避免浮点误差。

## 6. 安全边界（宪法约束）
- 云函数入参校验（AuthZ：仅操作本人 ownerOpenid 数据）。
- 附件下载域名白名单；外部请求仅限已知域名。
- 密钥不落前端/代码。
