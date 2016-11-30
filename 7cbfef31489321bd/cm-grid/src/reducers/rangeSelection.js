'use strict'

const {HIGHLIGHT_COLUMNS} = require('../actionTypes')

const initialState = {
  columns: []
}

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case HIGHLIGHT_COLUMNS:
      return Object.assign({}, state, {columns: action.columns})

    default:
      return state
  }
}

module.exports.getHighlightedColumns = state => state.columns
