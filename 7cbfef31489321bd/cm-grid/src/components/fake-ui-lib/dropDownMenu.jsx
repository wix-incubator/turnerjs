'use strict'

const React = require('react')

const styles = require('./dropDownMenu.scss')

const DropDownMenu = ({
  isOpen,
  children,
  position = {top: '36px', left: '0'}
}) => {
  if (isOpen) {
    return (
      <div className={styles.dropdown} style={position}>
        <div className={styles.dropdownItem}>
          {children}
        </div>
      </div>
    )
  }
  return null
}

DropDownMenu.propTypes = {
  isOpen: React.PropTypes.bool.isRequired,
  position: React.PropTypes.object
}

module.exports = DropDownMenu
