'use strict'

const set_ = require('lodash/fp/set')
const merge_ = require('lodash/fp/merge')

const actions = require('../actionTypes')

const initialState = {
  fields: [],
  collectionName: null,
  lastFieldAdded: null
}

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.SCHEMA_LOADED:
      return {
        fields: action.fields,
        collectionName: action.collectionName
      }

    case actions.SUBMIT_FIELD_PROPERTIES_FORM:
      const newField = {displayName: action.field.displayName, type: action.field.type}
      return set_(['fields', action.field.key], merge_(state.fields[action.field.key], newField), state)

    case actions.ADD_FIELD:
      return Object.assign(set_(['fields', action.fieldKey], action.field, state), {lastFieldAdded: action.fieldKey})

    default:
      return state
  }
}

module.exports.getCollectionName = state => state.collectionName
module.exports.getIsSchemaLoaded = state => state.collectionName !== null
module.exports.getFields = state => state.fields
module.exports.getLastFieldAdded = state => state.lastFieldAdded

