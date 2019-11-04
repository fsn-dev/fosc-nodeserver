const crypto = require('crypto')

module.exports = (password) => {
  password = password.toString()
  let pwd = crypto.createHash('md5').update(password).digest("hex")
  return pwd
}