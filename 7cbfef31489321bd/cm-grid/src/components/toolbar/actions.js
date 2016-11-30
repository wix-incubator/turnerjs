'use strict'

const types = require('../../actionTypes')
const {setIsRowBeingAdded} = require('../app-container/actions')

exports.onColumnVisibilityChange = (field, isHidden) => ({
  type: types.TOGGLE_COLUMN_VISIBILITY,
  field,
  isHidden
})

exports.onToggleDropdown = name => ({
  type: types.TOGGLE_DROPDOWN,
  name
})

exports.setIsRowBeingAdded = setIsRowBeingAdded
