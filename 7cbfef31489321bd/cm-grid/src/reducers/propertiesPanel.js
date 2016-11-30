'use strict'

const actions = require('../actionTypes')

const initialState = false

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.OPEN_COLUMN_PROPERTIES:
      return {
        column: action.index,
        definition: action.definition
      }

    case actions.CLOSE_COLUMN_PROPERTIES:
      return false

    case actions.COLUMN_PROPERTIES_CHANGED:
      return Object.assign({}, state, {definition: action.definition})

    default:
      return state
  }
}
