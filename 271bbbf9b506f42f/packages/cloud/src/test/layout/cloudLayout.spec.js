define(['definition!cloud/layout/cloudLayout'], function(cloudLayoutDef) {
    'use strict';

    describe('CloudLayout', function() {
        beforeEach(function() {
            this.tpa = {
                tpaMeasurer: {
                    measureTPA: function () {}
                },
                tpaSectionPatcher: {
                    patchTPASection: function () {}
                }
            };

            this.fakeLayout = {
                registerRequestToMeasureDom: jasmine.createSpy('registerRequestToMeasureDom'),
                registerSAFEPatcher: jasmine.createSpy('registerSAFEPatcher'),
                registerCustomMeasure: jasmine.createSpy('registerCustomMeasure'),
                registerRequestToMeasureChildren: jasmine.createSpy('registerRequestToMeasureChildren')
            };

            this.fakeGluedWidgetPatcher = {
                patchGluedWidget: function() {},
                measureWixAdComponent: function() {}
            };

            this.tpa.GluedWidgetPatcher = jasmine.createSpy();
            this.tpa.GluedWidgetPatcher.and.returnValue(this.fakeGluedWidgetPatcher);
            this.fakeGluedWidgetPlacementStrategy = {};

            cloudLayoutDef(this.fakeLayout, this.tpa, this.fakeGluedWidgetPlacementStrategy);
        });

        it('constructs `GluedWidgetPatcher` correctly', function() {
            expect(this.tpa.GluedWidgetPatcher).toHaveBeenCalledWith(this.fakeGluedWidgetPlacementStrategy);
        });

        describe('register calls to registerRequestToMeasureDom', function() {
            it('should register CloudWidget', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudWidget');
            });

            it('should register CloudPage', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudPage');
            });

            it('should register CloudWidget', function () {
                expect(this.fakeLayout.registerRequestToMeasureDom).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudGluedWidget');
            });
        });

        describe('register calls to registerSAFEPatcher', function() {
            it('should register the CloudGluedWidget patcher', function () {
                expect(this.fakeLayout.registerSAFEPatcher).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudGluedWidget', this.fakeGluedWidgetPatcher.patchGluedWidget);
            });

            it('should register the CloudPage patcher', function () {
                expect(this.fakeLayout.registerSAFEPatcher).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudPage', this.tpa.tpaSectionPatcher.patchTPASection);
            });
        });

        describe('register calls to registerCustomMeasure', function() {
            it('should register the CloudWidget', function() {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudWidget', this.tpa.tpaMeasurer.measureTPA);
            });

            it('should register the CloudPage', function() {
                expect(this.fakeLayout.registerCustomMeasure).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudPage', this.tpa.tpaMeasurer.measureTPA);
            });
        });

        describe('register calls to registerRequestToMeasureChildren', function() {
            it('should register the TPASection children', function() {
                expect(this.fakeLayout.registerRequestToMeasureChildren).toHaveBeenCalledWith('wysiwyg.viewer.components.cloud.CloudPage', [['iframe']]);
            });
        });
    });
});
