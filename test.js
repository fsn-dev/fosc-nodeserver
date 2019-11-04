// const path = require("path").resolve(".")
// const pathLink = path

// const $$ = require(pathLink + '/server/public/methods/methods')
// const http = require('http')
// const https = require('https')
// const fetch = require("node-fetch")
// const fs = require("fs")
// const moment = require('moment')
// const xlsx = require('node-xlsx')
// const async = require('async')
// require($$.config.link.db)
// const httpReq = require(pathLink + '/server/public/methods/httpReq')
// const web3 = require(pathLink + '/server/public/methods/web3')
// let Tx = require("ethereumjs-tx")
// const Wallet = require(pathLink + '/server/public/methods/wallet')










const path = require("path").resolve(".")
const pathLink = path
const xlsx = require('node-xlsx')
require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DevUser = mongoose.model('DevUser')

let roleArr = [{"name":"设计师","name_en":"Designer","isD":1,"sort":0},{"name":"程序员","name_en":"Programmer","isD":1,"sort":1},{"name":"开发者","name_en":"Developer","isD":1,"sort":2},{"name":"研究者","name_en":"Researcher","isD":1,"sort":3},{"name":"运营","name_en":"Operate","isD":1,"sort":4},{"name":"内容创造者","name_en":"Content creators","isD":1,"sort":5},{"name":"翻译","name_en":"Translate","isD":1,"sort":6},{"name":"社区用户","name_en":"Community users","isD":1,"sort":7},{"name":"社区大使","name_en":"Community Ambassadors","isD":1,"sort":8},{"name":"运维","name_en":"Operation and maintenance","isD":1,"sort":9}]
let obj0 = {}
for (let obj of roleArr) {
  obj0[obj.name] = obj
}
var obj = xlsx.parse("./" + "dev.xlsx")
let arr = []
for (let obj1 of obj[0].data) {
  if (arr && obj1[0] && obj1[1] && !isNaN(obj1[19])) {
    let roleAr = []
    let roleAr1 = []
    if (obj1[3]) {
      roleAr = obj1[3].split('-')
    }
    for (let obj2 of roleAr) {
      roleAr1.push(obj0[obj2])
    }
    arr.push({
      gitID: obj1[0],
      wx: obj1[1],
      email: obj1[2],
      roleArr: roleAr1,
      work: obj1[4],
      city: obj1[5] + '-' + obj1[6] + '-' + obj1[7],
      skill: '',
      fileUrl: '',
      isInvited: obj1[8],
      ref: obj1[9],
      address: obj1[18],
      createTime: obj1[17],
      updateTime: obj1[17],
      refCode: '',
      isGitMember: obj1[19],
      isWxMember: obj1[20],
      isReviewAll: obj1[21],
      isPublic: 1,
    })
  }
}
DevUser.insertMany(arr, (err, res) => {
  console.log(err)
  console.log(res)
})