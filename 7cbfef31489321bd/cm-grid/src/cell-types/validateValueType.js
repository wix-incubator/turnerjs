'use strict'

const isUndefined_ = require('lodash/isUndefined')

const boolean = require('./boolean/validate')
const datetime = require('./datetime/validate')
const number = require('./number/validate')
const image = require('./image/validate')
const richtext = require('./richtext/validate')
const json = require('./json/validate')
const text = require('./text/validate')

const validators = {boolean, datetime, image, json, number, richtext, text}

const isEmpty = value => value === null || isUndefined_(value)

module.exports = (type, value) => {
  const validator = validators[type]
  if (isEmpty(value) || !validator) {
    return true
  }
  return validator(value)
}
