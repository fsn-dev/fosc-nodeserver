const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'RoleSys')
const mongoose = require('mongoose')
const async = require('async')

const RoleSys = mongoose.model('RoleSys')


function roleList(socket, req, type) {
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0

  let data = { msg: 'Error', info: [] },
      params = {}
  
  if (req) {
    if (req.id) {
      params._id = req.id
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
      params.updatetime = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      RoleSys.find(params).sort({'updatetime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      RoleSys.find(params).countDocuments((err, results) => {
        if (err) {
          cb(err)
        } else {
          data.total = results
          data.info = list
          cb(null, data)
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
}

function roleEdit(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  if (req) {
    if (req.name) {
      params.name = req.name
    }
    if (req.type) {
      params.type = req.type
    }
    if (req.adminLimit) {
      params.adminLimit = req.adminLimit
    }
    // if (req.sysAdver) {
    //   params.sysAdver = req.sysAdver
    // }
    // if (req.sysNews) {
    //   params.sysNews = req.sysNews
    // }
    // if (req.sysPairs) {
    //   params.sysPairs = req.sysPairs
    // }
    // if (req.sysUsers) {
    //   params.sysUsers = req.sysUsers
    // }
    // if (req.sysRole) {
    //   params.sysRole = req.sysRole
    // }
    params.updateTime = Date.now()
  }
  RoleSys.updateOne({_id: req.id}, params).exec((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function roleAdd(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  let roleSys = new RoleSys({
    name: req.name,
    type: req.type,
    createTime: Date.now(),
    updateTime: Date.now(),
    adminLimit: req.adminLimit
    // sysAdver: req.sysAdver,
    // sysNews: req.sysAdver,
    // sysPairs: req.sysAdver,
    // sysUsers: req.sysAdver,
    // sysRole: req.sysAdver,
  })
  roleSys.save((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function roleDele(socket, req, type) {
  let data = {
    msg: 'Error',
    info: []
  }
  RoleSys.remove({ _id: req.id }, (err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

module.exports = {
  List: roleList,
  Edit: roleEdit,
  Add: roleAdd,
  Dele: roleDele
}
