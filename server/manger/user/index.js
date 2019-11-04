const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'Users')
const mongoose = require('mongoose')
const async = require('async')

const Users = mongoose.model('Users')
const RoleSys = mongoose.model('RoleSys')
const encryption = require(pathLink + '/server/public/methods/encryption')
const supAdmin = require($$.config.link.admin)

function findUser (socket, req, type) {
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0

  let params = {}
  let data = { msg: 'Error', info: '' }
  // logger.info(req)
  if (req) {
    if (req.id) {
      params._id = req.id
    }
    if (req.username) {
      params.username = req.username
    }
    if (req.mobile) {
      params.mobile = req.mobile
    }
    if (req.role) {
      params.role = req.role
    }
    if (req.searchVal && req.searchKey) {
      if (req.type) {
        const reg = new RegExp(req.searchVal, 'ig') 
        params[req.searchKey] = {'$regex': reg}
      } else {
        params[req.searchKey] = req.searchVal
      }
    }
    if (req.timestamp) {
      params.updateTime = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      Users.find(params).sort({role: 1, 'updateTime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      Users.find(params).countDocuments((err, results) => {
        if (err) {
          cb(err)
        } else {
          data.total = results
          data.info = list
          cb(null, data)
        }
      })
    },
    ($data, cb) => {
      RoleSys.find({}, {name: 1, type: 1}).sort({'type': 1}).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          data.role = res
          cb(null, res)
        }
      })
    }
  ], (err, res) => {
    if (err) {
      data.msg = 'Error'
      data.error = err.toString()
      logger.error(err.toString())
    } else {
      data.msg = 'Success'
      // logger.info(123)
    }
    socket.emit(type, data)
  })

  // Users.find(params).sort({ role: 1 }).exec((err, res) => {
  //   if (err) {
  //     data.error = err.toString()
  //   } else {
  //     data.msg = 'Success'
  //     data.info = res
  //   }
  //   socket.emit(type, data)
  // })
}

function createUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }

  logger.info(req)

  if (req && req.mobile) {
    params.mobile = req.mobile
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  if (req && req.password) {
    params.password = encryption(req.password)
  } else {
    data = { msg: 'Error', info: 'Password cannot be empty!' }
    socket.emit(type, data)
    return
  }
  // logger.info(req)
  // logger.info(params)
  async.waterfall([
    (cb) => {
      Users.find({mobile: params.mobile}).exec((err, results) => {
        // logger.info(results)
        if (!results || results.length <= 0) {
          cb(null, results)
        } else {
          data.msg = 'Repeat'
          cb(data)
        }
      })
    },
    (res, cb) => {
      let user = new Users({
        username: req.username ? req.username : '',
        mobile: params.mobile,
        password: params.password,
        createTime: Date.now(),
        updateTime: Date.now(),
        role: req.role,
        latestLoginIP: req.latestLoginIP,
        latestLoginCity: req.latestLoginCity,
      })
      // logger.info(user)
      // logger.info(res)
      user.save((err, results) => {
        if (err) {
          data.error = err.toString()
        } else {
          data.msg = 'Success'
          data.info = results
        }
        cb(null, data)
      })
    }
  ], () => {
    socket.emit(type, data)
  })
  // let user = new Users({
  //   username: '',
  //   mobile: params.mobile,
  //   password: params.password,
  //   createTime: Date.now(),
  //   updateTime: Date.now(),
  //   role: 3,
  //   latestLoginIP: req.latestLoginIP,
  //   latestLoginCity: req.latestLoginCity,
  // })
  // logger.info(user)
  // user.save((err, res) => {
  //   if (err) {
  //     data.error = err.toString()
  //   } else {
  //     data.msg = 'Success'
  //     data.info = res
  //   }
  //   socket.emit(type, data)
  // })
}

function deleUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }
  if (req && req.id) {
    params._id = req.id
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  Users.remove(params, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }

    socket.emit(type, data)
  })
}

function editUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }
  if (req && req.mobile) {
    params.mobile = req.mobile
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  if (req) {
    if (req.role || req.role === 0) {
      params.role = req.role
    }
    if (req.password || req.password === 0) {
      params.password = encryption(req.password)
    }
    if (req.username || req.username === 0) {
      params.username = req.username
    }
    
    if (req.latestLoginIP || req.latestLoginIP === 0) {
      params.latestLoginIP = req.latestLoginIP
    }
    if (req.latestLoginCity || req.latestLoginCity === 0) {
      params.latestLoginCity = req.latestLoginCity
    }
    
    if (req.oldPwd) {
      findParam.password = encryption(req.oldPwd)
    }
  }
  params.updateTime = Date.now()
  logger.info(params)
  Users.update({_id: req.id}, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function validUser (socket, req, type) {
  let params = {}, updateParams = {}
  let data = { msg: 'Error', info: '' }
  // logger.info(req)
  if (!req.mobile || !req.password) {
    data.info = ''
    socket.emit(type, data)
    return
  } else {
    params.mobile = req.mobile
  }
  if (req.mobile === supAdmin.username && req.password === supAdmin.password) {
    data.msg = 'Success'
    data.info = 'ALL'
    socket.emit(type, data)
    return
  }
  if (req) {
    if (req.password || req.password === 0) {
      params.password = encryption(req.password)
    }
    if (req.latestLoginIP || req.latestLoginIP === 0) {
      updateParams.latestLoginIP = req.latestLoginIP
    }
    if (req.latestLoginCity || req.latestLoginCity === 0) {
      updateParams.latestLoginCity = req.latestLoginCity
      updateParams.updateTime = Date.now()
    }
  }
  logger.info(params)
  async.waterfall([
    (cb) => {
      Users.find(params).sort({ role: 1 }).exec((err, res) => {
        if (res && res.length > 0) {
          data.info = res
          cb(null, res)
        } else {
          data.msg = 'Null'
          if (err) {
            data.error = err.toString()
          }
          cb(data)
        }
      })
    },
    (res, cb) => {
      Users.update({_id: res[0]._id}, updateParams).exec((error, results) => {
        if (error) {
          data.error = err.toString()
          cb(data)
        } else {
          cb(null, res)
        }
      })
    },
    (res, cb) => {
      RoleSys.find({type: res[0].role}).exec((err, results) => {
        if (err) {
          data.error = err.toString()
          cb(err)
        } else {
          data.msg = 'Success'
          data.role = results
          cb(null, results)
        }
      })
    }
  ], () => {
    
    socket.emit(type, data)
  })
  // Users.find(params).sort({ role: 1 }).exec((err, res) => {
  //   if (err) {
  //     data.error = err.toString()
  //     data.info = 'No such user'
  //   } else {
  //     // logger.info(res)
  //     if (res.length > 0) {
  //       data.msg = 'Success'
  //       data.info = res
  //       Users.updateOne({_id: res[0]._id}, updateParams).exec((error, results) => {
  //         if (error) {
  //           logger.error(error.toString())
  //         } else {
  //           logger.info(results)
  //         }
  //       })
  //     } else {
  //       data.msg = 'Null'
  //       data.info = 'No such user'
  //     }
  //   }
  //   socket.emit(type, data)
  // })
}

module.exports = {
  createUser,
  deleUser,
  editUser,
  findUser,
  validUser
}