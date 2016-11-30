'use strict'

const React = require('react')
const isArray_ = require('lodash/isArray')
const isObject_ = require('lodash/isObject')

module.exports = ({value}) => {
  if (isArray_(value)) {
    return <span data-aid="json-renderer-value">{'[...]'}</span>
  }

  if (isObject_(value)) {
    return <span data-aid="json-renderer-value">{'{...}'}</span>
  }

  return null
}
