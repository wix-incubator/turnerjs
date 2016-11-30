const omit_ = require('lodash/fp/omit')

const systemFields = {
  _id: {displayName: 'ID', type: 'text'},
  _createdDate: {displayName: 'Created', type: 'datetime'},
  _updatedDate: {displayName: 'Updated', type: 'datetime'},
  _owner: {displayName: 'Owner', type: 'text'}
}

const dropSystemFields = columnDefs => omit_(Object.keys(systemFields), columnDefs)

module.exports = {systemFields, dropSystemFields}
