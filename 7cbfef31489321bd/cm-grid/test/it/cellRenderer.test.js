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

describe('cell renderers', function() {
  this.timeout(4000)
  const {$} = prepareForFullRendering(beforeEach, afterEach)

  afterEach(testkit.reset)

  it('boolean', co.wrap(function*() {
    testkit.setInitialData(createFakeCollection([
      {isActive: true, _createdDate: new Date(2016, 10, 20, 1)},
      {isActive: false, _createdDate: new Date(2016, 10, 20, 0)}
    ]))

    const {app} = renderApp($, testkit.getClient(), createFakeSchema({
      isActive: {displayName: 'Active', type: 'boolean'}
    }))

    const driver = gridDriverCreator($, app)

    yield eventually(function*() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const booleanRenderers = driver.getBooleanRenderers()
    expect(booleanRenderers.length).to.not.equal(0)
    expect(booleanRenderers.eq(0).text()).to.equal('V')
    expect(booleanRenderers.eq(1).text()).to.equal('')
  }))

  describe('datetime renderer', function() {
    it('should render both date and time strings', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {date: new Date('6/26/2014 01:33')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        date: {displayName: 'Date', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function*() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const dateTimeValues = driver.getDateTimeRendererValues()

      const {date, time} = dateTimeValues.pop()

      expect(date.trim()).to.equal('06/26/2014')
      expect(time.trim()).to.equal('01:33')
    }))
  })

  it('should render objects as {...}', co.wrap(function*() {
    testkit.setInitialData(createFakeCollection([
      {object: {}}
    ]))

    const {app} = renderApp($, testkit.getClient(), createFakeSchema({}))

    const driver = gridDriverCreator($, app)

    yield eventually(function*() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const objectValues = driver.getJsonRendererValues()

    expect(objectValues[0]).to.equal('{...}')
  }))

  it('should render arrays as [...]', co.wrap(function*() {
    testkit.setInitialData(createFakeCollection([
      {array: []}
    ]))

    const {app} = renderApp($, testkit.getClient(), createFakeSchema({}))

    const driver = gridDriverCreator($, app)

    yield eventually(function*() {
      expect(driver.doesGridShowRows()).to.be.true
    })

    const arrayValues = driver.getJsonRendererValues()

    expect(arrayValues[0]).to.equal('[...]')
  }))
})
