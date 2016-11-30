define([
    'lodash',
    'zepto',
    'utils',
    'layout/util/layout',
    'layout/util/singleCompLayout',
    'definition!layout/specificComponents/shapeLayout',
    'layout/specificComponents/svgShape/svgScaler'
], function (_,
             $,
             utils,
             layout,
             singleCompLayout,
             shapeLayoutDef,
             svgScaler) {
    'use strict';

    describe('shapeLayout', function () {

        describe('popups', function () {

            beforeEach(function () {
                this.registerPatcherSpy = spyOn(layout, 'registerPatcher');
                this.registerCustomMeasureSpy = spyOn(layout, 'registerCustomMeasure');

                shapeLayoutDef(
                    _,
                    $,
                    utils,
                    layout,
                    svgScaler
                );
            });

            it('registers a patcher for the component', function () {
                expect(this.registerPatcherSpy).toHaveBeenCalledWith(
                    'wysiwyg.viewer.components.PopupCloseIconButton', jasmine.any(Function));
            });

            it('registers a custom measure for the component', function () {
                expect(this.registerCustomMeasureSpy).toHaveBeenCalledWith(
                    'wysiwyg.viewer.components.PopupCloseIconButton', jasmine.any(Function));
            });

        });

        describe('Scale', function () {

            function Elem(childNodeArr) {
                var groupElem = {
                    childNodes: childNodeArr,
                    getElementsByTagName: function () {
                        return [this];
                    },
                    getBBox: function () {
                        return {x: 0, y: 0, width: 100, height: 100};
                    }
                };
                this.style = {};
                this.getElementsByTagName = function () {
                    return [groupElem];
                };
            }

            beforeEach(function () {
                this.compId = 'shape1';
                this.measureMap = {
                    height: {shape1: 100},
                    width: {shape1: 100},
                    custom: {shape1: {}}
                };

                this.nodesMap = {
                    shape1: new Elem([{tagName: 'g'}])
                };

                this.siteData = {};

                this.structureInfo = {
                    type: 'wysiwyg.viewer.components.svgshape.SvgShape',
                    propertiesItem: {
                        maintainAspectRatio: false
                    },
                    styleItem: {
                        skin: 'skin1',
                        style: {
                            properties: {
                                strokewidth: '3px'
                            }
                        }
                    }
                };

                this.siteData = {};
                this.featureSupportMock = spyOn(utils.svgFeatureDetection, 'flags').and.callThrough();
                shapeLayoutDef(
                    _,
                    $,
                    utils,
                    layout,
                    svgScaler
                );

                this.customMeasure = singleCompLayout.maps.classBasedCustomMeasures[this.structureInfo.type];
                this.patcher = singleCompLayout.maps.classBasedPatchers[this.structureInfo.type];
            });


            it('should not measure and patch when svg node does not exists', function () {

                //setup
                this.nodesMap = {
                    shape1: undefined
                };
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                expect(this.siteData.shapesBoundaries).not.toBeDefined();
                expect(this.measureMap.custom[this.compId].boundingBox).not.toBeDefined();

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).not.toHaveBeenCalled();
                expect(spyZeptoCss).not.toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });

            it('should not measure and patch when styleInfo does not exists', function () {

                //setup
                this.structureInfo.styleItem = undefined;
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                expect(this.siteData.shapesBoundaries).not.toBeDefined();
                expect(this.measureMap.custom[this.compId].boundingBox).not.toBeDefined();

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).not.toHaveBeenCalled();
                expect(spyZeptoCss).not.toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });

            it('should not patch if shape bounding box measure is missing', function () {

                //setup
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);
                //remove measure - simulate failure
                this.siteData = {};
                this.measureMap.custom[this.compId].boundingBox = undefined;

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).not.toHaveBeenCalled();
                expect(spyZeptoCss).not.toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });

            it('should use viewBox values when shape have no stroke', function () {

                //setup
                this.featureSupportMock.and.returnValue({isVectorEffect: true});
                // no stroke
                this.structureInfo.styleItem.style.properties.strokewidth = '0px';
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);
                var skinName = this.structureInfo.styleItem.skin;
                var expected = {x: 0, y: 0, width: 100, height: 100};

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                //expect
                expect(this.siteData.shapesBoundaries[skinName].boxBoundaries).toEqual(expected);

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).toHaveBeenCalled();
                expect(spyZeptoCss).toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });


            it('should use viewBox values when shape is stretched and the browser supports vector effect', function () {

                //setup
                this.featureSupportMock.and.returnValue({isVectorEffect: true});
                // stroke > 0
                this.structureInfo.styleItem.style.properties.strokewidth = '1px';
                // shape is stretched
                this.structureInfo.propertiesItem.maintainAspectRatio = false;
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);
                var skinName = this.structureInfo.styleItem.skin;
                var expected = {x: 0, y: 0, width: 100, height: 100};

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                //expect
                expect(this.siteData.shapesBoundaries[skinName].boxBoundaries).toEqual(expected);

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).toHaveBeenCalled();
                expect(spyZeptoCss).toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });

            it('should use viewBox values when shape isnt stretch and the browser doesnt supports vector effect', function () {
                //setup
                this.featureSupportMock.and.returnValue({isVectorEffect: false});
                // stroke > 0
                this.structureInfo.styleItem.style.properties.strokewidth = '1px';
                // shape isnt stretched
                this.structureInfo.propertiesItem.maintainAspectRatio = true;
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);
                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);
                var skinName = this.structureInfo.styleItem.skin;
                var expected = {x: 0, y: 0, width: 100, height: 100};

                //measure action
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                //expect
                expect(this.siteData.shapesBoundaries[skinName].boxBoundaries).toEqual(expected);

                //patcher action
                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);

                //expect
                expect(spyZeptoAttr).toHaveBeenCalled();
                expect(spyZeptoCss).toHaveBeenCalled();
                expect(svgScalerSpy).not.toHaveBeenCalled();
            });

            it('should use scalers when browser doesnt supported vector-effect, shape is stretched and has a stroke', function () {
                //mock browser support
                var mockFalsyVectorEffect = {isVectorEffect: false};
                this.featureSupportMock.and.returnValue(mockFalsyVectorEffect);
                // stroke > 0
                this.structureInfo.styleItem.style.properties.strokewidth = '1px';
                // shape is stretched
                this.structureInfo.propertiesItem.maintainAspectRatio = false;

                var expected = {x: 0, y: 0, width: 100, height: 100};
                this.customMeasure(this.compId, this.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                expect(this.measureMap.custom[this.compId].boundingBox).toEqual(expected);

                var svgScalerSpy = spyOn(svgScaler, 'scale').and.callFake(_.noop);
                var spyZeptoAttr = spyOn($.fn, 'attr').and.callFake(_.noop);
                var spyZeptoCss = spyOn($.fn, 'css').and.callFake(_.noop);

                this.patcher(this.compId, this.nodesMap, this.measureMap, this.structureInfo, this.siteData);
                expect(svgScalerSpy).toHaveBeenCalled();
                expect(spyZeptoAttr).not.toHaveBeenCalled();
                expect(spyZeptoCss).not.toHaveBeenCalled();

            });

        });
    });
});
