describe('Unit: EditorData', function () {
    'use strict';


    var editorData, dataItem;


    beforeEach(module('angularEditor'));

    beforeEach(inject(function (_editorData_) {
        editorData = _editorData_;
    }));

    describe('EditorData - ', function () {
        beforeEach(function() {
            dataItem = editorData.getDataByQuery('dummyData', editorData.DATA_SOURCE.WDATA);
        });

        it('queries the W.Data', function(){
            expect(W.Data.getDataByQuery).toHaveBeenCalledWith('dummyData');
        });

        it('retrives a wrappedItem', function(){
            expect(dataItem.item1).toEqual(dataItem._dataItem._data.item1);
        });

    });

    describe('uses the various data sources', function(){
       var previewManager;
       beforeEach(function(){
           previewManager = W.Preview.getPreviewManagers();
       });

       it ('queries W.Data', function(){
           dataItem = editorData.getDataByQuery('dummyData', editorData.DATA_SOURCE.WDATA);
           expect(W.Data.getDataByQuery).toHaveBeenCalledWith('dummyData');
       });

        it ('queries W.Theme', function(){
            dataItem = editorData.getDataByQuery('dummyData', editorData.DATA_SOURCE.WTHEME);
            expect(W.Theme.getDataByQuery).toHaveBeenCalledWith('dummyData');
        });

        it ('queries W.preview.Data', function(){
            dataItem = editorData.getDataByQuery('dummyData', editorData.DATA_SOURCE.PREVIEW_DATA);
            expect(previewManager.Data.getDataByQuery).toHaveBeenCalledWith('dummyData');
        });

        it ('queries W.previewTheme', function(){
            dataItem = editorData.getDataByQuery('dummyData', editorData.DATA_SOURCE.PREVIEW_THEME);
            expect(previewManager.Theme.getDataByQuery).toHaveBeenCalledWith('dummyData');
        });
    });

    describe(' creates a dataItem', function(){
        var dataObj = {
            item1: 'value1',
            item2: 'value2'
        };

        var id = 'yoyo';

        it('creates a simple data Item with addDataItem', function(){
            var dataItem =  editorData.addDataItem(id, dataObj, editorData.DATA_SOURCE.WDATA);
            expect(W.Data.addDataItem).toHaveBeenCalledWith(id, dataObj);
            expect(dataItem._dataItem._data.item1).toEqual(dataObj.item1);
        });

        it('creates a data item with addDataItemWithUniqueId', function(){
            var itemAndId = editorData.addDataItemWithUniqueId(id, dataObj, editorData.DATA_SOURCE.WDATA);
            expect(W.Data.addDataItemWithUniqueId).toHaveBeenCalledWith(id, dataObj);
            expect(itemAndId.dataObject._dataItem._data.item1).toEqual(dataObj.item1);
            expect(itemAndId.id).toEqual(id);
        });

        it('creates a data item with  createDataItem', function(){
            var type = '_dataType';
            var dataItem =  editorData.createDataItem(dataObj, type, editorData.DATA_SOURCE.WDATA);
            expect(W.Data.createDataItem).toHaveBeenCalledWith(dataObj, type);
            expect(dataItem._dataItem._data.item1).toEqual(dataObj.item1);
        });
    });
});