/**
 * @author yevhenp (Yevhen Pavliuk)
 */
define(['Squire'], function (Squire) {
    'use strict';

    xdescribe('AreaTooltip layout', function () {
        var layoutMock;

        beforeEach(function (done) {
            var injector;

            injector = new Squire();

            injector.mock('layout/util/layout', {
                registerPatcher: jasmine.createSpy('registerPatcher'),
                registerRequestToMeasureChildren: jasmine.createSpy('registerRequestToMeasureChildren'),
                registerCustomMeasure: jasmine.createSpy("registerCustomMeasure")
            });

            injector.require(['layout/specificComponents/areaTooltipLayout'], function () {
                layoutMock = injector.mocks['layout/util/layout'];
                done();
            });
        });

        it('registers a patcher for the component', function () {
            expect(layoutMock.registerPatcher).toHaveBeenCalledWith(
                'wysiwyg.common.components.areatooltip.viewer.AreaTooltip', jasmine.any(Function));
        });

        it('registers a request to measure the children of the component', function () {
            expect(layoutMock.registerRequestToMeasureChildren).toHaveBeenCalledWith(
                'wysiwyg.common.components.areatooltip.viewer.AreaTooltip', [
                    ['tooltip'],
                    ['content']
                ]);
        });

        describe('patcher', function () {
            var adjustTooltipPosition, options;

            beforeEach(function () {
                var compId, patcher, customMesure;

                compId = '';


                customMesure = layoutMock.registerCustomMeasure.calls.argsFor(0)[1];
                // Get the original patcher function provided by the module.
                patcher = layoutMock.registerPatcher.calls.argsFor(0)[1];

                /**
                 * Calls the patcher with internally created mock arguments based on the given options, and returns an
                 * object that represents the tooltip inline style adjusted by the patcher.
                 * @param {{
                 *  isTooltipShown: boolean,
                 *  tooltipPosition: string,
                 *  componentWidth: number=,
                 *  componentHeight: number=,
                 *  contentWidth: number=,
                 *  contentHeight: number=
                 * }} optionsObj Specific tooltip positions require specific options.
                 * @returns {({
                 *  top: string,
                 *  left: string
                 * }|{})} Tooltip DOM node's inline style adjusted by the patcher. An empty object if the tooltip is hidden.
                 */
                adjustTooltipPosition = function (optionsObj) {
                    var contentId, measureMap, nodesMap, siteData, tooltipId;

                    siteData = {
                        dataTypes: {}
                    };

                    tooltipId = compId + 'tooltip';
                    contentId = compId + 'content';

                    measureMap = {
                        height: {},
                        width: {},
                        custom: {}
                    };

                    measureMap.height[tooltipId] = optionsObj.isTooltipShown;
                    measureMap.height[compId] = optionsObj.componentHeight;
                    measureMap.height[contentId] = optionsObj.contentHeight;
                    measureMap.width[compId] = optionsObj.componentWidth;
                    measureMap.width[contentId] = optionsObj.contentWidth;

                    nodesMap = {};
                    nodesMap[tooltipId] = {
                        style: {}
                    };

                    customMesure(compId, measureMap);
                    patcher(compId, nodesMap, measureMap, {propertiesItem: {tooltipPosition: optionsObj.tooltipPosition}}, siteData);

                    return nodesMap[tooltipId].style;
                };
            });

            it('should correctly adjust position for a top-oriented tooltip if the tooltip is shown', function () {
                options = {
                    isTooltipShown: true,
                    tooltipPosition: 'top',
                    contentHeight: 100
                };
                expect(adjustTooltipPosition(options)).toEqual({
                    top: '-114px',  // -contentHeight - 14
                    left: 0         // 0
                });

                options.isTooltipShown = false;
                expect(adjustTooltipPosition(options)).toEqual({});
            });

            it('should correctly adjust position for a right-oriented tooltip if the tooltip is shown', function () {
                options = {
                    isTooltipShown: true,
                    tooltipPosition: 'right',
                    componentWidth: 100,
                    componentHeight: 200,
                    contentHeight: 300
                };
                expect(adjustTooltipPosition(options)).toEqual({
                    top: '-50px',  // componentHeight / 2 - contentHeight / 2
                    left: '114px'   // componentWidth + 14
                });

                options.isTooltipShown = false;
                expect(adjustTooltipPosition(options)).toEqual({});
            });

            it('should correctly adjust position for a bottom-oriented tooltip if the tooltip is shown', function () {
                options = {
                    isTooltipShown: true,
                    tooltipPosition: 'bottom',
                    componentHeight: 100
                };
                expect(adjustTooltipPosition(options)).toEqual({
                    top: '114px',  // componentHeight + 14
                    left: 0        // 0
                });

                options.isTooltipShown = false;
                expect(adjustTooltipPosition(options)).toEqual({});
            });

            it('should correctly adjust position for a left-oriented tooltip if the tooltip is shown', function () {
                options = {
                    isTooltipShown: true,
                    tooltipPosition: 'left',
                    componentHeight: 100,
                    contentHeight: 200
                };
                expect(adjustTooltipPosition(options)).toEqual({
                    top: '-50px',   // componentHeight / 2 - contentHeight / 2
                    left: '-414px'  // -414
                });

                options.isTooltipShown = false;
                expect(adjustTooltipPosition(options)).toEqual({});
            });

            it('should ignore an invalid tooltip position', function() {
                options = {
                    isTooltipShown: true,
                    tooltipPosition: '',
                    componentWidth: 100,
                    componentHeight: 200,
                    contentWidth: 300,
                    contentHeight: 400
                };
                expect(adjustTooltipPosition(options)).toEqual({});
            });
        });
    });
});
