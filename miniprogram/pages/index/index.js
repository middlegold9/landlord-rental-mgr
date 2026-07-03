// pages/index/index.js

// 根据文件名判断类别：image / pdf / word / other
const categoryOf = (name) => {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'heic'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'word'
  return 'other'
}

// 文件大小格式化
const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

Page({
  data: {
    file: null,      // 当前已选文件
    result: null,    // 最近一次上传结果
    list: [],        // 已上传文件列表
    uploading: false
  },

  // 选择文件（图片 / PDF / Word 均可）
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: (res) => {
        const f = res.tempFiles[0]
        this.setData({
          file: {
            path: f.path,
            name: f.name,
            size: f.size,
            sizeText: formatSize(f.size),
            category: categoryOf(f.name)
          },
          result: null
        })
      }
    })
  },

  // 上传到云存储
  uploadFile() {
    const file = this.data.file
    if (!file) return
    this.setData({ uploading: true })

    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const cloudPath = `uploads/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`

    wx.cloud.uploadFile({
      cloudPath,
      filePath: file.path,
      success: (res) => {
        const item = { ...file, fileID: res.fileID, cloudPath }
        this.setData({
          result: item,
          list: [item, ...this.data.list]
        })
        wx.showToast({ title: '上传成功', icon: 'success' })
      },
      fail: (err) => {
        console.error(err)
        wx.showToast({ title: '上传失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ uploading: false })
      }
    })
  },

  // 预览/打开最近一次上传结果
  openFile() {
    if (this.data.result) this.openRecord(this.data.result)
  },

  // 点击列表项预览/打开
  openItem(e) {
    const index = e.currentTarget.dataset.index
    this.openRecord(this.data.list[index])
  },

  // 统一处理：图片走预览，其它（PDF/Word）走打开文档
  openRecord(item) {
    if (!item) return
    if (item.category === 'image') {
      wx.cloud.getTempFileURL({
        fileList: [item.fileID],
        success: (res) => {
          const url = res.fileList[0] && res.fileList[0].tempFileURL
          if (!url) {
            wx.showToast({ title: '获取链接失败', icon: 'none' })
            return
          }
          wx.previewImage({ urls: [url], current: url })
        },
        fail: () => wx.showToast({ title: '获取链接失败', icon: 'none' })
      })
    } else {
      wx.cloud.downloadFile({
        fileID: item.fileID,
        success: (res) => {
          wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
        },
        fail: () => wx.showToast({ title: '打开失败', icon: 'none' })
      })
    }
  }
})
