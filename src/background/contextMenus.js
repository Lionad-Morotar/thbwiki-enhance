import neteaseConfig from '../netease-service/config'

// 在 THBWIKI 搜索选中内容
function searchOnTHBWIKI() {
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: '搜索 THB WIKI 的："%s"',
    onclick: info => {
      chrome.tabs.create({
        url: `https://thwiki.cc/index.php?search=${encodeURIComponent(
          info.selectionText
        )}&fulltext=1`,
      })
    },
  })
}

// 访问 THBWIKI 的选中内容页面
function jumpToTHBWIKI() {
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: '访问 THB WIKI 的："%s" 页面',
    onclick: info => {
      chrome.tabs.create({
        url: `https://thwiki.cc/${encodeURIComponent(info.selectionText)}`,
      })
    },
  })
}

// 在网易云音乐搜索选中内容
function searchOn163() {
  this._id = chrome.contextMenus.create({
    contexts: ['selection'],
    title: '搜索网易云音乐："%s"',
    onclick: info => {
      chrome.tabs.create({
        url: `https://music.163.com/#/search/m/?s=${encodeURIComponent(
          info.selectionText
        )}`,
      })
    },
  })
}

// 在网易云音乐搜索选中内容（按单曲、专辑等项目拆分子项）
function searchOn163WithType() {
  const parentID = searchOn163._id

  neteaseConfig.searchTypes.map(([id, title]) => {
    chrome.contextMenus.create({
      contexts: ['selection'],
      parentId: parentID,
      title,
      onclick: info => {
        chrome.tabs.create({
          url: `https://music.163.com/#/search/m/?s=${encodeURIComponent(
            info.selectionText
          )}&type=${id}`,
        })
      },
    })
  })
}

// 分割线
function sep() {
  chrome.contextMenus.create({
    contexts: ['selection'],
    type: 'separator',
  })
}

/** 事件初始化 */

// TODO：config.xxx 控制子项禁用
const enableSearch163SubItem = false
const searchOn163Items = enableSearch163SubItem
  ? [searchOn163, searchOn163WithType]
  : [searchOn163]
const selectionMenus = [
  ...searchOn163Items,
  sep,
  searchOnTHBWIKI,
  jumpToTHBWIKI,
]

// 注册 ContextMenus
export default function registerContextMenus() {
  selectionMenus.map(midware => midware.bind(midware)())
}
