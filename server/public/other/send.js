const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.server + 'SendTxns')
const mongoose = require('mongoose')
const async = require('async')

const fetch = require("node-fetch")
const Tx = require("ethereumjs-tx")


const Wallet = require($$.config.link.wallet)
const web3 = require($$.config.link.web3)

function sendTxns (socket, req, type) {

  async.waterfall([
    (cb) => {
      let privateKey = new Buffer($$.fixPkey(pwd.pwd), "hex")
      let wallet = new Wallet(privateKey)
      // let to = req.address
      let to = '0x33f9dE49AAe954C84De21eaCBfD158Fd20891630'
      if (to.indexOf('0x') !== 0) {
        to = web3.fsn.getAddressByNotation(Number(to), "latest")
      }
      let rawTx = {
        nonce: 0,
        gasPrice: 0,//Number类型 
        gasLimit: 0,
        from: wallet.getChecksumAddressString(),
        to: to,
        value: Number(10),//Number类型
        // chainId: 4,
        data: ''
      }
      cb(null, privateKey, rawTx)
    },
    (pwd, rawTx, cb) => {
      let batch = web3.createBatch()
      batch.add(web3.eth.getGasPrice.request())
      batch.add(web3.eth.estimateGas.request({to: rawTx.to}))
      batch.add(web3.eth.getTransactionCount.request(rawTx.from, 'pending'))
      batch.requestManager.sendBatch(batch.requests, (err, res) => {
        if (err) {
          cb(err.toString())
        } else {
          if (res[0].result || Number(res[0].result) === 0) {
            rawTx.gasPrice = parseInt(res[0].result)
          } else {
            cb(res)
            return
          }

          if (res[1].result || Number(res[1].result) === 0) {
            rawTx.gasLimit = parseInt(res[1].result)
          } else {
            rawTx.gasLimit = 800000
          }
          let tx = new Tx(rawTx)
          tx.sign(pwd)
          let signTx = tx.serialize().toString("hex")
          signTx = signTx.indexOf("0x") === 0 ? signTx : ("0x" + signTx)
          logger.info(rawTx)
          cb(null, signTx)
        }
      })
    },
    (signTx, cb) => {
      logger.info(signTx)
      web3.eth.sendRawTransaction(signTx, (err, res) => {
        if (err) {
          cb(err.toString())
        } else {
          cb(null, res)
        }
      })
    }
  ], (err, res) => {
    if (err) {
      logger.error(err)
    } else {
      logger.info(res)
    }
  })
}

/**
 * 
 * @param {Object} data {
 *  from: address
 *  to: address
 *  nonce: nonce
 *  private: private
 *  value: value
 * }
 */
function signAndSendTxn (data) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      (cb) => {
        let privateKey = new Buffer($$.fixPkey(data.private), "hex")
        let to = data.to
        if (to.toString().toLowerCase().indexOf('0x') !== 0) {
          try {
            to = web3.fsn.getAddressByNotation(Number(to), "latest")
          } catch (error) {
            cb({
              label: 'Address change',
              error: to + ' address is error!'
            })
          }
        } else if (!web3.isAddress(to.toLowerCase())) {
          cb({
            label: 'Address valid',
            error: to + ' address is error!'
          })
        }
        let amount = web3.toWei(data.value, 'ether')
        let rawTx = {
          nonce: data.nonce,
          gasPrice: 0,//Number类型 
          gasLimit: 0,
          from: data.from,
          to: to.toLowerCase(),
          value: Number(amount),//Number类型
          // data: ''
        }
        cb(null, privateKey, rawTx)
      },
      (pwd, rawTx, cb) => {
        let batch = web3.createBatch()
        batch.add(web3.eth.getGasPrice.request())
        batch.add(web3.eth.estimateGas.request({to: rawTx.to}))
        batch.requestManager.sendBatch(batch.requests, (err, res) => {
          if (err) {
            cb({
              label: 'Get base info',
              error: err.toString()
            })
          } else {
            if (res[0].result || Number(res[0].result) === 0) {
              rawTx.gasPrice = parseInt(res[0].result)
            } else {
              cb({
                label: 'GasPrice error',
                error: res
              })
            }
            if (res[1].result || Number(res[1].result) === 0) {
              rawTx.gasLimit = parseInt(res[1].result)
            } else {
              rawTx.gasLimit = 800000
            }
            let tx = new Tx(rawTx)
            tx.sign(pwd)
            let signTx = tx.serialize().toString("hex")
            signTx = signTx.indexOf("0x") === 0 ? signTx : ("0x" + signTx)
            cb(null, signTx)
          }
        })
      },
      (signTx, cb) => {
        web3.eth.sendRawTransaction(signTx, (err, res) => {
          if (err) {
            cb({
              label: 'Send txns sign',
              error: err.toString()
            })
          } else {
            cb(null, res)
          }
        })
      }
    ], (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve({hash: res})
      }
    })
  })
}

// sendTxns()
module.exports = {
  sendTxns,
  signAndSendTxn
}

