'use strict'

const gridActionTypes = require('cm-grid/src/actionTypes')

const setIsRowBeingAdded = value => ({
  type: gridActionTypes.SET_IS_ROW_BEING_ADDED,
  value
})

exports.onColumnVisibilityChange = (field, isHidden) => ({
  type: gridActionTypes.TOGGLE_COLUMN_VISIBILITY,
  field,
  isHidden
})

exports.onToggleDropdown = name => ({
  type: gridActionTypes.TOGGLE_DROPDOWN,
  name
})

exports.setIsRowBeingAdded = setIsRowBeingAdded
