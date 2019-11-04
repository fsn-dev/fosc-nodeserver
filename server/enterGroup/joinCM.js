const path = require("path").resolve(".")
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')

const register = require(pathLink + '/server/joinCM/register/index')
const task = require(pathLink + '/server/joinCM/task/index')

const myTask = require(pathLink + '/server/joinCM/usercenter/myTask')

const redPackage = require(pathLink + '/server/joinCM/active/redPackage')

function StartSocket (socket, io) {
  // 加入社区-注册
  socket.on('getGitUserInfo', (req) => {
    register.getGitUserInfo(socket, req, 'getGitUserInfo')
  })
  socket.on('joinCM', (req) => {
    register.joinCM(socket, req, 'joinCM')
  })
  socket.on('editCM', (req) => {
    register.editCM(socket, req, 'editCM')
  })
  socket.on('findDevUser', (req) => {
    register.findDevUser(socket, req, 'findDevUser')
  })
  // 文件上传、删除
  socket.on('uploadFile', (req) => {
    register.uploadFile(socket, req, 'uploadFile')
  })
  socket.on('removeFile', (req) => {
    register.removeFile(socket, req, 'removeFile')
  })
  // 任务中心
  socket.on('taskCenterList', (req) => {
    task.List(socket, req, 'taskCenterList')
  })
  socket.on('taskJoin', (req) => {
    task.taskJoin(socket, req, 'taskJoin')
  })
  // 个人中心
  socket.on('myTask', (req) => {
    myTask.getMyTask(socket, req, 'myTask')
  })

  // 抢红包 robRedPackage
  socket.on('robRedPackage', (req) => {
    redPackage.robRedPackage(socket, req, 'robRedPackage')
  })
  socket.on('getRedPackage', (req) => {
    redPackage.getRedPackage(socket, req, 'getRedPackage')
  })
  // login
  // socket.on('login', (req) => {
  //   login('login')
  // })
}




module.exports = StartSocket