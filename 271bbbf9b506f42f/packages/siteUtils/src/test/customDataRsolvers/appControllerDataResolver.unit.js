define([
    'lodash',
    'testUtils',
    'siteUtils/customDataResolvers/appControllerDataResolver'
], function (_, testUtils, appControllerDataResolver) {
    'use strict';
    describe('appControllerDataResolver', function () {

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.getData = this.siteData.dataResolver.getDataByQuery.bind(this, this.siteData.pagesData, 'masterPage', 'masterPage', this.siteData.dataTypes.DATA);
        });

        it('should call appControllerDataResolver for data of type "AppController"', function () {
            var spy = spyOn(appControllerDataResolver, 'resolve');
            var controllerData = this.siteData.mock.controllerData();

            this.getData(controllerData.id);

            expect(spy).toHaveBeenCalledWith(controllerData, jasmine.any(Function));
        });

        it('should parse controller settings', function () {
            var controllerData = this.siteData.mock.controllerData({settings: '{"a":{"b":1}}'});

            var result = this.getData(controllerData.id);

            expect(result.settings).toEqual(JSON.parse(controllerData.settings));
            expect(_.omit(result, 'settings')).toEqual(_.omit(controllerData, 'settings'));
        });

        it('should do nothing if controller has no settings', function(){
            var controllerData = this.siteData.mock.controllerData();

            var result = this.getData(controllerData.id);

            expect(result).toEqual(controllerData);
            expect(result.settings).toBeUndefined();
        });
    });
});
