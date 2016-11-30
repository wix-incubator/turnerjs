'use strict'

const merge_ = require('lodash/fp/merge')
const isUndefined_ = require('lodash/isUndefined')

const {allTypes, noValueTypes} = require('./constants')

module.exports = (data, filterForm) => {
  const form = merge_(filterForm, data)

  if (!form.fieldKey || !form.fieldType || !form.condition) {
    return false
  }

  if (noValueTypes.indexOf(form.condition.filterType) !== -1) {
    return true
  }

  if (form.condition.filterType === allTypes.between) {
    return form.condition.from && form.condition.to
  }

  return !isUndefined_(form.condition.value)
}
