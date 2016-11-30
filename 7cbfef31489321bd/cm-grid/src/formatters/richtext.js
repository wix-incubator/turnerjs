'use strict'

const toString_ = require('lodash/toString')

module.exports = value => {
  const regex = /(<([^>]+)>)/ig
  return toString_(value).replace(regex, '')
}
