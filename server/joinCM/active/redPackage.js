const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.client + 'RedPackages')
const mongoose = require('mongoose')
const async = require('async')

const RedPackages = mongoose.model('RedPackages')
const DevUser = mongoose.model('DevUser')


/**
 * 抢红包
 * @param {[number]} totalAmount [总金额]
 * @param {[number]} totalPeople [总人数]
 * @return {[Array]}       [每个人抢到的金额]
 */
// let hash = '0xgfdgsdfgdsfgsdghdsgh2625'
function assign(totalAmount, totalPeople){
  var remainAmount = +totalAmount;
  var remainPeople = +totalPeople;
  var arr = [];
  while(remainPeople > 0){
    let num = scramble(remainAmount, remainPeople);
    remainAmount = remainAmount - num;
    remainPeople--;
    arr.push(num);
  }
  return arr;
}
function scramble(remainAmount, remainPeople){
  if(remainPeople === 1){
    return +remainAmount.toFixed(2);
  }
  let max = ((remainAmount / remainPeople) * 2 - 0.01).toFixed(2);
  let min = 0.01;
  let range = max - min;
  let rand = Math.random();
  let num = min + rand * range
  return num;
}

let robPeopleObj = {}
let robPeopleObjOver = {}

function robRedPackage (socket, req, type) {
  let data = { msg: 'Error', info: [] }
  if (!req.randomID) {
    data.msg = 'Expired'
    data.tip = '此红包已过期'
    socket.emit(type, data)
    return
  }
  if (!req.userID) {
    data.msg = 'NoLogin'
    data.tip = '未登录'
    socket.emit(type, data)
    return
  }
  if (robPeopleObj[req.randomID] && robPeopleObj[req.randomID].indexOf(req.userID) !== -1) {
    data.msg = 'ClickFast'
    data.tip = '操作过快'
    socket.emit(type, data)
    return
  } else {
    robPeopleObj[req.randomID] += req.userID + '-'
  }
  // logger.info(robPeopleObjOver[req.randomID])
  if (robPeopleObjOver[req.randomID] && robPeopleObjOver[req.randomID].indexOf(req.userID) !== -1) {
    data.msg = 'Repeat'
    socket.emit(type, data)
    return
  }
  async.waterfall([
    (cb) => {
      DevUser.findOne({$or: [
        {gitID: req.userID.replace(/\s/g, '')},
        {wx: req.userID.replace(/\s/g, '')},
        {email: req.userID.replace(/\s/g, '')},
      ]}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          // logger.info(res)
          if (res && res.gitID && res.address && res.isPublic) {
            cb(null, res.gitID)
          } else if (!res.address) {
            data.msg = 'NoAddress'
            data.tip = '地址未填写'
            cb(data)
          } else if (!res.isPublic) {
            data.msg = 'NoPublic'
            data.tip = '不是公共会员'
            cb(data)
          } else {
            data.msg = 'NoLogin'
            data.tip = '未登录'
            cb(data)
          }
        }
      })
    },
    (results, cb) => {
      RedPackages.findOne({randomID: req.randomID}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          // logger.info(1)
          // logger.info(res)
          if (res && res.state === 1 && res.joinList.length < Number(res.joinLimit) ) {
            cb(null, res)
          } else {
            data.msg = res && res.state === 0 ? 'Waiting' : 'End'
            cb(data)
          }
        }
      })
    },
    (results, cb) => {
      RedPackages.find({randomID: req.randomID, joinList: {$elemMatch: {id: req.userID} } }).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb(data)
        } else {
          if (res.length > 0) {
            data.msg = 'Repeat'
            cb(data)
          } else {
            // logger.info(2)
            // logger.info(res)
            cb(null, results)
          }
        }
      })
    },
    (results, cb) => {
      let surPeopNum = Number(results.joinLimit) - results.joinList.length
      let sendAmount = 0
      for (let obj of results.joinList) {
        sendAmount += Number(obj.amount)
      }
      let nowAmount = Number(results.amount) - sendAmount
      let nextAmount = 0
      if (surPeopNum === 1) {
        nextAmount = nowAmount
      } else {
        nextAmount = assign(nowAmount, surPeopNum)
        nextAmount = nextAmount[0].toFixed(2)
      }
      // logger.info(3)
      // logger.info(nextAmount)
      cb(null, nextAmount, results)
    },
    (amount, results, cb) => {
      let timestamp = Date.now()
      let updateData = {
        $push: {
          joinList: {
            userID: req.userID,
            amount: amount,
            timestamp: timestamp,
            isDraw: 0,
            sort: results.joinList.length,
            hash: '',
            address: ''
          }
        },
        state: 1
      }
      if (Number(results.joinLimit - 1) === (results.joinList.length)) {
        updateData.state = 4
        delete robPeopleObj[req.randomID]
        delete robPeopleObjOver[req.randomID]
      } else {
        robPeopleObjOver[req.randomID] += req.userID + '-'
      }
      // logger.info(updateData)
      // logger.info(updateData.state)
      // logger.info(updateData.state)
      RedPackages.updateOne({randomID: req.randomID}, updateData).exec((err, res) => {
        if (err) {
          data.error = err.toString()
        } else {
          data.msg = 'Success',
          data.amount = amount
          data.timestamp = timestamp
          data.info = res
        }
        cb(null, data)
      })
    }
  ], () => {
    socket.emit(type, data)
    setTimeout(() => {
      if (robPeopleObj[req.randomID]) {
        delete robPeopleObj[req.randomID]
      }
    }, 1000 * 10)
    setTimeout(() => {
      if (robPeopleObjOver[req.randomID]) {
        delete robPeopleObjOver[req.randomID]
      }
    }, 1000 * 60 * 60 * 24)
  })
}

function getRedPackage (socket, req, type) {
  let data = { msg: 'Error', info: [] },
      params = {}
  if (!req.randomID) {
    socket.emit(type, {
      error: 'Id is not null'
    })
    return
  }
  if (req) {
    if (req.randomID) {
      params.randomID = req.randomID
    }
  }
  async.waterfall([
    (cb) => {
      RedPackages.findOne(params).sort({createTime: -1}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
        } else {
          let nowTime = Date.now()
          logger.info(res)
          if (res && nowTime < res.limitTime && res.limitTime) {
            data.msg = 'Success'
            data.info = res
            cb(data)
          } else {
            cb(null, res)
          }
        }
      })
    },
    (results, cb) => {
      if (!results) {
        data.msg = 'Expired'
        cb(data)
        return
      }
      RedPackages.updateOne(params, {state: 4}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
        } else {
          data.msg = 'Expired'
          results.state = 4
          data.info = results
          if (robPeopleObj[req.randomID]) {
            delete robPeopleObj[req.randomID]
            delete robPeopleObjOver[req.randomID]
          }
        }
        cb(null, data)
      })
    }
  ], () => {
    socket.emit(type, data)
  })
}


module.exports = {
  robRedPackage,
  getRedPackage,
}