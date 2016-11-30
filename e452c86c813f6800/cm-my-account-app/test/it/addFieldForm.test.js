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

describe('cm-my-account-app addFieldForm', function() {
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
      firstName: {displayName: 'First Name', type: 'text'},
      _id: {displayName: 'ID', type: 'text'}
    }})
  })

  prepareWixDataServer(before, after, {router: testkit.getRouter()})
  afterEach(testkit.reset)

  it('should show form when add column button is clicked', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    expect(gridDriver.isAddFieldFormVisible()).to.be.false
    const addFieldFormDriver = yield gridDriver.openAddFieldForm()

    yield eventually(function*() {
      expect(gridDriver.isAddFieldFormVisible()).to.be.true
      expect(addFieldFormDriver.isFieldKeyInputVisible()).to.be.true
      expect(addFieldFormDriver.isSubmitButtonVisible()).to.be.true
    })
  }))

  it('should sanitize and add undefined field to grid', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const addFieldFormDriver = yield gridDriver.openAddFieldForm()

    addFieldFormDriver.setFieldKey('Goat name')

    yield eventually(function*() {
      expect(addFieldFormDriver.isSubmitButtonVisible()).to.be.true
    })

    addFieldFormDriver.submit()
    
    yield eventually(function*() {
      expect(gridDriver.getRenderedColumnNames()).to.contain('goat_name')
      expect(gridDriver.isAddFieldFormVisible()).to.be.false
    })

  }))

  it('should disable submit button if field key is not valid and show error message', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()
    const addFieldFormDriver = yield gridDriver.openAddFieldForm()

    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.false
    expect(addFieldFormDriver.isErrorMessageForInvalidKeyVisible()).to.be.false

    addFieldFormDriver.setFieldKey('123')
    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.false
    expect(addFieldFormDriver.isErrorMessageForInvalidKeyVisible()).to.be.true

    addFieldFormDriver.setFieldKey('')
    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.false
    expect(addFieldFormDriver.isErrorMessageForInvalidKeyVisible()).to.be.true

    addFieldFormDriver.setFieldKey('!1a &?') // this is sanitized to a valid key 'a_'
    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.true
    expect(addFieldFormDriver.isErrorMessageForInvalidKeyVisible()).to.be.false
  }))

  it('should disable submit button if field key exists and show error message', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()
    const addFieldFormDriver = yield gridDriver.openAddFieldForm()

    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.false
    expect(addFieldFormDriver.isErrorMessageForInvalidKeyVisible()).to.be.false

    addFieldFormDriver.setFieldKey('_id')
    expect(addFieldFormDriver.isSubmitButtonEnabled()).to.be.false
    expect(addFieldFormDriver.isErrorMessageForExistingKeyVisible()).to.be.true
  }))

  it('should close form when "X" is pressed inside it', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const addFieldFormDriver = yield gridDriver.openAddFieldForm()
    addFieldFormDriver.close()

    yield eventually(function*() {
      expect(gridDriver.isAddFieldFormVisible()).to.be.false
    })
  }))

  it('should clear the form when it is closed', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    let addFieldFormDriver = yield gridDriver.openAddFieldForm()
    addFieldFormDriver.setFieldKey('key')
    addFieldFormDriver.close()
    addFieldFormDriver = yield gridDriver.openAddFieldForm()
    const fieldKey = addFieldFormDriver.getFieldKey()

    expect(fieldKey).to.equal('')
  }))

  it('should clear the form when it is submitted', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    let addFieldFormDriver = yield gridDriver.openAddFieldForm()
    addFieldFormDriver.setFieldKey('key')
    addFieldFormDriver.submit()
    addFieldFormDriver = yield gridDriver.openAddFieldForm()
    const fieldKey = addFieldFormDriver.getFieldKey()

    expect(fieldKey).to.equal('')
  }))

})
