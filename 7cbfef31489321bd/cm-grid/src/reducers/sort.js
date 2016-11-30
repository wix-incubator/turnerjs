'use strict'

const merge_ = require('lodash/fp/merge')

const actions = require('../actionTypes')

const initialState = {
  sortModel: [
    {
      fieldKey: '_createdDate',
      order: 'desc'
    }
  ],
  sortForm: null
}

module.exports = (state = initialState, action) => {
  switch (action.type) {

    case actions.SORT_FORM_OPEN:
      return Object.assign({}, state, {sortForm: {fieldKey: '', order: ''}})

    case actions.SORT_FORM_CLOSE:
      return Object.assign({}, state, {sortForm: null})

    case actions.SORT_FORM_CHANGED:
      return Object.assign({}, state, {
        sortForm: merge_(state.sortForm, action.data)
      })

    case actions.SORT_FORM_SAVE:
      let sortModel, sortForm
      if (state.sortForm.currentIndex === undefined) {
        sortModel = [
          ...state.sortModel,
          {fieldKey: state.sortForm.fieldKey, order: state.sortForm.order}
        ]
        sortForm = Object.assign({}, state.sortForm, {currentIndex: sortModel.length - 1})
      } else {
        sortModel = [...state.sortModel]
        sortModel[state.sortForm.currentIndex] = {fieldKey: state.sortForm.fieldKey, order: state.sortForm.order}
        sortForm = state.sortForm
      }

      return Object.assign({}, state, {sortModel}, {sortForm})

    case actions.REMOVE_ALL_SORTS:
      return {sortModel: [], sortForm: null}

    case actions.TOGGLE_SORT:
      return Object.assign({}, state, {
        sortModel: [
          {fieldKey: action.data.fieldKey, order: action.data.order}
        ]
      })

    case actions.REMOVE_SORT:
      const newSortModel = state.sortModel.filter((element, index) => index !== state.sortForm.currentIndex)
      return Object.assign({}, state, {sortModel: newSortModel}, {sortForm: null})

    case actions.EDIT_SORT:
      return Object.assign({}, state, {
        sortForm: Object.assign({}, state.sortModel[action.index], {currentIndex: action.index})
      })

    default:
      return state
  }
}

module.exports.getSortModel = state => state.sortModel
module.exports.getSortForm = state => state.sortForm
