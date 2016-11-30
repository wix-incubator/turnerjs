'use strict'
const types = require('../actionTypes')

const initialState = {
  fieldKey: null,
  title: null,
  fieldType: null,
  isTitleDirty: false
}

module.exports = (state = initialState, action) => {

  switch (action.type) {
    case types.UPDATE_ADD_FIELD_FORM:
      return Object.assign({}, state, {[action.key]: action.value})

    case types.CLEAR_ADD_FIELD_FORM:
      return Object.assign({}, initialState)

    default:
      return state
  }
}

module.exports.getKey = state => state.fieldKey

module.exports.getTitle = state => state.title

module.exports.getType = state => state.fieldType

module.exports.getIsTitleDirty = state => state.isTitleDirty
