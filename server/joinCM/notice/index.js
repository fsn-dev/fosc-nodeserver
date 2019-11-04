const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.client + 'Notice')
const mongoose = require('mongoose')
const async = require('async')

const NewsSys = mongoose.model('NewsSys')

function noticeList (socket, req, type) {
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
    if (req.timestamp) {
      params.timestamp = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      NewsSys.find(params).sort({sortId: 1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      NewsSys.find(params).countDocuments((err, results) => {
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

function noticeEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.type || req.type === 0) {
      params.type = req.type
    }
    if (req.title || req.title === 0) {
      params.title = req.title
    }
    if (req.author || req.author === 0) {
      params.author = req.author
    }
    if (req.content || req.content === 0) {
      params.content = req.content
    }
    if (req.label || req.label === 0) {
      params.label = req.label
    }
    if (req.url || req.url === 0) {
      params.url = req.url
    }
    if (req.isOutside || req.isOutside === 0) {
      params.isOutside = req.isOutside
    }
    if (req.sortId || req.sortId === 0) {
      params.sortId = req.sortId
    }
    if (req.isShow || req.isShow === 0) {
      params.isShow = req.isShow
    }
  }
  params.updateTime = Date.now()
  NewsSys.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function noticeAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  let noticeSys = new NewsSys({
    type: req.type,
    title: req.title,
    author: req.author,
    createTime: Date.now(),
    updateTime: Date.now(),
    clicks: 0,
    content: req.content,
    label: req.label,
    url: req.url,
    isOutside: req.isOutside,
    sortId: req.sortId,
    isShow: req.isShow,
  })
  noticeSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function noticeDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  NewsSys.remove({ _id: req.id }, (err, res) => {
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
  List: noticeList,
  Edit: noticeEdit,
  Dele: noticeDele,
  Add: noticeAdd
}
