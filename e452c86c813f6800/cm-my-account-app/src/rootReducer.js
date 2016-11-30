'use strict'

const {combineReducers} = require('redux')
const grid = require('cm-grid/src/reducer')
const {NAME} = require('cm-grid/src/constants')
const navigation = require('./app-container/reducer')
const toolbar = require('cm-grid/src/components/toolbar/reducer')
const app = require('./app-container/reducer')

module.exports = combineReducers({
  [NAME]: grid,
  navigation,
  app
})
  
module.exports.getHiddenColumns = state => toolbar.getHiddenColumns(state[NAME])
module.exports.getOpenDropDown = state => toolbar.getOpenDropDown(state[NAME])
module.exports.getSortModel = state => toolbar.getSortModel(state[NAME])
module.exports.getSortForm = state => toolbar.getSortForm(state[NAME])

module.exports.getSelectedPage = state => navigation.getSelectedPage(state.navigation)
module.exports.getSelectedCollection = state => navigation.getSelectedCollection(state.navigation)

module.exports.getSchemas = state => app.getSchemas(state.app)
module.exports.getSelectedSchema = state => app.getSelectedSchema(state.app)
