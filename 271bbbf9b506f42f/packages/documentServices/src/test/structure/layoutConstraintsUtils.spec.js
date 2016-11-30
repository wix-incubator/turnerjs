define([
    'lodash',
    'documentServices/structure/utils/layoutConstraintsUtils',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/structure/structure',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants'
], function(_, layoutConstraintsUtils, componentsMetaData, structure, privateServicesHelper, constants) {
    'use strict';

    describe('layoutConstraintsUtils spec', function() {

        var privateServices;

        function prepareTest(pagesData, measureMap) {
            var siteData = privateServicesHelper.getSiteDataWithPages(pagesData);
            siteData.addMeasureMap(measureMap);
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        function getCompPointer(compId) {
            var pagePointer = privateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
            var compPointer = privateServices.pointers.components.getComponent(compId, pagePointer);
            return compPointer;
        }

        describe('constrainByChildrenLayout', function() {

            describe('Changing the layout of a component without children', function() {

                beforeEach(function() {
                    prepareTest({
                        'mainPage': {
                            components: [
                                {
                                    id: 'compWithoutChildren',
                                    layout: {x: 100, y: 100, width: 100, height: 100}
                                }
                            ]
                        }
                    });
                });

                it('Should not modify the new layout', function() {
                    var newLayout = {x: 100, y: 100, width: 70, height: 100};

                    layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('compWithoutChildren'), newLayout);

                    expect(newLayout).toEqual(newLayout);
                });

            });

            describe('Changing the layout of component that is FULLY wrapping its children', function() {

                describe('Container without docked component', function() {

                    beforeEach(function() {
                        prepareTest({
                            'mainPage': {
                                components: [
                                    {
                                        id: 'container',
                                        layout: {x: 100, y: 100, width: 100, height: 100},
                                        children: [
                                            {
                                                id: 'childA',
                                                layout: {x: 10, y: 10, width: 30, height: 30, rotationInDegrees: 0}
                                            },
                                            {
                                                id: 'childB',
                                                layout: {x: 60, y: 60, width: 20, height: 20, rotationInDegrees: 45} // bounding: { x: 56, y: 56, width: 28.5, height: 28.5 }
                                            }
                                        ]
                                    }
                                ]
                            }
                        });
                    });

                    it('Should not be possible to make it smaller then its children bounding box from right side', function() {
                        var newLayout = {x: 100, y: 100, width: 70, height: 100};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                        expect(newLayout).toEqual({x: 100, y: 100, width: 84.5, height: 100});
                    });

                    it('Should not be possible to make it smaller then its children bounding box from left side', function() {
                        var newLayout = {x: 120, y: 100, width: 80, height: 100};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                        expect(newLayout).toEqual({x: 110, y: 100, width: 90, height: 100});
                    });

                    it('Should not be possible to make it smaller then its children bounding box from top side', function() {
                        var newLayout = {x: 100, y: 120, width: 100, height: 80};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                        expect(newLayout).toEqual({x: 100, y: 110, width: 100, height: 90});
                    });

                    it('Should not be possible to make it smaller then its children bounding box from bottom side', function() {
                        var newLayout = {x: 100, y: 100, width: 100, height: 50};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                        expect(newLayout).toEqual({x: 100, y: 100, width: 100, height: 84.5});
                    });

                    it('Should be possible to make it smaller then its children bounding box from the left if not constraining by width', function() {
                        var newLayout = {x: 120, y: 120, width: 80, height: 80};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout, true);

                        expect(newLayout).toEqual({x: 120, y: 110, width: 80, height: 90});
                    });

                    it('Should be possible to make it smaller then its children bounding box from the top if not constraining by height', function() {
                        var newLayout = {x: 120, y: 120, width: 80, height: 80};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout, false, true);

                        expect(newLayout).toEqual({x: 110, y: 120, width: 90, height: 80});
                    });

                    it('Should be possible to make it smaller then its children bounding box from top-left if not constraining by height or width', function() {
                        var newLayout = {x: 120, y: 120, width: 80, height: 80};

                        layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout, true, true);

                        expect(newLayout).toEqual({x: 120, y: 120, width: 80, height: 80});
                    });
                });

                describe('Container with docked component', function() {
                    var pagesData;
                    beforeEach(function() {
                        pagesData = {
                            'mainPage': {
                                components: [
                                    {
                                        id: 'container',
                                        layout: {x: 0, y: 0, width: 100, height: 100},
                                        children: [
                                            {
                                                id: 'childA',
                                                layout: {x: 10, y: 10, width: 30, height: 30, rotationInDegrees: 0}
                                            }
                                        ]
                                    }
                                ]
                            }
                        };
                    });

                    describe('Child comp is docked left', function() {

                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0,
                                    childA: 10
                                },
                                top: {
                                    container: 0
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);

                            structure.updateDock(privateServices, getCompPointer('childA'), {left: {px: 10}});
                        });

                        it('Should not be possible to make the container smaller than docked value + child width -> when resizing from left', function() {
                            var newLayout = {x: 70, width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.x).toEqual(60);
                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from right side -> when resizing from right', function() {
                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from top side -> when resizing from top', function() {
                            var newLayout = {y: 70, height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.y).toEqual(10);
                            expect(newLayout.height).toEqual(90);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from bottom side -> when resizing from bottom', function() {
                            var newLayout = {height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.height).toEqual(40);
                        });

                    });

                    describe('Child comp is docked right', function() {
                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0,
                                    childA: 60
                                },
                                top: {
                                    container: 0
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);
                            structure.updateDock(privateServices, getCompPointer('childA'), {right: {px: 10}});
                        });

                        it('Should not be possible to make it smaller then its children bounding box from left side-> when resizing from left', function() {
                            var newLayout = {x: 70, width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.x).toEqual(60);
                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make the container smaller than docked value + child width -> when resizing from right', function() {
                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from top side -> when resizing from top', function() {
                            var newLayout = {y: 70, height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.y).toEqual(10);
                            expect(newLayout.height).toEqual(90);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from bottom side -> when resizing from bottom', function() {
                            var newLayout = {height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.height).toEqual(40);
                        });
                    });

                    describe('Child comp is docked top', function() {
                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0
                                },
                                top: {
                                    container: 0,
                                    childA: 10
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);

                            structure.updateDock(privateServices, getCompPointer('childA'), {top: {px: 10}});

                        });



                        it('Should not be possible to make it smaller then its children bounding box from left side-> when resizing from left', function() {
                            var newLayout = {x: 30, width: 70};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.x).toEqual(10);
                            expect(newLayout.width).toEqual(90);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from right side -> when resizing from right', function() {
                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make the container smaller than docked value + child height -> when resizing from top', function() {
                            var newLayout = {y: 70, height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.y).toEqual(60);
                            expect(newLayout.height).toEqual(40);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from bottom side -> when resizing from bottom', function() {
                            var newLayout = {height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.height).toEqual(40);
                        });
                    });

                    describe('Child comp is docked bottom', function() {
                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0
                                },
                                top: {
                                    container: 0,
                                    childA: 60
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);
                            structure.updateDock(privateServices, getCompPointer('childA'), {bottom: {px: 10}});

                        });

                        it('Should not be possible to make it smaller then its children bounding box from left side-> when resizing from left', function() {
                            var newLayout = {x: 30, width: 70};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.x).toEqual(10);
                            expect(newLayout.width).toEqual(90);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from right side -> when resizing from right', function() {
                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(40);
                        });

                        it('Should not be possible to make it smaller then its children bounding box from top side -> when resizing from top', function() {
                            var newLayout = {y: 70, height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.y).toEqual(60);
                            expect(newLayout.height).toEqual(40);
                        });

                        it('Should not be possible to make the container smaller than docked value + child height -> when resizing from bottom', function() {
                            var newLayout = {height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.height).toEqual(40);
                        });
                    });

                    describe('Child comp is vertically stretched', function(){
                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0
                                },
                                top: {
                                    container: 0,
                                    childA: 60
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);
                            structure.updateDock(privateServices, getCompPointer('childA'), {top: {px: 10}, bottom: {px: 10}});
                        });

                        it('Should be possible to make it smaller than its children bounding box from top side -> when resizing from top', function() {
                            var newLayout = {y: 70, height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.y).toEqual(70);
                            expect(newLayout.height).toEqual(30);
                        });

                        it('Should be possible to make the container smaller than docked value + child height -> when resizing from bottom', function() {
                            var newLayout = {height: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.height).toEqual(30);
                        });
                    });

                    describe('Child comp is horizontally stretched', function(){
                        beforeEach(function() {
                            var measureMap = {
                                left: {
                                    container: 0,
                                    childA: 60
                                },
                                top: {
                                    container: 0
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);
                            structure.updateDock(privateServices, getCompPointer('childA'), {left: {px: 10}, right: {px: 10}});
                        });

                        it('Should be possible to make it smaller then its children bounding box from left side-> when resizing from left', function() {
                            var newLayout = {x: 70, width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.x).toEqual(70);
                            expect(newLayout.width).toEqual(30);
                        });

                        it('Should be possible to make the container smaller than docked value + child width -> when resizing from right', function() {
                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(30);
                        });
                    });
                });

                describe('Container with docked and non-docked components', function() {
                    describe('Narrowing from right', function(){
                        it('should take the maximum restriction if the maximum restriction derived from non docked component', function(){
                            var pagesData = {
                                'mainPage': {
                                    components: [
                                        {
                                            id: 'container',
                                            layout: {x: 0, y: 0, width: 100, height: 100},
                                            children: [
                                                {
                                                    id: 'dockTop',
                                                    layout: {x: 40, y: 10, width: 20, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'nonDockedA',
                                                    layout: {x: 25, y: 30, width: 10, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'nonDockedB',
                                                    layout: {x: 30, y: 50, width: 40, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'dockRightA',
                                                    layout: {x: 0, y: 20, width: 15, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'dockRightB',
                                                    layout: {x: 0, y: 40, width: 10, height: 10, rotationInDegrees: 0}
                                                }
                                            ]
                                        }
                                    ]
                                }
                            };
                            var measureMap = {
                                left: {
                                    container: 0,
                                    dockRightA: 75,
                                    dockRightB: 70
                                },
                                top: {
                                    container: 0
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);

                            structure.updateDock(privateServices, getCompPointer('dockTop'), {top: {px: 10}});
                            structure.updateDock(privateServices, getCompPointer('dockRightA'), {right: {px: 10}});
                            structure.updateDock(privateServices, getCompPointer('dockRightB'), {right: {px: 20}});

                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(70);
                        });



                        it('should take the maximum restriction if the maximum restriction derived from docked to left edge component', function(){
                            var pagesData = {
                                'mainPage': {
                                    components: [
                                        {
                                            id: 'container',
                                            layout: {x: 0, y: 0, width: 100, height: 100},
                                            children: [
                                                {
                                                    id: 'dockTop',
                                                    layout: {x: 40, y: 10, width: 20, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'nonDockedA',
                                                    layout: {x: 25, y: 30, width: 10, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'nonDockedB',
                                                    layout: {x: 30, y: 50, width: 40, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'dockRightA',
                                                    layout: {x: 0, y: 20, width: 15, height: 10, rotationInDegrees: 0}
                                                },
                                                {
                                                    id: 'dockRightB',
                                                    layout: {x: 0, y: 40, width: 60, height: 10, rotationInDegrees: 0}
                                                }
                                            ]
                                        }
                                    ]
                                }
                            };
                            var measureMap = {
                                left: {
                                    container: 0,
                                    dockRightA: 75,
                                    dockRightB: 20
                                },
                                top: {
                                    container: 0
                                },
                                width: {
                                    container: 100
                                },
                                height: {
                                    container: 100
                                }
                            };
                            prepareTest(pagesData, measureMap);
                            structure.updateDock(privateServices, getCompPointer('dockTop'), {top: {px: 10}});
                            structure.updateDock(privateServices, getCompPointer('dockRightA'), {right: {px: 10}});
                            structure.updateDock(privateServices, getCompPointer('dockRightB'), {right: {px: 20}});


                            var newLayout = {width: 30};

                            layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                            expect(newLayout.width).toEqual(80);
                        });
                    });
                });

            });

            describe('Changing the layout of a component that is PARTIALLY wrapping its children', function() {

                beforeEach(function() {
                    prepareTest({
                        'mainPage': {
                            components: [
                                {
                                    id: 'container',
                                    layout: {x: 120, y: 100, width: 80, height: 100},
                                    children: [
                                        {
                                            id: 'childA',
                                            layout: {x: -10, y: 10, width: 30, height: 30}
                                        },
                                        {
                                            id: 'childB',
                                            layout: {x: 40, y: 60, width: 20, height: 20}
                                        }
                                    ]
                                }
                            ]
                        }
                    });
                });

                it('Should no be possible to make it smaller', function() {
                    var newLayout = {x: 125, y: 100, width: 75, height: 100};

                    layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                    expect(newLayout).toEqual({x: 120, y: 100, width: 80, height: 100});
                });

                it('Should be possible to make it bigger', function() {
                    var newLayout = {x: 115, y: 100, width: 85, height: 100};

                    layoutConstraintsUtils.constrainByChildrenLayout(privateServices, getCompPointer('container'), newLayout);

                    expect(newLayout).toEqual({x: 115, y: 100, width: 85, height: 100});
                });

            });

        });

        describe('constrainByDimensionsLimits', function() {

            var defaultsLimits = {
                minWidth: 5,
                maxWidth: 1000,
                minHeight: 5,
                maxHeight: 1000
            };

            beforeEach(function() {
                spyOn(componentsMetaData.public, 'getLayoutLimits');
                prepareTest({
                    'mainPage': {
                        components: [
                            {
                                id: 'comp',
                                layout: {x: 100, y: 100, width: 100, height: 100}
                            }
                        ]
                    }
                });
            });

            it('Should not be possible to make a component smaller than its minimum dimensions', function() {
                componentsMetaData.public.getLayoutLimits.and.returnValue(_.defaults({minWidth: 5, minHeight: 5}, defaultsLimits));
                var newLayout = {x: 100, y: 100, width: 2, height: 4};

                layoutConstraintsUtils.constrainByDimensionsLimits(privateServices, getCompPointer('comp'), newLayout);

                expect(newLayout).toEqual({x: 100, y: 100, width: 5, height: 5});
            });

            it('Should not be possible to make a component smaller than its maximum dimensions', function() {
                componentsMetaData.public.getLayoutLimits.and.returnValue(_.defaults({maxWidth: 500, maxHeight: 250}, defaultsLimits));
                var newLayout = {x: 100, y: 100, width: 520, height: 251};

                layoutConstraintsUtils.constrainByDimensionsLimits(privateServices, getCompPointer('comp'), newLayout);

                expect(newLayout).toEqual({x: 100, y: 100, width: 500, height: 250});
            });

            it('Should fix component X if there is a width limitation', function() {
                componentsMetaData.public.getLayoutLimits.and.returnValue(_.defaults({minWidth: 50}, defaultsLimits));
                var newLayout = {x: 160, y: 100, width: 40, height: 100};

                layoutConstraintsUtils.constrainByDimensionsLimits(privateServices, getCompPointer('comp'), newLayout);

                expect(newLayout).toEqual({x: 150, y: 100, width: 50, height: 100});
            });

            it('Should fix component Y if there is a height limitation', function() {
                componentsMetaData.public.getLayoutLimits.and.returnValue(_.defaults({minHeight: 50}, defaultsLimits));
                var newLayout = {x: 100, y: 160, width: 100, height: 40};

                layoutConstraintsUtils.constrainByDimensionsLimits(privateServices, getCompPointer('comp'), newLayout);

                expect(newLayout).toEqual({x: 100, y: 150, width: 100, height: 50});
            });

        });

        describe('constrainByDockingLimits', function() {

            describe('for horizontal dock to screen by px', function(){
                var dockedLayout;

                beforeEach(function(){
                    dockedLayout = {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 100,
                        docked: {
                            left: {
                                vw: 0,
                                px: 5
                            },
                            right: {
                                vw: 0,
                                px: 5
                            }
                        }
                    };
                });

                it('should not be possible to update to negative px dock', function(){
                    var newDockedLayout = _.clone(dockedLayout);
                    _.set(newDockedLayout, 'docked.left.px', -10);
                    _.set(newDockedLayout, 'docked.right.px', -10);

                    layoutConstraintsUtils.constrainByDockingLimits(newDockedLayout);

                    var pxDockLeftValue = _.get(newDockedLayout, 'docked.left.px');
                    var pxDockRightValue = _.get(newDockedLayout, 'docked.right.px');
                    expect(pxDockLeftValue).toEqual(0);
                    expect(pxDockRightValue).toEqual(0);
                });

                it('should do nothing if update px dock to non negative number', function(){
                    var newDockedLayout = _.clone(dockedLayout);
                    _.set(newDockedLayout, 'docked.left.px', 3);
                    _.set(newDockedLayout, 'docked.right.px', 3);

                    var newDockedLayoutAfterConstraint = _.clone(newDockedLayout);
                    layoutConstraintsUtils.constrainByDockingLimits(newDockedLayoutAfterConstraint);

                    expect(newDockedLayoutAfterConstraint).toEqual(newDockedLayout);
                    expect(newDockedLayoutAfterConstraint).toEqual(newDockedLayout);
                });
            });

            describe('for horizontal dock to screen by vw', function(){
                var dockedLayout;

                beforeEach(function(){
                    dockedLayout = {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 100,
                        docked: {
                            left: {
                                vw: 5
                            },
                            right: {
                                vw: 5
                            }
                        }
                    };
                });

                it('should not be possible to update to negative vw dock', function(){
                    var newDockedLayout = _.clone(dockedLayout);
                    _.set(newDockedLayout, 'docked.left.vw', -10);
                    _.set(newDockedLayout, 'docked.right.vw', -10);

                    layoutConstraintsUtils.constrainByDockingLimits(newDockedLayout);

                    var vwDockLeftValue = _.get(newDockedLayout, 'docked.left.vw');
                    var vwDockRightValue = _.get(newDockedLayout, 'docked.right.vw');
                    expect(vwDockLeftValue).toEqual(0);
                    expect(vwDockRightValue).toEqual(0);
                });

                it('should do nothing if update vw dock to non negative number', function(){
                    var newDockedLayout = _.clone(dockedLayout);
                    _.set(newDockedLayout, 'docked.left.vw', 3);
                    _.set(newDockedLayout, 'docked.right.vw', 3);

                    var newDockedLayoutAfterConstraint = _.clone(newDockedLayout);
                    layoutConstraintsUtils.constrainByDockingLimits(newDockedLayoutAfterConstraint);

                    expect(newDockedLayoutAfterConstraint).toEqual(newDockedLayout);
                    expect(newDockedLayoutAfterConstraint).toEqual(newDockedLayout);
                });
            });
        });
    });
});
