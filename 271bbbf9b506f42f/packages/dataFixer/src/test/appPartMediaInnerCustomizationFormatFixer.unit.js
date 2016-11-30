define([
    'dataFixer/plugins/appPartMediaInnerCustomizationFormatFixer',
    'coreUtils'
], function (appPartMediaInnerCustomizationFormatFixer, coreUtils) {

    'use strict';


    describe('appPartMediaInnerCustomizationFormatFixer', function () {

        describe('exec', function () {

            var DESKTOP_FORMAT = '';


            var MOBILE_FORMAT = 'Mobile';


            var COMMON_FORMAT = '*';


            describe('when called with page JSON containing data of AppPart component', function () {

                beforeEach(function () {
                    spyOn(appPartMediaInnerCustomizationFormatFixer, 'isAppPartType').and.returnValue(true);
                });


                describe('and the component data has desktop customization for media inner view', function () {

                    beforeEach(function () {
                        spyOn(coreUtils.appPartMediaInnerViewNameUtils, 'isMediaInnerViewName').and.returnValue(true);
                    });


                    it('should convert the customization into common one if there is no mobile or common customization for the field ID and the view', function () {
                        var customizations = [
                            stubCustomizationWithFormat(DESKTOP_FORMAT)
                        ];

                        var pageJson = stubPageJsonWithAppPartHavingCustomizations(customizations);
                        appPartMediaInnerCustomizationFormatFixer.exec(pageJson);

                        expect(customizations).toEqual([
                            stubCustomizationWithFormat(COMMON_FORMAT)
                        ]);
                    });


                    it('should not convert the customization into common one if there is mobile customization for the field ID and the view', function () {
                        var customizations = [
                            stubCustomizationWithFormat(DESKTOP_FORMAT),
                            stubCustomizationWithFormat(MOBILE_FORMAT)
                        ];

                        var pageJson = stubPageJsonWithAppPartHavingCustomizations(customizations);
                        appPartMediaInnerCustomizationFormatFixer.exec(pageJson);

                        expect(customizations).toEqual([
                            stubCustomizationWithFormat(DESKTOP_FORMAT),
                            stubCustomizationWithFormat(MOBILE_FORMAT)
                        ]);
                    });


                    it('should not convert the customization into common one if there is common customization for the field ID and the view', function () {
                        var customizations = [
                            stubCustomizationWithFormat(DESKTOP_FORMAT),
                            stubCustomizationWithFormat(COMMON_FORMAT)
                        ];

                        var pageJson = stubPageJsonWithAppPartHavingCustomizations(customizations);
                        appPartMediaInnerCustomizationFormatFixer.exec(pageJson);

                        expect(customizations).toEqual([
                            stubCustomizationWithFormat(DESKTOP_FORMAT),
                            stubCustomizationWithFormat(COMMON_FORMAT)
                        ]);
                    });

                });


                describe('and the component data has desktop customization for view other than media inner', function () {

                    beforeEach(function () {
                        spyOn(coreUtils.appPartMediaInnerViewNameUtils, 'isMediaInnerViewName').and.returnValue(false);
                    });


                    it('should not convert the customization into common one if there is no mobile or common customization for the field ID and the view', function () {
                        var customizations = [
                            stubCustomizationWithFormat(DESKTOP_FORMAT)
                        ];

                        var pageJson = stubPageJsonWithAppPartHavingCustomizations(customizations);
                        appPartMediaInnerCustomizationFormatFixer.exec(pageJson);

                        expect(customizations).toEqual([
                            stubCustomizationWithFormat(DESKTOP_FORMAT)
                        ]);
                    });

                });


                describe('and the component data has customizations [null]', function () {

                    it('should not throw', function () {
                        var pageJson = stubPageJsonWithAppPartHavingCustomizations([null]);
                        expect(function () {
                            appPartMediaInnerCustomizationFormatFixer.exec(pageJson);
                        }).not.toThrow();
                    });

                });

            });


            describe('when called with page JSON containing data of component other than AppPart and the component data has desktop customization for media inner view', function () {

                beforeEach(function () {
                    spyOn(appPartMediaInnerCustomizationFormatFixer, 'isAppPartType').and.returnValue(false);
                    spyOn(coreUtils.appPartMediaInnerViewNameUtils, 'isMediaInnerViewName').and.returnValue(true);
                });


                it('should not convert the customization into common one if there is no mobile or common customization for the field ID and the view', function () {
                    var customizations = [
                        stubCustomizationWithFormat(DESKTOP_FORMAT)
                    ];

                    var pageJson = stubPageJsonWithAppPartHavingCustomizations(customizations);
                    appPartMediaInnerCustomizationFormatFixer.exec(pageJson);

                    expect(customizations).toEqual([
                        stubCustomizationWithFormat(DESKTOP_FORMAT)
                    ]);
                });

            });


            function stubCustomizationWithFormat(format) {
                return {
                    fieldId: 'some field ID',
                    format: format,
                    view: 'some view'
                };
            }


            function stubPageJsonWithAppPartHavingCustomizations(customizations) {
                return {
                    data: {
                        document_data: {
                            appPart: {
                                appLogicCustomizations: customizations,
                                type: 'AppPart'
                            }
                        }
                    }
                };
            }

        });


        describe('isAppPartType', function () {

            describe('when called with "AppPart"', function () {

                var returnValue;


                beforeEach(function () {
                    returnValue = appPartMediaInnerCustomizationFormatFixer.isAppPartType('AppPart');
                });


                it('should return true', function () {
                    expect(returnValue).toBe(true);
                });

            });


            describe('when called with "NonAppPart"', function () {

                var returnValue;


                beforeEach(function () {
                    returnValue = appPartMediaInnerCustomizationFormatFixer.isAppPartType('NonAppPart');
                });


                it('should return false', function () {
                    expect(returnValue).toBe(false);
                });

            });

        });

    });

});
