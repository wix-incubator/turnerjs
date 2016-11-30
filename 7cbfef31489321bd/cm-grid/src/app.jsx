'use strict'

const React = require('react')

const WixDataSource = require('./data-source-wrappers/wixDatasource')
const AppContainer = require('./components/app-container/appContainer')
const {schemaLoaded} = require('./components/app-container/actions')
const {showPreloader, hidePreloader} = require('./components/preloader/actions')

const App = ({schema}, {store, services}) => {

  const wixData = services.wixData

  const collectionName = schema.displayName
  store.dispatch(schemaLoaded({fields: schema.fields, collectionName}))

  const dataSource = new WixDataSource({
    wixData,
    collectionName,
    showPreloader: () => showPreloader(store.dispatch, store.getState, 'Loading Data'),
    hidePreloader: () => hidePreloader(store.dispatch)
  })

  return (
    <AppContainer datasource={dataSource} />
  )
}

App.propTypes = {
  schema: React.PropTypes.object.isRequired
}

App.contextTypes = {
  store: React.PropTypes.object.isRequired,
  services: React.PropTypes.object.isRequired
}

module.exports = App
