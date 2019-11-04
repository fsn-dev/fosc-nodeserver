const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'Review')
const mongoose = require('mongoose')
const async = require('async')

const DevUser = mongoose.model('DevUser')
const fetch = require("node-fetch")

function userReview (socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  let params = {}
  if (req) {
    if (req.isGitMember) {
      params.isGitMember = req.isGitMember
    }
    if (req.isWxMember) {
      params.isWxMember = req.isWxMember
    }
    if (req.isReviewAll) {
      params.isReviewAll = req.isReviewAll
    }
  }
  logger.info(params)
  DevUser.updateOne({gitID: req.gitID}, params).exec((err, res) => {
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
  userReview
}
