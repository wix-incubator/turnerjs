'use strict'

const actions = require('../actionTypes')

const initialState = false

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.SET_IS_ROW_BEING_ADDED:
      return state = action.value

    default:
      return state
  }
}

module.exports.getIsRowBeingAdded = state => state
