'use strict'

module.exports = {
  development: {
    db: 'mongodb://localhost/todo',
    port: process.env.PORT || 3001,
    userCookieName: 'user'
  },
  test: {
    db: 'mongodb://localhost/todo-integration',
    port: process.env.PORT || 3001,
    userCookieName: 'user'
  },
  production: {
    // db: 'mongodb://localhost/todo',
    // port: process.env.PORT || 80,
    // userCookieName: 'user'
  }
}