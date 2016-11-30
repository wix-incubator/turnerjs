'use strict'

const React = require('react')
const find_ = require('lodash/find')

const getFieldName = (fields, field) => find_(fields, (fieldDefinition) => fieldDefinition.key === field).displayName

const getSortList = (sortModel, getFieldName, onClick) => {
  if (sortModel.length === 0) {
    return (
      <div data-aid="no-sort-message">No Sort Applied</div>
    )
  }

  return sortModel.map((sort, key) => (
    <div key={key} data-aid="sort-list-item" onClick={() => onClick(key)}>{getFieldName(sort.fieldKey)}: {sort.order === 'asc' ? 'A -> Z' : 'Z -> A'}</div>
  ))
}

const SortList = (props) => {
  const list = getSortList(props.sortModel, getFieldName.bind(null, props.fields), props.onSortEdit)

  return (
    <div data-aid="sort-list-wrapper">
      {list}
      <div>
        <a href="#" data-aid="sort-list-add-sort" onClick={props.onAddSortClicked}>+ Add Sort</a>
      </div>
      <div>
        {props.sortModel.length ? 
          <a href="#"
            data-aid="sort-list-remove-sort"
            onClick={props.onRemoveAllSorts}
          >
            Remove Sort
          </a> : null}
      </div>
    </div>
  )
}

SortList.propTypes = {
  sortModel: React.PropTypes.array.isRequired,
  fields: React.PropTypes.array.isRequired,
  onAddSortClicked: React.PropTypes.func.isRequired,
  onRemoveAllSorts: React.PropTypes.func.isRequired,
  onSortEdit: React.PropTypes.func.isRequired
}

module.exports = SortList
