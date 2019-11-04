const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.client + 'Register')
const mongoose = require('mongoose')
const async = require('async')

const gitConfig = require($$.config.link.git)

const DevUser = mongoose.model('DevUser')
const fetch = require("node-fetch")
const fs = require('fs')


function getGitUserInfo(socket, req, type) {
  const params = {
    client_id: gitConfig.client_id,
    client_secret: gitConfig.client_secret,
    code: req.code
  }
  fetch(gitConfig.loginURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  }).then(res => {
    // logger.info(res)
    return res.text()
  }).then(body => {
    //解析并返回access_token
    let args = body.split("&")
    let arg = args[0].split("=")
    let access_token = arg[1]
    // logger.info(access_token)
    return access_token
  }).then(token => {
    let url = gitConfig.userURL + token
    fetch(url).then(res2 => {
      return res2.json()
    }).then(response => {
      logger.info(response)
      if (response.login) {
        let url = gitConfig.checkPublicURL + response.login
        fetch(url).then(res3 => {
          // console.log(res2.status)
          // logger.info(res3.status)
          let isPublic = 0
          if (res3.status === 204) {
            isPublic = 1
          }
          socket.emit(type, {
            msg: 'Success',
            username: response.login,
            email: response.email,
            isPublic: isPublic
          })
        })
      } else {
        logger.error(response)
        socket.emit(type, {
          msg: 'Error',
          error: 'Timeout'
        })
      }
    })
  })
}


function joinCM (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  // logger.info(req)
  if (
    !req.gitID ||
    !req.wx ||
    !req.email ||
    !req.work ||
    !req.city ||
    !req.skill ||
    // !req.fileUrl ||
    !req.ref
  ) {
    data.error = '必填项不得为空'
    socket.emit(type, data)
    return
  }
  async.waterfall([
    (cb) => {
      let state = 0
      let url = gitConfig.invitItemURL + req.gitID.replace(/\s/g, '')
      fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": gitConfig.Authorization,
          "Accept": gitConfig.Accept
        },
      }).then(res => {
        if (res.status === 200) {
          state = 1
        } else {
          state = 0
        }
        cb(null, state)
      })
    },
    (state, cb) => {
      if (state) {
        cb(null, {
          isGitMember: 1,
          isInvited: 1
        })
      } else {
        let url = gitConfig.invitItemURL + req.gitID.replace(/\s/g, '')
        fetch(url, {
          method: "PUT",
          headers: {
            "Authorization": gitConfig.Authorization,
            "Accept": gitConfig.Accept
          },
        }).then(res => {
          if (res.status === 200) {
            cb(null, {
              isGitMember: 0,
              isInvited: 1
            })
          } else {
            cb(null, {
              isGitMember: 0,
              isInvited: 0
            })
          }
        })
      }
    },
    (status, cb) => {
      if (req.gitID.replace(/\s/g, '') === req.ref.replace(/\s/g, '')) {
        req.ref = ''
      }
      
      let params = {
        gitID: req.gitID.replace(/\s/g, ''),
        wx: req.wx.replace(/\s/g, ''),
        email: req.email.replace(/\s/g, ''),
        work: req.work.replace(/\s/g, ''),
        city: req.city,
        skill: req.skill.replace(/\s/g, ''),
        fileUrl: req.fileUrl,
        ref: req.ref.replace(/\s/g, ''),
        address: req.address.replace(/\s/g, ''),
        refCode: req.refCode.replace(/\s/g, ''),
        isInvited: status.isInvited,
        isGitMember: status.isGitMember,
        createTime: Date.now(),
        roleArr: req.roleArr,
        isPublic: req.isPublic
      }
      let devUser = new DevUser(params)
      devUser.save((err, res) => {
        if (err) {
          logger.error(err.toString())
          data.error = err.toString()
        } else {
          data.msg = 'Success'
          data.info = res
        }
        cb(null, data)
      })
    }
  ], () => {
    socket.emit(type, data)
  })
}

function editCM (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  let params = {}
  if (req) {
    if (req.wx || req.wx === 0) {
      params.wx = req.wx
    }
    if (req.email || req.email === 0) {
      params.email = req.email
    }
    if (req.work || req.work === 0) {
      params.work = req.work
    }
    if (req.city || req.city === 0) {
      params.city = req.city
    }
    if (req.skill || req.skill === 0) {
      params.skill = req.skill
    }
    if (req.fileUrl || req.fileUrl === 0) {
      params.fileUrl = req.fileUrl
    }
    if (req.address || req.address === 0) {
      params.address = req.address
    }
    if (req.roleArr || req.roleArr === 0) {
      params.roleArr = req.roleArr
    }
    if (req.isPublic || req.isPublic === 0) {
      params.isPublic = req.isPublic
    }
  }
  params.updateTime = Date.now()

  DevUser.update({gitID: req.gitID}, {'$set': params}).exec((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function findDevUser (socket, req, type) {
  let data = {
    msg: 'Error',
    info: []
  }
  DevUser.findOne({gitID: req.gitID}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      // logger.info(res)
      if (res && res.gitID) {
        data.msg = 'Success'
        data.info = res
      } else {
        data.msg = 'Null'
      }
    }
    socket.emit(type, data)
  })
}

function removeFile (socket, req, type) {
  // logger.info(fs.existsSync(req))
  try {
    let fileUrl = $$.config.file.upload + req.substr(req.lastIndexOf('/') + 1)
    if (fs.existsSync(fileUrl)) {
      fs.unlinkSync(fileUrl)
      socket.emit(type, {
        msg: 'Success',
        tip: 'Remove file success!'
      })
    } else {
      socket.emit(type, {
        msg: 'Null',
        tip: 'File is Null!'
      })
    }
  } catch (error) {
    socket.emit(type, {
      msg: 'Error',
      error: error.toString()
    })
  }
}



module.exports = {
  getGitUserInfo,
  // getRoleCM,
  joinCM,
  editCM,
  findDevUser,
  removeFile,
}

