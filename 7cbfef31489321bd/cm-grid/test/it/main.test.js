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

describe('grid', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  afterEach(testkit.reset)

  describe('rendering', function() {

    it('should render ag-grid', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([{}]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema())
      const driver = gridDriverCreator($, app)

      expect(driver.isGridRendered()).to.be.true
    }))

    it('should render rows', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([{}]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema())
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })
    }))

    it('should render columns which are not in schema', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {firstName: 'Foo', lastName: 'Bar', age: 20, isActive: false}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        firstName: {displayName: 'First name', type: 'string'},
        lastName: {displayName: 'Last name', type: 'string'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function*() {
        expect(driver.getRenderedColumnNames()).to.deep.equal([
          '_row', 'firstName', 'lastName', 'age', 'isActive'
        ])
      })
    }))
  })

  describe('show/hide columns', function() {
    it('should hide column from context menu', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        firstName: {displayName: 'First Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const columnsLength = driver.getHeaderColumns().length

      expect(driver.getRenderedColumnNames()).to.contain('firstName')

      const menuDriver = yield driver.openColumnContextMenu(1)

      menuDriver.hide()

      expect(driver.getHeaderColumns()).to.have.length.of(columnsLength - 1)
      expect(driver.getRenderedColumnNames()).to.not.contain('firstName')
    }))
  })

  describe('undiscoverable fields', function() {
    it('should not discover _ctorName field', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {_ctorName: '42'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema())

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const renderedColumnNames = driver.getRenderedColumnNames()

      expect(renderedColumnNames).to.not.contain('_ctorName')
    }))
  })

  describe('delete range', function() {
    it('should select and delete a range', co.wrap(function*() {
      const date = new Date(16, 11, 8)
      
      testkit.setInitialData(createFakeCollection([
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date},
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date},
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date},
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date},
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date},
        {firstName: 'First Name', lastName: 'Last Name', _updatedDate: date}
      ]))

      const schema = createFakeSchema({
        firstName: {displayName: 'First Name', type: 'text'},
        lastName: {displayName: 'Last Name', type: 'text'}
      })

      const {app} = renderApp($, testkit.getClient(), schema, {visibleColumns: ['_updatedDate']})

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const initialUpdatedDate = driver.getCellValue(2, '_updatedDate')

      driver.deleteRange(2, 'firstName', 4, 'lastName')

      yield eventually(function() {
        const firstName = driver.getCellValue(2, 'firstName')
        const lastName = driver.getCellValue(4, 'lastName')
        const updatedDate = driver.getCellValue(2, '_updatedDate')
        expect(firstName).to.equal('')
        expect(lastName).to.equal('')
        expect(updatedDate).not.to.equal(initialUpdatedDate)
      })
    }))
  })
  
  describe('column header', function() {
    it('should show lock icon for system fields', co.wrap(function*() {
      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        name: {displayName: '', type: 'string'}
      }), {visibleColumns: ['_id']})
    
      const driver = gridDriverCreator($, app)
      yield driver.waitUntilFullyRendered()
    
      expect(driver.isColumnLockIconVisible(driver.getColumnIndex('_id'))).to.be.true
      expect(driver.isColumnLockIconVisible(driver.getColumnIndex('name'))).to.be.false
    
    }))
  
    it('should show pin-lock icon for pinned system fields', co.wrap(function*() {
      const {app} = renderApp($, testkit.getClient(), createFakeSchema(), {visibleColumns: ['_id']})
      const driver = gridDriverCreator($, app)
      yield driver.waitUntilFullyRendered()
    
      const columnIndex = driver.getColumnIndex('_id')
    
      expect(driver.isColumnLockIconVisible(columnIndex)).to.be.true
      expect(driver.isColumnPinLockIconVisible(columnIndex)).to.be.false
    
      const columnContextMenuDriver = yield driver.openColumnContextMenu(columnIndex)
      columnContextMenuDriver.pin()
    
      expect(driver.isColumnLockIconVisible(columnIndex)).to.be.false
      expect(driver.isColumnPinLockIconVisible(columnIndex)).to.be.true
    }))
  })

  it('should show menu icon for unfiltered, unsorted column', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), createFakeSchema({
      name: {displayName: 'name', type: 'text'}
    }))

    const driver = gridDriverCreator($, app)
    yield driver.waitUntilFullyRendered()

    expect(driver.isColumnMenuIconVisible(driver.getColumnIndex('name'))).to.be.true
  }))
  
})

