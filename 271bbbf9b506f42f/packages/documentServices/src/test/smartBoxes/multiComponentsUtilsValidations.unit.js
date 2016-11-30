/**
 * Created by alexandreroitman on 24/01/2016.
 */
define(['testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/smartBoxes/multiComponentsUtilsValidations',
    'documentServices/constants/constants'], function (testUtils, privateServicesHelper, multiComponentsUtilsValidations, constants) {
    'use strict';

    var direction = constants.COMP_ALIGNMENT_OPTIONS.LEFT;
    var distribution = constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL;

    function getCompPointer(ps, compId, pageId) {
        var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        return ps.pointers.components.getComponent(compId, page);
    }

    function getSiteDataWithComponents(pageId, components) {
        return testUtils.mockFactory.mockSiteData({}, true).addPageWithDefaults(pageId, [{
            id: 'container',
            layout: {
                x: 0,
                y: 0,
                width: 1000,
                height: 1000,
                rotationInDegrees: 0
            },
            components: components
        }]);
    }

    describe('multiComponentsUtilsValidations', function(){

        beforeEach(function () {
            direction = constants.COMP_ALIGNMENT_OPTIONS.LEFT;
            distribution = constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL;
        });

        describe('canAlign', function(){

            var ps, components;

            describe('only ONE component not full width in selection', function(){
                beforeEach(function () {
                    var myPageId = 'currentPage';
                    var siteData = getSiteDataWithComponents(myPageId, [
                        {
                            id: 'comp1',
                            layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}},
                            componentType: 'mobile.core.components.Container'
                        },
                        {
                            id: 'comp2',
                            layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}},
                            componentType: 'mobile.core.components.Container'
                        },
                        {
                            id: 'comp3',
                            layout: {x:0, y: 45, width: 100, height: 70},
                            componentType: 'mobile.core.components.Container'
                        }
                    ]);
                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', myPageId),
                        getCompPointer(ps, 'comp2', myPageId),
                        getCompPointer(ps, 'comp3', myPageId)
                    ];
                });
                it('should return false for align horizontal if there is only ONE component not full width in selection', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.LEFT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.RIGHT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.CENTER)).toBeFalsy();
                });

                it('should return false for align without direction', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, '')).toBeFalsy();
                });

                it('should return true for align vertically even with full width in selection', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.TOP)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.BOTTOM)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.MIDDLE)).toBeTruthy();
                });
            });

            describe('all comps are full width in selection', function(){
                beforeEach(function () {
                    var myPageId = 'currentPage';
                    var siteData = getSiteDataWithComponents(myPageId, [
                        {
                            id: 'comp1',
                            layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                        },
                        {
                            id: 'comp2',
                            layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                        },
                        {
                            id: 'comp3',
                            layout: {y: 5, height: 80, docked: {left: {vw: 10}, right: {vw: 10}}}
                        }
                    ]);
                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', myPageId),
                        getCompPointer(ps, 'comp2', myPageId),
                        getCompPointer(ps, 'comp3', myPageId)
                    ];
                });

                it('should return false for align horizontally', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.LEFT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.RIGHT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.CENTER)).toBeFalsy();
                });

                it('should return true for vertical alignment', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.BOTTOM)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.TOP)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.MIDDLE)).toBeTruthy();
                });
            });

            describe('if no components are stretched in the selection', function(){
                it('should return true if trying to align vertically or horizontally', function() {
                    var pageId = 'pageId1';
                    var siteData = getSiteDataWithComponents(pageId, [
                        {
                            id: 'comp1',
                            layout: {x:0, width: 100, y: 45, height: 70}
                        },
                        {
                            id: 'comp2',
                            layout: {x:10, width: 50, y: 5, height: 80}
                        }
                    ]);

                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', pageId),
                        getCompPointer(ps, 'comp2', pageId)
                    ];

                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.LEFT)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.RIGHT)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.CENTER)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.MIDDLE)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.TOP)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.BOTTOM)).toBeTruthy();
                });
            });

            describe('single component', function(){
                beforeEach(function () {
                    var pageId = 'pageId1';
                    var siteData = getSiteDataWithComponents(pageId, [
                        {
                            id: 'comp1',
                            layout: {y: 45, height: 70, docked: {left: {vw:0}, right: {vw: 0}}}
                        }
                    ]);

                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', pageId)
                    ];
                });

                it('should return false if component is full width', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.LEFT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.RIGHT)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.CENTER)).toBeFalsy();
                });

                it('should return true for vertical alignment even if the component is full width', function() {
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.TOP)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.BOTTOM)).toBeTruthy();
                    expect(multiComponentsUtilsValidations.canAlign(ps, components, constants.COMP_ALIGNMENT_OPTIONS.MIDDLE)).toBeTruthy();
                });

                it('should return true if there is only one component in the selection and not full width', function() {
                    var pageId = 'pageId1';
                    var siteData = getSiteDataWithComponents(pageId, [
                        {
                            id: 'comp1',
                            layout: {x:0, width: 100, y: 45, height: 70}
                        }
                    ]);

                    var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(privateServices, 'comp1', pageId)
                    ];

                    var canAlign = multiComponentsUtilsValidations.canAlign(privateServices, components, direction);

                    expect(canAlign).toBeTruthy();
                });
            });
        });

        describe('canDistribute', function(){
            var components, ps;
            describe('all components in the selection are full width', function(){
                beforeEach(function () {
                    var pageId = 'pageId1';
                    var siteData = getSiteDataWithComponents(pageId, [
                        {
                            id: 'comp1',
                            layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                        },
                        {
                            id: 'comp2',
                            layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                        },
                        {
                            id: 'comp3',
                            layout: {y: 5, height: 80, docked: {left: {vw: 10}, right: {vw: 10}}}
                        }
                    ]);

                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', pageId),
                        getCompPointer(ps, 'comp2', pageId),
                        getCompPointer(ps, 'comp3', pageId)
                    ];
                });

                it('should return false for distribute without axis', function() {
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, '')).toBeFalsy();
                });

                it('should return true for vertical distribute', function() {
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.BOTH)).toBeFalsy();
                });

                it('should return false for horizontal distribute', function() {
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL)).toBeTruthy();
                });
            });



            describe('only ONE of the components in the selection are NOT full width', function(){
                beforeEach(function () {
                    var pageId = 'pageId1';
                    var siteData = getSiteDataWithComponents(pageId, [
                        {
                            id: 'comp1',
                            layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                        },
                        {
                            id: 'comp2',
                            layout: {x:10, y: 45, width: 100, height: 70}
                        },
                        {
                            id: 'comp3',
                            layout: {y: 5, height: 80, docked: {left: {vw: 10}, right: {vw: 10}}}
                        }
                    ]);

                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                    components = [
                        getCompPointer(ps, 'comp1', pageId),
                        getCompPointer(ps, 'comp2', pageId),
                        getCompPointer(ps, 'comp3', pageId)
                    ];
                });

                it('should return true for vertical alignment', function() {
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL)).toBeTruthy();
                });

                it('should return false for horizontal alignment', function() {
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL)).toBeFalsy();
                    expect(multiComponentsUtilsValidations.canDistribute(ps, components, constants.COMP_DISTRIBUTION_OPTIONS.BOTH)).toBeFalsy();
                });

            });

            it('should return true if more than one of the components in the selection are NOT full width', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {x:10, y: 45, width: 100, height: 70}
                    },
                    {
                        id: 'comp3',
                        layout: {x:30, y: 5, width: 20, height: 60}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canDistribute(privateServices, components, distribution);
                expect(canDistribute).toBeTruthy();

                expect(multiComponentsUtilsValidations.canDistribute(privateServices, components, constants.COMP_DISTRIBUTION_OPTIONS.BOTH)).toBeTruthy();
                expect(multiComponentsUtilsValidations.canDistribute(privateServices, components, constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL)).toBeTruthy();
            });

            it('should return false if selection has only one component', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {x:10, y: 45, width: 100, height: 70}
                    },
                    {
                        id: 'comp3',
                        layout: {x:30, y: 5, width: 20, height: 60}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                components = [
                    getCompPointer(privateServices, 'comp2', pageId)
                ];

                expect(multiComponentsUtilsValidations.canDistribute(privateServices, components, constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL)).toBeFalsy();
                expect(multiComponentsUtilsValidations.canDistribute(privateServices, components, constants.COMP_DISTRIBUTION_OPTIONS.BOTH)).toBeFalsy();
                expect(multiComponentsUtilsValidations.canDistribute(privateServices, components, constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL)).toBeFalsy();
            });
        });

        describe('canMatchSize', function(){

            it('should return false for match size without axis', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {y: 45, height: 70, docked: {left: {vw: 15}, right: {vw: 15}}}
                    },
                    {
                        id: 'comp3',
                        layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, '');
                expect(canDistribute).toBeFalsy();
            });

            it('should return false if all components are full width and trying to match size width', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {y: 45, height: 70, docked: {left: {vw: 15}, right: {vw: 15}}}
                    },
                    {
                        id: 'comp3',
                        layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                expect(canDistribute).toBeFalsy();
            });

            it('should return false if there is only ONE non full width component in selection', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {y: 45, height: 70, docked: {left: {vw: 15}, right: {vw: 15}}}
                    },
                    {
                        id: 'comp3',
                        layout: {x:30, y: 5, width: 20, height: 60}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                expect(canDistribute).toBeFalsy();
            });

            it('should return true if there is more than one non full width component in selection', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {x:55, y: 0, width: 60, height: 10}
                    },
                    {
                        id: 'comp3',
                        layout: {x:30, y: 5, width: 20, height: 60}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                expect(canDistribute).toBeTruthy();
            });

            it('should return true if trying to match size for height, regardless of full width components in selection', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {y: 45, height: 70, docked: {left: {vw: 15}, right: {vw: 15}}}
                    },
                    {
                        id: 'comp3',
                        layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId),
                    getCompPointer(privateServices, 'comp2', pageId),
                    getCompPointer(privateServices, 'comp3', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.HEIGHT);
                expect(canDistribute).toBeTruthy();
            });

            it('should return false if selection has only one stretched component', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {y: 45, height: 70, docked: {left: {vw: 5}, right: {vw: 5}}}
                    },
                    {
                        id: 'comp2',
                        layout: {y: 45, height: 70, docked: {left: {vw: 15}, right: {vw: 15}}}
                    },
                    {
                        id: 'comp3',
                        layout: {y: 45, height: 70, docked: {left: {vw: 0}, right: {vw: 0}}}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp2', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.HEIGHT);
                expect(canDistribute).toBeFalsy();
            });

            it('should return false if selection has only one not stretched component', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithComponents(pageId, [
                    {
                        id: 'comp1',
                        layout: {x: 10, y: 45, height: 70, width: 200}
                    }
                ]);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var components = [
                    getCompPointer(privateServices, 'comp1', pageId)
                ];

                var canDistribute = multiComponentsUtilsValidations.canMatchSize(privateServices, components, constants.COMP_MATCH_SIZE_OPTIONS.HEIGHT);
                expect(canDistribute).toBeFalsy();
            });
        });
    });
});
