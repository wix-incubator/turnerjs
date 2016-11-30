'use strict'

const actions = require('../actionTypes')

const initialState = []

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.ADD_UNDEFINED_FIELDS:
      return [...state, ...action.undefinedFields]

    case actions.ADD_COLUMN:
      return [...state, action.column.field]

    case actions.REMOVE_UNDEFINED_FIELD:
      const index = state.findIndex(field => field === action.field)
      return [
        ...state.splice(0, index),
        ...state.splice(index + 1)
      ]

    default:
      return state
  }
}

module.exports.getUndefinedFields = state => state
