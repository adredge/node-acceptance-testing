'use strict'

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const routes = require('../routes')

module.exports = function(app, config) {
    app.set('port', config.port)

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(cookieParser())
    app.use('/api', routes)

    app.listen(app.get('port'), function () {
        console.log("Listening on port %s...", app.get('port'))
        if (process.send) process.send('service_started') // this event is used in acceptance tests when running locally.
    })
}