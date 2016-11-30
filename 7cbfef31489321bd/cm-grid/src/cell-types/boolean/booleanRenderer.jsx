'use strict'

const React = require('react')

module.exports = ({value}) =>
  <span data-aid="boolean-renderer-value">{value === true ? 'V' : ''}</span>
