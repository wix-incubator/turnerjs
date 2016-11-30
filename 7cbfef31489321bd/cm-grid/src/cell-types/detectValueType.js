'use strict'

const find_ = require('lodash/find')

const boolean = require('./boolean/validate')
const datetime = require('./datetime/validate')
const number = require('./number/validate')
const image = require('./image/validate')
const richtext = require('./richtext/validate')
const json = require('./json/validate')
const text = require('./text/validate')

const DEFAULT_TYPE = 'text'

const validators = {
  boolean, 
  datetime, 
  number, 
  image, 
  richtext: value => richtext(value) && richtext.containsTags(value),
  json, 
  text
}

const validationOrder = ['datetime', 'boolean', 'image', 'number', 'richtext', 'json', 'text']

module.exports = value => {
  return find_(validationOrder, type => {
    return validators[type](value)
  }) || DEFAULT_TYPE
}

