'use strict'

const env = 'test'
const config = require('../server/config/config')[env]

require('../server/config/mongoose')(config, env)