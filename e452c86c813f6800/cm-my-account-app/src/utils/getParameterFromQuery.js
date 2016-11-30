'use strict'

module.exports = (query, name) => {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(query)
  return results && results[1] ? decodeURIComponent(results[1]).replace(/\+/g, ' ') : ''
}
