const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')

const sendTxns = require(pathLink + '/server/public/other/send')
const getBaseSet = require(pathLink + '/server/public/getBaseSet/index')

function StartSocket (socket, io) {
  socket.on('sendTxns', (req) => {
    sendTxns.sendTxns(socket, req, 'sendTxns')
  })

  socket.on('getRoleCM', (req) => {
    getBaseSet.getRoleCM(socket, req, 'getRoleCM')
  })
  socket.on('getTask', (req) => {
    getBaseSet.getTask(socket, req, 'getTask')
  })
  socket.on('getNoticeType', (req) => {
    getBaseSet.getNoticeType(socket, req, 'getNoticeType')
  })
}



module.exports = StartSocket