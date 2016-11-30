'use strict'

const constants = require('../../constants')

module.exports.listItem = {
  text: {
    contains: '${fieldName} contains text "${filterValue}"',
    endsWith: '${fieldName} ends with "${filterValue}"',
    eq: '${fieldName} is "${filterValue}"',
    ge: '${fieldName} is greater than or equal to "${filterValue}"',
    gt: '${fieldName} is greater than "${filterValue}"',
    le: '${fieldName} is less than or equal to "${filterValue}"',
    lt: '${fieldName} is less than "${filterValue}"',
    startsWith: '${fieldName} starts with "${filterValue}"',
    isSet: '${fieldName} is set',
    isNotSet: '${fieldName} is not set'
  },
  number: {
    eq: '${fieldName} is ${filterValue}',
    ge: '${fieldName} is greater than or equal to ${filterValue}',
    gt: '${fieldName} is greater than ${filterValue}',
    le: '${fieldName} is less than or equal to ${filterValue}',
    lt: '${fieldName} is less than ${filterValue}',
    isSet: '${fieldName} is set',
    isNotSet: '${fieldName} is not set'
  },
  datetime: {
    dateEq: '${fieldName} is "${filterValue}"',
    dateGe: '${fieldName} is greater than or equal to "${filterValue}"',
    dateGt: '${fieldName} is greater than "${filterValue}"',
    dateLe: '${fieldName} is less than or equal to "${filterValue}"',
    dateLt: '${fieldName} is less than "${filterValue}"',
    between: '${fieldName} is between "${fromValue}" - "${toValue}"',
    tomorrow: '${fieldName} is tomorrow',
    today: '${fieldName} is today',
    yesterday: '${fieldName} is yesterday',
    nextWeek: '${fieldName} is next week',
    currentWeek: '${fieldName} is current week',
    lastWeek: '${fieldName} is last week',
    nextMonth: '${fieldName} is next month',
    currentMonth: '${fieldName} is current month',
    lastMonth: '${fieldName} is last month',
    nextYear: '${fieldName} is next year',
    thisYear: '${fieldName} is this year',
    lastYear: '${fieldName} is last year'

  }
}

module.exports.DEFAULT_FIELD_TYPE = 'text'

module.exports.types = {
  text: [
    {
      value: 'contains',
      label: 'Contains'
    },
    {
      value: 'endsWith',
      label: 'Ends with'
    },
    {
      value: 'eq',
      label: 'Equals'
    },
    {
      value: 'ge',
      label: 'Greater than or equal'
    },
    {
      value: 'gt',
      label: 'Greater than'
    },
    {
      value: 'le',
      label: 'Less than or equal'
    },
    {
      value: 'lt',
      label: 'Less than'
    },
    {
      value: 'startsWith',
      label: 'Starts with'
    },
    {
      value: 'isSet',
      label: 'Is set'
    },
    {
      value: 'isNotSet',
      label: 'Is not set'
    }
  ],
  number: [
    {
      value: 'eq',
      label: 'Equals'
    },
    {
      value: 'ge',
      label: 'Greater than or equal'
    },
    {
      value: 'gt',
      label: 'Greater than'
    },
    {
      value: 'le',
      label: 'Less than or equal'
    },
    {
      value: 'lt',
      label: 'Less than'
    },
    {
      value: 'isSet',
      label: 'Is set'
    },
    {
      value: 'isNotSet',
      label: 'Is not set'
    }
  ],
  datetime: [
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.EQUALS,
      label: 'Equals'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN_OR_EQUAL,
      label: 'Greater than or equal'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN,
      label: 'Greater than'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN_OR_EQUAL,
      label: 'Less than or equal'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN,
      label: 'Less than'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.BETWEEN,
      label: 'Between'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.TOMORROW,
      label: 'Tomorrow'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.TODAY,
      label: 'Today'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.YESTERDAY,
      label: 'Yesterday'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_WEEK,
      label: 'Next week'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_WEEK,
      label: 'Current week'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_WEEK,
      label: 'Last week'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_MONTH,
      label: 'Next month'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_MONTH,
      label: 'Current month'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_MONTH,
      label: 'Last month'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_YEAR,
      label: 'Next year'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.THIS_YEAR,
      label: 'This year'
    },
    {
      value: constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_YEAR,
      label: 'Last year'
    }
  ],
  boolean: [
    {
      value: constants.AG_GRID.FILTER.BOOLEAN.TYPE.EQUALS,
      label: 'Is checked'
    }
  ]
}

const allTypes = {
  contains: 'contains',
  endsWith: 'endsWith',
  eq: 'eq',
  ge: 'ge',
  gt: 'gt',
  le: 'le',
  lt: 'lt',
  startsWith: 'startsWith',
  isSet: 'isSet',
  isNotSet: 'isNotSet',
  between: constants.AG_GRID.FILTER.DATETIME.TYPE.BETWEEN,
  dateEq: constants.AG_GRID.FILTER.DATETIME.TYPE.EQUALS,
  dateGe: constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN_OR_EQUAL,
  dateGt: constants.AG_GRID.FILTER.DATETIME.TYPE.GREATER_THAN,
  dateLe: constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN_OR_EQUAL,
  dateLt: constants.AG_GRID.FILTER.DATETIME.TYPE.LESS_THAN,
  booleanEq: constants.AG_GRID.FILTER.BOOLEAN.TYPE.EQUALS
}

module.exports.allTypes = allTypes

module.exports.noValueTypes = [
  allTypes.isSet,
  allTypes.isNotSet,
  constants.AG_GRID.FILTER.DATETIME.TYPE.TOMORROW,
  constants.AG_GRID.FILTER.DATETIME.TYPE.TODAY,
  constants.AG_GRID.FILTER.DATETIME.TYPE.YESTERDAY,
  constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_WEEK,
  constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_WEEK,
  constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_WEEK,
  constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_MONTH,
  constants.AG_GRID.FILTER.DATETIME.TYPE.CURRENT_MONTH,
  constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_MONTH,
  constants.AG_GRID.FILTER.DATETIME.TYPE.NEXT_YEAR,
  constants.AG_GRID.FILTER.DATETIME.TYPE.THIS_YEAR,
  constants.AG_GRID.FILTER.DATETIME.TYPE.LAST_YEAR
]
