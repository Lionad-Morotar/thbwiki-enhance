import registerContextMenus from './contextMenus.js'

chrome.runtime.onInstalled.addListener(() => {
  console.clear()
  console.log('Installed @', new Date())

  registerContextMenus()
})
