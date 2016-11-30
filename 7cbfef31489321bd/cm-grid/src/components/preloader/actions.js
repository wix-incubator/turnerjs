'use strict'

const types = require('../../actionTypes')
const {getIsOverlayDisplayed} = require('../../reducer')

exports.showPreloader = (dispatch, getState, message) => {
  if (!getIsOverlayDisplayed(getState())) {
    dispatch({
      type: types.SHOW_PRELOADER,
      message
    })
  }
}

exports.hidePreloader = (dispatch) => {
  dispatch({
    type: types.HIDE_PRELOADER
  })
}
