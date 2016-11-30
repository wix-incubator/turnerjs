'use strict'

require('wix-data-testkit/lib/babelHelpers')
const {describe, it, before, after, beforeEach, afterEach} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const webdriver = require('selenium-webdriver')
const path = require('path')
const {prepareVMServerWithWixData} = require('cm-common-test/src/server/prepareServer')
const testkit = require('wix-data-testkit/lib/testkit-factory')()

const gridDriverCreator = require('cm-common-test/src/browser/gridDriver')
const prepareBrowser = require('dbsm-common-test/src/browser/prepareBrowser')

const collectionName = 'collectionName'

describe('cell editors', function() {
  this.timeout(30000)
  prepareBrowser(before, after, webdriver)
  prepareVMServerWithWixData(before, after, testkit, {root: path.resolve(__dirname, '../../dist'), name: 'gridBaseUrl'})

  afterEach(testkit.reset)

  describe('text editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          text: {displayName: 'Text', type: 'text'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {text: 'First'}
        ]
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))
  
    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      expect(yield driver.getCellText('text', 0)).to.equal('First')

      const textDriver = yield driver.openTextEditor('text', 0)
      yield textDriver.setValue('Second')
      yield driver.closeEditor('text', 0)

      expect(yield driver.getCellText('text', 0)).to.equal('Second')

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
    }))

    it('should set value to a char when cell is opened with a keypress', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      yield driver.openTextEditorWithKeyPress('text', 0, 'a')
      yield driver.closeEditor('text', 0)

      expect(yield driver.getCellText('text', 0)).to.equal('a')
    }))
  })

  describe('richtext editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          richtext: {displayName: 'Rich text', type: 'richtext'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {richtext: 'ZEAM'}
        ]
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))
  
    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      expect(yield driver.getCellText('richtext', 0)).to.equal('ZEAM')

      const richtextDriver = yield driver.openRichtextEditor('richtext', 0)
      yield richtextDriver.setValue('<h1>oh hai</h1>')
      yield driver.closeEditor('richtext', 0)

      expect(yield driver.getCellText('richtext', 0)).to.equal('oh hai')

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
    }))

    it('should set value to a char when cell is opened with a keypress', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      yield driver.openRichTextEditorWithKeyPress('richtext', 0, 'a')
      yield driver.closeEditor('richtext', 0)

      expect(yield driver.getCellText('richtext', 0)).to.equal('a')
    }))

  })

  describe('boolean editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          boolean: {displayName: 'Boolean', type: 'boolean'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {boolean: false}
        ]
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      const booleanCellText = yield driver.getCellText('boolean', 0)
      expect(booleanCellText).to.equal('')

      const booleanEditorDriver = yield driver.openBooleanEditor('boolean', 0)
      yield booleanEditorDriver.toggle()

      yield driver.closeEditor('boolean', 0)

      const editedBooleanCellText = yield driver.getCellText('boolean', 0)

      expect(editedBooleanCellText).to.equal('V')

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
    }))
  })
  
  describe('boolean editor with empty data', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          isActive: {displayName: 'active', type: 'boolean'}
        }
      })
      testkit.setInitialData({
        [collectionName]: []
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))
  
    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
    
      const booleanCellText = yield driver.getCellText('isActive', 0)
      expect(booleanCellText).to.equal('')
    
      const booleanEditorDriver = yield driver.openBooleanEditor('isActive', 0)
      yield booleanEditorDriver.toggle()
    
      yield driver.closeEditor('isActive', 0)
    
      const editedBooleanCellText = yield driver.getCellText('isActive', 0)
      expect(editedBooleanCellText).to.equal('V')
    
      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(finalTimestamp).not.to.be.null
    }))
  })

  describe('datetime editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          datetime: {displayName: 'Date time', type: 'datetime'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {datetime: new Date('Sunday, September 13, 2015 4:50 AM')}
        ]
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))
 
    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      const dateCellText = yield driver.getCellText('datetime', 0)

      expect(dateCellText).to.equal('09/13/2015 04:50')

      const dateEditorDriver = yield driver.openDateTimeEditor('datetime', 0)

      yield dateEditorDriver.setDateTime('11/11/2011', '11:11')

      yield driver.closeEditor('datetime', 0)

      const editedDateCellText = yield driver.getCellText('datetime', 0)
      expect(editedDateCellText).to.equal('11/11/2011 11:11')

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
    }))

    it('should not persist invalid data and show the validation error', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      const initialCellText = '09/13/2015 04:50'

      const dateCellText = yield driver.getCellText('datetime', 0)

      expect(dateCellText).to.equal(initialCellText)

      const dateEditorDriver = yield driver.openDateTimeEditor('datetime', 0)

      yield dateEditorDriver.setDateTime('invalid', '11:11')

      yield dateEditorDriver.close()

      expect(yield dateEditorDriver.isOpen()).to.be.true

      expect(yield dateEditorDriver.isInvalid()).to.be.true

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.be.NaN

      yield driver.closeEditor('datetime', 0)

      expect(yield driver.getCellText('datetime', 0)).to.equal(initialCellText)
    }))
  })

  describe('datetime editor with empty data', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          registered: {displayName: 'Registration time', type: 'datetime'}
        }
      })
      testkit.setInitialData({
        [collectionName]: []
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const dateCellText = yield driver.getCellText('registered', 0)
      expect(dateCellText).to.equal('')
      const dateEditorDriver = yield driver.openDateTimeEditor('registered', 0)
      yield dateEditorDriver.setDateTime('11/11/2011', '11:11')

      yield driver.closeEditor('registered', 0)

      const editedDateCellText = yield driver.getCellText('registered', 0)
      expect(editedDateCellText).to.equal('11/11/2011 11:11')

      yield driver.scrollTo(0, 0)
      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(finalTimestamp).not.to.be.null
    }))

    it('should not persist invalid data and show the validation error', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      const initialCellText = ''

      const dateCellText = yield driver.getCellText('registered', 0)

      expect(dateCellText).to.equal(initialCellText)

      const dateEditorDriver = yield driver.openDateTimeEditor('registered', 0)

      yield dateEditorDriver.setDateTime('invalid', '11:11')

      yield dateEditorDriver.close()

      expect(yield dateEditorDriver.isOpen()).to.be.true

      expect(yield dateEditorDriver.isInvalid()).to.be.true

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.be.NaN

      yield driver.closeEditor('registered', 0)

      expect(yield driver.getCellText('registered', 0)).to.equal(initialCellText)
    }))
  })

  describe('number editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          number: {displayName: 'Number', type: 'number'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {number: 35}
        ]
      })

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()
      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      const numberCellText = yield driver.getCellText('number', 0)
      expect(numberCellText).to.equal('35')

      const numberEditorDriver = yield driver.openNumberEditor('number', 0)

      yield numberEditorDriver.setValue('1010.11')

      yield driver.closeEditor('number', 0)

      const editedNumberCellText = yield driver.getCellText('number', 0)
      expect(editedNumberCellText).to.equal('1,010.11')

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.not.equal(parseInt(initialTimestamp))
    }))

    it('should show invalid message for too big number', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const numberCellText = yield driver.getCellText('number', 0)
      expect(numberCellText).to.equal('35')

      const numberEditorDriver = yield driver.openNumberEditor('number', 0)

      yield numberEditorDriver.setValue('' + Math.pow(2, 64))

      yield numberEditorDriver.close()

      expect(yield numberEditorDriver.isOpen()).to.be.true
      expect(yield numberEditorDriver.isInvalid()).to.be.true

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.be.NaN

      yield driver.closeEditor('number', 0)

      expect(yield driver.getCellText('number', 0)).to.equal(numberCellText)
    }))

    it('should show invalid message for a number bigger than 1e21 (saved in scientific notation)', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      const numberCellText = yield driver.getCellText('number', 0)
      expect(numberCellText).to.equal('35')

      const numberEditorDriver = yield driver.openNumberEditor('number', 0)

      yield numberEditorDriver.setValue('999999999999999999999')

      yield numberEditorDriver.close()

      expect(yield numberEditorDriver.isOpen()).to.be.true
      expect(yield numberEditorDriver.isInvalid()).to.be.true

      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(parseInt(finalTimestamp)).to.be.NaN

      yield driver.closeEditor('number', 0)

      expect(yield driver.getCellText('number', 0)).to.equal(numberCellText)
    }))
  })

  describe('json editor', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {displayName: collectionName, fields: {}})
      testkit.setInitialData({[collectionName]: [{json: {someObj: true}}]})

      yield this.browser.get(`${this.gridBaseUrl}/grid.test.html`)
    }))

    it('should open, change the value and save the row', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const initialTimestamp = yield driver.getCellDateValue('_updatedDate', 0)

      const objectCellText = yield driver.getCellText('json', 0)
      expect(objectCellText).to.equal('{...}')

      const objectEditorDriver = yield driver.openJsonEditor('json', 0)

      yield objectEditorDriver.setValue(JSON.stringify({newValue: 42}))

      yield driver.closeEditor('json', 0)

      yield driver.scrollTo(0, 0)
      const finalTimestamp = yield driver.getCellDateValue('_updatedDate', 0)
      expect(finalTimestamp).to.not.equal(initialTimestamp)
    }))

    it('should properly inform about invalid input', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const objectEditorDriver = yield driver.openJsonEditor('json', 0)

      yield objectEditorDriver.setValue('{some invalid object value}')

      expect(yield objectEditorDriver.isInvalid()).to.be.true
    }))
  })

  describe('undefined fields', function() {

    const schema = {
      displayName: collectionName, fields: {}
    }

    it('should open text editor for string', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{name: 'Foo'}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('name', 0)).to.equal('text')
    }))

    it('should open number editor for number', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{age: 20}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('age', 0)).to.equal('number')
    }))

    it('should open boolean editor for boolean', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{isActive: false}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('isActive', 0)).to.equal('boolean')
    }))

    it('should open richtext editor for html string', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{description: '<b>html text</b>'}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('description', 0)).to.equal('richtext')
    }))

    it('should open image editor', co.wrap(function*() {
      const data = [{
        image: 'https://static.wixstatic.com/media/9365567b1e20395df3746ce1f6899e6e.jpg/v1/fill/w_220,h_220/9365567b1e20395df3746ce1f6899e6e.jpg'
      }]
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: data})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('image', 0)).to.equal('image')
    }))

    it('should open datetime editor for date object', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{date: new Date()}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('date', 0)).to.equal('datetime')
    }))

    it('should open json editor for array', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{list: []}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('list', 0)).to.equal('json')
    }))

    it('should open json editor for object', co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{params: {}}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('params', 0)).to.equal('json')
    }))
  })

  describe('image editor', function() {
    it('should not show validation error when user submits empty string', co.wrap(function*() {

      const schema = {displayName: collectionName, fields: {
        picture: {displayName: 'Profile picture', type: 'image'}
      }}

      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const imageRendererDriver = yield driver.getImageRenderer('picture', 0)

      yield imageRendererDriver.focus()
      yield imageRendererDriver.openOptions()

      const imageEditorDriver = yield driver.openImageEditor(imageRendererDriver)
      yield imageEditorDriver.setInputValue('')

      expect(yield driver.getCellClass('picture', 0)).not.to.include('invalid')
    }))
  })

  describe('type detection', function() {
    it('should select editor according to value type', co.wrap(function*() {

      const schema = {displayName: collectionName, fields: {
        name: {displayName: 'Name', type: 'text'},
        age: {displayName: 'Age', type: 'number'}
      }}

      testkit.givenSchemaForCollection(collectionName, schema)
      testkit.setInitialData({[collectionName]: [{name: 1337, age: new Date()}]})

      const browser = this.browser
      yield browser.get(`${this.gridBaseUrl}/grid.test.html`)

      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getEditorType('name', 0)).to.equal('number')
      expect(yield driver.getEditorType('age', 0)).to.equal('datetime')
    }))
  })
})

