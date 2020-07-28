import registerContextMenus from './contextMenus.js'
import api from '../netease-service'

// TODO global.config

chrome.runtime.onInstalled.addListener(() => {
  console.clear()
  console.log('Installed @', new Date())

  // 注册右键搜索菜单
  registerContextMenus()

  // 注册网易云服务
  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.api) {
      const apiType = msg.api
      const query = msg.query
      api(apiType, query).then(res => {
        const { status, body } = res
        if (status === 200) {
          sendResponse({
            ...body,
          })
        } else {
          sendResponse({
            code: 500,
          })
        }
      })
      return true
    }
  })
})
