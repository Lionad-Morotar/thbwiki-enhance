import encrypt from './crypto'
import request from 'browser-request'
import queryString from 'queryString'
import zlib from 'zlib'

const createRequest = ({ method = 'POST', url, data = {}, options = {} }) => {
  return new Promise((resolve, reject) => {
    let headers = {}

    if (method.toUpperCase() === 'POST')
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (url.includes('music.163.com'))
      headers['Referer'] = 'https://music.163.com'
    if (typeof options.cookie === 'object')
      headers['Cookie'] = Object.keys(options.cookie)
        .map(
          key =>
            encodeURIComponent(key) +
            '=' +
            encodeURIComponent(options.cookie[key])
        )
        .join('; ')
    else if (options.cookie) headers['Cookie'] = options.cookie

    if (!headers['Cookie']) {
      headers['Cookie'] = options.token || ''
    }
    if (!options.crypto) {
      options.crypto = 'weapi'
    }
    if (options.crypto === 'weapi') {
      let csrfToken = (options.token || '').match(/_csrf=([^(;|$)]+)/)
      data.csrf_token = csrfToken ? csrfToken[1] : ''
      data = encrypt.weapi(data)
      url = url.replace(/\w*api/, 'weapi')
    } else if (options.crypto === 'linuxapi') {
      data = encrypt.linuxapi({
        method: method,
        url: url.replace(/\w*api/, 'api'),
        params: data,
      })
      headers['User-Agent'] =
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
      url = 'https://music.163.com/api/linux/forward'
    } else if (options.crypto === 'eapi') {
      const cookie = options.cookie || {}
      const csrfToken = cookie['__csrf'] || ''
      const header = {
        osver: cookie.osver, //系统版本
        deviceId: cookie.deviceId, //encrypt.base64.encode(imei + '\t02:00:00:00:00:00\t5106025eb79a5247\t70ffbaac7')
        appver: cookie.appver || '6.1.1', // app版本
        versioncode: cookie.versioncode || '140', //版本号
        mobilename: cookie.mobilename, //设备model
        buildver:
          cookie.buildver ||
          Date.now()
            .toString()
            .substr(0, 10),
        resolution: cookie.resolution || '1920x1080', //设备分辨率
        __csrf: csrfToken,
        os: cookie.os || 'android',
        channel: cookie.channel,
        requestId: `${Date.now()}_${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(4, '0')}`,
      }
      if (cookie.MUSIC_U) header['MUSIC_U'] = cookie.MUSIC_U
      if (cookie.MUSIC_A) header['MUSIC_A'] = cookie.MUSIC_A
      headers['Cookie'] = Object.keys(header)
        .map(
          key => encodeURIComponent(key) + '=' + encodeURIComponent(header[key])
        )
        .join('; ')
      data.header = header
      data = encrypt.eapi(options.url, data)
      url = url.replace(/\w*api/, 'eapi')
    }

    const answer = { status: 500, body: {}, cookie: [] }
    const settings = {
      method: method,
      url: url,
      headers: headers,
      body: queryString.stringify(data),
    }

    if (options.crypto === 'eapi') settings.encoding = null

    request(settings, (err, res, body) => {
      if (err) {
        answer.status = 502
        answer.body = { code: 502, msg: err.stack }
        reject(answer)
      } else {
        // answer.cookie = (res.headers['set-cookie'] || []).map(x =>
        //   x.replace(/\s*Domain=[^(;|$)]+;*/, '')
        // )
        try {
          if (options.crypto === 'eapi') {
            zlib.unzip(body, function(err, buffer) {
              const _buffer = err ? body : buffer
              try {
                try {
                  answer.body = JSON.parse(encrypt.decrypt(_buffer).toString())
                  answer.status = answer.body.code || res.statusCode
                } catch (e) {
                  answer.body = JSON.parse(_buffer.toString())
                  answer.status = res.statusCode
                }
              } catch (e) {
                answer.body = _buffer.toString()
                answer.status = res.statusCode
              }
              answer.status =
                100 < answer.status && answer.status < 600 ? answer.status : 400
              if (answer.status === 200) resolve(answer)
              else reject(answer)
            })
            return false
          } else {
            answer.body = JSON.parse(body)
            answer.status = answer.body.code || res.statusCode
            if (answer.body.code === 502) {
              answer.status = 200
            }
          }
        } catch (e) {
          answer.body = body
          answer.status = res.statusCode
        }

        answer.status =
          100 < answer.status && answer.status < 600 ? answer.status : 400
        if (answer.status == 200) resolve(answer)
        else reject(answer)
      }
    })
  })
}

export default createRequest
