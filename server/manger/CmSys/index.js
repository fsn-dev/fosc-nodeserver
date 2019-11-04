const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'DevUser')
const mongoose = require('mongoose')
const async = require('async')

const DevUser = mongoose.model('DevUser')

function searchInfo (socket, req, type) {
  let data = { msg: 'Error', info: [] },
      params = {}
  if (req) {
    if (req.gitID) {
      const reg = new RegExp(req.gitID.replace(/\s/g, ''), 'ig') 
      params.gitID = {'$regex': reg}
    }
    if (req.wx) {
      const reg = new RegExp(req.wx.replace(/\s/g, ''), 'ig') 
      params.wx = {'$regex': reg}
    }
    if (req.email) {
      const reg = new RegExp(req.email.replace(/\s/g, ''), 'ig') 
      params.email = {'$regex': reg}
    }
    if (req.work) {
      const reg = new RegExp(req.work.replace(/\s/g, ''), 'ig') 
      params.work = {'$regex': reg}
    }
    if (req.role) {
      params.roleArr = {'$elemMatch': {name: req.role.replace(/\s/g, '')}}
    }
    if (req.city) {
      // params.$or = {'': {name: req.role}}
      const reg = new RegExp(req.city.replace(/\s/g, ''), 'ig') 
      params.$or = [
        {city: reg},
        {'city.s.name': reg},
        {'city.c.name': reg},
        {'city.p.name': reg},
      ]
    }
    if (req.ref) {
      const reg = new RegExp(req.ref.replace(/\s/g, ''), 'ig') 
      params.ref = {'$regex': reg}
    }
    if (req.review) {
      let reviewStr = req.review.join('-')
      if (reviewStr.indexOf('isGitMember') !== -1) {
        params.isGitMember = 1
      } else {
        params.isGitMember = 0
      }
      if (reviewStr.indexOf('isWxMember') !== -1) {
        params.isWxMember = 1
      } else {
        params.isWxMember = 0
      }
      if (reviewStr.indexOf('isReviewAll') !== -1) {
        params.isReviewAll = 1
      } else {
        params.isReviewAll = 0
      }
    } else {
      // params.isGitMember = 0
      // params.isWxMember = 0
      // params.isReviewAll = 0
    }
    if (req.timestamp && req.timestamp.length > 0 && req.timestamp[0] && req.timestamp[1]) {
      params.createTime = {
        $gte: Date.parse(req.timestamp[0] + ' ' + '00:00:00'),
        $lt: Date.parse(req.timestamp[1] + ' ' + '23:59:59'),
      }
      // params.createTime = req.timestamp
    }
  }
  logger.info(req)
  logger.info(params)
  async.waterfall([
    (cb) => {
      DevUser.find(params).sort({'createTime': -1}).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      DevUser.find(params).countDocuments((err, results) => {
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

function CmList (socket, req, type) {
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
      // logger.info(isNaN(req.searchVal))
      // const reg = new RegExp(req.searchVal, 'ig') 
      if (req.type) {
        const reg = new RegExp(req.searchVal, 'ig') 
        params[req.searchKey] = {'$regex': reg}
      } else {
        params[req.searchKey] = req.searchVal
      }
    }
    if (req.timestamp) {
      params.createTime = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      DevUser.find(params).sort({'createTime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      DevUser.find(params).countDocuments((err, results) => {
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

function CmEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.gitID || req.gitID === 0) {
      params.gitID = req.gitID
    }
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
    if (req.ref || req.ref === 0) {
      params.ref = req.ref
    }
    if (req.address || req.address === 0) {
      params.address = req.address
    }
  }
  params.updateTime = Date.now()
  DevUser.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function CmAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  let CmSys = new DevUser({
    gitID: req.gitID.replace(/\s/g, ''),
    wx: req.wx.replace(/\s/g, ''),
    email: req.email.replace(/\s/g, ''),
    work: req.work.replace(/\s/g, ''),
    city: req.city.replace(/\s/g, ''),
    skill: req.skill.replace(/\s/g, ''),
    fileUrl: req.fileUrl,
    ref: req.ref.replace(/\s/g, ''),
    address: req.address.replace(/\s/g, ''),
    createTime: Date.now()
  })
  CmSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function CmDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  DevUser.remove({ _id: req.id }, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}



module.exports = {
  List: CmList,
  Edit: CmEdit,
  Dele: CmDele,
  Add: CmAdd,
  searchInfo,
}
