const path = require("path").resolve(".")
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')


const manger = require(pathLink + '/server/enterGroup/manger')
const joinCM = require(pathLink + '/server/enterGroup/joinCM')
const public = require(pathLink + '/server/enterGroup/public')


function StartSocket (socket, io) {
    public(socket, io)
    if ($$.config.isUseEnters.manger) {
        manger(socket, io)
    }
    if ($$.config.isUseEnters.joinCM) {
        joinCM(socket, io)
    }
}

module.exports = StartSocket
