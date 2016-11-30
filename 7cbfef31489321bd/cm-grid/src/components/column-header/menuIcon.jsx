'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('./styles.scss')

const MenuIcon = () =>
  <svg data-aid="menu-icon" className={classNames(styles.icon, styles.menuButton)} viewBox="-6 -9 31 30" version="1.1">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#7A92A5">
        <polygon points="17 2 19 2 19 0 17 0"></polygon>
        <polygon points="17 7 19 7 19 5 17 5"></polygon>
        <polygon points="17 12 19 12 19 10 17 10"></polygon>
      </g>
    </g>
  </svg>

module.exports = MenuIcon
