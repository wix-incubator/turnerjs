'use strict'

require('wix-data-testkit/lib/babelHelpers')
const {describe, it, before, after, beforeEach, afterEach} = require('mocha')
const {expect} = require('chai')
const co = require('co')
const webdriver = require('selenium-webdriver')
const eventually = require('dbsm-common-test/src/eventually')
const {withIframe} = require('dbsm-common-test/src/browser/automation')(webdriver)
const prepareBrowser = require('dbsm-common-test/src/browser/prepareBrowser')
const path = require('path')
const createDriver = require('cm-fake-my-account-container/src/browser/driver')
const gridDriverCreator = require('cm-common-test/src/browser/gridDriver')
const {prepareVMServerWithWixData} = require('cm-common-test/src/server/prepareServer')
const {prepareFakeMyAccountContainerServer} = require('cm-fake-my-account-container/src/browser/testSupport')
const {Key} = require('selenium-webdriver/lib/input')
const testkit = require('wix-data-testkit/lib/testkit-factory')()

const createVmTemplateConfig = require('../../vmTemplateConfig')
const createMyAccountAppDriver = require('./infrastructure/driver')

const templateOptions = createVmTemplateConfig('http://localhost:3000/')
const ignoreScripts = []
const redirectScripts = {
  [createVmTemplateConfig.scriptsPaths.sdk]: 'http://localhost:3001/wix.js'
}
const localScripts = {
  [createVmTemplateConfig.scriptsPaths.react]: path.resolve(__dirname, '../../node_modules/react/dist/react.min.js'),
  [createVmTemplateConfig.scriptsPaths.reactDOM]: path.resolve(__dirname, '../../node_modules/react-dom/dist/react-dom.min.js')
}

const INSTANCE = '2ac58c19f2f735fc3410d8f3d5ebadec0ff5eb60.eyJleHRlbnNpb25JZCI6IjBmNzc5NjUxLWNiY2YtNDRlZS05M2Q2LTA2NDYwMDVmZDlmOSIsImluc3RhbmNlSWQiOiI3MDM3ZDJlMi03YzY0LTRlYjUtYTNlZi00ODQ4YmMzZGM4YWMiLCJzaWduRGF0ZSI6MTQ3MDg5ODcyMzE0OCwidWlkIjoiNTFmMTM3NWItM2FhNS00ZTEyLTgzMDUtYjg2OGZjOTJjM2M3IiwicGVybWlzc2lvbnMiOiJPV05FUiIsImh0bWxTaXRlSWQiOiI5ZDQwY2MxZi01NmIzLTQ4MDEtYWMyMC00NzJjZWExZWYzZjgifQ=='

