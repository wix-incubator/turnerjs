/**
 * serve runner files locally
 */
/*eslint no-console: 0*/

'use strict'

const logger = require('../spec/specLogger')
const express = require('express')
const app = express()

app.use(express.static('runners'))
app.listen(4578, () => {
    logger.log('App listening on port 4578!')
})
