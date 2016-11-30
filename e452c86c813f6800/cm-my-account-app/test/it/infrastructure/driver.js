'use strict'

const co = require('co')
const {expect} = require('chai')
const eventually = require('dbsm-common-test/src/eventually')
const {byAid} = require('dbsm-common-test/src/it/automation')
const gridDriverCreator = require('cm-common-test/src/it/gridDriver')

module.exports = ($, appComponent) => ({

  waitForSchemasToLoad: () =>
    eventually(() => expect(byAid(appComponent, 'schema-link').length).to.be.greaterThan(0)),

  getRenderedSchemaNames: () =>
    byAid(appComponent, 'schema-link').toArray().map(el => $(el).text()),
  
  selectSchema: co.wrap(function*(index) {
    expect(byAid(appComponent, 'schema-link').length, `Cannot open schema #${index}, index out of bounds`).to.be.greaterThan(index)

    byAid(appComponent, 'schema-link').eq(index).simulate('click')

    return eventually(function*() {
      const grid = byAid(appComponent, 'cm-grid-container')
      expect(grid.length).to.equal(1)

      return gridDriverCreator($, grid)
    })
  })
})
