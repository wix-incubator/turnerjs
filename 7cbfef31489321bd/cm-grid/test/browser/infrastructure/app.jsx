'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const {createStore, applyMiddleware, combineReducers, compose} = require('redux')
const {Provider} = require('react-redux')
const ReduxThunk = require('redux-thunk').default
const serviceRepository = require('dbsm-common/src/service-container/services')
const ServiceContainer = require('dbsm-common/src/service-container/serviceContainer')
const createMediaManagerSupport = require('wix-code-media-manager-support/src/index')
const Raven = require('raven-js')
const {TOGGLE_COLUMN_VISIBILITY} = require('../../../src/actionTypes')

const gridReducer = require('../../../src/reducer')
const Grid = require('../../../src/app')
const {NAME} = require('../../../src/constants')

const createApp = ({wixData, schemaStructure}) => {

  const reducerRoot = combineReducers({
    [NAME]: gridReducer
  })
  
  const openMediaManager = () => {}
  const mediaManagerSupport = createMediaManagerSupport('http://fakedomain.com')

  const services = serviceRepository()
  services({
    schemaApi: {
      addField: () => {},
      updateField: () => {},
      removeField: () => {}
    },
    wixData,
    openMediaManager,
    mediaManagerSupport,
    Raven,
    staticsUrl: `${window.location.origin}/`
  })

  const store = createStore(reducerRoot, compose(
    applyMiddleware(ReduxThunk.withExtraArgument(services())),
    window && window.devToolsExtension ? window.devToolsExtension() : f => f)
  )
  
  // makes updatedDate and id columns visible by default so selenium can make assertions
  // This should be removed when ui-preferences for hidden columns is implemented.
  store.dispatch({
    type: TOGGLE_COLUMN_VISIBILITY,
    field: '_updatedDate',
    isHidden: false
  })
  store.dispatch({
    type: TOGGLE_COLUMN_VISIBILITY, 
    field: '_id',
    isHidden: false
  })

  return (
    <ServiceContainer services={services}>
      <Provider store={store}>
        <Grid schema={schemaStructure} />
      </Provider>
    </ServiceContainer>
  )

}

const wixData = window.wixData.wixData
window.elementorySupport.baseUrl = '/api'

wixData.getSchema().then(({schemas}) => {
  const schemaStructure = schemas[0]
  const collectionName = schemaStructure.displayName
  ReactDOM.render(createApp({wixData, collectionName, schemaStructure}), document.getElementById('cm-wrapper'))
})
