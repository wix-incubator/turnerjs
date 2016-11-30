define([
    'lodash',
    'utils',
    'testUtils',
    'layout/specificComponents/balataLayout',
    'definition!layout/util/popupContainerDocking'
], function(
    _,
    utils,
    testUtils,
    balataLayout,
    popupContainerDockingDef
){
    'use strict';

    xdescribe('Docking a container to the screen.', function(){
        var popupContainerDocking;
        var widthLayout;

        beforeEach(function(){
            widthLayout = {
                measureStripContainer: jasmine.createSpy('measureStripContainer'),
                patchStripContainer: jasmine.createSpy('patchStripContainer')
            };
            popupContainerDocking = popupContainerDockingDef(utils, widthLayout, balataLayout);
            this.testId = 'testId';

            this.siteData = testUtils.mockFactory.mockSiteData();
            this.siteData.getScreenWidth = _.constant(1000);
            this.siteData.getSiteWidth = _.constant(900);
            this.siteData.getPageBottomMargin = _.constant(0);
            this.siteData.addMeasureMap({
                width: {screen: this.siteData.getScreenWidth()},
                height: {testIdinlineContent: 0, testPageId: 0}
            });

            this.structureInfo = {
                propertiesItem: {
                    horizontalAlignment: null,
                    verticalAlignment: null,
                    alignmentType: null,
                    horizontalOffset: 0,
                    verticalOffset: 0
                },

                structure: {
                    components: [{
                        id: 'child1',
                        layout: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        }
                    }]
                }
            };
        });

        describe('measure:', function(){
            beforeEach(function(){
                this.nodesMap = {
                    testId: {offsetHeight: 110},
                    child1: {
                        offsetLeft: 0,
                        offsetTop: 0
                    }
                };
            });

            describe('nine grid (only horizontal case, see comment in the code) - ', function(){
                beforeEach(function(){
                    this.setup = function(horizontal, screenWidth, horizontalOffset){
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'nineGrid';
                        compProps.horizontalAlignment = horizontal;
                        compProps.verticalAlignment = 'top';
                        compProps.horizontalOffset = horizontalOffset || 0;

                        if (screenWidth) {
                            this.siteData.getScreenWidth = _.constant(screenWidth);
                            this.siteData.measureMap.width.screen = screenWidth;
                        }

                        this.siteData.measureMap.width.testId = 500;
                    };

                    this.expectLeft = function(left){
                        expect(this.siteData.measureMap.left[this.testId]).toBe(left);
                    };
                });

                it('is LEFT', function(){
                    this.setup('left');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(-50);
                });

                it('is LEFT with offset', function(){
                    this.setup('left', null, 10);

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(-40);
                });

                it('is CENTER', function(){
                    this.setup('center');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(200);
                });

                it('is CENTER with offset', function(){
                    this.setup('center', null, -10);

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(190);
                });

                it('is RIGHT', function(){
                    this.setup('right');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(450);
                });

                it('is RIGHT with offset', function(){
                    this.setup('right', null, 10);

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectLeft(440);
                });

                describe('edge cases - ', function(){
                    it('is LEFT and site is wider than screen', function(){
                        this.setup('left', 800);

                        popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                        this.expectLeft(0);
                    });

                    it('is CENTER and site is wider than screen', function(){
                        this.setup('center', 800);

                        popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                        this.expectLeft(150);
                    });

                    it('is RIGHT and site is wider than screen', function(){
                        this.setup('right', 800);

                        popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                        this.expectLeft(300);
                    });
                });
            });

            describe('full width - ', function(){
                beforeEach(function(){
                    this.setup = function(pos){
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'fullWidth';
                        compProps.verticalAlignment = pos;
                        compProps.horizontalAlignment = 'center';

                        this.siteData.addMeasureMap({
                            width: {
                                screen: 1000,
                                testId: 500
                            }
                        });
                    };

                    this.expectComp = function(expected){
                        expect(this.siteData.measureMap.left[this.testId]).toBe(expected.left);
                        expect(this.siteData.measureMap.width[this.testId]).toBe(expected.width);
                    };
                });

                it('is TOP', function(){
                    var expected = {
                        left: 999,
                        width: 888
                    };

                    this.setup('top');

                    widthLayout.measureStripContainer.and.callFake(function (id, measureMap) {
                        measureMap.left[id] = expected.left;
                        measureMap.width[id] = expected.width;
                    });

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectComp(expected);
                });

                it('should not mark it as a shrinkable container', function(){
                    this.setup('top');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    expect(this.siteData.measureMap.shrinkableContainer[this.testId]).toBeFalsy();
                });
            });

            describe('full height - ', function(){
                beforeEach(function(){
                    this.setup = function(pos){
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'fullHeight';
                        compProps.horizontalAlignment = pos;

                        this.siteData.addMeasureMap({
                            width: {
                                screen: 1000,
                                testId: 500,
                                child1: 0
                            },
                            height: {
                                child1: 0
                            },
                            innerHeight: {
                                screen: 800
                            }
                        });
                    };

                    this.setChild1Layout = function(layout){
                        this.siteData.measureMap.height.child1 = layout.height;
                        this.nodesMap.child1.offsetTop = layout.y;

                        this.structureInfo.structure.components[0] = {
                            id: 'child1',
                            layout: {
                                x: layout.x,
                                y: layout.y,
                                width: layout.width,
                                height: layout.height
                            }
                        };
                    };

                    this.expectComp = function(expected){
                        expect(this.siteData.measureMap.left[this.testId]).toBe(expected.left);
                        expect(this.siteData.measureMap.height[this.testId]).toBe(expected.height);
                        expect(this.siteData.measureMap.minHeight[this.testId]).toBe(expected.height);
                    };
                });

                it('is LEFT', function(){
                    this.setup('left');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectComp({
                        left: -50,
                        height: 800
                    });
                });

                it('is RIGHT', function(){
                    this.setup('right');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectComp({
                        left: 450,
                        height: 800
                    });
                });

                it('is higher then screen, should be screen height, the rest the anchors will take care of', function(){
                    this.setup('left');

                    this.setChild1Layout({
                        x: 0,
                        y: 800,
                        width: 100,
                        height: 200
                    });

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    this.expectComp({
                        left: -50,
                        height: 800
                    });
                });

                it('should mark it as a shrinkable container', function(){
                    this.setup('left');

                    popupContainerDocking.measure(this.testId, this.siteData.measureMap, this.nodesMap, this.siteData, this.structureInfo);

                    expect(this.siteData.measureMap.shrinkableContainer[this.testId]).toEqual(true);
                });
            });
        });

        describe('patch: (yes, this function violates common principle not to change measure map during patching, see comment in the code)', function(){
            beforeEach(function(){
                this.nodesMap = {
                    testId: window.document.createElement('div'),
                    testPageId: window.document.createElement('div')
                };

                this.siteData.measureMap.top.testId = 0;

                this.siteData.getCurrentPopupId = _.constant('testPageId');

                this.getNodeStyle = function(id, value){
                    return this.nodesMap[id].style.getPropertyValue(value);
                };

                this.expectPageHeight = function(height){
                    expect(this.siteData.measureMap.height.testPageId).toBe(height);
                    expect(this.getNodeStyle('testPageId', 'height')).toBe(height + 'px');
                };
            });

            it('should set "left" to a node from the measure map', function(){
                this.siteData.measureMap.left.testId = 50;

                popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                expect(this.getNodeStyle(this.testId, 'left')).toBe('50px');
            });

            it('should set "width" to a node from the measure map', function(){
                this.siteData.measureMap.width.testId = 1000;

                popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                expect(this.getNodeStyle(this.testId, 'width')).toBe('1000px');
            });

            describe('nine grid (only vertical case, see comments in the code) - ', function(){
                beforeEach(function(){
                    this.setup = function(vertical, compHeight, verticalOffset){
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'nineGrid';
                        compProps.horizontalAlignment = 'left';
                        compProps.verticalAlignment = vertical;
                        compProps.verticalOffset = verticalOffset || 0;

                        this.siteData.addMeasureMap({
                            height: {
                                testId: compHeight || 400
                            },
                            innerHeight: {
                                screen: 800
                            }
                        });
                    };

                    this.expect = function(expected){
                        this.expectPageHeight(expected.pageHeight);
                        expect(this.siteData.measureMap.top[this.testId]).toBe(expected.compTop);
                        expect(this.getNodeStyle(this.testId, 'top')).toBe(expected.compTop + 'px');
                    };
                });

                it('is TOP', function(){
                    this.setup('top');

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 0,
                        pageHeight: 400
                    });
                });

                it('is TOP with offset', function(){
                    this.setup('top', null, 10);

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 10,
                        pageHeight: 410
                    });
                });

                it('is vertical CENTER', function(){
                    this.setup('center');

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 200,
                        pageHeight: 600
                    });
                });

                it('is vertical CENTER with offset', function(){
                    this.setup('center', null, -10);

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 190,
                        pageHeight: 590
                    });
                });

                it('is BOTTOM', function(){
                    this.setup('bottom');

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 400,
                        pageHeight: 800
                    });
                });

                it('is BOTTOM with offset', function(){
                    this.setup('bottom', null, 10);

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 390,
                        pageHeight: 790
                    });
                });

                describe('edge cases - ', function(){
                    it('is BOTTOM and the component is higher than screen', function(){
                        this.setup('bottom', 1000);

                        popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                        this.expect({
                            compTop: 0,
                            pageHeight: 1000
                        });
                    });
                });
            });

            describe('full width - ', function(){
                beforeEach(function(){
                    this.setup = function(pos){
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'fullWidth';
                        compProps.verticalAlignment = pos;

                        this.siteData.addMeasureMap({
                            height: {
                                testId: 400
                            },
                            innerHeight: {
                                screen: 800
                            }
                        });
                    };

                    this.expect = function(expected){
                        this.expectPageHeight(expected.pageHeight);
                        expect(this.siteData.measureMap.top[this.testId]).toBe(expected.compTop);
                        expect(this.getNodeStyle(this.testId, 'top')).toBe(expected.compTop + 'px');
                    };
                });

                it('is BOTTOM', function(){
                    this.setup('bottom');

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 400,
                        pageHeight: 800
                    });
                });
            });

            describe('full height - ', function(){
                beforeEach(function(){
                    this.setup = function (pos) {
                        var compProps = this.structureInfo.propertiesItem;

                        compProps.alignmentType = 'fullHeight';
                        compProps.horizontalAlignment = pos;

                        this.siteData.addMeasureMap({
                            height: {
                                testId: 800
                            },
                            innerHeight: {
                                screen: 800
                            }
                        });
                    };

                    this.expect = function(expected){
                        this.expectPageHeight(expected.pageHeight);
                        expect(this.siteData.measureMap.top[this.testId]).toBe(expected.compTop);
                        expect(this.getNodeStyle(this.testId, 'top')).toBe(expected.compTop + 'px');
                    };
                });

                it('is LEFT', function(){
                    this.setup('left');

                    popupContainerDocking.patch(this.testId, this.nodesMap, this.siteData.measureMap, this.structureInfo, this.siteData);

                    this.expect({
                        compTop: 0,
                        pageHeight: 800
                    });
                });
            });
        });
    });
});
