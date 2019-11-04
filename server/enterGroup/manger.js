const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')

const AdverSys = require(pathLink + '/server/manger/adverSys/index')
const NewsSys = require(pathLink + '/server/manger/newsSys/index')
const Users = require(pathLink + '/server/manger/user/index')
const RoleSys = require(pathLink + '/server/manger/roleSys/index')
const baseSys = require(pathLink + '/server/manger/baseSys/index')
const TaskSys = require(pathLink + '/server/manger/taskSys/index')
const RedPackageSys = require(pathLink + '/server/manger/activeSys/redPackage/index')

const SendRedPackage = require(pathLink + '/server/manger/activeSys/redPackage/sendRedPackage')

const CmSys = require(pathLink + '/server/manger/CmSys/index')
const github = require(pathLink + '/server/manger/CmSys/github')
const review = require(pathLink + '/server/manger/CmSys/review')

function StartSocket (socket, io) {
  // 广告系统
  socket.on('adverAdd', (req) => {
    AdverSys.Add(socket, req, 'adverAdd')
  })
  socket.on('adverDele', (req) => {
    AdverSys.Dele(socket, req, 'adverDele')
  })
  socket.on('adverEdit', (req) => {
    AdverSys.Edit(socket, req, 'adverEdit')
  })
  socket.on('adverList', (req) => {
    AdverSys.List(socket, req, 'adverList')
  })
  // 新闻系统
  socket.on('newsAdd', (req) => {
    NewsSys.Add(socket, req, 'newsAdd')
  })
  socket.on('newsDele', (req) => {
    NewsSys.Dele(socket, req, 'newsDele')
  })
  socket.on('newsEdit', (req) => {
    NewsSys.Edit(socket, req, 'newsEdit')
  })
  socket.on('newsList', (req) => {
    NewsSys.List(socket, req, 'newsList')
  })
  // 用户系统
  socket.on('createUser', (req) => {
    Users.createUser(socket, req, 'createUser')
  })
  socket.on('deleUser', (req) => {
    Users.deleUser(socket, req, 'deleUser')
  })
  socket.on('editUser', (req) => {
    Users.editUser(socket, req, 'editUser')
  })
  socket.on('findUser', (req) => {
    Users.findUser(socket, req, 'findUser')
  })
  socket.on('validUser', (req) => {
    Users.validUser(socket, req, 'validUser')
  })
  // 权限系统
  socket.on('roleAdd', (req) => {
    RoleSys.Add(socket, req, 'roleAdd')
  })
  socket.on('roleDele', (req) => {
    RoleSys.Dele(socket, req, 'roleDele')
  })
  socket.on('roleEdit', (req) => {
    RoleSys.Edit(socket, req, 'roleEdit')
  })
  socket.on('roleList', (req) => {
    RoleSys.List(socket, req, 'roleList')
  })
  // 社区管理
  socket.on('CmAdd', (req) => {
    CmSys.Add(socket, req, 'CmAdd')
  })
  socket.on('CmDele', (req) => {
    CmSys.Dele(socket, req, 'CmDele')
  })
  socket.on('CmEdit', (req) => {
    CmSys.Edit(socket, req, 'CmEdit')
  })
  socket.on('CmList', (req) => {
    CmSys.List(socket, req, 'CmList')
  })
  socket.on('searchInfo', (req) => {
    CmSys.searchInfo(socket, req, 'searchInfo')
  })

  socket.on('goInvited', (req) => {
    github.goInvited(socket, req, 'goInvited')
  })
  socket.on('oneTouchInvited', (req) => {
    github.oneTouchInvited(socket, req, 'oneTouchInvited')
  })
  socket.on('oneTouchGitReview', (req) => {
    github.oneTouchGitReview(socket, req, 'oneTouchGitReview')
  })
  socket.on('oneTouchGitValidUser', (req) => {
    github.oneTouchGitValidUser(socket, req, 'oneTouchGitValidUser')
  })
  socket.on('userReview', (req) => {
    review.userReview(socket, req, 'userReview')
  })
  // 任务中心 TaskSys
  socket.on('taskAdd', (req) => {
    TaskSys.Add(socket, req, 'taskAdd')
  })
  socket.on('taskDele', (req) => {
    TaskSys.Dele(socket, req, 'taskDele')
  })
  socket.on('taskEdit', (req) => {
    TaskSys.Edit(socket, req, 'taskEdit')
  })
  socket.on('taskList', (req) => {
    TaskSys.List(socket, req, 'taskList')
  })
  // 红包管理 RedPackageSys
  socket.on('RedPackageAdd', (req) => {
    RedPackageSys.Add(socket, req, 'RedPackageAdd')
  })
  socket.on('RedPackageDele', (req) => {
    RedPackageSys.Dele(socket, req, 'RedPackageDele')
  })
  socket.on('RedPackageEdit', (req) => {
    RedPackageSys.Edit(socket, req, 'RedPackageEdit')
  })
  socket.on('RedPackageList', (req) => {
    RedPackageSys.List(socket, req, 'RedPackageList')
  })

  // 发放奖励
  socket.on('oneTouchSend', (req) => {
    SendRedPackage.oneTouchSend(socket, req, 'oneTouchSend')
  })

  // 基础设置管理
  socket.on('baseAdd', (req) => {
    baseSys.Add(socket, req, 'baseAdd')
  })
  socket.on('baseCheck', (req) => {
    baseSys.Check(socket, req, 'baseCheck')
  })
}

module.exports = StartSocket
