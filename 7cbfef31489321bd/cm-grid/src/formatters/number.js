'use strict'

const startsWith_ = require('lodash/startsWith')

function getCellValue(value) {
  const parsedValue = parseFloat(value)
  
  if (value === undefined || value === null) {
    return ''
  }
  
  if (isNaN(parsedValue)) {
    return value
  }
  
  if (value.toString().length !== parsedValue.toString().length) {
    return value
  }
  
  return format(parsedValue)
}

function format(value) {
  const [integer, fraction] = value.toString().split('.')
  
  return fraction ?
    addCommas(integer).concat('.' + fraction) :
    addCommas(integer)
}

function addCommas(value) {
  const withCommas = value
    .split('')
    .reverse()
    .reduce(function(previousValue, currentValue, index) {
      previousValue = previousValue.concat(currentValue)
      if ((index + 1) % 3 === 0) {
        previousValue = previousValue.concat(',')
      }
      
      return previousValue
    })
    .split('')
    .reverse()
    .join('')
  
  if (startsWith_(withCommas, ',')) {
    return withCommas.substr(1, withCommas.length - 1)
  }
  
  return withCommas
}

module.exports = (value) => getCellValue(value)
