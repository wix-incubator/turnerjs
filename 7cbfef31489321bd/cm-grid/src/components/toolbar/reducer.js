module.exports.getHiddenColumns = state => state.columnSettings.hidden
module.exports.getOpenDropDown = state => state.openDropDown
module.exports.getSortModel = state => state.sort.sortModel
module.exports.getSortForm = state => state.sort.sortForm
module.exports.getIsSyncInProgress = state => state.sync.inProgress
module.exports.getIsSyncCompleted = state => state.sync.completed
module.exports.getIsSyncFailed = state => state.sync.failed

