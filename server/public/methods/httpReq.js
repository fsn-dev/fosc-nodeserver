const http = require('http')
const https = require('https')
const TimeOut = 1000 * 30
let $data = {
  code: 0,
  msg: 'Error',
  info: ''
}
const HttpRequest ={
  TimeOut: TimeOut,
  get (url) {
    return new Promise((resolve, reject) => {
      let getTimeOut = this.TimeOut
      // console.log(this.TimeOut)
      let getReq = http.get(url, httpReq => {
        let uData = Buffer.allocUnsafe(0)
        if (httpReq.statusCode == 200) {
          httpReq.on('data', (chunk) => {
            uData = Buffer.concat([uData, chunk], uData.length + chunk.length)
          })

          httpReq.on('end', () => {
            let data = uData.toString();
            if (data == '' || data.indexOf('服务器错误') != -1) {
              $data = {
                code: 0,
                msg: 'Get server error!',
                info: ''
              }
              resolve($data)
            } else {
              $data = {
                code: 1,
                msg: 'Get data success!',
                info: JSON.parse(data, 'utf8')
              }
              resolve($data)
            }
          })
        } else {
          $data = {
            code: 0,
            msg: 'Get response is error!',
            info: ''
          }
          resolve($data)
        }
      })
      getReq.on('error', err =>{
        // console.log(err)
        $data = {
          code: 0,
          msg: err.toString(),
          info: err
        }
        resolve($data)
      })
      getReq.setTimeout(getTimeOut, () => {
        $data = {
          code: 0,
          msg: 'Get time out!',
          info: ''
        }
        resolve($data)
      })
    })
  },
  post (options, param) {
    return new Promise( (resolve, reject) => {
      let getTimeOut = this.TimeOut
      let postReq = http.request(options, httpReq => {
        var uData = Buffer.allocUnsafe(0)
        if (httpReq.statusCode == 200) {
          httpReq.on('data', chunk => {
            uData = Buffer.concat([uData, chunk], uData.length + chunk.length)
          })

          httpReq.on('end', () => {
            var data = uData.toString()
            if (data == '' || data.indexOf('服务器错误') != -1) {
              $data = {
                code: 0,
                msg: 'Post server error!',
                info: ''
              }
              resolve($data)
            } else {
              $data = {
                code: 1,
                msg: 'Post data success!',
                info: JSON.parse(data, 'utf8')
              }
              resolve($data)
            }
          })
        } else {
          $data = {
            code: 0,
            msg: 'Post response is error!',
            info: ''
          }
          resolve($data)
        }
      })
      postReq.on('error', err => {
        $data = {
          code: 0,
          msg: err.toString(),
          info: err
        }
        resolve($data)
      })
      postReq.setTimeout(getTimeOut, () =>{
        $data = {
          code: 0,
          msg: 'Post time out!',
          info: ''
        }
        resolve($data)
      })
      postReq.write(param)
      postReq.end()
    })
  },
  setRequestTime (time) {
    this.TimeOut = time
  }
}

const HttpsRequest ={
  TimeOut: TimeOut,
  get (url) {
    return new Promise((resolve, reject) => {
      let getTimeOut = this.TimeOut
      // console.log(this.TimeOut)
      let getReq = https.get(url, httpReq => {
        let uData = Buffer.allocUnsafe(0)
        if (httpReq.statusCode == 200) {
          httpReq.on('data', (chunk) => {
              uData = Buffer.concat([uData, chunk], uData.length + chunk.length)
          })

          httpReq.on('end', () => {
            let data = uData.toString();
            if (data == '' || data.indexOf('服务器错误') != -1) {
              $data = {
                code: 0,
                msg: 'Get server error!',
                info: ''
              }
              resolve($data)
            } else {
              $data = {
                code: 1,
                msg: 'Get data success!',
                info: JSON.parse(data, 'utf8')
              }
              resolve($data)
            }
          })
        } else {
          $data = {
            code: 0,
            msg: 'Get response is error!',
            info: ''
          }
          resolve($data)
        }
      })
      getReq.on('error', err =>{
        // console.log(err)
        $data = {
          code: 0,
          msg: err.toString(),
          info: err
        }
        resolve($data)
      })
      getReq.setTimeout(getTimeOut, () => {
        $data = {
          code: 0,
          msg: 'Get time out!',
          info: ''
        }
        resolve($data)
      })
    })
  },
  post (options, param) {
    return new Promise( (resolve, reject) => {
      let getTimeOut = this.TimeOut
      let postReq = https.request(options, httpReq => {
        var uData = Buffer.allocUnsafe(0)
        if (httpReq.statusCode == 200) {
          httpReq.on('data', chunk => {
              uData = Buffer.concat([uData, chunk], uData.length + chunk.length)
          })

          httpReq.on('end', () => {
            var data = uData.toString()
            if (data == '' || data.indexOf('服务器错误') != -1) {
              $data = {
                code: 0,
                msg: 'Post server error!',
                info: ''
              }
              resolve($data)
            } else {
              $data = {
                code: 1,
                msg: 'Post data success!',
                info: JSON.parse(data, 'utf8')
              }
              resolve($data)
            }
          })
        } else {
          $data = {
            code: 0,
            msg: 'Post response is error!',
            info: ''
          }
          resolve($data)
        }
      })
      postReq.on('error', err => {
        $data = {
          code: 0,
          msg: err.toString(),
          info: err
        }
        resolve($data)
      })
      postReq.setTimeout(getTimeOut, () =>{
        $data = {
          code: 0,
          msg: 'Post time out!',
          info: ''
        }
        resolve($data)
      })
      postReq.write(param)
      postReq.end()
    })
  },
  setRequestTime (time) {
    this.TimeOut = time
  }
}

module.exports = {
  http: HttpRequest,
  https: HttpsRequest
}