'use strict'

const isString_ = require('lodash/isString')

module.exports = isString_

module.exports.containsTags = value => value.match(/<\w+\s*[^>]*>/)
