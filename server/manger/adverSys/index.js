const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'AdverSys')
const mongoose = require('mongoose')
const async = require('async')

const AdverSys = mongoose.model('AdverSys')

function adverList (socket, req, type) {
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
      // const reg = new RegExp(req.searchVal, 'ig')
      if (req.type) {
        const reg = new RegExp(req.searchVal, 'ig') 
        params[req.searchKey] = {'$regex': reg}
      } else {
        params[req.searchKey] = req.searchVal
      }
    }
    if (req.timestamp) {
      params.timestamp = req.timestamp
    }
  }
  // logger.info(params)
  async.waterfall([
    (cb) => {
      AdverSys.find(params).sort({sortId: 1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      AdverSys.find(params).countDocuments((err, results) => {
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

function adverEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.sortId || req.sortId === 0) {
      params.sortId = req.sortId
    }
    if (req.isOutside || req.isOutside === 0) {
      params.isOutside = req.isOutside
    }
    if (req.isShow || req.isShow === 0) {
      params.isShow = req.isShow
    }
    if (req.img || req.img === 0) {
      params.img = req.img
    }
    if (req.remark || req.remark === 0) {
      params.remark = req.remark
    }
    if (req.url || req.url === 0) {
      params.url = req.url
    }
  }
  AdverSys.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function adverAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  let adverSys = new AdverSys({
    timestamp: Date.now(),
    sortId: req.sortId,
    isOutside: req.isOutside,
    isShow: req.isShow,
    img: req.img,
    url: req.url,
    remark: req.remark
  })
  adverSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function adverDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  AdverSys.remove({ _id: req.id }, (err, res) => {
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
  List: adverList,
  Edit: adverEdit,
  Dele: adverDele,
  Add: adverAdd
}
