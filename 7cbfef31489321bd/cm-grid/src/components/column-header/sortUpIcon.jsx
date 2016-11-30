'use strict'

const React = require('react')

const styles = require('./styles.scss')

const SortUpIcon = () =>
  <svg data-aid="sort-up-icon" className={styles.icon} viewBox="-6 -9 31 30" version="1.1" >
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#7A92A5">
        <polygon points="17 2 19 2 19 0 17 0"></polygon>
        <polygon points="17 7 19 7 19 5 17 5"></polygon>
        <polygon points="17 12 19 12 19 10 17 10"></polygon>
        <polygon points="8.625 4 11 1.729 11 12 12 12 12 1.729 14.375 4 15 3.197 11.5 0 8 3.197"></polygon>
      </g>
    </g>
  </svg>

module.exports = SortUpIcon
