'use strict'

const types = require('../../actionTypes')
const {showPreloader} = require('../preloader/actions')

exports.onAddFilterClicked = () => ({
  type: types.FILTER_FORM_OPEN
})

exports.onRemoveAllFilters = () => ({
  type: types.REMOVE_ALL_FILTERS
})

exports.onFilterFormClose = () => ({
  type: types.FILTER_FORM_CLOSE
})

exports.changeFilterForm = data => ({
  type: types.CHANGE_FILTER_FORM,
  data
})

exports.saveFilterForm = () => (dispatch, getState) => {
  showPreloader(dispatch, getState, 'Applying Filters')

  dispatch({
    type: types.SAVE_FILTER_FORM
  })
}

exports.editFilter = index => ({
  type: types.EDIT_FILTER,
  index
})

exports.removeFilter = () => ({
  type: types.REMOVE_FILTER
})
