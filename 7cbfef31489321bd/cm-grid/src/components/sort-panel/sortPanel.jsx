'use strict'

const React = require('react')
const {connect} = require('react-redux')

const {getSortModel, getSortForm} = require('../../reducer')
const SortForm = require('./sortForm')
const SortList = require('./sortList')
const actions = require('./actions')
const styles = require('./sortPanel.scss')

const mapDispatchToProps = actions

const mapStateToProps = (state) => ({
  sortModel: getSortModel(state),
  sortForm: getSortForm(state)
})

const SortPanel = (props) => {
  if (props.sortForm) {
    return (
      <div data-aid="sort-panel-wrapper" className={styles.sortPanelWrapper}>
        <SortForm
          sortForm={props.sortForm}
          fields={props.fields}
          onSortFormClose={props.onSortFormClose}
          onSortFormChanged={props.onSortFormChanged}
          field={props.field}
          fromColumnContextMenu={props.fromColumnContextMenu}
          onSave={props.onSortFormSave}
          onRemoveSort={props.onRemoveSort}
        />
      </div>
    )
  }
  return (
    <div data-aid="sort-panel-wrapper" className={styles.sortPanelWrapper}>
      <SortList
        sortModel={props.sortModel}
        onAddSortClicked={props.onAddSortClicked}
        fields={props.fields}
        onRemoveAllSorts={props.onRemoveAllSorts}
        onSortEdit={props.onSortEdit}
      />
    </div>
  )
}

SortPanel.propTypes = {
  sortModel: React.PropTypes.array.isRequired,
  sortForm: React.PropTypes.object,
  fields: React.PropTypes.array.isRequired,
  field: React.PropTypes.string,
  fromColumnContextMenu: React.PropTypes.bool
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(SortPanel)
