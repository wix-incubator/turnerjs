const sortHandler = require('./sortHandler')
const filterHandler = require('./filterHandler')

function WixDatasource({wixData, collectionName, showPreloader, hidePreloader}) {
  this.wixData = wixData
  this.collectionName = collectionName
  this.totalCount = 0
  this.showPreloader = showPreloader
  this.hidePreloader = hidePreloader
}

WixDatasource.prototype.getRows = function (params, sortModel, filterModel) {
  this.showPreloader()

  return this.getCollectionData(params.startRow, params.endRow - params.startRow, params, sortModel, filterModel)
    .then(result => ({
      items: result.items,
      totalCount: result.totalCount,
      isLastRowReached: !result.hasNext()
    }))
    .then(result => addEmptyRowIfNoData.call(this, result))
    .then(result => storeTotalCount.call(this, result))
    .then(result => {
      this.hidePreloader()

      return result
    })
}

WixDatasource.prototype.getCollectionData = function (start, number, params, sortModel, filterModel) {
  const query = sortHandler(sortModel, this.wixData.query(this.collectionName))
  return filterHandler(filterModel, query)
    .limit(number).skip(start).find()
}

WixDatasource.prototype.query = function () {
  return this.wixData.query(this.collectionName)
}

WixDatasource.prototype.save = function(data) {
  return this.wixData.save(this.collectionName, data)
}

WixDatasource.prototype.update = function (data) {
  return this.wixData.update(this.collectionName, data)
}

WixDatasource.prototype.insert = function (data) {
  return this.wixData.insert(this.collectionName, data)
}

WixDatasource.prototype.getTotalCount = function () {
  return this.totalCount
}

WixDatasource.prototype.remove = function (id) {
  return this.wixData.remove(this.collectionName, id)
}

WixDatasource.prototype.getCollectionName = function () {
  return this.collectionName
}

function addEmptyRowIfNoData(result) {
  if (!result.totalCount) {
    return addEmptyRow.call(this, result)
  }
  return {
    items: result.items,
    totalCount: result.totalCount
  }
}

function addEmptyRow(result) {
  const items = result.items
  const totalCount = result.totalCount + 1

  this.totalCount = totalCount

  if (result.isLastRowReached) {
    items.push({})
  }

  return {
    items,
    totalCount
  }
} 

function storeTotalCount (result) {
  if (result.totalCount > this.totalCount) {
    this.totalCount = result.totalCount
  }
  return result
}

module.exports = WixDatasource
