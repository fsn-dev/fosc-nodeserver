const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'Github')
const mongoose = require('mongoose')
const async = require('async')

const BaseSet = mongoose.model('BaseSet')

function Add(socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  // logger.info(req)
  BaseSet.update({type: req.type}, {baseInfo: req.baseInfo}, {upsert: true}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function Check(socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  BaseSet.findOne({type: req.type}).exec((err, res) => {
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
  Add,
  Check
}