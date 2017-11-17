'use strict'

const express = require('express')

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const app = express()

const config = require('./server/config/config')[env]

require('./server/config/express')(app, config)

require('./server/config/mongoose')(config, env)