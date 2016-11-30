'use strict'

module.exports = value =>
  value
    .toLowerCase()
    .replace(/\s/g, '_')
    .replace(/_+/g, '_')
    .replace(/[^a-zA-Z_\d]/g, '')
    .replace(/^\d+/, '')

