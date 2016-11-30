define(['coreUtils/core/appPartMediaInnerViewNameUtils'], function (appPartMediaInnerViewNameUtils) {

    'use strict';

    describe('appPartMediaInnerViewNameUtils', function () {

        it('should be an Object', function () {

            it('should be a Function', function () {
                expect(appPartMediaInnerViewNameUtils).toEqual(jasmine.any(Object));
            });

        });


        describe('getMediaInnerViewNames', function () {

            it('should be a Function', function () {
                expect(appPartMediaInnerViewNameUtils.getMediaInnerViewNames).toEqual(jasmine.any(Function));
            });


            describe('when called', function () {

                var returnValue;


                beforeEach(function () {
                    returnValue = appPartMediaInnerViewNameUtils.getMediaInnerViewNames();
                });


                it('should return an Array', function () {
                    expect(returnValue).toEqual(jasmine.any(Array));
                });


                describe('return value', function () {

                    it('should contain "FeaturedInner"', function () {
                        expect(returnValue).toContain('FeaturedInner');
                    });


                    it('should contain "FeaturedInnerMobile"', function () {
                        expect(returnValue).toContain('FeaturedInnerMobile');
                    });


                    it('should contain "MediaInner"', function () {
                        expect(returnValue).toContain('MediaInner');
                    });


                    it('should contain "MediaInnerCustom"', function () {
                        expect(returnValue).toContain('MediaInnerCustom');
                    });


                    it('should contain "PostsListMediaInner"', function () {
                        expect(returnValue).toContain('PostsListMediaInner');
                    });


                    it('should contain "SinglePostMediaInner"', function () {
                        expect(returnValue).toContain('SinglePostMediaInner');
                    });

                });

            });

        });


        describe('isMediaInnerViewName', function () {

            it('should be a Function', function () {
                expect(appPartMediaInnerViewNameUtils.isMediaInnerViewName).toEqual(jasmine.any(Function));
            });

            describe('when called', function () {

                describe('with "view name"', function () {

                    var OTHER_VIEW_NAME = 'other view name';


                    var VIEW_NAME = 'view name';


                    describe('if appPartMediaInnerViewNameUtils.getMediaInnerViewNames returns ["view name"]', function () {

                        var returnValue;


                        beforeEach(function () {
                            spyOn(appPartMediaInnerViewNameUtils, 'getMediaInnerViewNames').and.returnValue([VIEW_NAME]);
                            returnValue = appPartMediaInnerViewNameUtils.isMediaInnerViewName(VIEW_NAME);
                        });


                        it('should return true', function () {
                            expect(returnValue).toBe(true);
                        });

                    });


                    describe('if appPartMediaInnerViewNameUtils.getMediaInnerViewNames returns ["other view name"]', function () {

                        var returnValue;


                        beforeEach(function () {
                            spyOn(appPartMediaInnerViewNameUtils, 'getMediaInnerViewNames').and.returnValue([OTHER_VIEW_NAME]);
                            returnValue = appPartMediaInnerViewNameUtils.isMediaInnerViewName(VIEW_NAME);
                        });


                        it('should return false', function () {
                            expect(returnValue).toBe(false);
                        });

                    });


                    describe('if appPartMediaInnerViewNameUtils.getMediaInnerViewNames returns ["other view name", "view name"]', function () {

                        var returnValue;


                        beforeEach(function () {
                            spyOn(appPartMediaInnerViewNameUtils, 'getMediaInnerViewNames').and.returnValue([OTHER_VIEW_NAME, VIEW_NAME]);
                            returnValue = appPartMediaInnerViewNameUtils.isMediaInnerViewName(VIEW_NAME);
                        });


                        it('should return true', function () {
                            expect(returnValue).toBe(true);
                        });

                    });

                });

            });

        });

    });

});
