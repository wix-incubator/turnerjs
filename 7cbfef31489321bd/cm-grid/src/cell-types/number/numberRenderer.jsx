'use strict'

const React = require('react')

const format = require('../../formatters/number')

module.exports = params => <span data-aid="number-renderer">{format(params.value)}</span>
