const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'Github')
const mongoose = require('mongoose')
const async = require('async')

const DevUser = mongoose.model('DevUser')
const fetch = require("node-fetch")
const gitConfig = require($$.config.link.git)

function goInvited (socket, req, type) {
  // logger.info(req)
  let data = {
    msg: 'Error',
    info: ''
  }
  // logger.info('req')
  // logger.info(req)
  // logger.info('req')
  async.waterfall([
    (cb) => {
      let url = gitConfig.invitItemURL + req.gitID.replace(/\s/g, '')
      // let url = gitConfig.invitItemURL + 'winter15627'
      fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": gitConfig.Authorization,
          "Accept": gitConfig.Accept
        },
      }).then(res => {
        // logger.info(res)
        if (res.status === 200) {
          cb(null, 1)
        } else {
          cb(null, 0)
        }
      })
    },
    (status, cb) => {
      if (status) {
        DevUser.update({gitID: req.gitID}, {'$set': {isInvited: status}}).exec((err, res) => {
          if (err) {
            logger.error(err.toString())
            data.error = err.toString()
          } else {
            data.msg = 'Success'
            data.info = res
          }
          cb(null, data)
        })
      } else {
        data.msg = 'Error'
        data.error = 'Invited error!'
        cb(null, data)
      }
    }
  ], () => {
    socket.emit(type, data)
  })
}

function oneTouchInvited (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }

  let sendInvited = (userArr) => {
    async.eachSeries(userArr, (user, cb) => {
      let url = gitConfig.invitItemURL + user.gitID.replace(/\s/g, '')
      fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": gitConfig.Authorization,
          "Accept": gitConfig.Accept
        },
      }).then(res => {
        if (res.status === 200) {
          DevUser.update({gitID: user.gitID}, {isInvited: 1}).exec(() => {})
          socket.emit(type, {
            msg: 'Add',
            count: 1
          })
        } else {
          socket.emit(type, {
            msg: 'Add',
            count: 0,
            info: user
          })
        }
        cb(null, user)
      })
    }, () => {
      socket.emit(type, {
        msg: 'Over'
      })
    })
  }

  let params = {isInvited: 0, isGitMember: 0}
  // let params = {isInvited: 0}
  async.waterfall([
    (cb) => {
      DevUser.find(params).countDocuments((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          cb(null, res)
        }
      })
    },
    (total, cb) => {
      DevUser.find(params).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          data.msg = 'Success'
          data.total = total
          data.info = res
          cb(null, res)
        }
      })
    }
  ], (err, res) => {
    if (err) {
    } else {
      sendInvited(res)
    }
    socket.emit(type, data)
  })
}

function oneTouchGitReview (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }

  let sendInvited = (userArr) => {
    async.eachSeries(userArr, (user, cb) => {
      let state = 0
      let url = gitConfig.invitItemURL + user.gitID.replace(/\s/g, '')
      fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": gitConfig.Authorization,
          "Accept": gitConfig.Accept
        },
      }).then(res => {
        if (res.status === 200) {
          state = 1
          socket.emit(type, {
            msg: 'Add',
            count: state
          })
        } else {
          state = 0
          socket.emit(type, {
            msg: 'Add',
            count: state,
            info: user
          })
        }
        DevUser.update({gitID: user.gitID}, {isGitMember: state}).exec(() => {})
        cb(null, state)
      })
    }, () => {
      socket.emit(type, {
        msg: 'Over'
      })
    })
  }

  // let params = {}
  let params = {isGitMember: 0}
  // let params = {isInvited: 0}
  async.waterfall([
    (cb) => {
      DevUser.find(params).countDocuments((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          cb(null, res)
        }
      })
    },
    (total, cb) => {
      DevUser.find(params).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          data.msg = 'Success'
          data.total = total
          data.info = res
          cb(null, res)
        }
      })
    }
  ], (err, res) => {
    if (err) {
    } else {
      sendInvited(res)
    }
    socket.emit(type, data)
  })
}

function oneTouchGitValidUser (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }

  let validUser = (userArr) => {
    async.eachSeries(userArr, (user, cb) => {
      let url = gitConfig.checkPublicURL + user.gitID.replace(/\s/g, '')
      let isPublic = 0
      fetch(url).then(res => {
        logger.warn(url)
        logger.info(res.status)
        if (res.status === 204) {
          isPublic = 1
          socket.emit(type, {
            msg: 'Add',
            count: isPublic
          })
        } else {
          isPublic = 0
          socket.emit(type, {
            msg: 'Add',
            count: isPublic,
            info: user
          })
        }
        DevUser.update({gitID: user.gitID}, {isPublic: isPublic}).exec(() => {})
        cb(null, isPublic)
      })
    }, () => {
      socket.emit(type, {
        msg: 'Over'
      })
    })
  }

  // let params = {}
  let params = {}
  // let params = {isInvited: 0}
  async.waterfall([
    (cb) => {
      DevUser.find(params).countDocuments((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          cb(null, res)
        }
      })
    },
    (total, cb) => {
      DevUser.find(params).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          data.msg = 'Success'
          data.total = total
          data.info = res
          cb(null, res)
        }
      })
    }
  ], (err, res) => {
    if (err) {
    } else {
      validUser(res)
    }
    socket.emit(type, data)
  })
}

module.exports = {
  goInvited,
  oneTouchInvited,
  oneTouchGitReview,
  oneTouchGitValidUser
}
