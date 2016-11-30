W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('editorData', function (dataItemWrapper) {
        var previewManagers = W.Preview.getPreviewManagers();


        var DATA_SOURCE = {
            WDATA: 'wdata',
            WTHEME: 'wtheme',
            PREVIEW_DATA: 'previewData',
            PREVIEW_THEME: 'previewTheme'
        };


        function _getManager(dataSource){
            var manager;
            switch (dataSource) {
                case 'wdata':
                    manager = W.Data;
                    break;
                case 'wtheme':
                    manager = W.Theme;
                    break;
                case 'previewData':
                    manager = previewManagers.Data;
                    break;
                case 'previewTheme':
                    manager = previewManagers.Theme;
            }
            return manager;
        }

        function getDataByQuery(query, dataSource) {
            return dataItemWrapper.wrapDataItem(_getManager(dataSource).getDataByQuery(query));
        }

        function addDataItem(id, dataObj, dataSource) {
            var dataItem = _getManager(dataSource).addDataItem(id, dataObj);
            return dataItemWrapper.wrapDataItem(dataItem);
        }

        function addDataItemWithUniqueId (prefix, dataObj, dataSource) {
            var itemAndId = _getManager(dataSource).addDataItemWithUniqueId(prefix, dataObj);
            itemAndId.dataObject = dataItemWrapper.wrapDataItem(itemAndId.dataObject);
            return itemAndId;
        }

        function createDataItem (dataObj, type, dataSource) {
            var dataItem = _getManager(dataSource).createDataItem(dataObj, type);
            return dataItemWrapper.wrapDataItem(dataItem);
        }

        return {
            getDataByQuery: getDataByQuery,
            addDataItem: addDataItem,
            addDataItemWithUniqueId: addDataItemWithUniqueId,
            createDataItem: createDataItem,
            DATA_SOURCE: DATA_SOURCE
        };
    });
});