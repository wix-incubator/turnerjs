define(['testUtils', 'widgets/core/modelBuilderDataHelper'], function(testUtils, modelBuilderDataHelper){
    'use strict';

    describe('getWidgetType', function(){

        it('should return Page for regular page', function(){
            var pageData = testUtils.mockFactory.dataMocks.pageData();

            var result = modelBuilderDataHelper.getWidgetType(pageData);

            expect(result).toEqual('Page');
        });

        it('should return Popup for popup page', function(){
            var popupData = testUtils.mockFactory.dataMocks.pageData({isPopup: true});

            var result = modelBuilderDataHelper.getWidgetType(popupData);

            expect(result).toEqual('Popup');
        });

        it('should return undefined for data item that is not page', function(){
            var unknownDataItem = testUtils.mockFactory.dataMocks.buttonData();

            var result = modelBuilderDataHelper.getWidgetType(unknownDataItem);

            expect(result).toEqual(undefined);
        });
    });
});