describe('cm-my-account-app', function () {
  this.timeout(30000)
  prepareBrowser(before, after, webdriver)
  prepareVMServerWithWixData(before, after, testkit, {
    root: path.resolve(__dirname, '../../dist'),
    name: 'myAccountAppBaseUrl',
    templateOptions,
    ignoreScripts,
    redirectScripts,
    localScripts
  })

  prepareFakeMyAccountContainerServer(before, after, testContext => {
    return {
      'wix-code-app': {
        url: `${testContext.myAccountAppBaseUrl}/`,
        queryParameters: {instance: INSTANCE}
      }
    }
  }, [
    {uri: '51f137_5cb8cafe41bb4b21b92ded370928d909~mv2.png', width: 100, height: 80, title: 'The Goat'}
  ])

  before(function() {
    this.driver = createDriver(webdriver, this.browser)
  })

  afterEach(co.wrap(function*() {
    testkit.reset()
  }))

  describe('grid', function() {

    beforeEach(co.wrap(function*() {
      testkit.givenSchemaForCollection('defaultCollection', {
        displayName: 'defaultCollection',
          fields: {
            firstName: {displayName: 'First Name', type: 'text'},
            age: {displayName: 'Age', type: 'number'},
            isFired: {displayName: 'Is fired', type: 'boolean'},
            description: {displayName: 'Description', type: 'richtext'},
            photo: {displayName: 'Image', type: 'image'}
          }
        }
      )

      testkit.setInitialData({
        defaultCollection: [
          {
            firstName: 'Foo',
            age: 22,
            isFired: false,
            description: '<b>some html</b>',
            photo: 'http://animalia-life.com/data_images/goat/goat4.jpg'
          }
        ]
      })

      const url = `${this.fakeMyAccountContainerBaseUrl}`
      yield this.browser.get(url)
      this.iframe = this.driver.openApp('wix-code-app')
    }))

    it('should render grid', co.wrap(function*() {
      const browser = this.browser

      yield withIframe(browser, this.iframe, co.wrap(function*() {
        const gridDriver = yield createMyAccountAppDriver(browser, webdriver).selectSchema(0)

        yield gridDriver.waitUntilFullyRendered()

        yield eventually(function*() {
          expect(yield gridDriver.doesGridShowRows()).to.be.true
        })
      }))
    }))

    it('should focus empty cell when new row button in toolbar is being added', co.wrap(function*() {
      const browser = this.browser
      yield withIframe(browser, this.iframe, co.wrap(function*() {
        const gridDriver = yield createMyAccountAppDriver(browser, webdriver).selectSchema(0)

        yield gridDriver.waitUntilFullyRendered()
        yield gridDriver.clickAddRowButton()

        yield eventually(function*() {
          expect(yield gridDriver.getActiveElementText()).to.equal('')
          expect(yield gridDriver.getActiveElementAttribute('colid')).to.equal('firstName')
        })
      }))
    }))
  })

  describe('grid cell types', function() {

    describe('image type', function() {

      const withImageRenderer = co.wrap(function*(browser, iframe, rowIndex, fn, gridIsOpen = false) {
        return withIframe(browser, iframe, co.wrap(function*() {
          if (!gridIsOpen) {
            yield createMyAccountAppDriver(browser, webdriver).selectSchema(0)
          }

          const gridDriver = gridDriverCreator(browser, webdriver)
          yield gridDriver.waitUntilFullyRendered()
          yield fn(yield gridDriver.getImageRenderer('photo', 1), gridDriver)
        }))
      })

      const externalImage = 'https://static.wixstatic.com/media/9365567b1e20395df3746ce1f6899e6e.jpg/v1/fill/w_220,h_220/9365567b1e20395df3746ce1f6899e6e.jpg'
      const wixMediaImage = 'http://static.wixstatic.com/media/51f137_5cb8cafe41bb4b21b92ded370928d909~mv2.png'

      beforeEach(co.wrap(function*() {

        testkit.givenSchemaForCollection('imageCollection', {
          displayName: 'imageCollection',
          fields: {
            photo: {displayName: 'Image', type: 'image'}
          }
        })

        testkit.setInitialData({
          imageCollection: [
            {photo: externalImage},
            {photo: null}
          ]
        })

        const url = `${this.fakeMyAccountContainerBaseUrl}`
        yield this.browser.get(url)
      }))

      it('should open media manager with plus icon', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver) {
          yield imageRendererDriver.focus()
          yield imageRendererDriver.clickPlusIcon()
        }))

        yield eventually(function*() {
          expect(yield driver.mediaPanel.isOpen()).to.be.true
        })
      }))

      it('should open media manager from context menu', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver) {
          yield imageRendererDriver.focus()
          yield imageRendererDriver.openOptions()
          yield imageRendererDriver.openMediaManager()
        }))

        yield eventually(function*() {
          expect(yield driver.mediaPanel.isOpen()).to.be.true
        })
      }))

      it('should open media manager with double click', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver) {
          yield imageRendererDriver.doubleClick()
        }))

        yield eventually(function*() {
          expect(yield driver.mediaPanel.isOpen()).to.be.true
        })
      }))

      it('should open media manager with enter keypress', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver) {
          yield imageRendererDriver.focus()
          yield imageRendererDriver.keypress(Key.ENTER)
        }))

        yield eventually(function*() {
          expect(yield driver.mediaPanel.isOpen()).to.be.true
        })
      }))

      it('should open native editor from context menu', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver, gridDriver) {
          yield imageRendererDriver.focus()
          yield imageRendererDriver.openOptions()

          const imageEditorDriver = yield gridDriver.openImageEditor(imageRendererDriver)

          yield eventually(function*() {
            expect(yield imageEditorDriver.isVisible()).to.be.true
          })
        }))
        expect(yield driver.mediaPanel.isOpen()).to.be.false
      }))

      it('should be able to change cell value to wix media image', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 0, co.wrap(function*(imageRendererDriver) {
          yield imageRendererDriver.doubleClick()
        }))

        yield driver.mediaPanel.select(0)
        yield driver.mediaPanel.confirm()

        yield withImageRenderer(browser, iframe, 0, co.wrap(function*(imageRendererDriver) {
          const uri = yield imageRendererDriver.getImageSource()
          expect(uri.startsWith(wixMediaImage)).to.be.true
        }), true)
      }))

      it('should be able to change cell value to external image', co.wrap(function*() {
        const browser = this.browser
        const driver = this.driver
        const iframe = yield driver.openApp('wix-code-app')

        yield withImageRenderer(browser, iframe, 1, co.wrap(function*(imageRendererDriver, gridDriver) {
          expect(yield imageRendererDriver.isImageVisible()).to.be.false

          yield imageRendererDriver.focus()
          yield imageRendererDriver.openOptions()

          const imageEditorDriver = yield gridDriver.openImageEditor(imageRendererDriver)
          yield imageEditorDriver.setInputValue(externalImage)

          yield eventually(function*() {
            expect(yield imageRendererDriver.getImageSource()).to.equal(externalImage)
          })
        }))
      }))
    })
  })
})
