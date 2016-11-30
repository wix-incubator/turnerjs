'use strict'

const actions = require('../actionTypes')

const initialState = null

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.OPEN_DROPDOWN:
      return action.name

    case actions.CLOSE_DROPDOWN:
      return null

    case actions.TOGGLE_DROPDOWN:
      return state === action.name ? null : action.name

    default:
      return state
  }
}

module.exports.getOpenDropDown = state => state
