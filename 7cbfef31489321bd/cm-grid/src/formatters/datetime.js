'use strict'

const isEmpty_ = require('lodash/isEmpty')

const prefixWithZeroIfNecessary = time =>
  time < 10 ? '0' + time : time

const toTimeString = date => {
  if (!(date instanceof Date)) {
    return ''
  }

  const hours = prefixWithZeroIfNecessary(date.getHours())
  const minutes = prefixWithZeroIfNecessary(date.getMinutes())

  return `${hours}:${minutes}`
}

const toDateString = date => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = prefixWithZeroIfNecessary(date.getMonth() + 1)
  const day = prefixWithZeroIfNecessary(date.getDate())

  return `${month}/${day}/${year}`
}

const toDateObject = (date, time) => {
  time = isEmpty_(time) ? '00:00' : time

  return new Date(date + ' ' + time)
}

module.exports = {toTimeString, toDateString, toDateObject}
