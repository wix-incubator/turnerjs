const constants = require('../constants')

const handleNumberFilter = (query, fieldName, filterType, filterValue) => {
  switch (filterType) {
    case constants.AG_GRID.FILTER.NUMBER.TYPE.EQUALS:
      return query.eq(fieldName, filterValue)

    case constants.AG_GRID.FILTER.NUMBER.TYPE.LESS_THAN:
      return query.lt(fieldName, filterValue)

    case constants.AG_GRID.FILTER.NUMBER.TYPE.LESS_THAN_OR_EQUAL:
      return query.le(fieldName, filterValue)

    case constants.AG_GRID.FILTER.NUMBER.TYPE.GREATER_THAN:
      return query.gt(fieldName, filterValue)

    case constants.AG_GRID.FILTER.NUMBER.TYPE.GREATER_THAN_OR_EQUAL:
      return query.ge(fieldName, filterValue)

    case constants.AG_GRID.FILTER.NUMBER.TYPE.IS_SET:
      return query

    case constants.AG_GRID.FILTER.NUMBER.TYPE.IS_NOT_SET:
      return query
  }

  return query
}

const handleTextFilter = (query, fieldName, filterType, filterValue) => {
  switch (filterType) {
    case constants.AG_GRID.FILTER.TEXT.TYPE.CONTAINS:
      return query.contains(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.EQUALS:
      return query.eq(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.STARTS_WITH:
      return query.startsWith(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.ENDS_WITH:
      return query.endsWith(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.LESS_THAN:
      return query.lt(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.LESS_THAN_OR_EQUAL:
      return query.le(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.GREATER_THAN:
      return query.gt(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.GREATER_THAN_OR_EQUAL:
      return query.ge(fieldName, filterValue)

    case constants.AG_GRID.FILTER.TEXT.TYPE.IS_SET:
      return query

    case constants.AG_GRID.FILTER.TEXT.TYPE.IS_NOT_SET:
      return query
  }

  return query
}

const handleDateTimeFilter = (query, fieldKey, filterType, filterValue, from, to) => {
  switch (filterType) {
    case constants.AG_GRID.FILTER.DATETIME.TYPE.EQUALS:
      return query.eq(fieldKey, filterValue)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN:
      return query.lt(fieldKey, filterValue)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN_OR_EQUAL:
      return query.le(fieldKey, filterValue)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN:
      return query.gt(fieldKey, filterValue)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN_OR_EQUAL:
      return query.ge(fieldKey, filterValue)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.BETWEEN:
      return query.between(fieldKey, from, to)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.TOMORROW:
      return query.tomorrow(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.TODAY:
      return query.today(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.YESTERDAY:
      return query.yesterday(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_WEEK:
      return query.nextWeek(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_WEEK:
      return query.currentWeek(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_WEEK:
      return query.lastWeek(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_MONTH:
      return query.nextMonth(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_MONTH:
      return query.currentMonth(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_MONTH:
      return query.lastMonth(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_YEAR:
      return query.nextYear(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.THIS_YEAR:
      return query.thisYear(fieldKey)

    case constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_YEAR:
      return query.lastYear(fieldKey)
  }

  return query
}

const handleBooleanFilter = (query, fieldKey, filterType, filterValue) => {
  switch (filterType) {
    case constants.AG_GRID.FILTER.BOOLEAN.TYPE.EQUALS:
      return query.eq(fieldKey, filterValue)
  }

  return query
}

const filterHandler = (filterModel, query) => {
  if (filterModel.length !== 0) {
    filterModel.forEach(function (model) {
      const filterType = model.condition.filterType
      const fieldKey = model.fieldKey

      let filterValue
      switch (model.fieldType) {
        case constants.AG_GRID.FILTER.NUMBER.NAME:
          filterValue = model.condition.value
          query = handleNumberFilter(query, fieldKey, filterType, parseInt(filterValue))
          break
        case constants.AG_GRID.FILTER.TEXT.NAME:
          filterValue = model.condition.value
          query = handleTextFilter(query, fieldKey, filterType, filterValue)
          break
        case constants.AG_GRID.FILTER.DATETIME.NAME:
          const from = new Date(model.condition.from)
          const to = new Date(model.condition.to)
          filterValue = new Date(model.condition.value)
          query = handleDateTimeFilter(query, fieldKey, filterType, filterValue, from, to)
          break
        case constants.AG_GRID.FILTER.BOOLEAN.NAME:
          filterValue = model.condition.value
          query = handleBooleanFilter(query, fieldKey, filterType, filterValue)
      }
    })
  }

  return query
}

module.exports = filterHandler
