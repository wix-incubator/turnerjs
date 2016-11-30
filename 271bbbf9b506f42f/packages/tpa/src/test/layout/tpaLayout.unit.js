define(['definition!tpa/layout/tpaLayout'], function(tpaLayoutDef) {
    'use strict';

    describe('TPALayout', function() {
        beforeEach(function() {
            this.fakeLayout = {
                registerRequestToMeasureDom: jasmine.createSpy('registerRequestToMeasureDom'),
                registerSAFEPatcher: jasmine.createSpy('registerSAFEPatcher'),
                registerCustomMeasure: jasmine.createSpy('registerCustomMeasure'),
                registerRequestToMeasureChildren: jasmine.createSpy('registerRequestToMeasureChildren')
            };

            this.fakeGluedWidgetPatcher = {
                patchGluedWidget: function() {}
            };

            this.fakeGluedWidgetMeasurer = {
                measureGluedWidget: function () {},
                measureWixAdComponent: function () {}
            };

            this.fakeGluedWidgetPatcherCtor = jasmine.createSpy().and.returnValue(this.fakeGluedWidgetPatcher);
            this.fakeGluedWidgetMeasurerCtor = jasmine.createSpy().and.returnValue(this.fakeGluedWidgetMeasurer);

            this.fakeGluedWidgetPlacementStrategy = {};

            this.fakeTPASectionPatcher = {
                patchTPASection: function () {}
            };

            this.fakeTPAWidgetPatcher = {
                measureTPA: function () {}
            };

            this.fakeMobileSafariPatcher = {
                patchWidth: function () {}
            };


            tpaLayoutDef(this.fakeLayout, this.fakeGluedWidgetPatcherCtor, this.fakeGluedWidgetMeasurerCtor, this.fakeTPASectionPatcher, this.fakeTPAWidgetPatcher, this.fakeGluedWidgetPlacementStrategy, this.fakeMobileSafariPatcher);
        });

        it('constructs `GluedWidgetPatcher` correctly', function () {
            expect(this.fakeGluedWidgetPatcherCtor).toHaveBeenCalledWith(this.fakeGluedWidgetPlacementStrategy);
        });

        describe('register calls to registerRequestToMeasureDom', function () {
            it('should register TPAWidget', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPAWidget');
            });

            it('should register TPASection', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPASection');
            });

            it('should register TPAGluedWidget', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPAGluedWidget');
            });
        });

        describe('register calls to registerSAFEPatcher', function() {
            it('should register the TPAGluedWidget patcher', function () {
                expect(this.fakeLayout.registerSAFEPatcher).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPAGluedWidget', this.fakeGluedWidgetPatcher.patchGluedWidget);
            });

            it('should register the TPASection patcher', function () {
                expect(this.fakeLayout.registerSAFEPatcher).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPASection', this.fakeTPASectionPatcher.patchTPASection);
            });

            it('should register the TPAWidget patcher', function () {
                expect(this.fakeLayout.registerSAFEPatcher).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPAWidget', this.fakeMobileSafariPatcher.patchWidth);
            });
        });

        describe('register calls to registerCustomMeasure', function() {

            it('should register the WixAdsMobile custom measure', function () {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.WixAdsMobile', this.fakeGluedWidgetMeasurer.measureWixAdComponent);
            });

            it('should register the WixAdsDesktop custom measure', function () {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.WixAdsDesktop', this.fakeGluedWidgetMeasurer.measureWixAdComponent);
            });

            it('should register the TPAWidget', function() {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPAWidget', this.fakeTPAWidgetPatcher.measureTPA);
            });

            it('should register the TPASection', function() {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPASection', this.fakeTPAWidgetPatcher.measureTPA);
            });
        });

        describe('register calls to registerRequestToMeasureChildren', function () {
            it('should register the WixAdsMobile children', function () {
                expect(this.fakeLayout.registerRequestToMeasureChildren).toHaveBeenCalledWith('wysiwyg.viewer.components.WixAdsMobile', [['desktopWADTop'], ['desktopWADBottom'], ['mobileWADTop']]);
            });

            it('should register the WixAdsDesktop children', function () {
                expect(this.fakeLayout.registerRequestToMeasureChildren).toHaveBeenCalledWith('wysiwyg.viewer.components.WixAdsDesktop', [['desktopWADTop'], ['desktopWADBottom'], ['mobileWADTop']]);
            });

            it('should register the TPASection children', function() {
                expect(this.fakeLayout.registerRequestToMeasureChildren).toHaveBeenCalledWith('wysiwyg.viewer.components.tpapps.TPASection', [['iframe']]);
            });
        });
    });
});
