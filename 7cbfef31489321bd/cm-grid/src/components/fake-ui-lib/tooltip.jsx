'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('./tooltip.scss')

const Tooltip = ({text, showButton, buttonText, onButtonClick}) => (
  <div data-aid="error-tooltip" className={classNames(styles.tooltip, 'cell-tooltip')}>
    {text} &nbsp;
    {showButton ?
      <span
        className={styles.button}
        onClick={onButtonClick}
      >{buttonText}</span> 
      : null
    }
      
  </div>
)

module.exports = Tooltip
