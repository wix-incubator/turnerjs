'use strict'

require('ignore-styles')
require('wix-data-testkit/lib/babelHelpers')
const {describe, it, beforeEach, afterEach} = require('mocha')
const expect = require('chai').expect
const co = require('co')
const prepareForFullRendering = require('dbsm-common-test/src/it/prepareForFullRendering')
const eventually = require('dbsm-common-test/src/eventually')
const gridDriverCreator = require('cm-common-test/src/it/gridDriver')
const {createFakeSchema, createFakeCollection} = require('cm-common-test/src/it/wixDataHelpers')
const testkit = require('wix-data-testkit/lib/in-memory-testkit')()

const renderApp = require('./infrastructure/renderApp')

describe('manage properties', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  const schema = createFakeSchema({
    firstName: {displayName: 'First Name', type: 'text'},
    lastName: {displayName: 'Last Name', type: 'text'}
  })

  beforeEach(() => {
    testkit.setInitialData(createFakeCollection([
      {'email': 'mr@awesome.grid'}
    ]))
  })

  afterEach(testkit.reset)

  it('should render column properties correctly', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    expect(driver.isColumnPropertiesVisible()).to.be.false

    const columnPropertiesDriver = yield driver.openColumnProperties(1)

    yield eventually(function() {
      expect(columnPropertiesDriver.isDisplayNameInputVisible()).to.be.true
      expect(columnPropertiesDriver.isNameInputVisible()).to.be.true
      expect(columnPropertiesDriver.isTypeDropdownVisible()).to.be.true
      expect(columnPropertiesDriver.isSubmitButtonVisible()).to.be.true
      expect(columnPropertiesDriver.isCloseButtonVisible()).to.be.true
    })

    columnPropertiesDriver.submit()
    expect(driver.isColumnPropertiesVisible()).to.be.false
  }))

  it('should set input\'s value to the title of the clicked column',  co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const columnIndex = 1
    const expectedInput = driver.getColumnTitle(columnIndex)

    const columnPropertiesDriver = yield driver.openColumnProperties(columnIndex)

    yield eventually(function() {
      expect(columnPropertiesDriver.getDisplayNameInputValue()).to.equal(expectedInput)
    })
  }))

  it('should change column title', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const fieldKey = 'firstName'
    const columnIndex = driver.getColumnIndex(fieldKey)
    const columnPropertiesDriver = yield driver.openColumnProperties(columnIndex)

    const newTitle = 'new column title'

    columnPropertiesDriver.setTitleInputValue(newTitle)
    columnPropertiesDriver.submit()

    yield eventually(function() {
      expect(driver.getColumnTitle(columnIndex)).to.equal(newTitle)
    })
  }))

  it('should disable field type select for regular fields', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const fieldName = 'firstName'

    expect(driver.getColumnType(fieldName)).to.equal('text')

    const columnIndex = driver.getColumnIndex(fieldName)
    const columnPropertiesDriver = yield driver.openColumnProperties(columnIndex)

    yield eventually(function() {
      expect(columnPropertiesDriver.isTypeDropdownDisabled()).to.be.true
    })
  }))

  it('should render column header context menu for undefined field', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    expect(driver.isColumnContextMenuVisible()).to.be.false

    const index = driver.getColumnIndex('email')
    const menuDriver = yield driver.openColumnContextMenu(index)

    yield eventually(function() {
      expect(menuDriver.isAddToSchemaButtonVisible()).to.be.true
    })
  }))

  it('should convert undefined field to field', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const initialNumberOfColumns = driver.getRenderedColumnNames().length

    expect(driver.isColumnContextMenuVisible()).to.be.false

    const fieldName = 'email'
    const index = driver.getColumnIndex(fieldName)

    const addToSchemaDriver = yield driver.openAddToSchemaPanel(index)

    addToSchemaDriver.setTitleInputValue('Email')
    addToSchemaDriver.setType('richtext')
    addToSchemaDriver.submit()

    yield eventually(function() {
      expect(driver.getRenderedColumnNames().length).to.equal(initialNumberOfColumns)
      expect(driver.getColumnType(fieldName)).to.equal('richtext')
      expect(driver.getColumnTitle('Email'))
    })
  }))

  it('should close field properties panel when close button is clicked', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const columnPropertiesDriver = yield driver.openColumnProperties(1)

    columnPropertiesDriver.close()

    yield eventually(function() {
      expect(driver.isColumnPropertiesVisible()).to.be.false
    })
  }))

  it('should close context menu when close button is clicked', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const menuDriver = yield driver.openColumnContextMenu(1)

    menuDriver.close()

    yield eventually(function() {
      expect(driver.isColumnContextMenuVisible()).to.be.false
    })
  }))
})
