'use strict'

const React = require('react')

const constants = require('../../constants')
const Image = require('../image/image')

const SortIcon = ({sortIndex, direction, showSortIndex}) => {
  if (direction === constants.AG_GRID.SORT.ASCENDING) {
    return (
      <span>
        <span className="ag-header-icon ag-sort-ascending-icon" data-aid="sort-asc">
          <Image src="sort-down.png" />
        </span>
        {showSortIndex ?
          <span data-aid="sort-index">{sortIndex + 1}</span> :
          null
        }
      </span>
    )
  } else if (direction === constants.AG_GRID.SORT.DESCENDING) {
    return (
      <span>
        <span className="ag-header-icon ag-sort-descending-icon" data-aid="sort-desc">
          <Image src="sort-up.png" />
        </span>
        {showSortIndex ?
          <span data-aid="sort-index">{sortIndex + 1}</span> :
          null
        }
      </span>
    )
  }
  return null
}

module.exports = SortIcon
