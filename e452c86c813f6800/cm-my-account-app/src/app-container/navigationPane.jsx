'use strict'

const React = require('react')
const {connect} = require('react-redux')

const {getSchemas} = require('../rootReducer')
const actions = require('./actions')
const style = require('./styles.scss')

const mapStateToProps = state => ({
  schemas: getSchemas(state)
})
const mapDispatchToProps = actions

const NavigationPane = ({schemas, selectSchema}) => (
  <div data-aid="navigation-pane" className={style.navigationPane}>
    <h1>Wix Data</h1>
    <div>
      <h2>Collections</h2>
      {schemas.map(schema => {
        return <div
          data-aid="schema-link"
          key={schema.displayName}
          onClick={() => selectSchema(schema.displayName)}
        >
          {schema.displayName}
        </div>
      })}
    </div>
  </div>
)

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationPane)

