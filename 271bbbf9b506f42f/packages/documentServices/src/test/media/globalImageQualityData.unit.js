define([
    'lodash',
    'testUtils',
    'documentServices/media/globalImageQualityData',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, testUtils, imageQuality, privateServicesHelper) {
    'use strict';
    describe('globalImageQualityData', function () {

        function getPrivateServices(data){
            var siteData = testUtils.mockFactory.mockSiteData();
            if (data) {
                siteData.addData(data);
            }
            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('get', function () {
            it('should return undefined if there is no global quality item', function () {
                var ps = getPrivateServices();
                var item = imageQuality.get(ps);

                expect(item).toBeUndefined();
            });

            it('should return global quality item if defined', function () {
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();
                var ps = getPrivateServices(data);
                var item = imageQuality.get(ps);

                expect(item).toEqual(data);
            });

        });

        describe('update', function () {
            it('should add a new global quality item if no item exits', function () {
                var ps = getPrivateServices();
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();

                imageQuality.update(ps, data);
                var after = imageQuality.get(ps);

                expect(after).toBeDefined();
                expect(_.omit(after, 'metaData')).toEqual(data);
            });

            it('should merge new unsharpMask data with existing global quality item (only first level merge)', function () {
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();
                var newData = {
                    unsharpMask: {
                        radius: 2,
                        amount: 2,
                        threshold: 2
                    }
                };
                var ps = getPrivateServices(data);

                imageQuality.update(ps, newData);
                var after = imageQuality.get(ps);

                expect(after.unsharpMask).toEqual(newData.unsharpMask);

            });

            it('should merge new data with existing global quality item (only first level merge)', function () {
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();
                var newData = {
                    quality: 80
                };
                var ps = getPrivateServices(data);

                imageQuality.update(ps, newData);
                var after = imageQuality.get(ps);

                expect(after.quality).toEqual(newData.quality);

            });

            it('should keep existing global quality item if merging an empty object', function () {
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();
                var newData = {};
                var ps = getPrivateServices(data);

                imageQuality.update(ps, newData);
                var after = imageQuality.get(ps);

                expect(after.unsharpMask).toEqual(data.unsharpMask);
                expect(after.quality).toEqual(data.quality);

            });
        });

        describe('update validations', function(){
            it('should fail if unsharpMask has less than 3 properties', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();

            });

            it('should fail if unsharpMask has unsupported properties', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: 2,
                        blabla: 3
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if radius is lower than 0', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: -1,
                        amount: 2,
                        threshold: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if radius is higher than 500', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 501,
                        amount: 2,
                        threshold: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if radius is 0 and any other value is not 0', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 0,
                        amount: 2,
                        threshold: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should pass if radius is 0 and all other values are 0 (for "None" value)', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 0,
                        amount: 0,
                        threshold: 0
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).not.toThrow();
                expect(_.omit(imageQuality.get(ps), 'metaData')).toEqual(data);
            });

            it('should fail if amount is lower than 0', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: -1,
                        threshold: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if amount is higher than 10', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: 11,
                        threshold: 2
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if threshold is lower than 0', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: 2,
                        threshold: -1
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if threshold is higher than 255', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    unsharpMask: {
                        radius: 2,
                        amount: 2,
                        threshold: 256
                    }
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if quality is lower than 0', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    quality: -1
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });

            it('should fail if quality is higher than 100', function(){
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData({
                    quality: 101
                });
                var ps = getPrivateServices();

                expect(imageQuality.update.bind(this, ps, data)).toThrow();
            });
        });

        describe('reset', function () {
            it('should empty existing global quality item if it exists', function () {
                var data = testUtils.mockFactory.dataMocks.globalImageQualityData();
                var ps = getPrivateServices(data);

                imageQuality.reset(ps);
                var after = imageQuality.get(ps);

                expect(_.omit(after, 'metaData')).toEqual(_.pick(data, ['type']));
            });

            it('should not create a new global quality item if it does not exist', function () {
                var ps = getPrivateServices();

                imageQuality.reset(ps);
                var after = imageQuality.get(ps);

                expect(after).toBeUndefined();
            });
        });
    });
});
