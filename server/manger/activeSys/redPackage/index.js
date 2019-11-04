const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'RedPackagesSet')
const mongoose = require('mongoose')
const async = require('async')

const RedPackages = mongoose.model('RedPackages')

function RedPackagesList (socket, req, type) {
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  async.waterfall([
    (cb) => {
      RedPackages.find(params).sort({'createTime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      RedPackages.find(params).countDocuments((err, results) => {
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

function RedPackagesEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  if (req) {
    if (req.amount || req.amount === 0) {
      params.amount = req.amount
    }
    if (req.limitTime || req.limitTime === 0) {
      params.limitTime = req.limitTime
    }
    if (req.joinLimit || req.joinLimit === 0) {
      params.joinLimit = req.joinLimit
    }
    if (req.state || req.state === 0) {
      params.state = req.state
    }
    if (req.selfTip || req.selfTip === 0) {
      params.selfTip = req.selfTip
    }
  }
  RedPackages.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function RedPackagesDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  RedPackages.remove({ _id: req.id }, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function RedPackagesAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  let redPackages = new RedPackages({
    createTime: Date.now(),
    amount: req.amount,
    limitTime: req.limitTime,
    joinLimit: req.joinLimit,
    state: req.state,
    selfTip: req.selfTip,
    randomID: req.randomID
  })
  redPackages.save((err, res) => {
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
  List: RedPackagesList,
  Edit: RedPackagesEdit,
  Dele: RedPackagesDele,
  Add: RedPackagesAdd
}