'use strict'

const React = require('react')
const {createStore, applyMiddleware, compose} = require('redux')
const {Provider} = require('react-redux')
const ReduxThunk = require('redux-thunk').default
const serviceRepository = require('dbsm-common/src/service-container/services')
const ServiceContainer = require('dbsm-common/src/service-container/serviceContainer')
const sendStateOnError = require('dbsm-common/src/raven/sendStateOnError')
const ravenMiddleware = require('dbsm-common/src/raven/middleware')
const createMediaManagerSupport = require('wix-code-media-manager-support/src/index')

const AppContainer = require('./app-container/appContainer')
const rootReducer = require('./rootReducer')

module.exports = ({wixData, devToolsExtension, staticsUrl, Raven, staticMediaUrl, myAccountSDK}) => {
  
  const openMediaManager = () => {
    return new Promise(resolve => {
      myAccountSDK.Dashboard.openMediaDialog(myAccountSDK.Settings.MediaType.IMAGE, false, result => resolve([result]))
    })
  }
  const mediaManagerSupport = createMediaManagerSupport(staticMediaUrl)
  
  const services = serviceRepository()
  services({
    schemaApi: {
      addField: () => {},
      updateField: () => {},
      removeField: () => {}
    },
    syncApi: {
      copyDevToPublic: () => Promise.resolve()
    },
    wixData,
    openMediaManager,
    mediaManagerSupport,
    staticsUrl,
    Raven,
    staticMediaUrl
  })
  
  const store = createStore(rootReducer, compose(
    applyMiddleware(ReduxThunk.withExtraArgument(services()), ravenMiddleware(Raven)),
    devToolsExtension ? devToolsExtension() : f => f)
  )
  
  sendStateOnError(Raven, store)
  
  return (
    <ServiceContainer services={services}>
      <Provider store={store}>
        <AppContainer />
      </Provider>
    </ServiceContainer>
  )
}
