const mongoose = require( 'mongoose' )
const Schema   = mongoose.Schema
const $$ = require('./methods')
const logger = require($$.config.link.logger).getLogger('DB')



const AdverSys = new Schema({
  timestamp: {type: Number},
  sortId: {type: Number},
  img: {type: String},
  url: {type: String},
  remark: {type: String},
  isOutside: {type: Number},
  isShow: {type: Number},
}, {collection: "AdverSys"})

const NewsSys = new Schema({
  type: {type: Number},
  title: {type: String},
  author: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
  clicks: {type: Number, default: 0},
  content: {type: String},
  label: {type: Array, default: []},
  url: {type: String},
  sortId: {type: Number},
  isOutside: {type: Number, default: 0},
  isShow: {type: Number, default: 1},
}, {collection: "NewsSys"})

const Users = new Schema({
  username: {type: String},
  mobile: {type: String, unique: true},
  password: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
  role: {type: Number},
  latestLoginIP: {type: String},
  latestLoginCity: {type: String},
}, {collection: 'Users'})

const RoleSys = new Schema({
  name: {type: String, required: true},
  createTime: {type: Number, required: true},
  updateTime: {type: Number, required: true},
  type: {type: Number, unique: true},
  adminLimit: {type: Object},
}, {collection: 'RoleSys'})


const DevUser = new Schema({
  gitID: {type: String, unique: true},
  wx: {type: String},
  email: {type: String},
  work: {type: String},
  city: {type: Object},
  skill: {type: String},
  fileUrl: {type: Array},
  ref: {type: String},
  address: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
  refCode: {type: String},
  isInvited: {type: Number, default: 0},
  isGitMember: {type: Number, default: 0},
  isWxMember: {type: Number, default: 0},
  isReviewAll: {type: Number, default: 0},
  roleArr: {type: Array},
  password: {type: String},
  isPublic: {type: Number, default: 0},
}, {collection: 'DevUsers'})

const BaseSet = new Schema({
  type: {type: Number, unique: true},
  baseInfo: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
}, {collection: 'BaseSet'})

const TaskSys = new Schema({
  title: {type: String},
  needs: {type: String},
  copyright: {type: String},
  reward: {type: Number},
  useTime: {type: Number},
  singUpTime: {type: Number},
  limitTime: {type: Number},
  joinLimit: {type: Number},
  joinList: {type: Array, default: []},
  state: {type: String, default: 0},
  createTime: {type: Number},
  updateTime: {type: Number},
  clicks: {type: Number, default: 0},
  label: {type: Number},
}, {collection: 'TaskSys'})

const RedPackages = new Schema({
  randomID: {type: String},
  amount: {type: Number},
  joinLimit: {type: Number},
  joinList: {type: Array, default: []},
  state: {type: Number, default: 0},
  limitTime: {type: Number},
  createTime: {type: Number},
  clicks: {type: Number, default: 0},
  isSend: {type: Number, default: 0},
  selfTip:{type: String, default: '恭喜发财，大吉大利'},
}, {collection: 'RedPackages'})



AdverSys.index({sortId: 1, timestamp: -1}, {background: 1})
NewsSys.index({sortId: 1, updateTime: -1}, {background: 1})
Users.index({role: 1, updateTime: -1}, {background: 1})
RoleSys.index({type: 1, updateTime: -1}, {background: 1})
DevUser.index({createTime: -1}, {background: 1})
BaseSet.index({updateTime: -1}, {background: 1})
TaskSys.index({createTime: -1}, {background: 1})
RedPackages.index({createTime: -1}, {background: 1})


mongoose.model('AdverSys', AdverSys)
mongoose.model('NewsSys', NewsSys)
mongoose.model('Users', Users)
mongoose.model('RoleSys', RoleSys)
mongoose.model('DevUser', DevUser)
mongoose.model('BaseSet', BaseSet)
mongoose.model('TaskSys', TaskSys)
mongoose.model('RedPackages', RedPackages)


mongoose.Promise = global.Promise

logger.info("db.js")
logger.info($$.config.mongoDBurl)

mongoose.connect(process.env.MONGO_URI || $$.config.mongoDBurl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

/**
 * 连接
 */
// mongoose.connect($$.config.mongoDBurl, options)
/**
  * 连接成功
  */
mongoose.connection.on('connected', () => {
  logger.info("db.js")
  logger.info('Mongoose connection success: ' + $$.config.mongoDBurl)
})
/**
 * 连接异常
 */
mongoose.connection.on('error', err => {
  logger.error('Mongoose connection error: ' + err.toString())
})
/**
 * 连接断开
 */
mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose connection disconnected')
})


module.exports = {

  AdverSys:         mongoose.model('AdverSys'),
  NewsSys:          mongoose.model('NewsSys'),
  Users:            mongoose.model('Users'),
  RoleSys:          mongoose.model('RoleSys'),
  DevUser:          mongoose.model('DevUser'),
  BaseSet:          mongoose.model('BaseSet'),
  TaskSys:          mongoose.model('TaskSys'),
  RedPackages:      mongoose.model('RedPackages'),
}