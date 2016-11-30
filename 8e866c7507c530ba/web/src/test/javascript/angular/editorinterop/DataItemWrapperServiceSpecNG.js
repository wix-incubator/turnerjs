describe('Unit: DataItemWrapper', function () {
    'use strict';

    var dataItemWrapper;

    var dummyDataItem = getDummyDataItem();



    beforeEach(module('editorInterop'));

    beforeEach(inject(function (_dataItemWrapper_) {
        dataItemWrapper = _dataItemWrapper_;
    }));

    describe('DataItemWrapper - ', function(){

        var wrappedDI;

        beforeEach(function(){
            wrappedDI = dataItemWrapper.wrapDataItem(dummyDataItem);
        });
        it('creates a wrapper around a data Item', function(){
            expect(wrappedDI).toBeDefined();
            expect(wrappedDI._dataItem).toBeDefined();
            expect(wrappedDI.item1).toEqual('item1');
        });

        it('retrieves the correct data from the data item',function(){
            expect(wrappedDI.item1).toEqual('item1');
        });

        it('creates a property for items in the schema',function(){
            expect(wrappedDI.item3).toEqual('item3');
        });

        it('it calls data items events on set', function(){
            wrappedDI.item1 = 'setItem1';
            expect(dummyDataItem.set).toHaveBeenCalledWith('item1','setItem1');
        });

        it('retrieves the original data Item ', function(){
            var retrievedDI = wrappedDI.getLegacyDataItem();
            expect(retrievedDI).toEqual(dummyDataItem);
        });

        it('removes the dataItem event on destroy', function(){
            wrappedDI.destroy();
            expect(dummyDataItem.offByListener).toHaveBeenCalledWith(wrappedDI);
        });
    });


});