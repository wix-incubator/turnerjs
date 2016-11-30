'use strict'

const React = require('react')

const format = require('../../formatters/richtext')

module.exports = params => <span data-aid="richtext-renderer">{format(params.value)}</span>
