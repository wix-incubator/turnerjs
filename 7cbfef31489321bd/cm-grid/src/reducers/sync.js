'use strict'

const types = require('../actionTypes')

const initialState = {
  inProgress: false,
  completed: false,
  failed: false
}

module.exports = (state = initialState, action) => {

  switch (action.type) {
    case types.START_SYNC:
      return {inProgress: true, completed: false, failed: false}

    case types.SYNC_COMPLETED:
      return {inProgress: false, completed: true, failed: false}
    
    case types.SYNC_FAILED:
      return {inProgress: false, completed: false, failed: true}

    default:
      return state
  }
}

module.exports.getIsSyncInProgress = state => state.inProgress
module.exports.getIsSyncCompleted = state => state.completed
module.exports.getIsSyncFailed = state => state.failed
