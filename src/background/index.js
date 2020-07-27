import registerContextMenus from './contextMenus.js'
import api from '../netease-service'

// TODO global.config

chrome.runtime.onInstalled.addListener(() => {
  console.clear()
  console.log('Installed @', new Date())

  // console.log(api.search('海阔天空'))

  registerContextMenus()
})
