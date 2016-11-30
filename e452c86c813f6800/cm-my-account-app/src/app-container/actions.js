'use strict'

const types = require('../actionTypes')

exports.loadSchemas = () => (dispatch, getState, {wixData}) => {
  wixData.getSchema()
    .then(({schemas}) => dispatch({type: types.LOAD_SCHEMAS_SUCCESS, schemas}))
    .catch(msg => dispatch({type: types.LOAD_SCHEMAS_ERROR, msg}))
}

exports.selectSchema = schemaName => ({
  type: types.SELECT_SCHEMA,
  schemaName
})
