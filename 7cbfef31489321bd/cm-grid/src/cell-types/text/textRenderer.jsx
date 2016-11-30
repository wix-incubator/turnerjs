'use strict'

const React = require('react')
const isUndefined_ = require('lodash/isUndefined')

module.exports = ({value}) =>
  <span data-aid="text-renderer">{isUndefined_(value) ? '' : value}</span>
