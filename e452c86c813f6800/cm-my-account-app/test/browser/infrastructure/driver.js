'use strict'

const co = require('co')
const {expect} = require('chai')
const eventually = require('dbsm-common/src/async/eventually')
const browserAutomation = require('dbsm-common-test/src/browser/automation')
const gridDriverCreator = require('cm-common-test/src/browser/gridDriver')

module.exports = (browser, webdriver) => {
  const {byAid} = browserAutomation(webdriver)

  return {
    
    waitForSchemasToLoad: () =>
      eventually(function*() {
        const links = yield browser.findElements(byAid('schema-link'))
        expect(links.length).to.be.greaterThan(0)
      }),
    
    getRenderedSchemaNames: co.wrap(function*() {
      const links = yield browser.findElements(byAid('schema-link'))
      return Promise.all(links.map(link => link.getText()))
    }),
    
    selectSchema: co.wrap(function*(index) {
      const links = yield browser.findElements(byAid('schema-link'))
      expect(links.length, `Cannot open schema #${index}, index out of bounds`).to.be.greaterThan(0)
   
      yield links[index].click()

      return eventually(function*() {
        const grid = yield browser.findElements(byAid('cm-grid-container'))
        expect(grid.length).to.equal(1)

        return gridDriverCreator(browser, webdriver)
      })
    })
  }
}
