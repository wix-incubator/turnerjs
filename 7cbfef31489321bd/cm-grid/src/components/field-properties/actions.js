'use strict'

const actionTypes = require('../../actionTypes')
const {getCollectionName} = require('../../reducer')

exports.updateForm = ({key, value}) => ({
  type: actionTypes.UPDATE_FIELD_PROPERTIES_FORM,
  key, 
  value
})

exports.updateFieldProperties = field => (dispatch, getState, {schemaApi}) => {
  dispatch({
    type: actionTypes.SUBMIT_FIELD_PROPERTIES_FORM,
    field
  })

  dispatch({
    type: actionTypes.CLEAR_FIELD_PROPERTIES_FORM
  })

  schemaApi.updateField(getCollectionName(getState()), field.key, field)
}

exports.addToSchema = field => (dispatch, getState, {schemaApi}) => {
  
  dispatch({
    type: actionTypes.REMOVE_UNDEFINED_FIELD,
    field: field.key
  })
  
  dispatch({
    type: actionTypes.SUBMIT_FIELD_PROPERTIES_FORM,
    field
  })
  
  dispatch({
    type: actionTypes.CLEAR_FIELD_PROPERTIES_FORM
  })
  
  schemaApi.addField(getCollectionName(getState()), field.key, field)
}
