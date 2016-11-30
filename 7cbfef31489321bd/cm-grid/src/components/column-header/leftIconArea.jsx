'use strict'

const React = require('react')

const PinLockIcon = require('./pinLockIcon')
const LockIcon = require('./lockIcon')
const PinIcon = require('./pinIcon')
const styles = require('./styles.scss')

const selectIcon = (isSystemField, isPinned) => {
  if (isSystemField && isPinned) {
    return <PinLockIcon />
  } else if (isSystemField) {
    return <LockIcon />
  } else if (isPinned) {
    return <PinIcon />
  }
  return null
}

const LeftIconArea = ({isSystemField, isPinned}) =>
  <div className={styles.iconAreaLeft}>
    {selectIcon(isSystemField, isPinned)}
  </div>

module.exports = LeftIconArea
