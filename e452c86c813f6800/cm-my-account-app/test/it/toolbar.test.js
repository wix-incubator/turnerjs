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

describe('cm-my-account-app toolbar', function() {
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
      lastName: {displayName: 'Last Name', type: 'text'},
      profilePicture: {displayName: 'Profile picture', type: 'image'}
    }})
  })

  prepareWixDataServer(before, after, {router: testkit.getRouter()})
  afterEach(testkit.reset)

  it('should open filter panel from toolbar', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()
    
    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const filterPanelDriver = yield gridDriver.openFilterPanel()
    yield filterPanelDriver.openForm()

    yield eventually(function () {
      expect(filterPanelDriver.isFormFieldSelectVisible()).to.be.true
      expect(filterPanelDriver.isFormConditionSelectVisible()).to.be.true
      expect(filterPanelDriver.isFormValueInputVisible()).to.be.true
      expect(filterPanelDriver.isFormBackButtonVisible()).to.to.be.true
    })

    yield filterPanelDriver.closeForm()
  }))

  it('should add several filters using filter panel', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const filterPanelDriver = yield gridDriver.openFilterPanel()

    expect(filterPanelDriver.getList()).to.have.length.of(0)

    yield filterPanelDriver.openForm()

    filterPanelDriver.setFormField('firstName')
    filterPanelDriver.setFormCondition('contains')
    filterPanelDriver.setFormConditionValue('value')

    yield filterPanelDriver.closeForm()

    expect(filterPanelDriver.getList()).to.have.length.of(1)

    yield filterPanelDriver.openForm()

    filterPanelDriver.setFormField('profilePicture')
    filterPanelDriver.setFormCondition('contains')
    filterPanelDriver.setFormConditionValue('value')

    yield filterPanelDriver.closeForm()

    const list = filterPanelDriver.getList()

    expect(list).to.have.length.of(2)

    expect(list[0]).to.equal('First Name contains text "value"')
    expect(list[1]).to.equal('Profile picture contains text "value"')
  }))

  it('should hide and show a column', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    expect(gridDriver.getRenderedColumnNames()).to.deep.equal(['_row', 'firstName', 'lastName', 'profilePicture'])

    const propertiesDriver = yield gridDriver.openToggleColumnsPanel()

    propertiesDriver.toggle('_id')

    yield eventually(function*() {
      expect(gridDriver.getRenderedColumnNames()).to.deep.equal(['_row', '_id', 'firstName', 'lastName', 'profilePicture'])
    })

    propertiesDriver.toggle('_id')

    yield eventually(function*() {
      expect(gridDriver.getRenderedColumnNames()).to.deep.equal(['_row', 'firstName', 'lastName', 'profilePicture'])
    })
  }))
 
  it('should delete a row', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const propertiesDriver = yield gridDriver.openToggleColumnsPanel()
    propertiesDriver.toggle('_id')

    const firstRowId = gridDriver.getCellValue(0, '_id')
    const secondRowId = gridDriver.getCellValue(1, '_id')

    gridDriver.deleteRow(firstRowId)

    yield eventually(function*() {
      // when first row is deleted second row moves into its position
      expect(gridDriver.getCellValue(0, '_id')).to.equal(secondRowId)
    })
  })) 

  it('should add sort by _createdDate desc by default', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const sortPanelDriver = yield gridDriver.openSortPanel()

    const sortList = sortPanelDriver.getSortList()

    expect(sortList.length).to.equal(1)
    expect(sortList[0]).to.equal('Created: Z -> A')
  }))

  it('should hide "remove sort" button when there is no sort applied', co.wrap(function*() {

    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))
    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')
    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const sortPanelDriver = yield gridDriver.openSortPanel()

    expect(sortPanelDriver.isSortButtonVisible()).to.be.true
    sortPanelDriver.removeAllSorts()

    yield eventually(function() {
      expect(sortPanelDriver.isSortButtonVisible()).to.be.false
    })
  }))

  it('should render toolbar sort button and sort panel correctly', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const sortPanelDriver = yield gridDriver.openSortPanel()

    sortPanelDriver.removeAllSorts()
    sortPanelDriver.listIsEmpty()
    sortPanelDriver.openForm()

    const selectedFieldTitle = sortPanelDriver.getFieldTitle()

    sortPanelDriver.setOrder('desc')
    sortPanelDriver.closeForm()

    const sortList = sortPanelDriver.getSortList()
    expect(sortList.length).to.equal(1)
    expect(sortList[0]).to.equal(selectedFieldTitle + ': Z -> A')

    sortPanelDriver.removeAllSorts()
    expect(sortPanelDriver.getSortList().length).to.equal(0)
  }))

  it('should add sort and then edit it through sort panel', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const sortPanelDriver = yield gridDriver.openSortPanel()
    sortPanelDriver.removeAllSorts()
    sortPanelDriver.openForm()

    const selectedFieldTitle = sortPanelDriver.getFieldTitle()
    sortPanelDriver.setOrder('desc')
    sortPanelDriver.closeForm()

    let sortList = sortPanelDriver.getSortList()
    expect(sortList.length).to.equal(1)
    expect(sortList[0]).to.equal(selectedFieldTitle + ': Z -> A')

    sortPanelDriver.editSort(0)
    sortPanelDriver.formIsPresent()
    expect(sortPanelDriver.getOrder()).to.equal('desc')

    sortPanelDriver.setOrder('asc')
    sortPanelDriver.closeForm()

    sortList = sortPanelDriver.getSortList()
    expect(sortList.length).to.equal(1)
    expect(sortList[0]).to.equal(selectedFieldTitle + ': A -> Z')
  }))

  it('should add multiple sort using sort panel and then remove one of them', co.wrap(function*() {
    const {myAccountDriver} = createApp.startFakeMyAccount($, getSiteApps(this.wixDataHost))

    const appComponent = yield myAccountDriver.openApp('cm-my-account-app')

    const navDriver = createMyAccountAppDriver($, appComponent)
    yield navDriver.waitForSchemasToLoad()

    const gridDriver = yield navDriver.selectSchema(0)
    yield gridDriver.waitUntilFullyRendered()

    const sortPanelDriver = yield gridDriver.openSortPanel()
    sortPanelDriver.removeAllSorts()
    sortPanelDriver.openForm()

    const selectedFieldTitles = []
    selectedFieldTitles.push(sortPanelDriver.getFieldTitle())
    sortPanelDriver.setOrder('desc')

    sortPanelDriver.closeForm()
    sortPanelDriver.openForm()

    sortPanelDriver.setFieldTitle('lastName')
    selectedFieldTitles.push(sortPanelDriver.getFieldTitle())
    sortPanelDriver.setOrder('desc')

    sortPanelDriver.closeForm()

    let sortList = sortPanelDriver.getSortList()
    expect(sortList.length).to.equal(2)

    expect(sortList).to.deep.equal(selectedFieldTitles.map(fieldName => fieldName + ': Z -> A'))

    const firstNameIndex = gridDriver.getColumnIndex('firstName')
    const lastNameIndex = gridDriver.getColumnIndex('lastName')

    expect(gridDriver.isColumnSortUpIndexIconVisible(firstNameIndex)).to.be.true
    expect(gridDriver.getColumnSortIndex(firstNameIndex)).to.equal('1')
    expect(gridDriver.isColumnSortUpIndexIconVisible(lastNameIndex)).to.be.true
    expect(gridDriver.getColumnSortIndex(lastNameIndex)).to.equal('2')

    sortPanelDriver.editSort(0)
    sortPanelDriver.removeSort()

    sortList = sortPanelDriver.getSortList()
    expect(sortList.length).to.equal(1)
    expect(sortList[0]).to.equal(selectedFieldTitles[1] + ': Z -> A')

    expect(gridDriver.isColumnSortUpIndexIconVisible(firstNameIndex)).to.be.false
    expect(gridDriver.isColumnSortUpIconVisible(lastNameIndex)).to.be.true
  }))
})
