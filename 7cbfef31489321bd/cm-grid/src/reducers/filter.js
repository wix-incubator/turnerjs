'use strict'

const merge_ = require('lodash/fp/merge')

const actions = require('../actionTypes')

const initialState = {
  filterModel: [],
  filterForm: null
}

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case actions.FILTER_FORM_OPEN:
      return Object.assign({}, state, {filterForm: {condition: {}}})

    case actions.FILTER_FORM_CLOSE:
      return Object.assign({}, state, {filterForm: null})

    case actions.REMOVE_ALL_FILTERS:
      return Object.assign({}, state, {filterModel: []})

    case actions.CHANGE_FILTER_FORM:
      if (action.data.fieldKey) {
        return Object.assign({}, state, {
          filterForm: merge_(state.filterForm, action.data, {
            condition: Object.assign(state.filterForm.condition, {filterType: null})
          })
        })
      }

      return Object.assign({}, state, {
        filterForm: merge_(state.filterForm, action.data)
      })

    case actions.SAVE_FILTER_FORM:
      let filterModel, filterForm
      if (state.filterForm.currentIndex === undefined) {
        filterModel = [
          ...state.filterModel,
          Object.assign({}, state.filterForm)
        ]
        filterForm = Object.assign({}, state.filterForm, {currentIndex: filterModel.length - 1})
      } else {
        filterModel = [...state.filterModel]
        filterModel[state.filterForm.currentIndex] = Object.assign({}, state.filterForm)
        filterForm = state.filterForm
      }

      return Object.assign({}, state, {filterModel}, {filterForm})

    case actions.EDIT_FILTER:
      return Object.assign({}, state, {filterForm: Object.assign({}, state.filterModel[action.index], {currentIndex: action.index})})

    case actions.REMOVE_FILTER:
      const newFilterModel = state.filterModel.filter((element, index) => index !== state.filterForm.currentIndex)

      if (newFilterModel.length === state.filterModel.length) {
        return Object.assign({}, state, {filterForm: null})
      }

      return Object.assign({}, state, {filterModel: newFilterModel}, {filterForm: null})

    case actions.OPEN_COLUMN_HEADER_FILTER_MENU:
      return Object.assign({}, state, {filterForm: {fieldKey: action.fieldKey, fieldType: action.fieldType, condition: {}}})

    default:
      return state
  }
}

module.exports.getFilterForm = state => state.filterForm
module.exports.getFilterModel = state => state.filterModel
