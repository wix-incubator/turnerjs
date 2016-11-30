'use strict'

const types = require('../../actionTypes')
const {showPreloader} = require('../preloader/actions')

exports.onAddSortClicked = () => ({
  type: types.SORT_FORM_OPEN
})

exports.onSortFormClose = () => ({
  type: types.SORT_FORM_CLOSE
})

exports.onSortFormChanged = (data) => ({
  type: types.SORT_FORM_CHANGED,
  data
})

exports.onSortFormSave = () => (dispatch, getState) => {
  showPreloader(dispatch, getState, 'Applying Sort')

  dispatch({
    type: types.SORT_FORM_SAVE
  })
}

exports.onRemoveAllSorts = () => ({
  type: types.REMOVE_ALL_SORTS
})

exports.onRemoveSort = () => ({
  type: types.REMOVE_SORT
})

exports.onSortEdit = (index) => ({
  type: types.EDIT_SORT,
  index
})
