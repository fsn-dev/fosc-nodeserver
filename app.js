const path = require("path").resolve(".")
const pathLink = path


const http = require('http')
const multer = require('multer')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')


const config = require('./static/js/config')
const httpPort =  config.appPort

const logger = require(pathLink + '/server/public/methods/log4js').getLogger('App')

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', '3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.use(express.static(require('path').join(__dirname, 'public')))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

const objMulter = multer({dest: config.file.upload})
app.use(objMulter.any())

const httpServer = http.createServer(app).listen(httpPort)
const io = require('socket.io')({})
io.attach(httpServer)

/**
 * router
 * 
 */
const uploadFile = require(pathLink + '/server/joinCM/uploadFile/index')

app.use('/uploadFile', uploadFile)


/**
 * socket
 * 
 */
// app list enter
const StartSocket = require('./server/index')


let peopleCount = 0
io.on('connection', function (socket) {
  peopleCount ++
  StartSocket(socket, io)
  
  socket.on('joinDataList', (data) => {
    socket.join(data)
  })

  socket.on('leaveDataList', (data) => {
    socket.leave(data)
  })
  
  socket.on('disconnect',function(){
    peopleCount--
  })
  logger.info(peopleCount + ' user')
})
