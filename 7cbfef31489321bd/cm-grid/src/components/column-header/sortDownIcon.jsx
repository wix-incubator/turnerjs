'use strict'

const React = require('react')

const styles = require('./styles.scss')

const SortDownIcon = () =>
  <svg data-aid="sort-down-icon" className={styles.icon} viewBox="-6 -9 31 30" version="1.1" >
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#7A92A5">
        <polygon points="17 2 19 2 19 0 17 0"></polygon>
        <polygon points="17 7 19 7 19 5 17 5"></polygon>
        <polygon points="17 12 19 12 19 10 17 10"></polygon>
        <polygon points="10.9997 0.0004 10.9997 10.2714 8.6247 7.9994 7.9997 8.8034 11.4997 12.0004 15.0007 8.8034 14.3747 7.9994 11.9997 10.2714 11.9997 0.0004"></polygon>
      </g>
    </g>
  </svg>

module.exports = SortDownIcon
