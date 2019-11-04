const path = require('path').resolve('.')
const pathLink = path
const $$ = require(pathLink + '/server/public/methods/methods')
require($$.config.link.db)
const logger = require($$.config.link.logger).getLogger($$.config.log.client + 'UploadFile')
const mongoose = require('mongoose')
const async = require('async')

const fs = require("fs")
const express = require('express')
const router = express.Router()


router.post('/', (req, res) => {
  fs.exists($$.config.file.upload, function(exists) {
    if (exists) {
      let newName = req.files[0].path + path.parse(req.files[0].originalname).ext
      let newName1 = $$.config.file.download + req.files[0].filename + path.parse(req.files[0].originalname).ext
      fs.rename(req.files[0].path, newName, (err) => {
        if (err) {
          logger.error(err)
          res.send('')
        } else {
          res.send(newName1)
        }
      })
    } else {
      fs.mkdir($$.config.file.upload, (err) => {
        if (err) {
          logger.error(err)
          res.send('')
        } else {
          let newName = req.files[0].path + path.parse(req.files[0].originalname).ext
          let newName1 = $$.config.file.download + req.files[0].filename + path.parse(req.files[0].originalname).ext
          fs.rename(req.files[0].path, newName, (error) => {
            if (error) {
              logger.error(error.toString())
              res.send('')
            } else {
              res.send(newName1)
            }
          })
        }
      })
    }
  })
})


module.exports = router