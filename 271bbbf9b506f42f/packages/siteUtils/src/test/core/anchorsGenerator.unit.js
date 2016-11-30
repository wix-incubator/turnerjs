define(['lodash', 'siteUtils/core/anchorsGenerator', 'siteUtils/core/componentsAnchorsMetaData', 'siteUtils/core/constants', 'testUtils'], function
    (_, /** anchorsGenerator */ anchorsGenerator, componentsAnchorsMetaData, constants, testUtils) {
    'use strict';

    describe('anchors generator in viewer', function () {
        var buttonType = 'wysiwyg.viewer.components.SiteButton';
        describe('Isolated components', function () {
            var theme;

            function createAnchorsMapWithComponents(components) {
                var containerComp = {
                    "id": "container",
                    "type": "Container",
                    "layout": {
                        "width": 751,
                        "height": 600,
                        "x": 113,
                        "y": 42,
                        "rotationInDegrees": 0
                    },
                    "componentType": "mobile.core.components.Container",
                    "components": components
                };
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('somePageId', containerComp);
                theme = siteData.getAllTheme();

                return anchorsGenerator.createChildrenAnchors(containerComp, theme, siteData.isMobileView());
            }

            describe('when components do not overlap horizontally', function () {
                it('should not create anchor between them, and create bottom parent from both', function () {
                    var components = [{
                        "id": "buttonA",
                        "componentType": buttonType,
                        "layout": {
                            "width": 50,
                            "height": 50,
                            "x": 325,
                            "y": 100,
                            "rotationInDegrees": 0
                        }
                    }, {
                        "id": "buttonB",
                        "componentType": buttonType,
                        "layout": {
                            "width": 50,
                            "height": 50,
                            "scale": 1,
                            "x": 100,
                            "y": 300,
                            "rotationInDegrees": 0
                        }
                    }];

                    var anchorsMap = createAnchorsMapWithComponents(components);

                    expect(anchorsMap.buttonA.length).toEqual(1);
                    expect(anchorsMap.buttonA[0].type).toEqual('BOTTOM_PARENT');
                    expect(anchorsMap.buttonB.length).toEqual(1);
                    expect(anchorsMap.buttonB[0].type).toEqual('BOTTOM_PARENT');
                });
            });

            describe('when components overlap horizontally', function () {
                describe('when components do not overlap vertically', function () {
                    it('should create bottom_top anchor, and bottom_parent from the lower comp', function () {
                        var topCompLayout = {
                            "width": 50,
                            "height": 50,
                            "x": 300,
                            "y": 100,
                            "rotationInDegrees": 0
                        };
                        var bottomCompLayout = {
                            "width": 50,
                            "height": 50,
                            "scale": 1,
                            "x": 300,
                            "y": 300,
                            "rotationInDegrees": 0
                        };

                        var components = [{
                            "id": "buttonA",
                            "componentType": buttonType,
                            "layout": topCompLayout
                        }, {
                            "id": "buttonB",
                            "componentType": buttonType,
                            "layout": bottomCompLayout
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        expect(anchorsMap.buttonA.length).toEqual(1);
                        expect(anchorsMap.buttonA[0].type).toEqual('BOTTOM_TOP');
                        expect(anchorsMap.buttonA[0].distance).toEqual(bottomCompLayout.y - topCompLayout.y - topCompLayout.height);
                        expect(anchorsMap.buttonA[0].locked).toEqual(false);
                        expect(anchorsMap.buttonB.length).toEqual(1);
                        expect(anchorsMap.buttonB[0].type).toEqual('BOTTOM_PARENT');
                    });

                    describe('when distance between components is lower than locked threshold', function () {
                        it('should create bottom_top locked anchor, and bottom_parent from the lower comp', function () {
                            var topCompLayout = {
                                "width": 50,
                                "height": 50,
                                "x": 300,
                                "y": 100,
                                "rotationInDegrees": 0
                            };
                            var bottomCompLayout = {
                                "width": 50,
                                "height": 50,
                                "scale": 1,
                                "x": 300,
                                "y": 200,
                                "rotationInDegrees": 0
                            };

                            var components = [{
                                "id": "buttonA",
                                "componentType": buttonType,
                                "layout": topCompLayout
                            }, {
                                "id": "buttonB",
                                "componentType": buttonType,
                                "layout": bottomCompLayout
                            }];

                            var anchorsMap = createAnchorsMapWithComponents(components);

                            expect(anchorsMap.buttonA.length).toEqual(1);
                            expect(anchorsMap.buttonA[0].type).toEqual('BOTTOM_TOP');
                            expect(anchorsMap.buttonA[0].distance).toEqual(bottomCompLayout.y - topCompLayout.y - topCompLayout.height);
                            expect(anchorsMap.buttonA[0].locked).toEqual(true);
                            expect(anchorsMap.buttonB.length).toEqual(1);
                            expect(anchorsMap.buttonB[0].type).toEqual('BOTTOM_PARENT');
                        });
                    });
                });

                describe('when components overlap vertically', function () {
                    it('should create top_top anchor, and bottom_parent from both comps to the container', function () {
                        var topCompLayout = {
                            "width": 50,
                            "height": 50,
                            "x": 300,
                            "y": 100,
                            "rotationInDegrees": 0
                        };
                        var bottomCompLayout = {
                            "width": 50,
                            "height": 50,
                            "scale": 1,
                            "x": 300,
                            "y": 120,
                            "rotationInDegrees": 0
                        };

                        var components = [{
                            "id": "buttonA",
                            "componentType": buttonType,
                            "layout": topCompLayout
                        }, {
                            "id": "buttonB",
                            "componentType": buttonType,
                            "layout": bottomCompLayout
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        var topTopAnchor = _.find(anchorsMap.buttonA, {type: 'TOP_TOP'});
                        var bottomParentAnchor = _.find(anchorsMap.buttonA, {type: 'BOTTOM_PARENT'});

                        expect(anchorsMap.buttonA.length).toEqual(2);
                        expect(topTopAnchor.distance).toEqual(bottomCompLayout.y - topCompLayout.y);
                        expect(topTopAnchor.locked).toEqual(true);
                        expect(bottomParentAnchor).toBeTruthy();
                        expect(anchorsMap.buttonB.length).toEqual(1);
                        expect(anchorsMap.buttonB[0].type).toEqual('BOTTOM_PARENT');
                    });

                    it('should always set top_top anchors to locked', function () {
                        var topCompLayout = {
                            "width": 50,
                            "height": 800,
                            "x": 300,
                            "y": 100,
                            "rotationInDegrees": 0
                        };
                        var bottomCompLayout = {
                            "width": 50,
                            "height": 50,
                            "scale": 1,
                            "x": 300,
                            "y": 300,
                            "rotationInDegrees": 0
                        };

                        var components = [{
                            "id": "buttonA",
                            "componentType": buttonType,
                            "layout": topCompLayout
                        }, {
                            "id": "buttonB",
                            "componentType": buttonType,
                            "layout": bottomCompLayout
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        var topTopAnchor = _.find(anchorsMap.buttonA, {type: 'TOP_TOP'});
                        var bottomParentAnchor = _.find(anchorsMap.buttonA, {type: 'BOTTOM_PARENT'});

                        expect(anchorsMap.buttonA.length).toEqual(2);
                        expect(topTopAnchor.distance).toEqual(bottomCompLayout.y - topCompLayout.y);
                        expect(topTopAnchor.locked).toEqual(true);
                        expect(bottomParentAnchor).toBeTruthy();
                        expect(anchorsMap.buttonB.length).toEqual(1);
                        expect(anchorsMap.buttonB[0].type).toEqual('BOTTOM_PARENT');
                    });
                });
            });

            describe('components anchors metaData', function () {
                afterEach(function () {
                    delete componentsAnchorsMetaData.someNotRealComponent;
                });

                it('should not create anchor from component with metaData that does not allow it', function () {
                    componentsAnchorsMetaData.someNotRealComponent = {
                        to: {allow: true},
                        from: {allow: false}
                    };

                    var components = [{
                        "id": "buttonA",
                        "type": "Component",
                        "layout": {
                            "width": 50,
                            "height": 60,
                            "x": 325,
                            "y": 400,
                            "rotationInDegrees": 0
                        },
                        "componentType": buttonType
                    }, {
                        "id": "someCompA",
                        "type": "Component",
                        "layout": {
                            "width": 50,
                            "height": 50,
                            "scale": 1,
                            "x": 325,
                            "y": 320,
                            "rotationInDegrees": 0
                        },
                        "componentType": "someNotRealComponent"
                    }];

                    var anchorsMap = createAnchorsMapWithComponents(components);

                    expect(anchorsMap.someCompA.length).toEqual(0);
                });

                it('should not create anchor to component with metaData that does not allow it', function () {
                    componentsAnchorsMetaData.someNotRealComponent = {
                        to: {allow: false},
                        from: {allow: true}
                    };

                    var components = [{
                        "id": "buttonA",
                        "type": "Component",
                        "layout": {
                            "width": 50,
                            "height": 60,
                            "x": 325,
                            "y": 320,
                            "rotationInDegrees": 0
                        },
                        "componentType": buttonType
                    },
                        {
                            "id": "someCompA",
                            "type": "Component",
                            "layout": {
                                "width": 50,
                                "height": 50,
                                "scale": 1,
                                "x": 325,
                                "y": 400,
                                "rotationInDegrees": 0
                            },
                            "componentType": "someNotRealComponent"
                        }];

                    var anchorsMap = createAnchorsMapWithComponents(components);

                    expect(_.find(anchorsMap.buttonA, 'targetComponent', 'someCompA')).not.toBeDefined();
                });

                describe('locked metaData', function () {
                    it('should have a locked anchor if componentsAnchorsMetaData says ALWAYS (although status distance > threshold)', function () {
                        componentsAnchorsMetaData.someNotRealComponent = {
                            to: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.THRESHOLD},
                            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.ALWAYS}
                        };

                        var components = [{
                            "id": "buttonA",
                            "type": "Component",
                            "layout": {
                                "width": 50,
                                "height": 60,
                                "x": 325,
                                "y": 400,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        }, {
                            "id": "someCompA",
                            "type": "Component",
                            "layout": {
                                "width": 50,
                                "height": 50,
                                "scale": 1,
                                "x": 325,
                                "y": 200,
                                "rotationInDegrees": 0
                            },
                            "componentType": "someNotRealComponent"
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        expect(anchorsMap.someCompA[0].distance > constants.ANCHORS.LOCK_THRESHOLD).toBe(true);
                        expect(anchorsMap.someCompA[0].locked).toEqual(true);
                    });

                    it('should not have a locked anchor if componentsAnchorsMetaData says NEVER (although distance <= threshold)', function () {
                        componentsAnchorsMetaData.someNotRealComponent = {
                            to: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.THRESHOLD},
                            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.NEVER}
                        };

                        var components = [{
                            "id": "buttonA",
                            "type": "Component",
                            "layout": {
                                "width": 50,
                                "height": 60,
                                "x": 325,
                                "y": 400,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        }, {
                            "id": "someCompA",
                            "type": "Component",
                            "layout": {
                                "width": 50,
                                "height": 50,
                                "scale": 1,
                                "x": 325,
                                "y": 320,
                                "rotationInDegrees": 0
                            },
                            "componentType": "someNotRealComponent"
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        expect(anchorsMap.someCompA[0].distance <= constants.ANCHORS.LOCK_THRESHOLD).toBe(true);
                        expect(anchorsMap.someCompA[0].locked).toEqual(false);
                    });
                });
            });

            describe('Site structure comps', function () {
                it('should always create anchors for site structure comps, even if they are fixed positions', function () {
                    var headerLayout = {
                        x: 0,
                        y: 0,
                        width: 1000,
                        height: 50,
                        rotationInDegrees: 0,
                        fixedPosition: true
                    };
                    var pagesContainerLayout = {
                        x: 0,
                        y: 50,
                        width: 1000,
                        height: 100,
                        rotationInDegrees: 0
                    };
                    var footerLayout = {
                        x: 0,
                        y: 150,
                        width: 1000,
                        height: 50,
                        rotationInDegrees: 0
                    };
                    var components = [{
                        id: "SITE_HEADER",
                        componentType: 'wysiwyg.viewer.components.HeaderContainer',
                        layout: headerLayout
                    }, {
                        id: "PAGES_CONTAINER",
                        componentType: 'wysiwyg.viewer.components.PagesContainer',
                        layout: pagesContainerLayout
                    }, {
                        id: "SITE_FOOTER",
                        componentType: 'wysiwyg.viewer.components.FooterContainer',
                        layout: footerLayout
                    }];

                    var anchorsMap = createAnchorsMapWithComponents(components);

                    var expectedHeaderAnchors = [{
                        fromComp: 'SITE_HEADER',
                        targetComponent: 'PAGES_CONTAINER',
                        distance: 0,
                        locked: true,
                        originalValue: 50,
                        type: 'BOTTOM_TOP'
                    }];
                    expect(anchorsMap.SITE_HEADER).toEqual(expectedHeaderAnchors);
                });

                it('should create bottom_parent anchor from site_pages to pages container with distance 0', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    theme = siteData.getAllTheme();

                    siteData.updatePageComponent('PAGES_CONTAINER', {layout: {x: 0, y: 0, height: 2000, width: 980}}, 'masterPage');

                    var masterPageAnchors = anchorsGenerator.createPageAnchors(siteData.pagesData.masterPage.structure, theme, false);

                    var siteAnchor = {
                        distance: 0,
                        locked: true,
                        originalValue: 0,
                        fromComp: 'SITE_PAGES',
                        targetComponent: "PAGES_CONTAINER",
                        type: "BOTTOM_PARENT"
                    };

                    expect(masterPageAnchors.SITE_PAGES).toEqual([siteAnchor]);
                });

                describe('pagesContainer anchors chain', function () {
                    it('assign 0 to original value of all non-locked bottomTop anchors under the pages container, to shrink gaps', function () {
                        var headerLayout = {
                            x: 0,
                            y: -50,
                            width: 1000,
                            height: 50,
                            rotationInDegrees: 0
                        };
                        var pagesContainerLayout = {
                            x: 0,
                            y: 50,
                            width: 1000,
                            height: 50,
                            rotationInDegrees: 0
                        };
                        var middleCompLayout = {
                            x: 0,
                            y: 120,
                            width: 1000,
                            height: 50,
                            rotationInDegrees: 0
                        };
                        var footerLayout = {
                            x: 0,
                            y: 500,
                            width: 1000,
                            height: 50,
                            rotationInDegrees: 0
                        };
                        var components = [{
                            id: "SITE_HEADER",
                            componentType: 'wysiwyg.viewer.components.HeaderContainer',
                            layout: headerLayout
                        }, {
                            id: "PAGES_CONTAINER",
                            componentType: 'wysiwyg.viewer.components.PagesContainer',
                            layout: pagesContainerLayout
                        }, {
                            id: 'compBetweenFooterAndPages',
                            componentType: buttonType,
                            layout: middleCompLayout
                        }, {
                            id: "SITE_FOOTER",
                            componentType: 'wysiwyg.viewer.components.FooterContainer',
                            layout: footerLayout
                        }];

                        var anchorsMap = createAnchorsMapWithComponents(components);

                        expect(anchorsMap.PAGES_CONTAINER.length).toEqual(1);
                        expect(anchorsMap.PAGES_CONTAINER[0]).toEqual({
                            targetComponent: 'compBetweenFooterAndPages',
                            distance: 20,
                            locked: true,
                            originalValue: 0,
                            type: 'BOTTOM_TOP',
                            fromComp: 'PAGES_CONTAINER'
                        });
                        expect(anchorsMap.compBetweenFooterAndPages.length).toEqual(1);
                        expect(anchorsMap.compBetweenFooterAndPages[0]).toEqual({
                            targetComponent: 'SITE_FOOTER',
                            distance: 330,
                            locked: false,
                            originalValue: 0,
                            type: 'BOTTOM_TOP',
                            fromComp: 'compBetweenFooterAndPages'
                        });
                        expect(anchorsMap.SITE_HEADER.length).toEqual(1);
                        expect(anchorsMap.SITE_HEADER[0]).toEqual({
                            targetComponent: 'PAGES_CONTAINER',
                            distance: 50,
                            locked: true,
                            originalValue: 50,
                            type: 'BOTTOM_TOP',
                            fromComp: 'SITE_HEADER'
                        });
                    });
                });
            });
        });

        describe('anchors between components without docked components - visual tests', function () {
            //visual of tested comps layout  - http://editor.wix.com/html/editor/web/renderer/edit/321279d5-0706-42f2-80aa-72086136554a?metaSiteId=51872479-33ea-4da0-89bb-ace459c55d00&editorSessionId=3639AD7B-74F4-4A12-94D1
            var theme;

            beforeEach(function () {
                this.comps = [{
                    "id": "container",
                    "type": "Container",
                    "layout": {
                        "width": 751,
                        "height": 565,
                        "x": 113,
                        "y": 42,
                        "rotationInDegrees": 0
                    },
                    "componentType": "mobile.core.components.Container",
                    "components": [{
                        "id": "redWPhoto",
                        "type": "Component",
                        "layout": {
                            "width": 155,
                            "height": 144,
                            "x": 228,
                            "y": 88,
                            "rotationInDegrees": 0
                        },
                        "componentType": "wysiwyg.viewer.components.WPhoto"
                    }, {
                        "id": "buttonA",
                        "type": "Component",
                        "layout": {
                            "width": 130,
                            "height": 60,
                            "x": 134,
                            "y": 261,
                            "rotationInDegrees": 0
                        },
                        "componentType": buttonType
                    },
                        {
                            "id": "buttonB",
                            "type": "Component",
                            "layout": {
                                "width": 130,
                                "height": 60,
                                "x": 181,
                                "y": 351,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        },
                        {
                            "id": "buttonC",
                            "type": "Component",
                            "layout": {
                                "width": 130,
                                "height": 60,
                                "x": 326,
                                "y": 362,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        },
                        {
                            "id": "orangeWPhoto",
                            "type": "Component",
                            "layout": {
                                "width": 164,
                                "height": 65,
                                "x": 350,
                                "y": 167,
                                "rotationInDegrees": 0
                            },
                            "componentType": "wysiwyg.viewer.components.WPhoto"
                        },
                        {
                            "id": "blackWPhoto",
                            "type": "Component",
                            "layout": {
                                "width": 32,
                                "height": 36,
                                "x": 279,
                                "y": 180,
                                "rotationInDegrees": 0
                            },
                            "componentType": "wysiwyg.viewer.components.WPhoto"
                        },
                        {
                            "id": "blueShape",
                            "type": "Component",
                            "layout": {
                                "width": 125,
                                "height": 69,
                                "x": 396,
                                "y": 180,
                                "rotationInDegrees": 0
                            },
                            "componentType": "wysiwyg.viewer.components.svgshape.SvgShape"
                        },
                        {
                            "id": "buttonD",
                            "type": "Component",
                            "layout": {
                                "width": 130,
                                "height": 60,
                                "x": 476,
                                "y": 400,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        },
                        {
                            "id": "buttonF",
                            "type": "Component",
                            "layout": {
                                "width": 58,
                                "height": 60,
                                "x": 325,
                                "y": 96,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        },
                        {
                            "id": "buttonG",
                            "type": "Component",
                            "layout": {
                                "width": 130,
                                "height": 60,
                                "scale": 1,
                                "x": -313,
                                "y": 358,
                                "rotationInDegrees": 0
                            },
                            "componentType": buttonType
                        }]
                }];
                var masterPageChildren = [
                    {
                        "type": "Container",
                        "id": "SITE_FOOTER",
                        "components": [{
                            "type": "Component",
                            "styleId": "txtNew",
                            "id": "textInFooter",
                            "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                            "layout": {
                                "width": 400,
                                "height": 20,
                                "x": 10,
                                "y": 17,
                                "scale": 1,
                                "rotationInDegrees": 0,
                                "fixedPosition": false
                            },
                            "componentType": "wysiwyg.viewer.components.WRichText"
                        }],
                        "skin": "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                        "layout": {
                            "width": 980,
                            "height": 110,
                            "x": 0,
                            "y": 727,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": "wysiwyg.viewer.components.FooterContainer"
                    },
                    {
                        "type": "Container",
                        "id": "SITE_HEADER",
                        "components": [],
                        "skin": "wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen",
                        "layout": {
                            "width": 980,
                            "height": 100,
                            "x": 0,
                            "y": 0,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": "wysiwyg.viewer.components.HeaderContainer"
                    },
                    {
                        "type": "Container",
                        "id": "PAGES_CONTAINER",
                        "components": [{
                            "type": "Container",
                            "id": "SITE_PAGES",
                            "components": [],
                            "skin": "wysiwyg.viewer.skins.PageGroupSkin",
                            "layout": {
                                "width": 980,
                                "height": 627,
                                "x": 0,
                                "y": 0,
                                "scale": 1,
                                "rotationInDegrees": 0,
                                "fixedPosition": false
                            },
                            "componentType": "wysiwyg.viewer.components.PageGroup"
                        }],
                        "skin": "wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen",
                        "layout": {
                            "width": 980,
                            "height": 627,
                            "x": 0,
                            "y": 100,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": "wysiwyg.viewer.components.PagesContainer"
                    },
                    {
                        "type": "Component",
                        "id": "masterPageButton1",
                        "skin": "wysiwyg.viewer.skins.button.BasicButton",
                        "layout": {
                            "width": 130,
                            "height": 60,
                            "x": -156,
                            "y": 504,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": buttonType
                    },
                    {
                        "type": "Component",
                        "id": "masterPageButton2",
                        "skin": "wysiwyg.viewer.skins.button.BasicButton",
                        "layout": {
                            "width": 130,
                            "height": 60,
                            "x": -156,
                            "y": 602,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": buttonType
                    },
                    {
                        "type": "Component",
                        "id": "masterPageButton3",
                        "skin": "wysiwyg.viewer.skins.button.BasicButton",
                        "layout": {
                            "width": 130,
                            "height": 60,
                            "x": 402,
                            "y": 629,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "fixedPosition": false
                        },
                        "componentType": buttonType
                    }

                ];
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('somePageId', this.comps)
                    .setPageComponents(masterPageChildren, 'masterPage');
                this.masterPageStructure = this.siteData.getPageData('masterPage').structure;
                theme = this.siteData.getAllTheme();
            });

            describe('create anchors for children', function () {
                describe('BOTTOM_PARENT', function () {
                    it('should create BOTTOM_PARENT anchors for components that have no siblings below them', function () {
                        var buttonBExpectedBottomParentAnchors = [
                            {
                                type: 'BOTTOM_PARENT',
                                distance: 154,
                                originalValue: 565,
                                locked: false,
                                targetComponent: 'container'
                            }
                        ];
                        var buttonCExpectedBottomParentAnchors = [
                            {
                                type: 'BOTTOM_PARENT',
                                distance: 143,
                                originalValue: 565,
                                locked: false,
                                targetComponent: 'container'
                            }
                        ];

                        var buttonDExpectedBottomParentAnchors = [
                            {
                                type: 'BOTTOM_PARENT',
                                distance: 105,
                                originalValue: 565,
                                locked: false,
                                targetComponent: 'container'
                            }
                        ];

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        expect(anchorsMap.buttonB.length).toBe(1);
                        expect(anchorsMap.buttonC.length).toBe(1);
                        expect(anchorsMap.buttonD.length).toBe(1);
                        expect(anchorsMap.buttonB[0]).toContain(buttonBExpectedBottomParentAnchors[0]);
                        expect(anchorsMap.buttonC[0]).toContain(buttonCExpectedBottomParentAnchors[0]);
                        expect(anchorsMap.buttonD[0]).toContain(buttonDExpectedBottomParentAnchors[0]);
                    });

                    it('should create BOTTOM_PARENT anchors for components with negative x value, and no siblings below them', function () {
                        var expectedAnchor = {
                            type: 'BOTTOM_PARENT',
                            distance: 147,
                            originalValue: 565,
                            locked: false,
                            targetComponent: 'container'
                        };

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        expect(anchorsMap.buttonG[0]).toContain(expectedAnchor);
                    });

                    it('should not create BOTTOM_PARENT anchors for components which are docked bottom', function () {
                        var dockedBottomCompId = 'dockedBottom';
                        this.comps[0].components = [
                            {
                                "id": dockedBottomCompId,
                                "type": "Component",
                                "layout": {
                                    "width": 155,
                                    "height": 144,
                                    "x": 228,
                                    "docked": {
                                        "bottom": {
                                            "px": 10
                                        }
                                    },
                                    "rotationInDegrees": 0
                                },
                                "componentType": buttonType
                            }
                        ];

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        expect(anchorsMap[dockedBottomCompId]).toEqual([]);
                    });
                });

                describe('BOTTOM_TOP', function () {
                    it('should create BOTTOM_TOP anchors for components directly below other components', function () {
                        var redWPhotoBottomTopAnchors, buttonATopAnchors;

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        redWPhotoBottomTopAnchors = _.filter(anchorsMap.redWPhoto, {type: 'BOTTOM_TOP'});
                        buttonATopAnchors = _.filter(anchorsMap.buttonA, {type: 'BOTTOM_TOP'});

                        var redWPhotoAnchorsTargets = _.map(redWPhotoBottomTopAnchors, 'targetComponent');
                        var buttonAAnchorsTargets = _.map(buttonATopAnchors, 'targetComponent');

                        expect(redWPhotoAnchorsTargets.length).toBe(2);
                        expect(_.includes(redWPhotoAnchorsTargets, 'buttonA')).toBe(true);
                        expect(_.includes(redWPhotoAnchorsTargets, 'buttonC')).toBe(true);

                        expect(buttonAAnchorsTargets.length).toBe(1);
                        expect(_.includes(buttonAAnchorsTargets, 'buttonB')).toBe(true);
                    });

                    it('should not create BOTTOM_TOP anchors to or from components with fixed position', function () {
                        var buttonB = _.find(this.comps[0].components, {id: 'buttonB'});
                        buttonB.layout.fixedPosition = true;

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var buttonAAnchorsTargets = _.map(anchorsMap.buttonA, 'targetComponent');

                        expect(anchorsMap.buttonB.length).toBe(0);
                        expect(_.includes(buttonAAnchorsTargets, 'buttonB')).toBeFalsy();
                    });

                    it('should not create BOTTOM_PARENT anchor, if comp has BOTTOM_TOP anchor', function () {
                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        expect(_.find(anchorsMap.redWPhoto, {type: 'BOTTOM_TOP'})).toBeTruthy();
                        expect(_.find(anchorsMap.redWPhoto, {type: 'BOTTOM_PARENT'})).toBeFalsy();
                    });

                    it('should create BOTTOM_TOP between all components above a given component, even if there are TOP_TOP anchors those above', function () {
                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var orangePhotoAnchorsTargets = _(anchorsMap.orangeWPhoto)
                            .filter({type: 'BOTTOM_TOP'})
                            .map('targetComponent')
                            .value();

                        expect(_.includes(orangePhotoAnchorsTargets, 'buttonD')).toEqual(true);
                    });
                });

                describe('TOP_TOP', function () {
                    it('should create TOP_TOP anchors for components vertically contained in original component', function () {
                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var topTopAnchors = _.filter(anchorsMap.redWPhoto, {type: 'TOP_TOP'});
                        var topTopAnchorsTargetComps = _.map(topTopAnchors, 'targetComponent');

                        expect(topTopAnchorsTargetComps.length).toBe(3);
                        expect(topTopAnchorsTargetComps).toContain('buttonF');
                        expect(topTopAnchorsTargetComps).toContain('blackWPhoto');
                        expect(topTopAnchorsTargetComps).toContain('orangeWPhoto');
                    });

                    it('should not create TOP_TOP anchors TO components on fixed position', function () {
                        var buttonF = _.find(this.comps[0].components, {id: 'buttonF'});
                        buttonF.layout.fixedPosition = true;

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var topTopAnchors = _.filter(anchorsMap.redWPhoto, {type: 'TOP_TOP'});
                        var topTopAnchorsTargetComps = _.map(topTopAnchors, 'targetComponent');

                        expect(topTopAnchorsTargetComps.length).toBe(2);
                        expect(_.includes(topTopAnchorsTargetComps, 'buttonF')).toBeFalsy();
                        expect(_.includes(topTopAnchorsTargetComps, 'orangeWPhoto')).toBe(true);
                        expect(_.includes(topTopAnchorsTargetComps, 'blackWPhoto')).toBe(true);
                    });

                    it('should not create TOP_TOP anchors FROM components on fixed position', function () {
                        var redWPhoto = _.find(this.comps[0].components, {id: 'redWPhoto'});
                        redWPhoto.layout.fixedPosition = true;

                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var topTopAnchors = _.filter(anchorsMap.redWPhoto, {type: 'TOP_TOP'});
                        expect(topTopAnchors.length).toBe(0);
                    });
                });

                describe('transitive anchors removal', function () {
                    it('should remove anchors that are not needed since comps are connected through a direct chain of anchors', function () {
                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var redWPhotoAnchorsTargets = _(anchorsMap.redWPhoto)
                            .filter({type: 'BOTTOM_TOP'})
                            .map('targetComponent')
                            .value();

                        expect(redWPhotoAnchorsTargets.length).toBe(2);
                        expect(_.includes(redWPhotoAnchorsTargets, 'buttonB')).toBeFalsy();
                    });

                    it('should not remove anchors if the alternative route between components includes top_top anchors', function () {
                        var anchorsMap = anchorsGenerator.createChildrenAnchors(this.comps[0], theme, this.siteData.isMobileView());

                        var blueShapeAnchorsTargets = _(anchorsMap.blueShape)
                            .filter({type: 'BOTTOM_TOP'})
                            .map('targetComponent')
                            .value();
                        var orangePhotoAnchorsTargets = _(anchorsMap.orangeWPhoto)
                            .filter({type: 'BOTTOM_TOP'})
                            .map('targetComponent')
                            .value();

                        expect(blueShapeAnchorsTargets.length).toBe(2);
                        expect(orangePhotoAnchorsTargets.length).toBe(2);
                        expect(_.includes(orangePhotoAnchorsTargets, 'buttonC')).toEqual(true);
                    });
                });
            });

            describe('createPageAnchors', function () {

                beforeEach(function () {
                    this.compIds = ['someComp0', 'someContainer', 'someComp1', 'someComp2', 'someComp3', 'someComp4', 'someComp5'];
                    this.page = {
                        type: 'Page',
                        id: 'testedPageId',
                        layout: {},
                        components: [
                            {
                                "id": this.compIds[1],
                                "type": "Container",
                                "layout": {
                                    "width": 751,
                                    "height": 565,
                                    "x": 113,
                                    "y": 42,
                                    "rotationInDegrees": 0
                                },
                                "componentType": "mobile.core.components.Container",
                                "components": [
                                    {
                                        "id": this.compIds[2],
                                        "type": "Component",
                                        "layout": {
                                            "width": 155,
                                            "height": 144,
                                            "x": 228,
                                            "y": 88,
                                            "rotationInDegrees": 0
                                        },
                                        "componentType": "wysiwyg.viewer.components.WPhoto"
                                    },
                                    {
                                        "id": this.compIds[3],
                                        "type": "Component",
                                        "layout": {
                                            "width": 130,
                                            "height": 60,
                                            "x": 134,
                                            "y": 261,
                                            "rotationInDegrees": 0
                                        },
                                        "componentType": buttonType
                                    },
                                    {
                                        "id": this.compIds[5],
                                        "type": "Container",
                                        "layout": {
                                            "width": 751,
                                            "height": 565,
                                            "x": 113,
                                            "y": 42,
                                            "rotationInDegrees": 0
                                        },
                                        "componentType": "mobile.core.components.Container",
                                        "components": [
                                            {
                                                "id": this.compIds[6],
                                                "type": "Component",
                                                "layout": {
                                                    "width": 130,
                                                    "height": 60,
                                                    "x": 134,
                                                    "y": 261,
                                                    "rotationInDegrees": 0
                                                },
                                                "componentType": buttonType
                                            },
                                            {
                                                "id": this.compIds[0],
                                                "type": "Component",
                                                "layout": {
                                                    "width": 130,
                                                    "height": 60,
                                                    "x": 134,
                                                    "y": 261,
                                                    "rotationInDegrees": 0
                                                },
                                                "componentType": buttonType
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "id": this.compIds[4],
                                "type": "Component",
                                "layout": {
                                    "width": 130,
                                    "height": 60,
                                    "x": 550,
                                    "y": 600,
                                    "rotationInDegrees": 0
                                },
                                "componentType": buttonType
                            }
                        ]
                    };
                });

                it('should create anchors for all components in page, recursively', function () {
                    var anchorsMap = anchorsGenerator.createPageAnchors(this.page, theme, this.siteData.isMobileView());

                    expect(anchorsMap).toBeTruthy();
                    _.forEach(this.compIds, function (id) {
                        expect(anchorsMap[id]).toBeTruthy();
                    });
                });
            });
        });

        describe('landing page - when master page has only pagesContainer', function () {
            it('should create bottom_parent anchor from pages container to masterPage', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var theme = siteData.getAllTheme();

                var pagesContainer = _.find(siteData.pagesData.masterPage.structure.children, {id: 'PAGES_CONTAINER'});
                pagesContainer.layout.y = 0;
                _.set(siteData, 'pagesData.masterPage.structure.children', [pagesContainer]);

                var masterPageAnchors = anchorsGenerator.createPageAnchors(siteData.pagesData.masterPage.structure, theme, false);

                var siteAnchor = {
                    distance: 0,
                    locked: true,
                    originalValue: 0,
                    fromComp: 'PAGES_CONTAINER',
                    targetComponent: "masterPage",
                    type: "BOTTOM_PARENT"
                };

                expect(masterPageAnchors.PAGES_CONTAINER).toEqual([siteAnchor]);
            });

            describe('when site was saved with landing page layout', function () {
                var theme;

                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    this.pagesContainer = _.find(this.siteData.pagesData.masterPage.structure.children, {id: 'PAGES_CONTAINER'});
                    this.header = _.find(this.siteData.pagesData.masterPage.structure.children, {id: 'SITE_HEADER'});
                    this.footer = _.find(this.siteData.pagesData.masterPage.structure.children, {id: 'SITE_FOOTER'});
                    _.assign(this.header.layout, {
                        y: 0,
                        height: 100,
                        anchors: [{
                            targetComponent: 'PAGES_CONTAINER',
                            distance: 0,
                            type: 'BOTTOM_TOP'
                        }]
                    });
                    _.assign(this.pagesContainer.layout, {
                        y: 0,
                        height: 500
                    });
                    _.assign(this.footer.layout, {
                        y: 600,
                        height: 100
                    });
                    theme = this.siteData.getAllTheme();
                });

                it('should create a bottom_top anchor from header to pagesContainer, with distance 0', function () {
                    var masterPageAnchors = anchorsGenerator.createPageAnchors(this.siteData.pagesData.masterPage.structure, theme, false);

                    expect(masterPageAnchors.SITE_HEADER.length).toEqual(1);
                    expect(masterPageAnchors.SITE_HEADER[0]).toEqual({
                        targetComponent: 'PAGES_CONTAINER',
                        distance: 0,
                        locked: true,
                        fromComp: 'SITE_HEADER',
                        type: 'BOTTOM_TOP',
                        originalValue: 100
                    });
                });

                it('should create a bottom_top anchor from pagesContainer to footer, with distance 0', function () {
                    var masterPageAnchors = anchorsGenerator.createPageAnchors(this.siteData.pagesData.masterPage.structure, theme, false);

                    expect(masterPageAnchors.PAGES_CONTAINER.length).toEqual(1);
                    expect(masterPageAnchors.PAGES_CONTAINER[0]).toEqual({
                        targetComponent: 'SITE_FOOTER',
                        distance: 0,
                        locked: true,
                        fromComp: 'PAGES_CONTAINER',
                        type: 'BOTTOM_TOP',
                        originalValue: 0
                    });
                });

                describe('when anchors were deleted from components', function () {
                    beforeEach(function () {
                        this.header.layout.anchors = undefined;
                        this.footer.layout.anchors = undefined;
                        this.expectedDistance = 50;
                        this.siteData.pagesData.masterPage.structure.layout = {
                            y: 0,
                            anchors: [{
                                targetComponent: 'PAGES_CONTAINER',
                                distance: this.expectedDistance,
                                type: 'BOTTOM_TOP'
                            }]
                        };
                    });

                    it('should create a bottom_top anchor from header to pagesContainer, according to distance on masterPage anchors', function () {
                        var masterPageAnchors = anchorsGenerator.createPageAnchors(this.siteData.pagesData.masterPage.structure, theme, false);

                        expect(masterPageAnchors.SITE_HEADER.length).toEqual(1);
                        expect(masterPageAnchors.SITE_HEADER[0]).toEqual({
                            targetComponent: 'PAGES_CONTAINER',
                            distance: this.expectedDistance,
                            locked: true,
                            fromComp: 'SITE_HEADER',
                            type: 'BOTTOM_TOP',
                            originalValue: 100 + this.expectedDistance
                        });
                    });

                    describe('when in mobile', function () {
                        it('should create bottom_top anchor from header to pagesContainer, with distance 0', function () {
                            this.siteData.pagesData.masterPage.structure.mobileComponents = _.cloneDeep(this.siteData.pagesData.masterPage.structure.children);

                            var masterPageAnchors = anchorsGenerator.createPageAnchors(this.siteData.pagesData.masterPage.structure, theme, true);

                            expect(masterPageAnchors.SITE_HEADER.length).toEqual(1);
                            expect(masterPageAnchors.SITE_HEADER[0]).toEqual({
                                targetComponent: 'PAGES_CONTAINER',
                                distance: 0,
                                locked: true,
                                fromComp: 'SITE_HEADER',
                                type: 'BOTTOM_TOP',
                                originalValue: 100
                            });
                        });
                    });
                });

                describe('when there are components between the header and the pages container', function () {
                    beforeEach(function(){
                        var topCompBetweenHeaderAndPage = testUtils.mockFactory.createStructure(buttonType, {
                            layout: {
                                y: 150,
                                x: 0,
                                height: 20,
                                width: 800
                            }
                        }, 'topComp');
                        var bottomCompBetweenHeaderAndPage = testUtils.mockFactory.createStructure(buttonType, {
                            layout: {
                                y: 200,
                                x: 0,
                                height: 50,
                                width: 800,
                                anchors: [{
                                    targetComponent: 'PAGES_CONTAINER',
                                    distance: 50,
                                    type: 'BOTTOM_TOP'
                                }]
                            }
                        }, 'bottomComp');
                        this.siteData.addDesktopComps([topCompBetweenHeaderAndPage, bottomCompBetweenHeaderAndPage], 'masterPage');
                        _.assign(this.header.layout, {
                            y: 0,
                            height: 50
                        });
                        _.assign(this.footer.layout, {
                            y: 800,
                            height: 50
                        });
                    });

                    it('should create bottom_top anchors from the bottom most component between header and pages, to the pagesContainer', function () {
                        var masterPageAnchors = anchorsGenerator.createPageAnchors(this.siteData.pagesData.masterPage.structure, theme, false);

                        expect(masterPageAnchors.SITE_HEADER[0].targetComponent).toEqual('topComp');
                        expect(masterPageAnchors.bottomComp[0]).toEqual({
                            targetComponent: 'PAGES_CONTAINER',
                            distance: 50,
                            locked: true,
                            fromComp: 'bottomComp',
                            type: 'BOTTOM_TOP',
                            originalValue: 300
                        });
                    });
                });
            });
        });

        describe('createChildrenAnchors', function () {

            function generateSiteData(pageComponents) {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('somePageId', pageComponents);

                return siteData;
            }

            function componentHasAnchor(anchorsMap, compId, expectedAnchors) {
                var componentAnchor = anchorsMap[compId];

                if (componentAnchor.length !== expectedAnchors.length) {
                    return false;
                }

                return _.every(expectedAnchors, function (anchor) {
                    return _.some(componentAnchor, anchor);
                });
            }

            function componentHasNoAnchorOfType(anchorsMap, compId, anchorType) {
                var componentAnchor = anchorsMap[compId];

                return !_.some(componentAnchor, {type: anchorType});
            }

            function componentHasNoAnchors(anchorsMap, compId) {
                var componentAnchor = anchorsMap[compId];

                return _.isEmpty(componentAnchor);
            }

            it('should not create BOTTOM_PARENT anchor from component with BOTTOM_TOP anchor', function () {
                var components = [
                    {
                        "componentType": "mobile.core.components.Container",
                        "layout": {
                            "x": 240,
                            "y": 130,
                            "width": 180,
                            "height": 280,
                            "rotationInDegrees": 0
                        },
                        "type": "Container",
                        "id": "comp-container",
                        "styleId": "c1",
                        "components": [
                            {
                                "componentType": "mobile.core.components.Container",
                                "layout": {
                                    "x": 60,
                                    "y": 50,
                                    "width": 90,
                                    "height": 60,
                                    "rotationInDegrees": 0
                                },
                                "type": "Container",
                                "id": "comp-a",
                                "styleId": "c1",
                                "components": []
                            },
                            {
                                "componentType": "mobile.core.components.Container",
                                "layout": {
                                    "x": 35,
                                    "y": 120,
                                    "width": 90,
                                    "height": 60,
                                    "rotationInDegrees": 0
                                },
                                "type": "Container",
                                "id": "comp-b",
                                "styleId": "c1",
                                "components": []
                            },
                            {
                                "componentType": "mobile.core.components.Container",
                                "layout": {
                                    "x": 30,
                                    "y": 190,
                                    "width": 110,
                                    "height": 60,
                                    "rotationInDegrees": 0
                                },
                                "type": "Container",
                                "id": "comp-c",
                                "styleId": "c1",
                                "components": []
                            }
                        ]
                    }
                ];
                var siteData = generateSiteData(components);
                var theme = siteData.getAllTheme();

                var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                expect(componentHasNoAnchorOfType(anchorsMap, 'comp-a', 'BOTTOM_PARENT')).toBe(true);
            });

            describe('anchors between docked components with layout_verbs_with_anchors experiment', function () {

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('layout_verbs_with_anchors');
                });

                it('should not create anchors to or from vertically stretched components', function () {
                    var components = [
                        {
                            "componentType": "mobile.core.components.Container",
                            "layout": {
                                "x": 250,
                                "y": 89,
                                "fixedPosition": false,
                                "width": 350,
                                "height": 180,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Container",
                            "id": "comp-container",
                            "styleId": "c1",
                            "components": [
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 5,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-a",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "rotationInDegrees": 0,
                                        "width": 100,
                                        "height": 80,
                                        "scale": 1,
                                        "docked": {
                                            "bottom": {
                                                "px": 50
                                            },
                                            "top": {
                                                "px": 50
                                            }
                                        },
                                        "x": 125,
                                        "y": 60,
                                        "fixedPosition": false
                                    },
                                    "type": "Container",
                                    "id": "comp-b",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 135,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-c",
                                    "styleId": "c1",
                                    "components": []
                                }
                            ]
                        }
                    ];
                    var siteData = generateSiteData(components);
                    var theme = siteData.getAllTheme();

                    var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                    var compAExpectedAnchors = [
                        {
                            "targetComponent": "comp-c",
                            "type": "BOTTOM_TOP"
                        }
                    ];

                    var compCExpectedAnchors = [
                        {
                            "targetComponent": "comp-container",
                            "type": "BOTTOM_PARENT"
                        }
                    ];

                    expect(componentHasAnchor(anchorsMap, 'comp-a', compAExpectedAnchors)).toBe(true);
                    expect(componentHasAnchor(anchorsMap, 'comp-c', compCExpectedAnchors)).toBe(true);
                    expect(componentHasNoAnchors(anchorsMap, 'comp-b')).toBe(true); // comp-b is docked top
                });

                it('should not create anchors to or from vertically centered components', function () {
                    var components = [
                        {
                            "componentType": "mobile.core.components.Container",
                            "layout": {
                                "x": 250,
                                "y": 89,
                                "fixedPosition": false,
                                "width": 350,
                                "height": 180,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Container",
                            "id": "comp-container",
                            "styleId": "c1",
                            "components": [
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 5,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-a",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "rotationInDegrees": 0,
                                        "width": 100,
                                        "height": 80,
                                        "scale": 1,
                                        "docked": {
                                            "vCenter": {
                                                "px": 0
                                            }
                                        },
                                        "x": 50,
                                        "y": 60,
                                        "fixedPosition": false
                                    },
                                    "type": "Container",
                                    "id": "comp-b",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 135,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-c",
                                    "styleId": "c1",
                                    "components": []
                                }
                            ]
                        }
                    ];
                    var siteData = generateSiteData(components);
                    var theme = siteData.getAllTheme();

                    var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                    var compAExpectedAnchors = [
                        {
                            "targetComponent": "comp-c",
                            "type": "BOTTOM_TOP"
                        }
                    ];

                    var compCExpectedAnchors = [
                        {
                            "targetComponent": "comp-container",
                            "type": "BOTTOM_PARENT"
                        }
                    ];

                    expect(componentHasAnchor(anchorsMap, 'comp-a', compAExpectedAnchors)).toBe(true);
                    expect(componentHasAnchor(anchorsMap, 'comp-c', compCExpectedAnchors)).toBe(true);
                    expect(componentHasNoAnchors(anchorsMap, 'comp-b')).toBe(true); // comp-b is docked top
                });

                it('should not create anchors to docked top component', function () {
                    var components = [
                        {
                            "componentType": "mobile.core.components.Container",
                            "layout": {
                                "x": 250,
                                "y": 49,
                                "fixedPosition": false,
                                "width": 350,
                                "height": 180,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Container",
                            "id": "comp-container",
                            "styleId": "c1",
                            "components": [
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 20,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-a",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 70,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "docked": {
                                            "top": {
                                                "px": 70
                                            }
                                        }
                                    },
                                    "type": "Container",
                                    "id": "comp-b",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 120,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-c",
                                    "styleId": "c1",
                                    "components": []
                                }
                            ]
                        }
                    ];
                    var siteData = generateSiteData(components);
                    var theme = siteData.getAllTheme();

                    var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                    var compAExpectedAnchors = [
                        {
                            "targetComponent": "comp-c",
                            "type": "BOTTOM_TOP"
                        }
                    ];


                    var compBExpectedAnchors = [
                        {
                            "targetComponent": "comp-c",
                            "type": "BOTTOM_TOP"
                        }
                    ];

                    var compCExpectedAnchors = [
                        {
                            "targetComponent": "comp-container",
                            "type": "BOTTOM_PARENT"
                        }
                    ];

                    expect(componentHasAnchor(anchorsMap, 'comp-a', compAExpectedAnchors)).toBe(true);
                    expect(componentHasAnchor(anchorsMap, 'comp-b', compBExpectedAnchors)).toBe(true); // comp-b is docked top
                    expect(componentHasAnchor(anchorsMap, 'comp-c', compCExpectedAnchors)).toBe(true);
                });

                it('should not create anchors from docked bottom components', function () {
                    var components = [
                        {
                            "componentType": "mobile.core.components.Container",
                            "layout": {
                                "x": 250,
                                "y": 49,
                                "fixedPosition": false,
                                "width": 350,
                                "height": 180,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Container",
                            "id": "comp-container",
                            "styleId": "c1",
                            "components": [
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 20,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-a",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 70,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "docked": {
                                            "bottom": {
                                                "px": 70
                                            }
                                        }
                                    },
                                    "type": "Container",
                                    "id": "comp-b",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 120,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-c",
                                    "styleId": "c1",
                                    "components": []
                                }
                            ]
                        }
                    ];
                    var siteData = generateSiteData(components);
                    var theme = siteData.getAllTheme();

                    var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                    var compAExpectedAnchors = [
                        {
                            targetComponent: 'comp-b',
                            type: 'BOTTOM_TOP'
                        },
                        {
                            targetComponent: 'comp-c',
                            type: 'BOTTOM_TOP'
                        }
                    ];

                    var compCExpectedAnchors = [
                        {
                            targetComponent: 'comp-container',
                            type: 'BOTTOM_PARENT'
                        }
                    ];

                    expect(componentHasAnchor(anchorsMap, 'comp-a', compAExpectedAnchors)).toBe(true);
                    expect(componentHasAnchor(anchorsMap, 'comp-c', compCExpectedAnchors)).toBe(true);
                    expect(componentHasNoAnchors(anchorsMap, 'comp-b')).toBe(true); // comp-b is docked bottom

                });

                it('should create anchors to vertically stretched to screen comps', function () {
                    var components = [
                        {
                            "componentType": "mobile.core.components.Container",
                            "layout": {
                                "x": 250,
                                "y": 49,
                                "fixedPosition": false,
                                "width": 350,
                                "height": 180,
                                "scale": 1,
                                "rotationInDegrees": 0
                            },
                            "type": "Container",
                            "id": "comp-container",
                            "styleId": "c1",
                            "components": [
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 20,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-a",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 70,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "docked": {
                                            "bottom": {
                                                "vh": 20
                                            },
                                            "top": {
                                                "vh": 20
                                            }
                                        }
                                    },
                                    "type": "Container",
                                    "id": "comp-b",
                                    "styleId": "c1",
                                    "components": []
                                },
                                {
                                    "componentType": "mobile.core.components.Container",
                                    "layout": {
                                        "x": 125,
                                        "y": 120,
                                        "fixedPosition": false,
                                        "width": 100,
                                        "height": 40,
                                        "scale": 1,
                                        "rotationInDegrees": 0
                                    },
                                    "type": "Container",
                                    "id": "comp-c",
                                    "styleId": "c1",
                                    "components": []
                                }
                            ]
                        }
                    ];
                    var siteData = generateSiteData(components);
                    var theme = siteData.getAllTheme();

                    var anchorsMap = anchorsGenerator.createChildrenAnchors(components[0], theme, siteData.isMobileView());

                    var compAExpectedAnchors = [
                        {
                            "targetComponent": "comp-b",
                            "type": "BOTTOM_TOP"
                        }
                    ];


                    var compBExpectedAnchors = [
                        {
                            "targetComponent": "comp-c",
                            "type": "BOTTOM_TOP"
                        }
                    ];

                    var compCExpectedAnchors = [
                        {
                            "targetComponent": "comp-container",
                            "type": "BOTTOM_PARENT"
                        }
                    ];

                    expect(componentHasAnchor(anchorsMap, 'comp-a', compAExpectedAnchors)).toBe(true);
                    expect(componentHasAnchor(anchorsMap, 'comp-b', compBExpectedAnchors)).toBe(true); // comp-b is docked top
                    expect(componentHasAnchor(anchorsMap, 'comp-c', compCExpectedAnchors)).toBe(true);
                });
            });

        });
    });
});
