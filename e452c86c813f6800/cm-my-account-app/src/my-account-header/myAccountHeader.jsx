'use strict'

const React = require('react')

const styles = require('./myAccountHeader.scss')

const MyAccountHeader = ({collectionName}) => (
  <div className={styles.wrapper} data-aid="my-account-header">
    <h1 className={styles.headerText}>
      {collectionName}
    </h1>
  </div>
)

MyAccountHeader.propTypes = {
  collectionName: React.PropTypes.string.isRequired
}

module.exports = MyAccountHeader
