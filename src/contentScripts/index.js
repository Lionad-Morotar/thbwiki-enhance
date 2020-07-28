import './index.styl'

/* find album title */

const $albumHeader = document.querySelector('#firstHeading')
const album = $albumHeader && $albumHeader.innerText

/* find songs info */

const $albumTable = document.querySelector('.wikitable.musicTable')
const $trs = $albumTable && ($albumTable.querySelectorAll('tr') || [])
const songs = []

;[...$trs].reduce((h, tr, i) => {
  const $name =
    tr.querySelector('.infoRD + .title') || tr.querySelector('.infoYD + .title')

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

console.log(album, songs)

/* search album on 163 */

// if (album && songs.length) {
//     chrome.runtime.sendMessage({
//       api: 'search',
//       query: {
//         keywords: album,
//         type: 10
//       }
//     }, response => {
//       const { status, result = {} } = response
//       const { songs = [] } = result
//       if (status === 200) {
//       }
//     })
// }

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
