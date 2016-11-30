'use strict'

require('ignore-styles')
require('wix-data-testkit/lib/babelHelpers')
const {describe, it, beforeEach, afterEach, before, after} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const logUnhandledRejections = require('dbsm-common-test/src/logUnhandledRejections')
const prepareForFullRendering = require('dbsm-common-test/src/it/prepareForFullRendering')
const createApp = require('cm-fake-my-account-container/src/it/testSupport')
const testkit = require('wix-data-testkit/lib/testkit-factory')()
const {prepareWixDataServer} = require('cm-common-test/src/server/prepareServer')
const eventually = require('dbsm-common-test/src/eventually')

const createMyAccountAppDriver = require('./infrastructure/driver')

describe('cm-my-account-app column context menu', function() {
  this.timeout(4000)
  const {$} = prepareForFullRendering(beforeEach, afterEach)
  logUnhandledRejections(beforeEach, afterEach)

  const getSiteApps = (wixDataHost) => ({
    'cm-my-account-app': {
      jsUrl: require.resolve('./infrastructure/renderApp'),
      queryParameters: {wixDataHost}
    }
  })

  beforeEach(() => {
    testkit.givenSchemaForCollection('col', {displayName: 'col', fields: {
      firstName: {displayName: 'First Name', type: 'text'}
    }})
  })

  prepareWixDataServer(before, after, {router: testkit.getRouter()})
  afterEach(testkit.reset)

  it('should render column header context menu with right click', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    expect(gridDriver.isColumnContextMenuVisible()).to.be.false

    yield gridDriver.openColumnContextMenu(1)

    yield eventually(function() {
      expect(gridDriver.isColumnContextMenuVisible()).to.be.true
    })
  }))
  
  it('should render column header context menu with menu button', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    expect(gridDriver.isColumnContextMenuVisible()).to.be.false
    
    yield gridDriver.openColumnContextMenu(1, false)
    
    yield eventually(function() {
      expect(gridDriver.isColumnContextMenuVisible()).to.be.true
    })
  }))

  it('shoud not contain "manage properties" and "add column to schema" buttons', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()
    const contextMenuDriver = yield gridDriver.openColumnContextMenu(1)

    expect(contextMenuDriver.isManagePropertiesButtonVisible()).to.be.false
    expect(contextMenuDriver.isAddToSchemaButtonVisible()).to.be.false
  }))

  it('should hide column from context menu', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const columnsLength = gridDriver.getHeaderColumns().length

    expect(gridDriver.getRenderedColumnNames()).to.contain('firstName')

    const menuDriver = yield gridDriver.openColumnContextMenu(1)

    menuDriver.hide()

    expect(gridDriver.getHeaderColumns()).to.have.length.of(columnsLength - 1)
    expect(gridDriver.getRenderedColumnNames()).to.not.contain('firstName')
  }))
})
