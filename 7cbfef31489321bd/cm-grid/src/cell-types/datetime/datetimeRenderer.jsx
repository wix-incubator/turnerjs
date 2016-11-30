'use strict'

const React = require('react')

const {toDateString, toTimeString} = require('../../formatters/datetime')

const DateTimeRender = ({value}) => {
  const date = toDateString(value)
  const time = toTimeString(value)

  return (
    <div data-aid="datetime-renderer" style={{display: 'inline-block'}}>
      <div data-aid="datetime-renderer-date" style={{width: '75px', display: 'inline-block'}}>{date}</div>
      <span data-aid="datetime-renderer-time"> {time}</span>
    </div>
  )
}

module.exports = DateTimeRender
