'use strict'

const types = require('../../actionTypes')

exports.schemaLoaded = ({fields, collectionName}) => ({
  type: types.SCHEMA_LOADED,
  fields,
  collectionName
})

exports.addColumn = column => ({
  type: types.ADD_COLUMN,
  column
})

exports.setIsRowBeingAdded = value => ({
  type: types.SET_IS_ROW_BEING_ADDED,
  value
})

exports.addUndefinedFields = undefinedFields => ({
  type: types.ADD_UNDEFINED_FIELDS,
  undefinedFields
})

exports.openColumnHeaderContextMenu = ({field, left, top}) => ({
  type: types.OPEN_COLUMN_HEADER_CONTEXT_MENU,
  field,
  left,
  top
})

exports.openColumnHeaderPropertiesMenu = ({field}) => ({
  type: types.OPEN_COLUMN_HEADER_PROPERTIES_MENU,
  field
})

exports.closeColumnHeaderMenu = () => ({
  type: types.CLOSE_COLUMN_HEADER_MENU
})

exports.toggleSort = (data) => ({
  type: types.TOGGLE_SORT,
  data
})

exports.openFilterPanel = (fieldKey, fieldType) => ({
  type: types.OPEN_COLUMN_HEADER_FILTER_MENU,
  fieldKey,
  fieldType
})

exports.toggleDropdown = name => dispatch => {
  dispatch({type: types.TOGGLE_DROPDOWN, name})
}

exports.toggleColumnPin = ({fieldKey, isPinned}) => ({
  type: types.TOGGLE_COLUMN_PIN,
  fieldKey,
  isPinned
})

exports.onColumnVisibilityChange = (field, isHidden) => ({
  type: types.TOGGLE_COLUMN_VISIBILITY,
  field,
  isHidden
})

exports.highlightColumns = columns => ({
  type: types.HIGHLIGHT_COLUMNS,
  columns
})
