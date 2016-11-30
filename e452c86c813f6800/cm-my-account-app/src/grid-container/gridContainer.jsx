'use strict'

const React = require('react')
const Grid = require('cm-grid/src/app')

const MyAccountHeader = require('../my-account-header/myAccountHeader')
const Toolbar = require('../toolbar/toolbar')
const styles = require('./gridContainer.scss')

const GridContainer = ({schema}) => {
  return (
    <div className={styles.gridContainer} data-aid="cm-grid-container">
      <div>
        <MyAccountHeader collectionName={schema.displayName} />
      </div>
      <div>
        <Toolbar />
      </div>
      <div className={styles.gridWrapper}>
        <Grid schema={schema} />
      </div>
    </div>
  )
}

module.exports = GridContainer
