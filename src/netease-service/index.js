import request from '../utils/request'

// 搜索网易云
function search(query) {
  query = query instanceof Object ? query : { keywords: query }
  const data = {
    s: query.keywords,
    // @see ./config.searchTypes
    type: query.type || 1,
    limit: query.limit || 30,
    offset: query.offset || 0,
  }
  return request({
    url: `https://music.163.com/weapi/search/get`,
    data,
  })
}

const apiStore = {
  search,
}

export default function neteaseAPI(type, query = {}) {
  const useCache = true
  const handle = apiStore[type]
  if (!handle) {
    return Promise.reject('API Not Found')
  } else {
    const cacheName = JSON.stringify(type) + JSON.stringify(query)
    if (useCache) {
      const cache = localStorage[cacheName]
      let res
      try {
        res = cache && JSON.parse(cache)
      } finally {
        if (res) {
          return Promise.resolve(res)
        }
      }
    }
    return new Promise(resolve => {
      handle(query).then(res => {
        localStorage[cacheName] = JSON.stringify(res)
        resolve(res)
      })
    })
  }
}
