define(['lodash', 'siteUtils/core/structureDimensions'], function (_, structureDimensions) {
    'use strict';

    describe('Structure Dimensions', function () {

        beforeEach(function () {
            this.clientSize = {
                width: 2000,
                height: 1000
            };
            this.siteWidth = 500;
        });

        describe('When all components have absolute layout', function () {

            it('Should contain a single component', function () {
                var structure = {
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: []
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(dimensionsMap.comp).toEqual({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 200
                });
            });

            it('Should contain parent + child component', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child',
                            layout: {
                                x: 0,
                                y: 0,
                                height: 100,
                                width: 100
                            }
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(dimensionsMap.parent).toEqual({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 200
                });
                expect(dimensionsMap.child).toEqual({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100
                });
            });

            it('Should contain all components in structure', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child_1',
                            layout: {
                                x: 10,
                                y: 10,
                                width: 30,
                                height: 30
                            }
                        },
                        {
                            id: 'child_2',
                            layout: {
                                x: 50,
                                y: 50,
                                width: 70,
                                height: 70
                            },
                            components: [
                                {
                                    id: 'grandchild',
                                    layout: {
                                        x: 10,
                                        y: 10,
                                        width: 10,
                                        height: 10
                                    }
                                }
                            ]
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(_.size(dimensionsMap)).toEqual(4);
                expect(dimensionsMap.parent).toEqual({
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 200
                });
                expect(dimensionsMap.child_1).toEqual({
                    x: 10,
                    y: 10,
                    width: 30,
                    height: 30
                });
                expect(dimensionsMap.child_2).toEqual({
                    x: 50,
                    y: 50,
                    width: 70,
                    height: 70
                });
                expect(dimensionsMap.grandchild).toEqual({
                    x: 10,
                    y: 10,
                    width: 10,
                    height: 10
                });
            });

        });

        describe('When component is docked in pixels', function () {

            it('Should contain the docked component dimensions in pixels', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child',
                            layout: {
                                x: 0,
                                y: 0,
                                height: 100,
                                docked: {
                                    left: {
                                        px: 10
                                    },
                                    right: {
                                        px: 20
                                    }
                                }
                            }
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(dimensionsMap.child).toEqual({
                    x: 10,
                    y: 0,
                    width: 170,
                    height: 100
                });
            });

        });

        describe('When component is docked in percents', function () {

            it('Should contain the docked component dimensions in pixels', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child',
                            layout: {
                                x: 0,
                                y: 0,
                                height: 100,
                                docked: {
                                    left: {
                                        pct: 10
                                    },
                                    right: {
                                        pct: 10
                                    }
                                }
                            }
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth);

                expect(dimensionsMap.child).toEqual({
                    x: 20,
                    y: 0,
                    width: 160,
                    height: 100
                });
            });

        });

        describe('When component is docked to screen', function () {

            it('Should contain the horizontally docked component dimensions in pixels - relative to site', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 20,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child',
                            layout: {
                                x: 0,
                                y: 0,
                                height: 100,
                                docked: {
                                    left: {
                                        vw: 0
                                    },
                                    right: {
                                        vw: 0
                                    }
                                }
                            }
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(dimensionsMap.child).toEqual({
                    x: -750,
                    y: 0,
                    width: this.clientSize.width,
                    height: 100
                });
            });

            it('Should contain the vertically docked component height dimension in pixels', function () {
                var structure = {
                    id: 'parent',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    },
                    components: [
                        {
                            id: 'child',
                            layout: {
                                x: 0,
                                y: 0,
                                width: 100,
                                docked: {
                                    top: {
                                        vh: 0
                                    },
                                    bottom: {
                                        vh: 0
                                    }
                                }
                            }
                        }
                    ]
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, false);

                expect(dimensionsMap.child).toEqual({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: this.clientSize.height
                });
            });

        });

        describe('When Structure has mobile components', function() {

            it('Should include only the mobile components tree', function() {
                var structure = {
                    mobileComponents: [
                        {
                            "id": "SITE_FOOTER",
                            "components": [],
                            "layout": {
                                "width": 320,
                                "height": 113,
                                "x": 0,
                                "y": 300
                            },
                            "componentType": "wysiwyg.viewer.components.FooterContainer"
                        },
                        {
                            "id": "SITE_HEADER",
                            "components": [
                                {
                                    "id": "TINY_MENU",
                                    "layout": {
                                        "width": 50,
                                        "height": 50,
                                        "x": 252,
                                        "y": 20
                                    },
                                    "propertyQuery": "TINY_MENU",
                                    "componentType": "wysiwyg.viewer.components.mobile.TinyMenu"
                                }
                            ],
                            "layout": {
                                "width": 320,
                                "height": 100,
                                "x": 0,
                                "y": 0
                            },
                            "componentType": "wysiwyg.viewer.components.HeaderContainer"
                        },
                        {
                            "type": "Container",
                            "styleId": "pc1",
                            "id": "PAGES_CONTAINER",
                            "components": [
                                {
                                    "id": "SITE_PAGES",
                                    "components": [],
                                    "layout": {
                                        "width": 320,
                                        "height": 200,
                                        "x": 0,
                                        "y": 0
                                    },
                                    "componentType": "wysiwyg.viewer.components.PageGroup"
                                }
                            ],
                            "layout": {
                                "width": 320,
                                "height": 200,
                                "x": 0,
                                "y": 100
                            },
                            "componentType": "wysiwyg.viewer.components.PagesContainer"
                        }
                    ],
                    "id": 'masterPage',
                    "layout": {
                        "y": 0,
                        "position": "static"
                    }
                };

                var dimensionsMap = structureDimensions.createDimensionsMap(structure, this.clientSize, this.siteWidth, true);

                expect(_.size(dimensionsMap)).toEqual(6);
                expect(_.keys(dimensionsMap)).toContain(['SITE_FOOTER', 'SITE_HEADER', 'PAGES_CONTAINER', 'masterPage', 'SITE_PAGES', 'TINY_MENU']);
            });
        });

    });
});
