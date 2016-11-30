'use strict'

require('ignore-styles')
require('wix-data-testkit/lib/babelHelpers')
const {describe, it, beforeEach, afterEach, before, after} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const logUnhandledRejections = require('dbsm-common-test/src/logUnhandledRejections')
const prepareForFullRendering = require('dbsm-common-test/src/it/prepareForFullRendering')
const eventually = require('dbsm-common-test/src/eventually')
const createApp = require('cm-fake-my-account-container/src/it/testSupport')
const testkit = require('wix-data-testkit/lib/testkit-factory')()
const {prepareWixDataServer} = require('cm-common-test/src/server/prepareServer')

const createMyAccountAppDriver = require('./infrastructure/driver')

describe('cm-my-account-app it', function() {
  this.timeout(4000)
  const {$} = prepareForFullRendering(beforeEach, afterEach)
  logUnhandledRejections(beforeEach, afterEach)

  const getSiteApps = (wixDataHost) => ({
    'cm-my-account-app': {
      jsUrl: require.resolve('./infrastructure/renderApp'),
      queryParameters: {wixDataHost}
    }
  })

  prepareWixDataServer(before, after, {router: testkit.getRouter()})
  afterEach(testkit.reset)

  describe('collections', function() {

    beforeEach(() => {
      testkit.givenSchemaForCollection('collection-1', {displayName: 'collection-1', fields: {}})
      testkit.givenSchemaForCollection('collection-2', {displayName: 'collection-2', fields: {}})
      testkit.givenSchemaForCollection('collection-3', {displayName: 'collection-3', fields: {}})
      testkit.setInitialData({
        'collection-1': [{name: 'Foo'}]
      })
    })

    it('should render collections list', co.wrap(function*() {
      const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

      const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

      const navDriver = createMyAccountAppDriver($, appComponent)
      
      yield eventually(function*() {
        expect(navDriver.getRenderedSchemaNames()).to.deep.equal(['collection-1', 'collection-2', 'collection-3'])
      })
    }))

    it('should open cm-grid when collection is clicked', co.wrap(function*() {
      const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

      const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

      const navDriver = createMyAccountAppDriver($, appComponent)
      yield navDriver.waitForSchemasToLoad()
  
      const gridDriver = yield navDriver.selectSchema(0)
      
      yield eventually(function*() {
        expect(gridDriver.doesGridShowRows()).to.be.true
        expect(gridDriver.getCellValue(0, 'name')).to.equal('Foo')
      })
    }))
  })
})
