'use strict'

require('ignore-styles')
require('wix-data-testkit/lib/babelHelpers')
const {describe, it, beforeEach, afterEach} = require('mocha')
const expect = require('chai').expect
const co = require('co')
const prepareForFullRendering = require('dbsm-common-test/src/it/prepareForFullRendering')
const gridDriverCreator = require('cm-common-test/src/it/gridDriver')
const eventually = require('dbsm-common/src/async/eventually')
const {createFakeSchema, createFakeCollection} = require('cm-common-test/src/it/wixDataHelpers')
const testkit = require('wix-data-testkit/lib/in-memory-testkit')()

const renderApp = require('./infrastructure/renderApp')

describe('column pinning', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  const schema = createFakeSchema({
    firstName: {displayName: 'First Name', type: 'text'},
    lastName: {displayName: 'Last Name', type: 'text'},
    balance: {displayName: 'balance', type: 'text'}
  })

  beforeEach(() => {
    testkit.setInitialData(createFakeCollection([]))
  })

  afterEach(testkit.reset)

  it('should pin & unpin column', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function*() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const fieldName = 'lastName'
    const initialIndex = driver.getColumnIndex(fieldName)
    const expectedIndexAfterPin = 1

    expect(driver.getRenderedColumnNames()[expectedIndexAfterPin]).to.not.equal(fieldName)

    expect(driver.isColumnPinIconVisible(initialIndex)).to.be.false

    const columnContextMenuDriver1 = yield driver.openColumnContextMenu(initialIndex)
    columnContextMenuDriver1.pin()

    yield eventually(function() {
      expect(driver.isColumnContextMenuVisible()).to.be.false
      expect(driver.getRenderedColumnNames()[expectedIndexAfterPin]).to.equal(fieldName)
      expect(driver.isColumnPinIconVisible(expectedIndexAfterPin)).to.be.true
    })

    const columnContextMenuDriver2 = yield driver.openColumnContextMenu(expectedIndexAfterPin)
    columnContextMenuDriver2.unpin()

    yield eventually(function() {
      expect(driver.isColumnContextMenuVisible()).to.be.false
      expect(driver.getRenderedColumnNames()[initialIndex]).to.equal(fieldName)
      expect(driver.isColumnPinIconVisible(initialIndex)).to.be.false
    })
  }))

  it('should pin multiple columns', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function*() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const fieldName = 'lastName'
    const columnIndex = driver.getColumnIndex(fieldName)
    const expectedIndexAfterPin = 1

    expect(driver.getRenderedColumnNames()[expectedIndexAfterPin]).to.not.equal(fieldName)

    expect(driver.isColumnPinIconVisible(columnIndex)).to.be.false

    const lastNameIndex = driver.getColumnIndex('lastName')
    const balanceIndex = driver.getColumnIndex('balance')

    const lastNameColumnContextMenuDriver = yield driver.openColumnContextMenu(lastNameIndex)
    lastNameColumnContextMenuDriver.pin()

    const balanceColumnContextMenuDriver = yield driver.openColumnContextMenu(balanceIndex)
    balanceColumnContextMenuDriver.pin()

    yield eventually(function() {
      const columnNames = driver.getRenderedColumnNames()
      expect(columnNames[1]).to.equal('lastName')
      expect(driver.isColumnPinIconVisible(1)).to.be.true
      expect(columnNames[2]).to.equal('balance')
      expect(driver.isColumnPinIconVisible(2)).to.be.true
    })
  }))
})
