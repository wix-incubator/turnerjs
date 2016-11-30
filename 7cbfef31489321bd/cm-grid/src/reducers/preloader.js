'use strict'

const actions = require('../actionTypes')

const initialState = {
  displayed: false
}

module.exports = (state = initialState, {type, message}) => {
  switch (type) {
    case actions.SHOW_PRELOADER:
      return {
        displayed: true,
        message
      }

    case actions.HIDE_PRELOADER:
      return {
        displayed: false
      }

    default:
      return state
  }
}

module.exports.isOverlayDisplayed = state => state.displayed

module.exports.getOverlayMessage = state => state.message
