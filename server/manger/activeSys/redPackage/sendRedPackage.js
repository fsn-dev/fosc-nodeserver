const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'RedPackages')
const mongoose = require('mongoose')
const async = require('async')

const RedPackages = mongoose.model('RedPackages')
const DevUser = mongoose.model('DevUser')

const web3 = require($$.config.link.web3)
const Wallet = require($$.config.link.wallet)
const keystore = require($$.config.link.keystore)

const Txns = require(pathLink + '/server/public/other/send')

function oneTouchSend (socket, req, type) {
  let data = { msg: 'Error', info: [] },
      params = {}
  // let url = req.url ? req.url : $$.config.serverRPC
  // let url = 'https://testnet.fsn.dev/api'
  // web3.setProvider(new web3.providers.HttpProvider(url))
  let sendGroupTxns = (rpData) => {
    // logger.info(rpData)
    async.eachSeries(rpData.rp.joinList, (user, callback) => {
      async.waterfall([
        (cb) => {
          if (user.isDraw) {
            data.error = user.userID + ' haveing send!'
            cb({
              label: 'Haveing send',
              error: user.userID + ' haveing send!'
            })
          } else {
            cb(null, 1)
          }
        },
        (state, cb) => {
          DevUser.findOne({gitID: user.userID}).exec((err, res) => {
            if (err) {
              data.error = err.toString()
              cb({
                label: 'DevUser find user',
                error: err.toString()
              })
            } else {
              if (res.gitID && res.address) {
                // let to = res.address
                user.to = res.address
                cb(null, res.address)
              } else {
                data.msg = 'SendError'
                cb({
                  label: 'DevUser find address',
                  error: res.gitID + ' address is null!'
                })
              }
            }
          })
        },
        (address, cb) => {
          let obj = {
            from: rpData.from,
            to: address,
            nonce: rpData.nonce,
            private: rpData.private,
            value: user.amount
          }
          Txns.signAndSendTxn(obj).then(hash => {
            rpData.nonce ++
            cb(null, hash.hash)
          }).catch(err => {
            cb(err)
          })
        },
        (hash, cb) => {
          RedPackages.updateOne(
            {_id: req.id, 'joinList.userID': user.userID, 'joinList.isDraw': 0},
            {'joinList.$.isDraw': 1, 'joinList.$.hash': hash, 'joinList.$.address': user.to}
          ).exec((err, res) => {
          // RedPackages.updateOne(
          //   {_id: req.id, 'joinList.userID': user.userID, 'joinList.isDraw': 0},
          //   {'joinList.$.isDraw': 1}
          // ).exec((err, res) => {
            if (err) {
              cb({
                label: 'RedPackages update',
                error: err.toString()
              })
            } else {
              cb(null, res)
            }
          }) 
        }
      ], (err, res) => {
        if (err) {
          logger.error(err)
          socket.emit(type, {
            msg: 'Add',
            count: 0,
            error: err.error,
            info: user
          })
        } else {
          socket.emit(type, {
            msg: 'Add',
            count: 1,
            info: user
          })
        }
        
        callback(null, res)
      })
    }, () => {
      socket.emit(type, {
        msg: 'Over'
      })
    })
  }

  async.waterfall([
    (cb) => {
      RedPackages.findOne({_id: req.id}).sort({createTime: -1}).exec((err, res) => {
        if (err) {
          data.error = err.toString()
          cb({
            label: 'RedPackages findOne',
            error: err.toString()
          })
        } else {
          cb(null, {rp: res})
        }
      })
    },
    (baseData, cb) => {
      try {
        let wallet = Wallet.getWalletFromPrivKeyFile(
          keystore,
          req.pwd
        )
        baseData.private = wallet.getPrivateKeyString()
        baseData.from = wallet.getChecksumAddressString()
        cb(null, baseData)
      } catch (err) {
        // logger.error(error.toString())
        data.error = err.toString()
        data.tip = 'Password is error!'
        cb({
          label: 'Password is error',
          error: err.toString()
        })
      }
    },
    (baseData, cb) => {
      // logger.info(baseData)
      web3.eth.getTransactionCount(baseData.from , 'pending', (err, res) => {
        if (err) {
          data.error = err.toString()
          cb({
            label: 'Get nonce',
            error: err.toString()
          })
        } else {
          baseData.nonce = parseInt(res)
          cb(null, baseData)
        }
      })
    }
  ], (err, res) => {
    if (err) {
      logger.error(err)
      socket.emit(type, data)
    } else {
      socket.emit(type, {
        msg: 'Success',
        total: res.rp.joinList.length
      })
      sendGroupTxns(res)
    }
  })
}

module.exports = {
  oneTouchSend
}