'use strict'
const set_ = require('lodash/fp/set')
const actions = require('../actionTypes')

const initialState = {
  hidden: {_id: true, _createdDate: true, _updatedDate: true, _owner: true},
  width: [],
  pin: {}
}

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.TOGGLE_COLUMN_VISIBILITY:
      return set_(['hidden', action.field], action.isHidden, state)

    case actions.TOGGLE_COLUMN_PIN:
      return set_(['pin', action.fieldKey], action.isPinned, state)

    default:
      return state
  }
}

module.exports.getHiddenColumns = state => state.hidden
module.exports.getPinModel = state => state.pin
