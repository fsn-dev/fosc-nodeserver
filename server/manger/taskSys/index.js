const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'TaskSys')
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
    if (req.searchVal && req.searchKey) {
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
  // logger.info(req)
  // logger.info(params)
  async.waterfall([
    (cb) => {
      TaskSys.find(params).sort({sortId: 1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
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

function taskEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.title || req.title === 0) {
      params.title = req.title
    }
    if (req.needs || req.needs === 0) {
      params.needs = req.needs
    }
    if (req.copyright || req.copyright === 0) {
      params.copyright = req.copyright
    }
    if (req.reward || req.reward === 0) {
      params.reward = req.reward
    }
    if (req.useTime || req.useTime === 0) {
      params.useTime = req.useTime
    }
    if (req.singUpTime || req.singUpTime === 0) {
      params.singUpTime = req.singUpTime
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
    if (req.label || req.label === 0) {
      params.label = req.label
    }
  }
  params.updateTime = Date.now()
  TaskSys.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function taskAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  let taskSys = new TaskSys({
    title: req.title,
    needs: req.needs,
    copyright: req.copyright,
    reward: req.reward,
    useTime: req.useTime,
    singUpTime: req.singUpTime,
    limitTime: req.limitTime,
    joinLimit: req.joinLimit,
    state: req.state,
    createTime: Date.now(),
    updateTime: Date.now(),
    label: req.label,
  })
  taskSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function taskDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  TaskSys.remove({ _id: req.id }, (err, res) => {
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
  List: taskList,
  Edit: taskEdit,
  Dele: taskDele,
  Add: taskAdd
}