'use strict'

const types = require('../actionTypes')

const initialState = {
  fieldKey: null,
  displayName: null,
  fieldType: null,
  isSystemField: false,
  isUndefinedField: false
}

module.exports = (state = initialState, action) => {
  
  switch (action.type) {
  
    case types.OPEN_COLUMN_HEADER_CONTEXT_MENU:
      // we populate form values before actual form is opened
      // because on actual 'open field properties' action we have no access to full field object
      // could be refactored to respond to 'open field properties' action if we add cm-grid fields to state
      return Object.assign({}, state, {
        fieldKey: action.field.key,
        displayName: action.field.displayName,
        fieldType: action.field.type,
        isSystemField: action.field.isSystemField,
        isUndefinedField: action.field.isUndefinedField
      })
    
    case types.UPDATE_FIELD_PROPERTIES_FORM:
      return Object.assign({}, state, {[action.key]: action.value})
    
    case types.CLEAR_FIELD_PROPERTIES_FORM:
      return Object.assign({}, initialState)
    
    default:
      return state
  }
}

module.exports.getFormValues = state => state
