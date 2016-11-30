const constants = require('../constants')

function sortHandler(sortModel, query) {
  if (sortModel.length !== 0) {
    sortModel.forEach(function (sort) {
      if (sort.order === constants.AG_GRID.SORT.ASCENDING) {
        query = query.ascending(sort.fieldKey)
      } else if (sort.order === constants.AG_GRID.SORT.DESCENDING) {
        query = query.descending(sort.fieldKey)
      }
    })
  }

  return query
}

module.exports = sortHandler
