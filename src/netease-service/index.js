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

export default {
  search,
}
