'use strict'

const React = require('react')

const constants = require('../../constants')
const FilterIcon = require('./filterIcon')
const FilterSortDownIcon = require('./filterSortDownIcon')
const FilterSortUpIcon = require('./filterSortUpIcon')
const SortUpIcon = require('./sortUpIcon')
const SortDownIcon = require('./sortDownIcon')
const SortUpIndexIcon = require('./sortUpIndexIcon')
const SortDownIndexIcon = require('./sortDownIndexIcon')
const MenuIcon = require('./menuIcon')
const styles = require('./styles.scss')

const selectFilterSortIcon = (sortDirection) => {
  return sortDirection === constants.AG_GRID.SORT.DESCENDING ?
    <FilterSortUpIcon /> :
    <FilterSortDownIcon />
}

const selectSortIcon = (sortDirection, sortIndex, showSortIndex) => {

  if (showSortIndex) {
    return sortDirection === constants.AG_GRID.SORT.DESCENDING ?
      <SortUpIndexIcon sortIndex={sortIndex} /> :
      <SortDownIndexIcon sortIndex={sortIndex} />
  }

  return sortDirection === constants.AG_GRID.SORT.DESCENDING ?
    <SortUpIcon /> :
    <SortDownIcon />

}

const selectIcon = (isFiltered, isSorted, sortDirection, sortIndex, showSortIndex) => {
  if (isFiltered && isSorted) {
    return selectFilterSortIcon(sortDirection)
  } else if (isSorted) {
    return selectSortIcon(sortDirection, sortIndex, showSortIndex)
  } else if (isFiltered) {
    return <FilterIcon />
  }
  return <MenuIcon />
}

const RightIconArea = ({
  isFiltered,
  isSorted,
  sortDirection,
  sortIndex,
  showSortIndex,
  onMenuButtonClick
}) =>
  <div data-aid="context-menu-button" className={styles.iconAreaRight} onClick={onMenuButtonClick}>
    {selectIcon(isFiltered, isSorted, sortDirection, sortIndex, showSortIndex)}
  </div>

module.exports = RightIconArea
