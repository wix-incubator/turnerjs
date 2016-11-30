define(['testUtils', 'fake!core'], function (testUtils, fakeCore) {
    'use strict';

    var siteData = new fakeCore.SiteData();
    siteData.currentUrl = {
            query: {

            }
        };

    var siteAPI = new fakeCore.SiteAPI();
    siteAPI.getSiteData = function(){return siteData;};

    function getComponent(props) {
        return testUtils.componentBuilder('wysiwyg.common.components.InfoTip', props);
    }

    function getPackagePicker() {
        var aspect = {
            setSelected: jasmine.createSpy('setSelected'),
            isPackagePickerSelected: jasmine.createSpy('isPackagePickerSelected')
        };

        spyOn(siteAPI, 'getSiteAspect').and.returnValue(aspect);

        return testUtils.componentBuilder('wysiwyg.common.components.packagepicker.viewer.PackagePicker', {
            //skin: 'wysiwyg.common.components.packagepicker.viewer.skins.PackagePickerSkin',
            compData: {
                selectByDefault: true
            },
            compProp: {
                buttonTopOffset: 0,
                radioButtonGap: 0
            },
            siteAPI: siteAPI,
            siteData: siteData
        });
    }

    function waitForOpen(infoTip, packagePicker) {
        infoTip.showToolTip({}, {source: packagePicker.refs.tooltipArea});
        jasmine.clock().tick(501);
    }

    xdescribe('infoTip component', function () {
        var props;

        beforeEach(function() {
            jasmine.clock().install();
            props = {
                skin: 'wixapps.integration.skins.ecommerce.options.InfoTipSkin',
                compData: {
                    "content": "Blue"
                },
                siteAPI: siteAPI,
                siteData: siteData
            };
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it("should create the component", function () {
            var infoTip = getComponent(props);
            var refData = infoTip.getSkinProperties();
            expect(refData).toBeDefined();
            expect(refData.content).toBeDefined();
        });

        describe('showToolTip', function () {
            it("should show a tip after 500 ms", function () {
                var infoTip = getComponent(props);
                var packagePicker = getPackagePicker();

                // act
                waitForOpen(infoTip, packagePicker);

                // assert
                expect(infoTip.state.$hidden).toBe('');
            });

            it("should NOT show a tip if closeToolTip was called before 500 ms", function () {
                var infoTip = getComponent(props);
                var packagePicker = getPackagePicker();

                // act
                infoTip.showToolTip({}, {source: packagePicker.refs.tooltipArea});
                jasmine.clock().tick(499);
                infoTip.closeToolTip();
                jasmine.clock().tick(501);

                // assert
                expect(infoTip.state.$hidden).toBe('hidden');
            });
        });

        it("should be hidden when mouse leaves and doesn't return", function(){
            var infoTip = getComponent(props);

            infoTip.onMouseLeave();
            expect(infoTip.state.isMouseInside).toBe(false);
            expect(infoTip.state.$hidden).toBe("hidden");
        });

        it("should close a tip after mouse lease the tip area", function(){
            var infoTip = getComponent(props);
            var packagePicker = getPackagePicker();

            // act
            waitForOpen(infoTip, packagePicker);
            infoTip.onMouseEnter();
            infoTip.onMouseLeave();

            // assert
            expect(infoTip.state.$hidden).toBe("hidden");
        });

        it("should stay visible when mouse is outside source container but inside a tip container", function(){
            var infoTip = getComponent(props);
            var packagePicker = getPackagePicker();

            // act
            waitForOpen(infoTip, packagePicker);
            infoTip.closeToolTip();

            infoTip.onMouseEnter();
            jasmine.clock().tick(149);

            // assert
            expect(infoTip.state.$hidden).toBe("");
        });
    });
});
