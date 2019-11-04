const path = require("path").resolve(".")
const pathLink = path
const config = require(pathLink + '/static/js/config')
const gitAPIURL = "https://api.github.com"
// 项目名
const projectName = ""

const git = {
  Accept: "application/vnd.github.dazzler-preview+json",
  loginURL: "https://github.com/login/oauth/access_token",
  checkPublicURL: gitAPIURL + "/orgs/fsn-dev/public_members/",
  userURL: gitAPIURL + "/user?access_token=",
  invitItemURL: gitAPIURL + "/orgs/" + projectName + "/memberships/",
  // 需申请
  client_id: "",
  client_secret: "",
  Authorization: "",
}

module.exports = git