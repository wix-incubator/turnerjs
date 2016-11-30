'use strict'

require('ignore-styles')
require('wix-data-testkit/lib/babelHelpers')
const {describe, it, beforeEach, afterEach} = require('mocha')
const expect = require('chai').expect
const co = require('co')
const prepareForFullRendering = require('dbsm-common-test/src/it/prepareForFullRendering')
const gridDriverCreator = require('cm-common-test/src/it/gridDriver')
const eventually = require('dbsm-common-test/src/eventually')
const {createFakeSchema, createFakeCollection} = require('cm-common-test/src/it/wixDataHelpers')
const testkit = require('wix-data-testkit/lib/in-memory-testkit')()

const renderApp = require('./infrastructure/renderApp')

describe('sort', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  const schema = createFakeSchema({
    firstName: {displayName: 'First Name', type: 'text'}
  })

  beforeEach(() => {
    testkit.setInitialData(createFakeCollection([
      {firstName: 'Tomas', _createdDate: new Date(2016, 10, 20, 5)},
      {firstName: 'Adomas', _createdDate: new Date(2016, 10, 20, 4)},
      {firstName: 'Petras', _createdDate: new Date(2016, 10, 20, 3)},
      {firstName: 'Jonas', _createdDate: new Date(2016, 10, 20, 2)},
      {firstName: 'Catherine', _createdDate: new Date(2016, 10, 20, 1)}
    ]))
  })

  afterEach(testkit.reset)

  it('should sort columns by ascending order', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })
    const menuDriver = yield driver.openColumnContextMenu(1)
    yield menuDriver.sortColumnByDirection('asc')
    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const firstNames = driver.getRowValues('firstName')

    expect(isSorted(firstNames, function(a, b) {
      return a < b
    })).to.equal(true)
  }))

  it('should sort columns by descending order', co.wrap(function*() {
    const {app} = renderApp($, testkit.getClient(), schema)

    const driver = gridDriverCreator($, app)

    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })
    const menuDriver = yield driver.openColumnContextMenu(1)
    yield menuDriver.sortColumnByDirection('desc')
    yield eventually(function() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const firstNames = driver.getRowValues('firstName')

    expect(isSorted(firstNames, function(a, b) {
      return a > b
    })).to.equal(true)
  }))
})

function isSorted(items, compare) {

  const reduceByComparing = items.reduce((previousValue, currentValue) => {
    if (previousValue === false) {
      return false
    }

    if (compare(previousValue, currentValue)) {
      return currentValue
    }

    return false
  })

  return reduceByComparing !== false
}
