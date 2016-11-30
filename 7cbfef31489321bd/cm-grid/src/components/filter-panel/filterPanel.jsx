'use strict'

const React = require('react')
const {connect} = require('react-redux')

const actions = require('./actions')
const FilterList = require('./filterList')
const FilterForm = require('./filterForm')
const styles = require('./filterPanel.scss')

const {getFilterForm, getFilterModel} = require('../../reducer')

const mapStateToProps = (state) => ({
  filterForm: getFilterForm(state),
  filterModel: getFilterModel(state)
})
const mapDispatchToProps = actions

const FilterPanel = ({
  onFilterFormClose,
  onAddFilterClicked,
  onRemoveAllFilters,
  changeFilterForm,
  saveFilterForm,
  removeFilter,
  editFilter,
  closeForm,
  filterForm,
  fields,
  filterModel,
  isFromContextMenu
}) => (
  <div data-aid="filter-panel-wrapper" className={styles.filterPanelWrapper}>
    {filterForm ?
      (<FilterForm
        onClose={onFilterFormClose}
        fields={fields}
        onChange={changeFilterForm}
        filterForm={filterForm}
        save={saveFilterForm}
        remove={removeFilter}
        isFromContextMenu={isFromContextMenu}
        closeForm={closeForm}
      />) :
      (<FilterList
          onAddFilterClicked={onAddFilterClicked}
          onRemoveAllFilters={onRemoveAllFilters}
          filterModel={filterModel}
          fields={fields}
          editFilter={editFilter}
        />)}
  </div>
)

FilterPanel.propTypes = {
  fields: React.PropTypes.array.isRequired,
  isFromContextMenu: React.PropTypes.bool.isRequired,
  closeForm: React.PropTypes.func
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterPanel)
