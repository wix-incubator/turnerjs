'use strict'

const types = require('../../actionTypes')
const {getCollectionName} = require('../../reducer')

exports.copyAllItemsToLive = () => (dispatch, getState, {syncApi}) => {
  dispatch({type: types.START_SYNC})

  syncApi.copyDevToPublic(getCollectionName(getState()))
    .then(() => dispatch({type: types.SYNC_COMPLETED}), () => dispatch({type: types.SYNC_FAILED}))
}
