const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'GetBaseSet')
const mongoose = require('mongoose')
const async = require('async')

const BaseSet = mongoose.model('BaseSet')


function getRoleCM (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  BaseSet.findOne({}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      let arr = res && res.baseInfo ? JSON.parse(res.baseInfo) : ''
      arr = arr && arr.roleCm && arr.roleCm.list.length > 0 ? arr.roleCm.list : []
      data.info = arr
      // logger.info(res)
      // logger.info(JSON.parse(res.baseInfo))
    }
    socket.emit(type, data)
  })
}

function getTask (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  BaseSet.findOne({}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      let arr = res && res.baseInfo ? JSON.parse(res.baseInfo) : ''
      arr = arr && arr.task && arr.task.list.length > 0 ? arr.task.list : []
      data.info = arr
      // logger.info(res)
      // logger.info(JSON.parse(res.baseInfo))
    }
    socket.emit(type, data)
  })
}

function getNoticeType (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  BaseSet.findOne({}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      let arr = res && res.baseInfo ? JSON.parse(res.baseInfo) : ''
      arr = arr && arr.notice && arr.notice.list.length > 0 ? arr.notice.list : []
      data.info = arr
      // logger.info(res)
      // logger.info(JSON.parse(res.baseInfo))
    }
    socket.emit(type, data)
  })
}

module.exports = {
  getRoleCM,
  getTask,
  getNoticeType
}