'use strict'

const React = require('react')

const styles = require('./styles.scss')

const LockIcon = () =>
  <svg data-aid="lock-icon" className={styles.icon} viewBox="-6 -9 31 30" version="1.1">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#7A92A5">
        <path d="M8,8.5 C8,9.328 7.328,10 6.5,10 L2.5,10 C1.672,10 1,9.328 1,8.5 L1,5.5 C1,5.224 1.224,5 1.5,5 L7.5,5 C7.776,5 8,5.224 8,5.5 L8,8.5 Z M3,3 C3,2.173 3.673,1.5 4.5,1.5 C5.327,1.5 6,2.173 6,3 L6,4 L3,4 L3,3 Z M8,4 L7,4 L7,3.143 C7,1.835 6.059,0.643 4.758,0.513 C3.261,0.363 2,1.534 2,3 L2,4 L1,4 C0.448,4 0,4.448 0,5 L0,8.5 C0,9.881 1.119,11 2.5,11 L6.5,11 C7.881,11 9,9.881 9,8.5 L9,5 C9,4.448 8.552,4 8,4 L8,4 Z"></path>
        <polygon points="6 7 5 7 5 6 4 6 4 7 3 7 3 8 4 8 4 9 5 9 5 8 6 8"></polygon>
      </g>
    </g>
  </svg>

module.exports = LockIcon
