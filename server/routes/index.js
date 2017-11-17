'use strict'

const express = require('express')
const router = express.Router()

router.use(require('./user-middleware'))

router.use(require('./list'))

module.exports = router