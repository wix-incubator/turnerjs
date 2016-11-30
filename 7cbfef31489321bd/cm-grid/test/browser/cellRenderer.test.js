'use strict'

require('babel-polyfill')
const {describe, it, before, after, beforeEach, afterEach} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const webdriver = require('selenium-webdriver')
const prepareBrowser = require('dbsm-common-test/src/browser/prepareBrowser')
const path = require('path')
const gridDriverCreator = require('cm-common-test/src/browser/gridDriver')
const {prepareVMServerWithWixData} = require('cm-common-test/src/server/prepareServer')
const testkit = require('wix-data-testkit/lib/testkit-factory')()
const eventually = require('dbsm-common/src/async/eventually')

const collectionName = 'collectionName'

describe('cell renderers', function() {
  this.timeout(30000)

  prepareBrowser(before, after, webdriver)
  prepareVMServerWithWixData(before, after, testkit, {root: path.resolve(__dirname, '../../dist'), name: 'gridbaseurl'})

  afterEach(testkit.reset)

  describe('value type validation', function() {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection('col', {
        displayName: 'col',
        fields: {
          age: {displayName: 'Age', type: 'number'}
        }
      })
      testkit.setInitialData({
        col: [
          {age: 19},
          {age: '19'}
        ]
      })
      yield this.browser.get(`${this.gridbaseurl}/grid.test.html`)
    }))

    it('should add class `invalid` to cells with incorrect value type', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.getCellClass('age', 0)).not.to.include('invalid')
      expect(yield driver.getCellClass('age', 1)).to.include('invalid')
    }))

    it('should show tooltip on hover', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.isErrorTooltipVisible('age', 1)).to.be.false

      yield driver.hoverCell('age', 1)
      expect(yield driver.isErrorTooltipVisible('age', 1)).to.be.true
    }))

    it('should show tooltip on focus', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.isErrorTooltipVisible('age', 1)).to.be.false

      yield driver.focusCell('age', 1)
      expect(yield driver.isErrorTooltipVisible('age', 1)).to.be.true
    }))

    it('should show correct type in tooltip button', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      yield driver.waitUntilFullyRendered()

      expect(yield driver.isErrorTooltipVisible('age', 1)).to.be.false

      yield driver.focusCell('age', 1)
      expect(yield driver.getErrorTooltipText('age', 1)).to.contain('number')
    }))
  })

  describe('type detection', function() {

  beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection('col', {
        displayName: 'col',
        fields: {
          name: {displayName: 'Name', type: 'text'},
          age: {displayName: 'Age', type: 'number'}
        }
      })
      testkit.setInitialData({
        col: [
          {name: 1337, age: new Date(), object: {}}
        ]
      })
      yield this.browser.get(`${this.gridbaseurl}/grid.test.html`)
    }))
    
    it('should select renderer according to value type', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      expect(yield driver.getRendererType('name', 0)).to.equal('number')
      expect(yield driver.getRendererType('age', 0)).to.equal('datetime')
      expect(yield driver.getRendererType('object', 0)).to.equal('json')
    }))
  })

  describe('other types', function() {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection('col', {
        displayName: 'col',
        fields: {
          link: {displayName: 'Link', type: 'pagelink'}
        }
      })
      testkit.setInitialData({
        col: [
          {link: '/the-link'}
        ]
      })
      yield this.browser.get(`${this.gridbaseurl}/grid.test.html`)
    }))

    it('should render other schema types as text', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      expect(yield driver.getRendererType('link', 0)).to.equal('text')
    }))
  })

  describe('undefined fields validation', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection('col', {
        displayName: 'col',
        fields: {}
      })
      testkit.setInitialData({
        col: [
          {isActive: true, params: {}}
        ]
      })
      yield this.browser.get(`${this.gridbaseurl}/grid.test.html`)
    }))

    it('should not add class `invalid` to cells of undefined fields', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()
      expect(yield driver.getCellClass('isActive', 0)).not.to.contain('invalid')
      expect(yield driver.getCellClass('params', 0)).not.to.contain('invalid')
    }))
  })

  describe('image', function() {
    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection(collectionName, {
        displayName: collectionName,
        fields: {
          profilePicture: {displayName: 'Profile picture', type: 'image'}
        }
      })
      testkit.setInitialData({
        [collectionName]: [
          {
            profilePicture: 'https://static.wixstatic.com/media/9365567b1e20395df3746ce1f6899e6e.jpg/v1/fill/w_220,h_220/9365567b1e20395df3746ce1f6899e6e.jpg',
            _createdDate: new Date(2016, 7, 26, 10)
          },
          {
            _createdDate: new Date(2016, 7, 26)
          }
        ]
      })
      yield this.browser.get(`${this.gridbaseurl}/grid.test.html`)
    }))

    it('should render correctly if value is set', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)

      const profilePictureSource = 'https://static.wixstatic.com/media/9365567b1e20395df3746ce1f6899e6e.jpg/v1/fill/w_220,h_220/9365567b1e20395df3746ce1f6899e6e.jpg'

      yield driver.waitUntilFullyRendered()

      const imageRendererDriver = yield driver.getImageRenderer('profilePicture', 0)

      expect(yield imageRendererDriver.isImageVisible()).to.be.true
      expect(yield imageRendererDriver.getImageSource()).to.equal(profilePictureSource)
      expect(yield imageRendererDriver.isPlusIconVisible()).to.be.false

      yield imageRendererDriver.focus()

      expect(yield imageRendererDriver.isEditOptionsButtonVisible()).to.be.true

      yield imageRendererDriver.openOptions()

      expect(yield imageRendererDriver.isEditOptionsVisible()).to.be.true
      expect(yield imageRendererDriver.isOpenMediaManagerVisible()).to.be.true
      expect(yield imageRendererDriver.isOpenEditorVisible()).to.be.true
      
      const imageEditorDriver = yield driver.openImageEditor(imageRendererDriver)

      yield eventually(function*() {
        expect(yield driver.isEditorOpen()).to.be.true
      })

      const newPictureSource = 'https://static.wixstatic.com/media/f260ef7ebb3c4add9c7257c9c459bd4e.jpg/v1/fill/w_220,h_220/f260ef7ebb3c4add9c7257c9c459bd4e.jpg'

      yield imageEditorDriver.setInputValue(newPictureSource)

      yield eventually(function*() {
        expect(yield driver.isEditorOpen()).to.be.false
      })

      expect(yield imageRendererDriver.getImageSource()).to.equal(newPictureSource)

      yield imageRendererDriver.openPreview()

      expect(yield imageRendererDriver.isPreviewOpen()).to.be.true

      expect(yield imageRendererDriver.getPreviewImageSource()).to.equal(newPictureSource)
    }))

    it('should render correctly if there\'s no value', co.wrap(function*() {
      const browser = this.browser
      const driver = gridDriverCreator(browser, webdriver)
      yield driver.waitUntilFullyRendered()

      const imageRendererDriver = yield driver.getImageRenderer('profilePicture', 1)

      expect(yield imageRendererDriver.isImageVisible()).to.be.false
      expect(yield imageRendererDriver.isPlusIconVisible()).to.be.false

      yield imageRendererDriver.focus()

      expect(yield imageRendererDriver.isPlusIconVisible()).to.be.true
      expect(yield imageRendererDriver.isEditOptionsButtonVisible()).to.be.true

    }))
  })
})
