'use strict'

const isArray_ = require('lodash/isArray')
const isObject_ = require('lodash/isObject')
const isDate_ = require('lodash/isDate')

module.exports = value => !isDate_(value) && (isArray_(value) || isObject_(value))
