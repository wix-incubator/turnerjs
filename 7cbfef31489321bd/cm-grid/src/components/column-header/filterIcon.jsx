'use strict'

const React = require('react')

const styles = require('./styles.scss')

const FilterIcon = () =>
  <svg data-aid="filter-icon" className={styles.icon} viewBox="-6 -9 31 30" version="1.1">
    <g fill="none" fillRule="evenodd">
      <g fill="#7A92A5">
        <polygon points="17 2 19 2 19 0 17 0"></polygon>
        <polygon points="17 7 19 7 19 5 17 5"></polygon>
        <polygon points="17 12 19 12 19 10 17 10"></polygon>
        <path d="M13.7813899,0 L5.80716934,0 C4.99538651,0 4.77299392,0.919 5.24470556,1.581 L9,7 L9,12 L10.9991455,12 L10.9991455,7 L14.8424917,1.581 C15.3132061,0.919 14.6550038,0 13.843221,0 L13.7813899,0 Z M10,7 L6,1 L14,1 L10,7 Z"></path>
      </g>
    </g>
  </svg>

module.exports = FilterIcon
