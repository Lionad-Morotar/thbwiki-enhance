import './index.styl'

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

const { album, songs } = tryGetAlbumInfoFromCache()

console.log(album, songs)

/* search album on 163 */
// TODO cache the result

if (album && songs.length) {
  // try to get album info
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

        console.log(handleAlbum)
      }
    }
  )
}

// songs.map((songTitle, i) => {
//   console.log(songTitle)
//   if (songTitle !== '狂气之瞳　～ Invisible Full Moon') return
//   chrome.runtime.sendMessage({ api: 'search', query: songTitle }, response => {
//     const { status, result = {} } = response
//     const { songs = [] } = result
//     if (status === 200) {
//     }
//   })
// })
