'use strict'

const React = require('react')
const {render, findDOMNode} = require('react-dom')
const {createStore, combineReducers, applyMiddleware} = require('redux')
const ReduxThunk = require('redux-thunk').default
const {Provider} = require('react-redux')
const serviceRepository = require('dbsm-common/src/service-container/services')
const ServiceContainer = require('dbsm-common/src/service-container/serviceContainer')
const createMediaManagerSupport = require('wix-code-media-manager-support/src/index')

const {TOGGLE_COLUMN_VISIBILITY} = require('../../../src/actionTypes')
const gridReducer = require('../../../src/reducer')
const {NAME} = require('../../../src/constants')

const createApp = ({wixData, schema, schemaApi, syncApi, visibleColumns}) => {
  // ag-grid import causes side effects which will produce errors
  // unless we require it after jsdom is set up
  const Grid = require('../../../src/app')

  const reducerRoot = combineReducers({
    [NAME]: gridReducer
  })
  
  const openMediaManager = () => {}
  const mediaManagerSupport = createMediaManagerSupport('http://fakedomain.com')

  const services = serviceRepository()
  services({schemaApi, syncApi, wixData, openMediaManager, mediaManagerSupport})

  const store = createStore(reducerRoot, applyMiddleware(ReduxThunk.withExtraArgument(services())))

  visibleColumns.forEach(key =>
    store.dispatch({
      type: TOGGLE_COLUMN_VISIBILITY,
      field: key,
      isHidden: false
    })
  )

  return (
    <ServiceContainer services={services}>
      <Provider store={store}>
        <Grid schema={schema} />
      </Provider>
    </ServiceContainer>
  )

}

const fakeSchemaApi = {
  addField: () => {},
  updateField: () => {},
  removeField: () => {}
}

const fakeSyncApi = {
  copyDevToPublic: () => Promise.resolve()
}

module.exports = ($, wixData, schema, {schemaApi, syncApi, visibleColumns} = {schemaApi: fakeSchemaApi, syncApi: fakeSyncApi, visibleColumns: []}) => {
  const component = render(createApp({wixData, schema, schemaApi, syncApi, visibleColumns}), document.getElementById('mount-point'))

  return {
    app: $(findDOMNode(component))
  }
}
