'use strict'

const isString_ = require('lodash/isString')
const {URI_TYPE} = require('wix-code-media-manager-support/src/constants')

const validProtocols = [URI_TYPE, 'http://', 'https://']

module.exports = value => isString_(value) && validProtocols.some(protocol => value.startsWith(protocol))
