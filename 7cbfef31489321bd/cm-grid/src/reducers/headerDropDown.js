'use strict'

const constants = require('../constants')
const types = require('../actionTypes')

module.exports = (state = {isOpen: false}, action) => {
  switch (action.type) {

    case types.OPEN_COLUMN_HEADER_CONTEXT_MENU:
      return Object.assign({}, state, {
        isOpen: true,
        left: action.left,
        top: action.top,
        field: action.field.key,
        type: constants.COLUMN_DROP_DOWN_TYPES.CONTEXT
      })

    case types.OPEN_COLUMN_HEADER_PROPERTIES_MENU:
      return Object.assign({}, state, {
        type: constants.COLUMN_DROP_DOWN_TYPES.PROPERTIES
      })

    case types.CLOSE_COLUMN_HEADER_MENU:
      return {isOpen: false}

    case types.OPEN_COLUMN_HEADER_FILTER_MENU:
      return Object.assign({}, state, {
        type: constants.COLUMN_DROP_DOWN_TYPES.FILTER
      })

    default:
      return state
  }
}

module.exports.getHeaderDropDown = state => state
