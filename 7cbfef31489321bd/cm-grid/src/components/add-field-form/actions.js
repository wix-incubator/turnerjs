'use strict'
const types = require('../../actionTypes')
const sanitize = require('./sanitize')
const {getCollectionName} = require('../../reducer')

exports.updateForm = ({key, value}) => dispatch => {
  dispatch({
    type: types.UPDATE_ADD_FIELD_FORM,
    key,
    value
  })

  if (key === 'title') {
    dispatch({
      type: types.UPDATE_ADD_FIELD_FORM,
      key: 'fieldKey',
      value: sanitize(value)
    })
  }
}

exports.addField = ({fieldKey, field}) => (dispatch, getState, {schemaApi}) => {

  if (sanitize(fieldKey) === '') {
    return
  }

  // This should be dispatched by component
  // When we have a smart component that contains add-field-button, dropDown and form itself, this can be refactored
  dispatch({
    type: types.CLOSE_DROPDOWN,
    name: 'add-field-form'
  })

  dispatch({
    type: types.CLEAR_ADD_FIELD_FORM
  })

  dispatch({
    type: types.ADD_FIELD,
    fieldKey,
    field
  })

  schemaApi.addField(getCollectionName(getState()), fieldKey, field)
}

exports.addUndefinedField = fieldName => dispatch => {
  const sanitizedKey = sanitize(fieldName)
  if (sanitizedKey === '') {
    return
  }

  dispatch({
    type: types.CLOSE_DROPDOWN,
    name: 'add-field-form'
  })

  dispatch({
    type: types.CLEAR_ADD_FIELD_FORM
  })

  dispatch({
    type: types.UPDATE_ADD_FIELD_FORM,
    key: 'fieldKey',
    value: ''
  })

  dispatch({
    type: types.ADD_UNDEFINED_FIELDS,
    undefinedFields: [sanitizedKey]
  })
}

exports.closeDropdown = () => dispatch => {
  dispatch({
    type: types.CLEAR_ADD_FIELD_FORM
  })
 
  dispatch({
    type: types.CLOSE_DROPDOWN,
    name: 'add-field-form'
  })
}
