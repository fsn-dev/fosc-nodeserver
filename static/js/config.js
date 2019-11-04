const path = require("path").resolve(".")
const pathLink = path
const httpPort = 8200

let publicSet = {
  /**
   * @description 环境配置
   *  @param dev: 开发环境
   *  @param pro: 生成环境
   */
  env: 'dev',
  // env: 'pro',
  /**
   * @description App名称
   */
  AppName: 'Fusion',
  /**
   * @description 服务启动端口
   */
  appPort: httpPort,
  /**
   * @description 数据库地址
   */
  mongoDBurl: 'mongodb://localhost:27017/focs',
  /**
   * @description 链接节点RPC地址
   */
  serverRPC: 'https://fsn.dev/api',
  /**
   * @description 是否启用服务
   * @param manger: 启用后端服务，默认为1启用
   * @param joinCM: 启用前端社区服务，默认为1启用
   */
  isUseEnters: {
    manger: 1,
    joinCM: 1,
  },
  /**
   * @description 前端文件上传和下载路径
   */
  file: {
    upload: '/usr/share/nginx/html/uploadFile',
    download: 'http://dcrm.network/uploadFile/'
  },
  /**
   * @description 通用文件路径
   */
  link: {
    keystore: pathLink + '/static/js/config/keystore',
    git: pathLink + '/static/js/config/github',
    admin: pathLink + '/static/js/config/admin',
    db: pathLink + '/server/public/methods/db.js',
    web3: pathLink + '/server/public/methods/web3',
    logger: pathLink + '/server/public/methods/log4js',
    wallet: pathLink + '/server/public/methods/wallet',
  },
  /**
   * @description 日志提示配置
   */
  log: {
    client: 'Client-',
    server: 'Server-'
  }
}

module.exports = publicSet