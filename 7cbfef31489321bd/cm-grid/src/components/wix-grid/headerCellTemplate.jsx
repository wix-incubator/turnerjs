'use strict'

const React = require('react')
const ReactDOM = require('react-dom')
const ServiceContainer = require('dbsm-common/src/service-container/serviceContainer')
const serviceRepository = require('dbsm-common/src/service-container/services')

const ColumnHeader = require('../column-header/columnHeader')

module.exports = (store, columnDef, onHeaderCellRightClick, services) => {
  return () => {
    const mountPoint = document.createElement('span')
    const servicesWrapper = serviceRepository()
    servicesWrapper(services)

    ReactDOM.render(
      <ServiceContainer services={servicesWrapper}>
        <ColumnHeader
          columnDef={columnDef}
          onHeaderCellRightClick={onHeaderCellRightClick}
          store={store}
        />
      </ServiceContainer>,
      mountPoint)

    return mountPoint
  }
}

