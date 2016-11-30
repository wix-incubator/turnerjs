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
const constants = require('../../src/constants')
const filters = constants.AG_GRID.FILTER

describe('preloader', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  const schema = createFakeSchema({
    firstName: {displayName: 'First Name', type: 'text'}
  })

  beforeEach(() => {
    testkit.setInitialData(createFakeCollection([{}]))
  })

  afterEach(testkit.reset)
  
  it('should show the preloader when loading data', co.wrap(function*() {
    testkit.givenHook('mainCollection', testkit.hooks.BEFORE_QUERY_HOOK, () => new Promise(resolve => {}))
    
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
    
    yield eventually(function() {
      expect(driver.isGridRendered()).to.be.true
      expect(driver.isPreloaderVisible()).to.be.true
    })
  }))
  
  it('should hide the preloader when data is loaded', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
    
    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
      expect(driver.isPreloaderVisible()).to.be.false
    })
  }))
  
  it('should show the preloader when sorting', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
  
    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })
    
    expect(driver.isPreloaderVisible()).to.be.false
  
    testkit.givenHook('mainCollection', testkit.hooks.BEFORE_QUERY_HOOK, () => new Promise(resolve => {}))
  
    const menuDriver = yield driver.openColumnContextMenu(1)
  
    yield menuDriver.sortColumnByDirection('asc')
    
    yield eventually(function() {
      expect(driver.isPreloaderVisible()).to.be.true
    })
  }))
  
  it('should hide the preloader when sorting is finished', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
    
    expect(driver.isGridRendered()).to.be.true
    
    const menuDriver = yield driver.openColumnContextMenu(1)
    
    yield menuDriver.sortColumnByDirection('asc')
    
    yield eventually(function() {
      expect(driver.isPreloaderVisible()).to.be.false
    })
  }))
  
  it('should show the preloader when filtering', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
    
    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })
    
    expect(driver.isPreloaderVisible()).to.be.false

    testkit.givenHook('mainCollection', testkit.hooks.BEFORE_QUERY_HOOK, () => new Promise(resolve => {}))

    const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('firstName'))
  
    panelDriver.setFormCondition(filters.NUMBER.TYPE.EQUALS)
    panelDriver.setFormConditionValue('42')
  
    yield eventually(function() {
      expect(driver.isPreloaderVisible()).to.be.true
    })
  }))
  
  it('should hide the preloader when filtering is finished', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)
    const driver = gridDriverCreator($, app)
    
    expect(driver.isGridRendered()).to.be.true
  
    const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('firstName'))
  
    panelDriver.setFormCondition(filters.NUMBER.TYPE.EQUALS)
    panelDriver.setFormConditionValue('42')
    
    yield eventually(function() {
      expect(driver.isPreloaderVisible()).to.be.false
    })
  }))
})
