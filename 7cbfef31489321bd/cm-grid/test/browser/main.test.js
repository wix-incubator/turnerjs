'use strict'

require('wix-data-testkit/lib/babelHelpers')
const {describe, it, before, after, beforeEach, afterEach} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const webdriver = require('selenium-webdriver')
const eventually = require('dbsm-common-test/src/eventually')
const {byAid} = require('dbsm-common-test/src/browser/automation')(webdriver)
const prepareBrowser = require('dbsm-common-test/src/browser/prepareBrowser')
const {prepareVMServerWithWixData} = require('cm-common-test/src/server/prepareServer')
const path = require('path')
const gridDriverCreator = require('cm-common-test/src/browser/gridDriver')
const testkit = require('wix-data-testkit/lib/testkit-factory')(global)
const {collectionName, schema} = require('cm-common-test/src/wix-data/mockData')
const {createEmptyFields} = require('cm-common-test/src/it/wixDataHelpers')

const {ROW_HEIGHT} = require('../../src/constants')

describe('cm-grid browser', function () {
  this.timeout(30000)
  prepareBrowser(before, after, webdriver)
  prepareVMServerWithWixData(before, after, testkit, {root: path.resolve(__dirname, '../../dist'), name: 'gridBaseUrl'})

  afterEach(testkit.reset)

  describe('with mock data', function() {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({
        [collectionName]: [
          {
            '_createdDate': new Date(2016, 9, 20, 11, 13),
            'firstName': 'Coffey',
            'lastName': 'Chang',
            'age': 35,
            'isActive': false,
            'balance': '$2,113.65',
            'eyeColor': 'brown',
            'company': 'ZEAM',
            'phone': '+1 (928) 442-3763',
            'address': '343 Hanover Place, Ezel, Arizona, 7762',
            'registered': new Date(),
            'email': 'coffey@domain.com',
            _ctorName: '42',
            'json': {
              somefield: 'some value'
            },
            'array': ['a', 'b', '42'],
            'profilePicture': 'https://static.wixstatic.com/media/9365567b1e20395df3746ce1f6899e6e.jpg/v1/fill/w_220,h_220/9365567b1e20395df3746ce1f6899e6e.jpg'
          }
        ]
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should be rendered', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      expect(yield driver.doesGridShowRows()).to.be.true
    }))

    it('should occupy all available vertical space', co.wrap(function*() {
      const browser = this.browser
      const getHeight = 'return arguments[0].offsetHeight'

      const moduleContainer = yield browser.findElement(byAid('grid-container'))
      const gridContainer = yield browser.findElement(byAid('wix-grid-container'))

      const moduleHeight = yield browser.executeScript(getHeight, moduleContainer)
      const gridHeight = yield browser.executeScript(getHeight, gridContainer)

      expect(gridHeight).to.equal(moduleHeight)
    }))

    it('should focus empty cell when new row is being added (when using grid button)', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.clickAddRowButton()

      yield eventually(function*() {
        expect(yield driver.getActiveElementText()).to.equal('')
        expect(yield driver.getActiveElementAttribute('colid')).to.equal('firstName')
      })

      expect(yield driver.getCellText('_updatedDate', 0)).to.be.empty

      const textDriver = yield driver.openTextEditor('firstName', 0)
      yield textDriver.setValue('New Item')

      yield driver.closeEditor('firstName', 0)

      // check if the text was set to new row
      const newRowText = yield driver.getCellText('firstName', 0)
      expect(newRowText).to.equal('New Item')

      // Check if the date was set which means row was updated
      expect(yield driver.getCellText('_updatedDate', 0)).to.not.be.empty
    }))

    it('refresh row when cell data is updated', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      expect(yield driver.getCellText('firstName', 0)).to.equal('Coffey')

      const textDriver = yield driver.openTextEditor('firstName', 0)
      yield textDriver.setValue('Peter')

      driver.closeEditor('firstName', 0)

      yield eventually(function*() {
        const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
        expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
      })
    }))

    it('should duplicate a row via context menu', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const gridContainer = yield driver.getGridContainer()
      const originalId = yield driver.getCellText('_id', 0)
      const originalFirstName = yield driver.getCellText('firstName', 0)

      yield browser.executeScript(duplicateRow, gridContainer, originalId)

      yield eventually(function*() {
        const newFirstName = yield driver.getCellText('firstName', 0)
        const newUpdatedDate = yield driver.getCellText('_updatedDate', 0)
        expect(newFirstName).to.equal(originalFirstName)
        expect(newUpdatedDate).to.be.defined
      })
    }))

    describe('adding a new field', function () {
      it('should scroll so the field would be visible', co.wrap(function*() {
        const browser = this.browser
        const driver = gridDriverCreator(browser, webdriver)
        yield driver.waitUntilFullyRendered()

        expect(yield driver.isColumnVisible('newcolumn')).to.be.false

        const addFieldFormDriver = yield driver.openAddFieldForm()
        yield addFieldFormDriver.setFieldTitle('newcolumn')
        yield addFieldFormDriver.submit()

        yield eventually(function*() {
          expect(yield driver.isColumnVisible('newcolumn')).to.be.true
        })
      }))
    })
  })

  describe('selection', function () {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({
        [collectionName]: createEmptyFields(5)
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should highlight row numbers and column headers on range select', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      yield driver.selectRange({
        startRowIndex: 0,
        startFieldKey: '_id',
        endRowIndex: 2,
        endFieldKey: '_updatedDate'
      })

      yield eventually(function*() {
        expect(yield driver.getPinnedCellClass('_row', 0)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 1)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 2)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 3)).not.to.contain('row-selected')

        expect(yield driver.getHeaderCellClass('_id')).to.contain('selected')
        expect(yield driver.getHeaderCellClass('_updatedDate')).to.contain('selected')
        expect(yield driver.getHeaderCellClass('firstName')).not.to.contain('selected')
        expect(yield driver.getHeaderCellClass('lastName')).not.to.contain('selected')
      })

      yield driver.selectRange({
        startRowIndex: 4,
        startFieldKey: 'lastName',
        endRowIndex: 3,
        endFieldKey: 'firstName',
        withCtrl: true
      })

      yield eventually(function*() {
        expect(yield driver.getPinnedCellClass('_row', 0)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 1)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 2)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 3)).to.contain('row-selected')
        expect(yield driver.getPinnedCellClass('_row', 4)).to.contain('row-selected')

        expect(yield driver.getHeaderCellClass('_id')).to.contain('selected')
        expect(yield driver.getHeaderCellClass('_updatedDate')).to.contain('selected')
        expect(yield driver.getHeaderCellClass('firstName')).to.contain('selected')
        expect(yield driver.getHeaderCellClass('lastName')).to.contain('selected')
      })
    }))

    it('should select whole row on row number click', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      yield driver.selectPinnedCell('_row', 0)

      yield eventually(function*() {
        expect(yield driver.getCellClass('_id', 0)).to.contain('ag-cell-range-selected')
        expect(yield driver.getCellClass('_updatedDate', 0)).to.contain('ag-cell-range-selected')
        expect(yield driver.getCellClass('firstName', 0)).to.contain('ag-cell-range-selected')
        expect(yield driver.getCellClass('lastName', 0)).to.contain('ag-cell-range-selected')
      })
    }))
  })

  describe('system fields', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {}
      })
      testkit.setInitialData({
        [collectionName]: []
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should not open editor for system field cell', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.canOpenEditor('_updatedDate', 0)).to.be.false
    }))
  })

  describe('with empty data', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          firstName: {displayName: 'First Name', type: 'text'},
          lastName: {displayName: 'Last Name', type: 'text'}
        }
      })
      testkit.setInitialData({
        [collectionName]: []
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should focus empty cell when new row is being added (when using grid button)', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.clickAddRowButton()

      yield eventually(function*() {
        expect(yield driver.getActiveElementText()).to.equal('')
        expect(yield driver.getActiveElementAttribute('colid')).to.equal('firstName')
      })

      expect(yield driver.getCellText('_updatedDate', 0)).to.be.empty

      const textDriver = yield driver.openTextEditor('firstName', 0)
      yield textDriver.setValue('New Item')

      yield driver.closeEditor('firstName', 0)

      // check if the text was set to new row
      const newRowText = yield driver.getCellText('firstName', 0)
      expect(newRowText).to.equal('New Item')

      // Check if the date was set which means row was updated
      expect(yield driver.getCellText('_updatedDate', 0)).to.not.be.empty
    }))

    it('should add a new row when down arrow is clicked while being at the last row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const rowsLength = yield driver.getRowsLength()

      yield driver.sendKeysToCell('firstName', 0, '\uE015') // Key down.

      yield eventually(function*() {
        expect(yield driver.getRowsLength()).to.equal(rowsLength + 1)
      })
    }))

    it('should add a new row when tab is clicked while being at the last row last column', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const rowsLength = yield driver.getRowsLength()

      yield driver.sendKeysToCell('lastName', 0, '\uE004') // TAB key.

      yield eventually(function*() {
        expect(yield driver.getRowsLength()).to.equal(rowsLength + 1)
      })
    }))
  })

  describe('grid buttons positions with empty data', function () {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          firstName: {displayName: 'First Name', type: 'text'}
        }
      })
      testkit.setInitialData({
        [collectionName]: []
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('add row button should have correct position', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const addRowButtonPosition = yield driver.getAddRowButtonPosition()

      const lastRowPosition = yield driver.getLastRowPosition()

      expect(addRowButtonPosition.y).to.equal(lastRowPosition.y + ROW_HEIGHT - 1)

      yield driver.clickAddRowButton()

      const nextButtonPosition = yield driver.getAddRowButtonPosition()
      const nextRowPosition = yield driver.getLastRowPosition()

      expect(nextButtonPosition.y).to.equal(nextRowPosition.y + ROW_HEIGHT - 1)
    }))

    it('add column button should have correct position', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const addColumnButtonPosition = yield driver.getAddColumnButtonPosition()

      const lastHeaderCellPosition = yield driver.getLastHeaderCellPosition()

      expect(addColumnButtonPosition.x).to.equal(lastHeaderCellPosition.x + 200 - 1)

      const addFieldFormDriver = yield driver.openAddFieldForm()
      yield addFieldFormDriver.setFieldTitle('new field')
      yield addFieldFormDriver.submit()

      const nextButtonPosition = yield driver.getAddColumnButtonPosition()

      const nextLastHeaderPosition = yield driver.getLastHeaderCellPosition()

      expect(nextButtonPosition.x).to.equal(nextLastHeaderPosition.x + 200 - 1)
    }))

    it('add column button should maintain correct positions when resizing', co.wrap(function*() {
      const columnSize = 200
      const shownColumns = 3
      const addColumnButtonWidth = 36
      const rowNumbersColumnWidth = 36

      const lastColumnHeaderRightPosition = columnSize * shownColumns + addColumnButtonWidth + rowNumbersColumnWidth

      const browser = this.browser

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      yield browser.manage().window().setSize(lastColumnHeaderRightPosition + 20, 600)

      const stickToColumnsEndLeftPosition = yield driver.getAddColumnButtonCssValue('left')

      yield browser.manage().window().setSize(lastColumnHeaderRightPosition + 1, 600)

      const addColumnButtonPosition = yield driver.getAddColumnButtonPosition()

      const lastHeaderCellPosition = yield driver.getLastHeaderCellPosition()

      expect(addColumnButtonPosition.x).to.equal(lastHeaderCellPosition.x + 200 - 1)
      expect(yield driver.getAddColumnButtonCssValue('left')).to.equal(stickToColumnsEndLeftPosition)

      yield browser.manage().window().setSize(lastColumnHeaderRightPosition, 600)

      expect(yield driver.getAddColumnButtonCssValue('right')).to.equal('0px')
      expect(yield driver.getAddColumnButtonCssValue('left')).to.not.equal(stickToColumnsEndLeftPosition)
    }))
  })

  describe('grid buttons positions', function () {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({
        [collectionName]: createEmptyFields(18)
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('add row button should have correct position', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getAddRowButtonCssValue('bottom')).to.equal('0px')
    }))

    it('add column button should have correct position', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getAddColumnButtonCssValue('right')).to.equal('0px')
    }))
  })

  describe('server validation', function() {
    const invalidValue = 'Bad name'

    beforeEach(co.wrap(function*() {
      const hook = entity => {
        if (entity.name === invalidValue) {
          return Promise.reject('failed validation')
        }
        return entity
      }

      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          name: {type: 'text', displayName: 'Name'},
          age: {type: 'number', displayName: 'Age'}
        }
      })
      testkit.givenHook(collectionName, testkit.hooks.BEFORE_UPDATE_HOOK, hook)
      testkit.givenHook(collectionName, testkit.hooks.BEFORE_INSERT_HOOK, hook)
      testkit.setInitialData({
        [collectionName]: [
          {}
        ]
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should add class `invalid` to row when server validation fails on insert', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      yield driver.clickAddRowButton()

      // verify that new item is in first row
      yield eventually(function*() {
        expect(yield driver.getCellText('_id', 0)).to.equal('')
      })

      const editor = yield driver.openTextEditor('name', 0)
      yield editor.setValue(invalidValue)
      yield driver.closeEditor('name', 0)

      yield eventually(function*() {
        expect(yield driver.getCellClass('_id', 0)).to.include('invalid')
        expect(yield driver.getCellClass('_updatedDate', 0)).to.include('invalid')
        expect(yield driver.getCellClass('name', 0)).to.include('invalid')
        expect(yield driver.getCellClass('age', 0)).to.include('invalid')
        expect(yield driver.isErrorTooltipVisible('name', 0)).to.be.true
      })
    }))

    it('should add class `invalid` to row when server validation fails on update', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const editor = yield driver.openTextEditor('name', 0)
      yield editor.setValue(invalidValue)
      yield driver.closeEditor('name', 0)

      yield eventually(function*() {
        expect(yield driver.getCellClass('_id', 0)).to.include('invalid')
        expect(yield driver.getCellClass('_updatedDate', 0)).to.include('invalid')
        expect(yield driver.getCellClass('name', 0)).to.include('invalid')
        expect(yield driver.getCellClass('age', 0)).to.include('invalid')
        expect(yield driver.isErrorTooltipVisible('name', 0)).to.be.true
      })
    }))

    it('should remove class `invalid` from row when server validation passes after update', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const initialEditor = yield driver.openTextEditor('name', 0)
      yield initialEditor.setValue(invalidValue)
      yield driver.closeEditor('name', 0)

      yield eventually(function*() {
        expect(yield driver.getCellClass('name', 0)).to.include('invalid')
      })

      const postUpdateEditor = yield driver.openTextEditor('name', 0)
      yield postUpdateEditor.setValue('New name')
      yield driver.closeEditor('name', 0)

      yield eventually(function*() {
        expect(yield driver.getCellClass('name', 0)).not.to.include('invalid')
      })
    }))
  })

  describe('adding rows', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {}
      })
      testkit.setInitialData({
        [collectionName]: [
          {_id: 1},
          {_id: 2}
        ]
      })
      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should new row below the focused one', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.getCellText('_id', 0)).to.equal('1')
      expect(yield driver.getCellText('_id', 1)).to.equal('2')

      yield driver.focusCell('_id', 0)
      yield driver.clickAddRowButton()

      yield eventually(function*() {
        expect(yield driver.getCellText('_id', 0)).to.equal('1')
        expect(yield driver.getCellText('_id', 1)).to.equal('')
        expect(yield driver.getCellText('_id', 2)).to.equal('2')
      })
    }))
  })
})

function duplicateRow() {
  return arguments[0].api.duplicateRow(arguments[1])
}
