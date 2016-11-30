'use strict'

const React = require('react')
const {connect} = require('react-redux')

const {getSchemas, getSelectedSchema} = require('../rootReducer')
const NavigationPane = require('./navigationPane')
const GridContainer = require('../grid-container/gridContainer')
const style = require('./styles.scss')
const actions = require('./actions')

const mapStateToProps = state => ({
  schemas: getSchemas(state),
  selectedSchema: getSelectedSchema(state)
})

const mapDispatchToProps = actions

class AppContainer extends React.Component {
  
  componentWillMount() {
    this.props.loadSchemas()
  }
  
  render() {
    return (
      <div className={style.myAccountContainer}>
        <NavigationPane 
          schemas={this.props.schemas}
          onSchemaClick={this.props.selectedSchema} />

        <div data-aid="main-view" className={style.mainView}>
          {this.props.selectedSchema ? <GridContainer schema={this.props.selectedSchema} /> : null}
        </div>
      </div>
    )
  }
}

module.exports = connect(
  mapStateToProps, 
  mapDispatchToProps
)(AppContainer)
