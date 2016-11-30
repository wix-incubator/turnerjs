'use strict'

const find_ = require('lodash/find')

const {pages} = require('../constants')
const types = require('../actionTypes')

const initialState = {
  selectedPage: pages.COLLECTIONS,
  selectedCollection: null,
  selectedWebModule: null,
  selectedWebMethod: null,
  schemas: [],
  selectedSchema: null,
  environment: 'my-account-app'
}

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case types.LOAD_SCHEMAS_SUCCESS:
      return Object.assign({}, state, {schemas: action.schemas})
    
    case types.SELECT_SCHEMA:
      return Object.assign({}, state, {selectedSchema: action.schemaName})

    default:
      return state
  }
}

module.exports.getSchemas = state => state.schemas
module.exports.getSelectedSchema = state => find_(state.schemas, schema => schema.displayName === state.selectedSchema)
