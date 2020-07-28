/* @file 在 THBWIKI 专辑页面的歌曲表格的歌曲标题后增加一个链接到网易云音乐原曲的播放按钮 */

// 查找并获取页面上的专辑相应信息
function qsAlbumInfo() {
  /* find album title */

  const $albumHeader = document.querySelector('#firstHeading')
  const album = $albumHeader && $albumHeader.innerText

  /* find songs info */
  // TODO multy disc in album

  const $albumTable = document.querySelector('.wikitable.musicTable')
  const $trs = $albumTable && ($albumTable.querySelectorAll('tr') || [])
  const songs = []

  ;[...$trs].reduce((h, tr, i) => {
    const $name =
      tr.querySelector('.infoRD + .title') ||
      tr.querySelector('.infoYD + .title')

    if ($name && Object.keys(h).length) {
      songs.push({ ...h })
      h = Object.create(null)
    }

    const $label = tr.querySelector('.label')
    const $text = tr.querySelector('.text')

    if ($name) {
      const name = $name.innerText
      h.name = name

      return h
    } else if ($label && $text) {
      const label = $label.innerText
      const text = $text.innerText
      h[label] = text
      return h
    } else {
      if (i === $trs.length - 1) {
        songs.push({ ...h })
      }
      return h
    }
  }, Object.create(null))

  return {
    album,
    songs,
  }
}

// 尝试从缓存获取页面上的专辑相应信息
function tryGetAlbumInfoFromCache() {
  const type = 'getAlbumInfo'
  const href = window.location.href

  const cacheName = `${type}-${href}`
  const cache = localStorage[cacheName]
  if (cache) {
    let res
    try {
      res = JSON.parse(cache)
    } finally {
      if (res) {
        return res
      }
    }
  }

  const res = qsAlbumInfo()
  localStorage[cacheName] = JSON.stringify(res)

  return res
}

// 尝试从网易云获取对应专辑详情
function tryGetOriginAlbumOn163(album, songs) {
  return new Promise(resolve => {
    // 搜索专辑信息
    chrome.runtime.sendMessage(
      {
        api: 'search',
        query: {
          keywords: album,
          type: 10,
        },
      },
      data => {
        const { result = {} } = data
        const { albumCount = 0, albums = [] } = result
        if (albumCount === 1) {
          const handleAlbum = albums[0]

          // 获取对应专辑详情
          chrome.runtime.sendMessage(
            {
              api: 'getAlbum',
              query: handleAlbum.id,
            },
            resolve
          )
        }
      }
    )
  })
}

// 确定从网易云返回的歌曲是否和表格上的是同一首曲子
// TODO refactor
function checkIsSameSong(item, tr) {
  const { name } = item
  const text = tr.innerText

  return name.trim() === text.trim()
}

// EXPORTS
export default function exec() {
  const { album, songs } = tryGetAlbumInfoFromCache()

  if (album && songs.length) {
    tryGetOriginAlbumOn163(album, songs).then(data => {
      const $trs = document.querySelectorAll('.wikitable.musicTable tr') || []
      const { songs: albumSongs = [] } = data

      albumSongs.map(item => {
        const { name, id } = item
        ;[...$trs].map(tr => {
          if (checkIsSameSong(item, tr)) {
            const container = tr.querySelector('td a')
            const a = document.createElement('a')
            const size = '1.2em'
            a.setAttribute('href', `https://music.163.com/#/song?id=${id}`)
            a.setAttribute('target', '_blank')
            a.setAttribute(
              'style',
              `display: inline-block; margin-left: 1em; width: ${size}; height: ${size}; vertical-align: middle;`
            )
            a.title = '在网易云播放'
            a.innerHTML = `<svg class="prefix__icon" viewBox="0 0 1024 1024" style="width: 100%;"><path fill="#e60026" d="M512 938.667C276.352 938.667 85.333 747.648 85.333 512S276.352 85.333 512 85.333 938.667 276.352 938.667 512 747.648 938.667 512 938.667zm-46.336-445.099c10.24-35.84 45.867-65.75 84.907-70.315 7.978 29.611 16.554 58.582 23.253 88.022 2.261 9.813 1.579 21.12-.768 31.018-9.088 38.059-53.248 52.992-84.395 29.227-22.613-17.28-31.658-47.787-22.997-77.952zm162.859-8.405c-5.334-19.84-10.923-39.552-16.768-60.587 21.333 5.547 38.741 15.36 53.546 29.781 53.632 52.096 59.094 140.8 12.544 201.856-48.426 63.574-134.613 91.051-214.528 68.48C365.1 696.96 300.843 598.741 316.501 497.877c11.691-75.434 54.187-128.17 123.734-159.274 17.365-7.766 24.746-23.894 17.92-39.68-6.699-15.531-23.04-21.504-40.278-14.635-116.096 46.464-184.32 176.384-156.586 298.112 30.421 133.035 149.12 220.288 284.8 207.317 73.898-7.04 134.997-40.448 179.882-100.138 64.256-85.419 55.339-204.075-19.754-277.291-28.416-27.733-62.763-43.435-101.974-49.195-3.541-.554-9.258-2.218-9.898-4.522-3.712-13.355-7.68-26.966-8.79-40.704-1.237-15.232 12.374-27.307 27.734-27.52 10.794-.128 18.517 5.546 25.728 12.8 12.928 12.8 30.037 13.738 42.154 2.645 12.374-11.264 12.63-28.928.768-43.008-24.149-28.672-67.669-38.016-103.68-22.315-36.138 15.787-56.362 50.646-51.2 89.302 1.622 11.946 4.694 23.765 7.126 35.925l-11.094 3.072a164.821 164.821 0 00-89.514 60.33c-39.296 52.054-39.936 120.662-1.75 168.406 54.358 68.01 159.872 54.784 192.982-24.235 12.117-28.842 11.733-58.368 3.712-88.106z"/></svg>`
            container.after(a)
          }
        })
      })
    })
  }
}
