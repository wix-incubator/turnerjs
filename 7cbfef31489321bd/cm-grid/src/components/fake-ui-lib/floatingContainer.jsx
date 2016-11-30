'use strict'

const React = require('react')

const styles = require('./floatingContainer.scss')

const FloatingContainer = (props) => {
  if (props.isOpen) {
    return (
      <div className={styles.floatingDropdown} style={{top: props.top + 'px', left: props.left + 'px'}}>
        <div>{props.children}</div>
      </div>
    )
  }
  return null
}

FloatingContainer.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  top: React.PropTypes.number,
  left: React.PropTypes.number
}

module.exports = FloatingContainer
