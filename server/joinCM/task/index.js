const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.client + 'Task')
const mongoose = require('mongoose')
const async = require('async')

const TaskSys = mongoose.model('TaskSys')

function taskList (socket, req, type) {
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
    if (req.label || req.label === 0) {
      params.label = req.label
    }
  }
  async.waterfall([
    (cb) => {
      TaskSys.find(params).sort({'createTime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      TaskSys.find(params).countDocuments((err, results) => {
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

function taskJoin (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.gitID || req.gitID === 0) {
      params.$push = {joinList: {id: req.gitID, timestamp: Date.now(), selected: 0}}
    }
  }
  // logger.info(req)
  // logger.info(params)
  async.waterfall([
    (cb) => {
      TaskSys.find({joinList: {$elemMatch: {id: req.gitID}}}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          // logger.info(res)
          if (res.length > 0) {
            if (res[0].joinList.length >= res[0].joinLimit) {
              data.msg = 'OverLimit'
            } else {
              data.msg = 'Repeat'
            }
            cb(data)
          } else {
            cb(null, res)
          }
        }
      })
    },
    (results, cb) => {
      TaskSys.updateOne({ _id: req.id }, params).exec((err, res) => {
        if (err) {
          data.error = err.toString()
        } else {
          data.msg = 'Success'
          data.info = res
        }
      })
    }
  ], () => {
    socket.emit(type, data)
  })
}

module.exports = {
  List: taskList,
  taskJoin,
}