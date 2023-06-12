require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const router = require('./api/index')

// Setup your Middleware and API Router here

app.use(bodyParser.json())

app.get('/api', (req, res, next) => {
  res.send('/api')
})
app.use('/api', router)

module.exports = app
