// app.js —— 应用入口，初始化云开发
const { env } = require('./config')

App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env,           // 云开发环境 ID，在 config.js 中配置
        traceUser: true
      })
    }
  }
})
