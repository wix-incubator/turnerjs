'use strict'

const convertToNull = value => null

const converters = {
  boolean: Boolean,
  datetime: Date,
  number: Number,
  richtext: String,
  text: String
}

module.exports = (type, value) => (converters[type] || convertToNull)(value)
