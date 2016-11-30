'use strict'

exports.NAME = 'grid'

exports.AG_GRID = {
  SORT: {
    ASCENDING: 'asc',
    DESCENDING: 'desc'
  },
  FILTER: {
    NUMBER: {
      NAME: 'number',
      TYPE: {
        EQUALS: 'eq',
        LESS_THAN: 'lt',
        LESS_THAN_OR_EQUAL: 'le',
        GREATER_THAN: 'ge',
        GREATER_THAN_OR_EQUAL: 'gt',
        IS_SET: 'isSet',
        IS_NOT_SET: 'isNotSet'
      }
    },
    TEXT: {
      NAME: 'text',
      TYPE: {
        CONTAINS: 'contains',
        ENDS_WITH: 'endsWith',
        EQUALS: 'eq',
        GREATER_THAN_OR_EQUAL: 'ge',
        GREATER_THAN: 'gt',
        LESS_THAN_OR_EQUAL: 'le',
        LESS_THAN: 'lt',
        STARTS_WITH: 'startsWith',
        IS_SET: 'isSet',
        IS_NOT_SET: 'isNotSet'
      }
    },
    DATETIME: {
      NAME: 'datetime',
      TYPE: {
        EQUALS: 'dateEq',
        GREATER_THAN_OR_EQUAL: 'dateGe',
        GREATER_THAN: 'dateGt',
        LESS_THAN_OR_EQUAL: 'dateLe',
        LESS_THAN: 'dateLt',
        BETWEEN: 'dateBetween',
        TOMORROW: 'dateTomorrow',
        TODAY: 'dateToday',
        YESTERDAY: 'dateYesterday',
        NEXT_WEEK: 'dateNextWeek',
        CURRENT_WEEK: 'dateCurrentWeek',
        LAST_WEEK: 'dateLastWeek',
        NEXT_MONTH: 'dateNextMonth',
        CURRENT_MONTH: 'dateCurrentMonth',
        LAST_MONTH: 'dateLastMonth',
        NEXT_YEAR: 'dateNextYear',
        THIS_YEAR: 'dateThisYear',
        LAST_YEAR: 'dateLastYear'
      }
    },
    BOOLEAN: {
      NAME: 'boolean',
      TYPE: {
        EQUALS: 'booleanEq'
      }
    }
  }
}

exports.KEYS = {
  ENTER: 13,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  ESCAPE: 27,
  TAB: 9
}

exports.COLUMN_DROP_DOWN_TYPES = {
  CONTEXT: 'CONTEXT',
  PROPERTIES: 'PROPERTIES',
  SORT: 'SORT',
  FILTER: 'FILTER'
}

exports.FIELD_TYPE_OPTIONS = [
  {value: 'text', label: 'Text'},
  {value: 'image', label: 'Image'},
  {value: 'boolean', label: 'Yes/No'},
  {value: 'number', label: 'Number'},
  {value: 'datetime', label: 'Date Time'},
  {value: 'richtext', label: 'Rich Text'}
]

exports.UNDISCOVERABLE_FIELDS = [
  '_ctorName'
]

exports.ROW_HEIGHT = 31

exports.IMAGE_EDITOR_MODES = {
  MEDIA_MANAGER: 'MEDIA_MANAGER',
  NATIVE: 'NATIVE'
}

exports.IMAGE_SIZES = {
  THUMBNAIL: {
    WIDTH: 34,
    HEIGHT: 22
  },
  PREVIEW: {
    WIDTH: 334,
    HEIGHT: 157
  }
}
