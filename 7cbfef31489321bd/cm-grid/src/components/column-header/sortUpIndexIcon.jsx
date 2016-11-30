'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('./styles.scss')

const SortUpIndexIcon = ({sortIndex}) =>
  <div>
    <svg
      data-aid="sort-up-index-icon"
      className={classNames(styles.sortIndexContainer, styles.icon)}
      viewBox="-6 -9 31 30" version="1.1"
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g fill="#7A92A5">
          <polygon points="8.615 4 11 1.729 11 5 12 5 12 1.729 14.365 4 15.004 3.197 11.511 0 8 3.197"></polygon>
          <polygon points="17 2 19 2 19 0 17 0"></polygon>
          <polygon points="17 7 19 7 19 5 17 5"></polygon>
          <polygon points="17 12 19 12 19 10 17 10"></polygon>
        </g>
      </g>
    </svg>
    <div data-aid="sort-index" className={classNames(styles.sortIndex, styles.sortIndexUp)}>{sortIndex + 1}</div>
  </div>

module.exports = SortUpIndexIcon
