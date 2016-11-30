define(['siteUtils/core/MobileDeviceAnalyzer'], function (MobileDeviceAnalyzer) {
    'use strict';

    describe('MobileDeviceAnalyzer', function () {
        var mobileDeviceAnalyzer, requestModel;

        var desktopAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.45 Safari/537.36";
        var samsungS3Chrome = "Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";
        var tabletIPADAgent = "Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53";

        beforeEach(function () {
            requestModel = {};
            mobileDeviceAnalyzer = new MobileDeviceAnalyzer(requestModel);
        });

        describe('hiding <iframe> within rounded corners', function () {
            function supports(userAgent) {
                requestModel.userAgent = userAgent;
                expect(mobileDeviceAnalyzer.cannotHideIframeWithinRoundedCorners()).toBe(false);
            }

            function doesNotSupport(userAgent) {
                requestModel.userAgent = userAgent;
                expect(mobileDeviceAnalyzer.cannotHideIframeWithinRoundedCorners()).toBe(true);
            }

            describe("Devices detection", function() {

                describe("Is 'Mobile' device", function() {

                    beforeEach(function() {
                        spyOn(mobileDeviceAnalyzer, 'isTouchScreen').and.returnValue(true);
                        requestModel.userAgent = samsungS3Chrome;
                    });

                    it("should return 'true' if device is mobile in 'Portrait' mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(true);
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(360);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(640);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeTruthy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeFalsy();
                    });

                    it("should return 'true' if device is mobile in 'Landscape' mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(false);
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(640);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(360);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeTruthy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeFalsy();
                    });
                });

                describe("Is 'Laptop' with touch screen device", function() {

                    beforeEach(function() {
                        spyOn(mobileDeviceAnalyzer, 'isTouchScreen').and.returnValue(true);
                        requestModel.userAgent = desktopAgent;
                    });

                    it("Landscape (orientation) mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(1920);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(1080);
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(false);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeFalsy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeFalsy();
                    });

                    it("Portrait (orientation) mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(1080);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(1920);
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(true);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeFalsy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeFalsy();
                    });
                });

                describe("Is 'Tablet' device", function() {
                    beforeEach(function() {
                        spyOn(mobileDeviceAnalyzer, 'isTouchScreen').and.returnValue(true);
                        requestModel.userAgent = tabletIPADAgent;
                    });

                    it("Landscape (orientation) mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(1024);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(768);
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(false);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeFalsy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeTruthy();
                    });

                    it("Portrait (orientation) mode", function() {
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(768);
                        spyOn(mobileDeviceAnalyzer, 'getScreenHeight').and.returnValue(1024);
                        spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(true);

                        expect(mobileDeviceAnalyzer.isMobileDevice()).toBeFalsy();
                        expect(mobileDeviceAnalyzer.isTabletDevice()).toBeTruthy();
                    });

                    describe('for specific user agents', function() {
                        it('should detect Galaxy Tab S on chrome as a Tablet device', function() {
                            // MAX_TABLET_WIDTH is now 1280 instead of 1100
                            // native has a userAgent with Chrome 28 version - isNewChromeOnAndroid() should return false
                            var deviceWidth = 800;
                            var deviceHeight = 1280;
                            var userAgent = 'Mozilla/5.0 (Linux; Android 4.4.2; en-us; SAMSUNG SM-T800 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/1.5 Chrome/28.0.1500.94 Safari/537.36';
                            spyOn(mobileDeviceAnalyzer, 'isWindowUnavailable').and.returnValue(false);
                            spyOn(mobileDeviceAnalyzer, 'getScreenDimensions').and.returnValue({width: deviceWidth, height: deviceHeight});
                            spyOn(mobileDeviceAnalyzer, 'isPortrait').and.returnValue(true);
                            spyOn(mobileDeviceAnalyzer, 'isLandscape').and.returnValue(false);
                            requestModel.userAgent = userAgent;

                            expect(mobileDeviceAnalyzer.isTabletDevice()).toEqual(true);
                            expect(mobileDeviceAnalyzer.isMobileDevice()).toEqual(false);

                            // switching to landscape mode should return the same results
                            mobileDeviceAnalyzer.getScreenDimensions.and.returnValue({width: deviceHeight, height: deviceWidth});
                            mobileDeviceAnalyzer.isPortrait.and.returnValue(false);
                            mobileDeviceAnalyzer.isLandscape.and.returnValue(true);
                            expect(mobileDeviceAnalyzer.isTabletDevice()).toEqual(true);
                            expect(mobileDeviceAnalyzer.isMobileDevice()).toEqual(false);
                        });
                    });
                });

                describe("Screen width", function() {

                    beforeEach(function() {
                        spyOn(mobileDeviceAnalyzer, 'getDevicePixelRatio').and.returnValue(1);
                    });

                    describe("Mobile - should return width according to orientation", function() {
                        it("should return the smaller value for width on Portrait mode", function() {
                            requestModel.userAgent = samsungS3Chrome;

                            spyOn(mobileDeviceAnalyzer, 'getScreenDimensions').and.returnValue({width: 360, height: 640});
                            spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(true);

                            expect(mobileDeviceAnalyzer.getScreenWidth()).toBe(360);

                        });

                        it("should return the bigger value for width on Landscape mode", function() {
                            requestModel.userAgent = samsungS3Chrome;

                            spyOn(mobileDeviceAnalyzer, 'getScreenDimensions').and.returnValue({width: 640, height: 360});
                            spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(false);

                            expect(mobileDeviceAnalyzer.getScreenWidth()).toBe(640);
                        });
                    });

                    describe("Laptop - should return width according to orientation", function() {
                        it("should return the bigger value for width on Landscape mode", function() {
                            requestModel.userAgent = desktopAgent;

                            spyOn(mobileDeviceAnalyzer, 'getScreenDimensions').and.returnValue({width: 1920, height: 1080});
                            spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(false);

                            expect(mobileDeviceAnalyzer.getScreenWidth()).toBe(1920);
                        });

                        it("should return the smaller value for width on Portrait mode", function() {
                            requestModel.userAgent = desktopAgent;

                            spyOn(mobileDeviceAnalyzer, 'getScreenDimensions').and.returnValue({width: 1080, height: 1920});
                            spyOn(mobileDeviceAnalyzer, 'isPortraitByScreenSize').and.returnValue(true);

                            expect(mobileDeviceAnalyzer.getScreenWidth()).toBe(1080);

                        });
                    });
                });
            });

            describe("Zoom", function() {
                describe("getZoom", function() {
                    it("should get a default zoom of scale '1' when not running on browser", function() {
                        spyOn(mobileDeviceAnalyzer, 'isWindowUnavailable').and.returnValue(true);

                        var zoom = mobileDeviceAnalyzer.getZoom();

                        expect(zoom).toEqual(1);
                    });

                    it("should get the correct zoom according to screen measurements", function() {
                        var viewPortWidth = 321;
                        var deviceCurrentWidth = 640;
                        spyOn(mobileDeviceAnalyzer, 'isWindowUnavailable').and.returnValue(false);
                        spyOn(mobileDeviceAnalyzer, 'getWindowInnerWidth').and.returnValue(viewPortWidth);
                        spyOn(mobileDeviceAnalyzer, 'getScreenWidth').and.returnValue(deviceCurrentWidth);

                        var zoom = mobileDeviceAnalyzer.getZoom();

                        expect(zoom).toEqual(deviceCurrentWidth / viewPortWidth);
                    });
                });

                describe("inverted zoom", function () {
                    it("should check for ZOOM IN value", function() {
                        spyOn(mobileDeviceAnalyzer, 'getZoom').and.returnValue(10);

                        var invertedZoom = mobileDeviceAnalyzer.getInvertedZoomRatio();

                        expect(invertedZoom).toBe(0.1);
                    });

                    it("should check for ZOOM OUT value", function() {
                        spyOn(mobileDeviceAnalyzer, 'getZoom').and.returnValue(0.5);

                        var invertedZoom = mobileDeviceAnalyzer.getInvertedZoomRatio();

                        expect(invertedZoom).toBe(2);
                    });
                });
            });

            it('is considered to be supported for empty user agent', function () {
                supports('');
            });

            it('should be supported for non-AppleWebKit user agents', function () {
                supports('Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14');
            });

            describe('for AppleWebKit versions in user agent', function () {
                it('is considered to be supported for undefined version', function () {
                    supports('Mozilla/5.0 (Some device) AppleWebKit (KHTML, like Gecko) Mobile/11A465');
                });

                it('should be supported for 3-digit major version >= 537', function () {
                    supports('new browser: AppleWebKit/537 (KHTML, like Gecko)');
                });

                it('should be supported for 4-digit major version that is alphabetically lesser', function () {
                    supports('very new browser: AppleWebKit/1001.23 (KHTML, like Gecko)');
                });

                it('is not supported for 7-digit version < 537', function () {
                    doesNotSupport('old browser: AppleWebKit/536.99.99 (KHTML, like Gecko)');
                });
            });

            describe('for specific user agents', function () {
                it('is supported by Safari on iOS 7', function () {
                    supports('Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465');
                });

                it('is supported by native browser on Android 4.4', function () {
                    supports('Mozilla/5.0 (Linux; U; Android 4.4.4; pl-pl; SK17i Build/KTU84P) AppleWebKit/537.16 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.16');
                });

                it('is supported by Chrome browser on Android 4.1', function () {
                    supports('Mozilla/5.0 (Linux; Android 4.1.2; IQ451 Build/JZO54K) AppleWebKit/537.36 (KHTML like Gecko) Chrome/35.0.1916.138 Mobile Safari/537.36');
                });

                it('is not supported by Safari on iOS 6', function () {
                    doesNotSupport('Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25');
                });

                it('is not supported by native browser on Android 4.3', function () {
                    doesNotSupport('Mozilla/5.0 (Linux; U; Android 4.3; en-gb; GT-I9300 Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30');
                });
            });
        });
    });
});
