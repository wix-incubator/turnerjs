'use strict'

const React = require('react')
const find_ = require('lodash/find')
const template_ = require('lodash/template')
const {listItem, DEFAULT_FIELD_TYPE} = require('./constants')

const getFieldName = (fields, fieldKey) => find_(fields, (fieldDefinition) => fieldDefinition.key === fieldKey).displayName

const getList = (filterModel, getFieldName, editFilter) => {
  if (filterModel.length === 0) {
    return (
      <div data-aid="no-filters-message">No Filters Applied</div>
    )
  }
  return filterModel.map((filter, index) => (
    <div
      data-aid="filter-list-item"
      key={index}
      onClick={() => editFilter(index)}
    >
      {
        listItem[filter.fieldType] ?
          template_(listItem[filter.fieldType][filter.condition.filterType])({
            fieldName: getFieldName(filter.fieldKey),
            filterValue: filter.condition.value
          }) :
          template_(listItem[DEFAULT_FIELD_TYPE][filter.condition.filterType])({
            fieldName: getFieldName(filter.fieldKey),
            filterValue: filter.condition.value
          })
      }
    </div>
  ))
}

const FilterList = ({
  onAddFilterClicked,
  onRemoveAllFilters,
  editFilter,
  filterModel,
  fields
}) => (
  <div data-aid="filter-list-wrapper">
    {getList(filterModel, getFieldName.bind(null, fields), editFilter)}
    <div>
      <a href="#" onClick={onAddFilterClicked} data-aid="filter-list-add-filter">Add Filter</a>
    </div>
    {filterModel.length === 0 ? null : (
      <div>
        <a href="#" onClick={onRemoveAllFilters} data-aid="filter-list-remove-all">Clear Filter</a>
      </div>
    )}
  </div>
)

FilterList.propTypes = {
  onAddFilterClicked: React.PropTypes.func.isRequired,
  onRemoveAllFilters: React.PropTypes.func.isRequired,
  editFilter: React.PropTypes.func.isRequired,
  filterModel: React.PropTypes.array.isRequired,
  fields: React.PropTypes.array.isRequired
}

module.exports = FilterList
