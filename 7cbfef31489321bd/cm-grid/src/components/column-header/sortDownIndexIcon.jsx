'use strict'

const React = require('react')
const classNames = require('classnames')

const styles = require('./styles.scss')

const SortDownIndexIcon = ({sortIndex}) =>
  <div>
    <svg
      data-aid="sort-down-index-icon"
      className={classNames(styles.sortIndexContainer, styles.icon)}
      viewBox="-6 -9 31 30"
      version="1.1"
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g fill="#7A92A5">
          <polygon points="14.3512586 7.9431 12 10.2141 12 7.0001 11 7.0001 11 10.2141 8.59467963 7.9431 8 8.7461 11.5200229 11.9431 15 8.7461"></polygon>
          <polygon points="17 2 19 2 19 0 17 0"></polygon>
          <polygon points="17 7 19 7 19 5 17 5"></polygon>
          <polygon points="17 12 19 12 19 10 17 10"></polygon>
        </g>
      </g>
    </svg>
    <div data-aid="sort-index" className={classNames(styles.sortIndex, styles.sortIndexDown)}>{sortIndex + 1}</div>
  </div>

module.exports = SortDownIndexIcon
