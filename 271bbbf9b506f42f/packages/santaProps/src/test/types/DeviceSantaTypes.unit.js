define(['testUtils', 'santaProps/types/modules/DeviceSantaTypes'], function (/** testUtils */ testUtils, DeviceSantaTypes) {
    'use strict';

    describe('DeviceSantaType.', function () {

        describe('isTabletDevice', function () {

            it('should return true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTabletDevice').and.returnValue(true);

                var isTabletDevice = DeviceSantaTypes.isTabletDevice.fetch({siteData: siteData});
                var isTabletDeviceRequired = DeviceSantaTypes.isTabletDevice.isRequired.fetch({siteData: siteData});

                expect(isTabletDevice).toEqual(true);
                expect(isTabletDeviceRequired).toEqual(true);
            });

            it('should return false', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTabletDevice').and.returnValue(false);

                var isTabletDevice = DeviceSantaTypes.isTabletDevice.fetch({siteData: siteData});
                var isTabletDeviceRequired = DeviceSantaTypes.isTabletDevice.isRequired.fetch({siteData: siteData});

                expect(isTabletDevice).toEqual(false);
                expect(isTabletDeviceRequired).toEqual(false);
            });

        });

        describe('isMobileDevice', function () {

            it('should return true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isMobileDevice').and.returnValue(true);

                var isMobileDevice = DeviceSantaTypes.isMobileDevice.fetch({siteData: siteData});
                var isMobileDeviceRequired = DeviceSantaTypes.isMobileDevice.isRequired.fetch({siteData: siteData});

                expect(isMobileDevice).toEqual(true);
                expect(isMobileDeviceRequired).toEqual(true);
            });

            it('should return false', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isMobileDevice').and.returnValue(false);

                var isMobileDevice = DeviceSantaTypes.isMobileDevice.fetch({siteData: siteData});
                var isMobileDeviceRequired = DeviceSantaTypes.isMobileDevice.isRequired.fetch({siteData: siteData});

                expect(isMobileDevice).toEqual(false);
                expect(isMobileDeviceRequired).toEqual(false);
            });

        });

        describe('isMobileDevice', function () {

            it('should return true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isMobileDevice').and.returnValue(true);

                var isMobileDevice = DeviceSantaTypes.isMobileDevice.fetch({siteData: siteData});
                var isMobileDeviceRequired = DeviceSantaTypes.isMobileDevice.isRequired.fetch({siteData: siteData});

                expect(isMobileDevice).toEqual(true);
                expect(isMobileDeviceRequired).toEqual(true);
            });

            it('should return false', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isMobileDevice').and.returnValue(false);

                var isMobileDevice = DeviceSantaTypes.isMobileDevice.fetch({siteData: siteData});
                var isMobileDeviceRequired = DeviceSantaTypes.isMobileDevice.isRequired.fetch({siteData: siteData});

                expect(isMobileDevice).toEqual(false);
                expect(isMobileDeviceRequired).toEqual(false);
            });

        });

        describe('isTouchDevice', function () {

            it('should return true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTouchDevice').and.returnValue(true);

                var isTouchDevice = DeviceSantaTypes.isTouchDevice.fetch({siteData: siteData});
                var isTouchDeviceRequired = DeviceSantaTypes.isTouchDevice.isRequired.fetch({siteData: siteData});

                expect(isTouchDevice).toEqual(true);
                expect(isTouchDeviceRequired).toEqual(true);
            });

            it('should return false', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTouchDevice').and.returnValue(false);

                var isTouchDevice = DeviceSantaTypes.isTouchDevice.fetch({siteData: siteData});
                var isTouchDeviceRequired = DeviceSantaTypes.isTouchDevice.isRequired.fetch({siteData: siteData});

                expect(isTouchDevice).toEqual(false);
                expect(isTouchDeviceRequired).toEqual(false);
            });

        });

        describe('isDesktopDevice', function () {

            it('should return true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTouchDevice').and.returnValue(false);

                var isDesktopDevice = DeviceSantaTypes.isDesktopDevice.fetch({siteData: siteData});
                var isDesktopDeviceRequired = DeviceSantaTypes.isDesktopDevice.isRequired.fetch({siteData: siteData});

                expect(isDesktopDevice).toEqual(true);
                expect(isDesktopDeviceRequired).toEqual(true);
            });

            it('should return false', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'isTouchDevice').and.returnValue(true);

                var isDesktopDevice = DeviceSantaTypes.isDesktopDevice.fetch({siteData: siteData});
                var isDesktopDeviceRequired = DeviceSantaTypes.isDesktopDevice.isRequired.fetch({siteData: siteData});

                expect(isDesktopDevice).toEqual(false);
                expect(isDesktopDeviceRequired).toEqual(false);
            });

        });

        it('devicePixelRatio should return the devicePixelRatio from mobile analyzer', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            spyOn(siteData.mobile, 'getDevicePixelRatio').and.returnValue(6.66);

            var devicePixelRatio = DeviceSantaTypes.devicePixelRatio.fetch({siteData: siteData});
            var devicePixelRatioRequired = DeviceSantaTypes.devicePixelRatio.isRequired.fetch({siteData: siteData});

            expect(devicePixelRatio).toEqual(6.66);
            expect(devicePixelRatioRequired).toEqual(6.66);
        });

    });

});
