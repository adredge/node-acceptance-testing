'use strict'

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const config = require('../config/config')[env]

module.exports = function(req, res, next) {
  if(req.path.includes('/auth')) return next()

  let userId
  const userIdCookie = req.cookies[config.userCookieName]

  if (!userIdCookie) {
    return res.sendStatus(401)
  }

  req.userId = userIdCookie
  next()
}