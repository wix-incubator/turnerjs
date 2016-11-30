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

describe('filter', function() {
  const {$} = prepareForFullRendering(beforeEach, afterEach)
  const filters = constants.AG_GRID.FILTER

  afterEach(testkit.reset)

  describe('numbers', function() {
    it('should filter by `equal` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {age: 19},
        {age: 20},
        {age: 21},
        {age: 22},
        {age: 23}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        age: {displayName: 'Age', type: 'number'}
      }))

      const filterValue = '21'
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('age'))

      panelDriver.setFormCondition(filters.NUMBER.TYPE.EQUALS)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('age')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.equal(filterValue))
    }))

    it('should filter by `less than` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {age: 19},
        {age: 20},
        {age: 21},
        {age: 22},
        {age: 23}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        age: {displayName: 'Age', type: 'number'}
      }))

      const filterValue = '21'
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('age'))

      panelDriver.setFormCondition(filters.NUMBER.TYPE.LESS_THAN)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('age')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.be.below(filterValue))
    }))

    it('should filter by `less than or equal` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {age: 19},
        {age: 20},
        {age: 21},
        {age: 22},
        {age: 23}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        age: {displayName: 'Age', type: 'number'}
      }))

      const filterValue = '21'
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('age'))

      panelDriver.setFormCondition(filters.NUMBER.TYPE.LESS_THAN_OR_EQUAL)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('age')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.be.below(22))
    }))

    it('should filter by `greater than` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {age: 19},
        {age: 20},
        {age: 21},
        {age: 22},
        {age: 23}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        age: {displayName: 'Age', type: 'number'}
      }))

      const filterValue = '21'
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('age'))

      panelDriver.setFormCondition(filters.NUMBER.TYPE.GREATER_THAN)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('age')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.be.above(filterValue))
    }))

    it('should filter by `greater than or equal` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {age: 19},
        {age: 20},
        {age: 21},
        {age: 22},
        {age: 23}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        age: {displayName: 'Age', type: 'number'}
      }))

      const filterValue = '21'
      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('age'))

      panelDriver.setFormCondition(filters.NUMBER.TYPE.GREATER_THAN_OR_EQUAL)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('age')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.be.at.least(filterValue))
    }))
  })

  describe('text', function() {
    it('should filter by `contains` condition', co.wrap(function*() {
      const filterValue = 'hang'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.CONTAINS)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.contain(filterValue))
    }))

    it('should filter by `ends with` condition', co.wrap(function*() {
      const filterValue = 'ang'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.ENDS_WITH)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value.toLowerCase().endsWith(filterValue)))
    }))

    it('should filter by `equals` condition', co.wrap(function*() {
      const filterValue = 'brown'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.EQUALS)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.equal(filterValue))
    }))

    it('should filter by `greater than or equal` condition', co.wrap(function*() {
      const filterValue = 'brown'
      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.GREATER_THAN_OR_EQUAL)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value >= filterValue))
    }))

    it('should filter by `greater than` condition', co.wrap(function*() {
      const filterValue = 'arown'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.GREATER_THAN)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value > filterValue))
    }))

    it('should filter by `less than or equal` condition', co.wrap(function*() {
      const filterValue = 'brown'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.LESS_THAN_OR_EQUAL)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value <= filterValue))
    }))

    it('should filter by `less than` condition', co.wrap(function*() {
      const filterValue = 'brown'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.LESS_THAN)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value < filterValue))
    }))

    it('should filter by `starts with` condition', co.wrap(function*() {
      const filterValue = 'chan'

      testkit.setInitialData(createFakeCollection([
        {lastName: 'Chang'},
        {lastName: 'brown'}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        lastName: {displayName: 'Last Name', type: 'text'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('lastName'))

      panelDriver.setFormCondition(filters.TEXT.TYPE.STARTS_WITH)
      panelDriver.setFormConditionValue(filterValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('lastName')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => value.toLowerCase().startsWith(filterValue)))
    }))
  })

  describe('datetime', function() {
    it('should filter by `equals` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const filterDateValue = '2/13/2016'
      const filterTimeValue = '18:53'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.EQUALS)
      panelDriver.setFormDateCondition(filterDateValue, filterTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const expected = new Date(filterDateValue + ' ' + filterTimeValue)

        expect(actual.getTime()).to.equal(expected.getTime())
      })
    }))

    it('should filter by `greater than or equal` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const filterDateValue = '2/13/2016'
      const filterTimeValue = '18:53'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.GREATER_THAN_OR_EQUAL)
      panelDriver.setFormDateCondition(filterDateValue, filterTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const expected = new Date(filterDateValue + ' ' + filterTimeValue)

        expect(actual.getTime()).to.be.at.least(expected.getTime())
      })
    }))

    it('should filter by `greater than` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const filterDateValue = '2/13/2016'
      const filterTimeValue = '18:53'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.GREATER_THAN)
      panelDriver.setFormDateCondition(filterDateValue, filterTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const expected = new Date(filterDateValue + ' ' + filterTimeValue)

        expect(actual.getTime()).to.be.above(expected.getTime())
      })
    }))

    it('should filter by `less than or equal` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const filterDateValue = '2/13/2016'
      const filterTimeValue = '18:53'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.LESS_THAN_OR_EQUAL)
      panelDriver.setFormDateCondition(filterDateValue, filterTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const expected = new Date(filterDateValue + ' ' + filterTimeValue)

        expect(actual.getTime() <= expected.getTime()).to.be.true
      })
    }))

    it('should filter by `less than` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const filterDateValue = '2/13/2016'
      const filterTimeValue = '18:53'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.LESS_THAN)
      panelDriver.setFormDateCondition(filterDateValue, filterTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const expected = new Date(filterDateValue + ' ' + filterTimeValue)

        expect(actual.getTime()).to.be.below(expected.getTime())
      })
    }))

    it('should filter by `between` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)
      const fromDateValue = '2/13/2016'
      const fromTimeValue = '18:52'
      const toDateValue = '2/13/2016'
      const toTimeValue = '18:54'

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.BETWEEN)
      panelDriver.setFormDateFromCondition(fromDateValue, fromTimeValue)
      panelDriver.setFormDateToCondition(toDateValue, toTimeValue)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => {
        const actual = new Date(value)
        const from = new Date(fromDateValue + ' ' + fromTimeValue)
        const to = new Date(toDateValue + ' ' + toTimeValue)

        expect(from < actual && actual < to).to.be.true
      })
    }))

    it('should filter by `tomorrow` condition ', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.TOMORROW)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const tomorrow = getTomorrow()
      const start = getDayStart(tomorrow)
      const end = getDayEnd(tomorrow)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return start < date && date < end
      }))
    }))

    it('should filter by `today` condition ', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.TODAY)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const today = new Date()
      const start = getDayStart(today)
      const end = getDayEnd(today)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return start < date && date < end
      }))
    }))

    it('should filter by `yesterday` condition ', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.YESTERDAY)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const yesterday = getYesterday()
      const yesterdayStart = getDayStart(yesterday)
      const yesterdayEnd = getDayEnd(yesterday)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return yesterdayStart < date && date < yesterdayEnd
      }))
    }))

    it('should filter by `next week` condition ', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.NEXT_WEEK)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const nextWeek = getNextWeek()
      const nextWeekStart = getWeekStart(nextWeek)
      const nextWeekEnd = getWeekEnd(nextWeek)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return nextWeekStart < date && date < nextWeekEnd
      }))
    }))

    it('should filter by `last week` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.LAST_WEEK)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const lastWeek = getLastWeek()
      const lastWeekStart = getWeekStart(lastWeek)
      const lastWeekEnd = getWeekEnd(lastWeek)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return lastWeekStart < date && date < lastWeekEnd
      }))
    }))

    it('should filter by `current week` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.CURRENT_WEEK)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const currentWeek = new Date()
      const currentWeekStart = getWeekStart(currentWeek)
      const currentWeekEnd = getWeekEnd(currentWeek)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return currentWeekStart < date && date < currentWeekEnd
      }))
    }))

    it('should filter by `next month` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.NEXT_MONTH)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const nextMonth = getNextMonth()
      const nextMonthStart = getMonthStart(nextMonth)
      const nextMonthEnd = getMonthEnd(nextMonth)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return nextMonthStart < date && date < nextMonthEnd
      }))
    }))

    it('should filter by `current month` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.CURRENT_MONTH)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const currentMonth = new Date()
      const currentMonthStart = getMonthStart(currentMonth)
      const currentMonthEnd = getMonthEnd(currentMonth)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return currentMonthStart < date && date < currentMonthEnd
      }))
    }))

    it('should filter by `last month` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.LAST_MONTH)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const lastMonth = getLastMonth()
      const lastMonthStart = getMonthStart(lastMonth)
      const lastMonthEnd = getMonthEnd(lastMonth)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return lastMonthStart < date && date < lastMonthEnd
      }))
    }))

    it('should filter by `next year` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.NEXT_YEAR)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const nextYear = getNextYear()
      const nextYearStart = getYearStart(nextYear)
      const nextYearEnd = getYearEnd(nextYear)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return nextYearStart < date && date < nextYearEnd
      }))
    }))

    it('should filter by `this year` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.THIS_YEAR)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const thisYear = new Date()
      const thisYearStart = getYearStart(thisYear)
      const thisYearEnd = getYearEnd(thisYear)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return thisYearStart < date && date < thisYearEnd
      }))
    }))

    it('should filter by `last year` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {registered: getTomorrow()},
        {registered: new Date()},
        {registered: getYesterday()},
        {registered: getNextWeek()},
        {registered: getLastWeek()},
        {registered: getNextMonth()},
        {registered: getLastMonth()},
        {registered: getNextYear()},
        {registered: getLastYear()},
        {registered: new Date('Saturday, February 13, 2016 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2000 6:53 PM')},
        {registered: new Date('Saturday, February 13, 2026 6:53 PM')}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      panelDriver.setFormCondition(filters.DATETIME.TYPE.LAST_YEAR)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const filteredItems = driver.getNonEmptyColumnValues('registered')

      const lastYear = getLastYear()
      const lastYearStart = getYearStart(lastYear)
      const lastYearEnd = getYearEnd(lastYear)

      expect(filteredItems.length).not.to.equal(0)
      filteredItems.forEach(value => expect(value).to.satisfy(value => {
        const date = new Date(value)

        return lastYearStart < date && date < lastYearEnd
      }))
    }))

    it('should show a time picker when editing time', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        registered: {displayName: 'Registered', type: 'datetime'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('registered'))

      const timePickerDriver = panelDriver.getFormTimeConditionDriver()

      expect(timePickerDriver.isTimePickerSelectVisible()).to.be.false

      timePickerDriver.focus()

      expect(timePickerDriver.isTimePickerSelectVisible()).to.be.true
      expect(timePickerDriver.isTimePickerOptionsVisible()).to.be.true

      expect(timePickerDriver.getTimePickerOptionsCount()).to.equal(48)

      const optionTexts = timePickerDriver.getTimePickerOptionTexts()

      expect(optionTexts[0]).to.equal('00:00')
      expect(optionTexts[1]).to.equal('00:30')
      expect(optionTexts[2]).to.equal('01:00')
      expect(optionTexts[47]).to.equal('23:30')

      timePickerDriver.selectTimePickerOption(2)

      yield eventually(function*() {
        expect(timePickerDriver.getTimePickerValue()).to.equal('01:00')
        expect(timePickerDriver.isTimePickerSelectVisible()).to.be.false
      })
    }))
  })

  describe('boolean', function() {
    it('should filter by `is checked` condition', co.wrap(function*() {
      testkit.setInitialData(createFakeCollection([
        {active: true},
        {active: false}
      ]))

      const {app} = renderApp($, testkit.getClient(), createFakeSchema({
        active: {displayName: 'Active', type: 'boolean'}
      }))

      const driver = gridDriverCreator($, app)

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      const panelDriver = yield driver.openFilterForColumn(driver.getColumnIndex('active'))

      panelDriver.setFormCondition(filters.BOOLEAN.TYPE.EQUALS)
      panelDriver.toggleBooleanChecked()

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      let filteredItems = driver.getNonEmptyColumnValues('active')
      filteredItems.forEach(value => expect(value).to.equal('V'))

      panelDriver.toggleBooleanChecked()

      yield eventually(function() {
        expect(driver.doesGridShowRows()).to.be.true
      })

      filteredItems = driver.getNonEmptyColumnValues('active')
      expect(filteredItems).to.have.length.of(0)
    }))
  })
})

const getTomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)

  return date
}

const getYesterday = () => {
  const date = new Date()
  date.setDate(date.getDate() - 1)

  return date
}

const getDayStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const getDayEnd = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1))

const getWeekEnd = (date) => {
  const week = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  week.setUTCDate(week.getUTCDate() - week.getUTCDay() + 7)

  return week
}

const getWeekStart = (date) => {
  const week = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  week.setUTCDate(week.getUTCDate() - week.getUTCDay())

  return week
}

const getNextWeek = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 7)

  return date
}

const getLastWeek = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - 7)

  return date
}

const getNextMonth = () => {
  const date = new Date()
  date.setUTCDate(28) // Due to some months have less days than others
  date.setUTCMonth(date.getUTCMonth() + 1)

  return date
}

const getMonthStart = (date) => {
  const month = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  month.setUTCDate(-1)

  return month
}

const getMonthEnd = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
}

const getLastMonth = () => {
  const date = new Date()
  date.setUTCDate(28) // Due to some months have less days than others
  date.setUTCMonth(date.getUTCMonth() - 1)

  return date
}

const getNextYear = () => {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() + 1)

  return date
}

const getYearStart = (date) => new Date(Date.UTC(date.getUTCFullYear(), 0))

const getYearEnd = (date) => new Date(Date.UTC(date.getUTCFullYear() + 1, 0))

const getLastYear = () => {
  const date = new Date()
  date.setUTCFullYear(date.getUTCFullYear() - 1)

  return date
}
