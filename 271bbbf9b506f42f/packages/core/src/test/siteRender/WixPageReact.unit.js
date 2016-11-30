define([
    "lodash",
    "core/siteRender/WixPageReact",
    'core/core/SiteDataAPI',
    'core/components/actionsAspectActions/triggerTypesConsts',
    "testUtils",
    "react",
    'reactDOM',
    'utils'
], function (_,
             wixPageReact,
             SiteDataAPI,
             triggerTypesConsts,
             testUtils,
             React,
             ReactDOM,
             utils) {
    "use strict";

    describe("WixPageReact", function () {
        var pageId = "",
            currentPageId = "",
            siteData;

        function getProps(structure) {
            var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);
            var viewerPrivateServices = {
                siteDataAPI: siteDataWrapper.siteDataAPI,
                pointers: siteDataWrapper.pointers,
                displayedDAL: siteDataWrapper.displayedDal
            };

            return {
                siteData: siteData,
                structure: structure,
                rootId: pageId,
                currentUrlPageId: currentPageId,
                siteAPI: testUtils.mockFactory.mockSiteAPI(siteData, null, viewerPrivateServices)
            };
        }

        function getPage(reactProps) {
            var elem = React.createElement(wixPageReact, reactProps);
            return React.addons.TestUtils.renderIntoDocument(elem);
        }

        beforeEach(function () {
            pageId = "masterPage";
            currentPageId = "page1";
            siteData = testUtils.mockFactory.mockSiteData();
            spyOn(utils.structureDimensions, "createDimensionsMap").and.returnValue({
                'page1': {},
                'masterPage': {}
            });
            var CustomDiv = React.createClass({
                render: function () {
                    return React.createElement('div');
                }
            });
            spyOn(utils.compFactory, "getCompClass").and.returnValue(React.createFactory(CustomDiv));
        });

        describe("rendering", function () {
            it("should render blank page", function () {
                var page = getPage(getProps({id: "site"})),
                    node = ReactDOM.findDOMNode(page);

                expect(node.id).toBe("site");
                expect(node.childNodes.length).toBe(0);
            });

            it("should render nested components", function () {
                var page = getPage(getProps({
                        id: "c0",
                        components: [{id: "c1"}, {id: "c2"}]
                    })),
                    childNodes = ReactDOM.findDOMNode(page).childNodes;

                expect(childNodes.length).toBe(2);
                expect(childNodes[0].id).toBe("c1");
                expect(childNodes[1].id).toBe("c2");
            });

            it("should enumerate refs recursively", function () {
                var page = getPage(getProps({
                    id: "c0",
                    components: [
                        {
                            id: "c01",
                            components: [
                                {id: "c011"}
                            ]
                        },
                        {
                            id: "c02"
                        }
                    ]
                }));

                expect(_.keys(page.refs).sort()).toEqual(["c0", "c01", "c011", "c02"].sort());
            });
        });

        describe("when page is landing page", function () {
            beforeEach(function () {
                spyOn(siteData, "isPageLandingPage").and.returnValue(true);
            });

            it("should hide everything if page group not found", function () {
                var page = getPage(getProps({
                    id: "master",
                    components: [
                        {
                            id: "page1",
                            components: [
                                {id: "c1"}
                            ]
                        }
                    ]
                }));

                expect(page.refs.page1.style.display).toBe("none");
                expect(page.refs.c1.style.display).toBe("none");
            });
        });

        describe("behavior registration in actions aspect", function () {
            var behaviors = {};

            describe('runtime', function () {
                var mockEnabledComp,
                    enabledProps;

                beforeEach(function () {
                    behaviors = [{
                        type: 'widget',
                        name: 'runCode',
                        params: {
                            'callbackId': '123'
                        }
                    }];
                    enabledProps = {
                        isDisabled: false
                    };
                    var componentType = 'wysiwyg.viewer.components.SiteButton';
                    siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(currentPageId);
                    mockEnabledComp = testUtils.mockFactory.mockComponent(componentType, siteData, currentPageId, {
                        props: enabledProps,
                        behaviors: behaviors
                    }, false, 'mock-enabled-comp');
                    siteData.setRootNavigationInfo({pageId: currentPageId});
                });

                it('should set runtime behaviors', function () {
                    var actionsBehaviors = {
                        action: {
                            name: undefined,
                            sourceId: 'mock-enabled-comp',
                            type: 'comp'
                        },
                        behavior: {
                            type: behaviors[0].type,
                            name: behaviors[0].name,
                            targetId: 'mock-enabled-comp',
                            params: {
                                callbackId: behaviors[0].params.callbackId
                            }
                        }
                    };
                    var reactProps = getProps(mockEnabledComp);
                    var behaviorAspect = reactProps.siteAPI.getSiteAspect("behaviorsAspect");
                    spyOn(behaviorAspect, 'setBehaviorsForActions');

                    getPage(reactProps);

                    expect(behaviorAspect.setBehaviorsForActions).toHaveBeenCalledWith([actionsBehaviors], pageId);
                });

                it('should be able to set behaviors for site structure as well', function () {
                    var openPopupBehavior = {
                        action: {
                            type: 'comp',
                            name: 'load',
                            sourceId: 'masterPage'
                        },
                        behavior: {
                            type: 'site',
                            name: 'openBehavior',
                            targetId: 'popup1'
                        }
                    };

                    siteData.setPageBehaviors('masterPage', [openPopupBehavior]);

                    var reactProps = getProps(siteData.pagesData.masterPage.structure);
                    var behaviorAspect = reactProps.siteAPI.getSiteAspect('behaviorsAspect');
                    spyOn(behaviorAspect, 'setBehaviorsForActions');

                    getPage(reactProps);

                    expect(siteData.pagesData.masterPage.structure.id).toBe('masterPage');
                    expect(behaviorAspect.setBehaviorsForActions).toHaveBeenCalledWith([jasmine.objectContaining(openPopupBehavior)], 'masterPage');
                });
            });

            describe("when page is stub", function () {
                beforeEach(function () {
                    //props.siteAPI.isSiteBusy = function () {
                    //    return false;
                    //};
                });

                it("should set the display to none", function () {
                    pageId = "page1";
                    var pageProps = getProps({
                        id: "page1",
                        type: "Page"
                    });
                    spyOn(pageProps.siteAPI, 'getAllRenderedRootIds').and.returnValue([]);
                    var page = getPage(pageProps);

                    expect(page.refs.page1.style.display).toBe('none');
                });

                describe('deactivate Page modes', function () {

                    beforeEach(function () {
                        testUtils.experimentHelper.openExperiments('sv_hoverBox');
                    });
                    describe('when page is NOT master page', function () {

                        beforeEach(function () {
                            this.oldPageId = pageId;
                            pageId = 'page1';

                            this.structure = {
                                id: 'test-page',
                                components: [{
                                    id: 'comp',
                                    componentType: 'mockComponentType',
                                    behaviors: [],
                                    modes: {
                                        definitions: [{
                                            modeId: 'booboo',
                                            type: 'APPLICATIVE'
                                        }]
                                    }
                                }]
                            };
                            siteData.addPageWithData(pageId, {}, this.structure.components);
                            siteData.setRootNavigationInfo({pageId: pageId});
                        });

                        afterEach(function () {
                            pageId = this.oldPageId;
                        });

                        it('should deactivate all of the page active modes when componentWillUpdate if NOT master page', function () {
                            var reactProps = getProps(this.structure);
                            var page = getPage(reactProps);
                            page.props.siteAPI.activateModeById('comp', pageId, 'booboo');

                            expect(page.props.siteAPI.getActiveModes()).toEqual({
                                'page1': {
                                    'booboo': true
                                }
                            });

                            var nextProps = _.assign({foo: 'bar'}, reactProps);
                            siteData.setRootNavigationInfo({pageId: this.structure.id});
                            page.componentWillUpdate(nextProps);

                            expect(page.props.siteAPI.getActiveModes()).toEqual({'page1': {}});
                        });
                    });

                    describe('when page is master page', function () {
                        beforeEach(function () {
                            this.oldPageId = pageId;
                            pageId = 'masterPage';

                            this.structure = {
                                id: "test-page",
                                components: [
                                    {
                                        id: 'comp',
                                        componentType: 'mockComponentType',
                                        behaviors: [],
                                        modes: {
                                            definitions: [{
                                                modeId: 'booboo',
                                                type: 'APPLICATIVE'
                                            }]
                                        }
                                    }
                                ]
                            };
                            siteData.addPageWithData(pageId, {}, this.structure.components);
                            siteData.setRootNavigationInfo({pageId: pageId});
                        });

                        afterEach(function () {
                            pageId = this.oldPageId;
                        });

                        it('should KEEP active modes on master page when componentWillUpdate is called', function () {
                            var reactProps = getProps(this.structure);
                            var page = getPage(reactProps);
                            page.props.siteAPI.activateModeById('comp', pageId, 'booboo');

                            var expectedActiveModes = {
                                'masterPage': {
                                    'booboo': true
                                }
                            };
                            expect(page.props.siteAPI.getActiveModes()).toEqual(expectedActiveModes);

                            var nextProps = _.assign({foo: 'bar'}, reactProps);
                            page.componentWillUpdate(nextProps);

                            expect(page.props.siteAPI.getActiveModes()).toEqual(expectedActiveModes);
                        });
                    });
                });
            });

            it('should not register old format behaviors to BehaviorsAspect', function () {
                //add test
            });

            describe('behaviors registration', function () {

                beforeEach(function () {
                    this.behaviors = {
                        id: 'pageBehaviors',
                        type: 'ObsoleteBehaviorsList',
                        items: "[{\"action\":\"screenIn\",\"name\":\"FloatIn\",\"delay\":0,\"duration\":1.2,\"params\":{\"direction\":\"right\"},\"targetId\":\"\"}]"
                    };
                    siteData.addPageWithDefaults(currentPageId).setCurrentPage(currentPageId);
                });

                it("should register site behaviors", function () {
                    siteData.setPageBehaviors(currentPageId, this.behaviors.items);
                    var pageJson = siteData.getPageData(currentPageId);

                    var reactProps = getProps(pageJson.structure);
                    var actionsAspect = reactProps.siteAPI.getSiteAspect("actionsAspect");
                    spyOn(actionsAspect, 'registerBehaviors');

                    getPage(reactProps);

                    expect(actionsAspect.registerBehaviors).toHaveBeenCalledWith(currentPageId, pageId, JSON.parse(this.behaviors.items));
                });

                it("should register components behaviors", function () {
                    var structure = {
                        components: [
                            testUtils.mockFactory.createStructure('someType', {id: "comp"})
                        ]
                    };
                    siteData.updatePageStructure(currentPageId, structure).setComponentBehaviors('comp', this.behaviors.items, currentPageId);
                    var pageJson = siteData.getPageData(currentPageId);

                    var reactProps = getProps(pageJson.structure);
                    var actionsAspect = reactProps.siteAPI.getSiteAspect("actionsAspect");
                    spyOn(actionsAspect, 'registerBehaviors');

                    getPage(reactProps);

                    expect(actionsAspect.registerBehaviors).toHaveBeenCalledWith("comp", pageId, JSON.parse(this.behaviors.items));
                });

                it('should register component behaviors in componentWillUpdate (so the ones that are now added to structure will already be there)', function () {
                    testUtils.experimentHelper.openExperiments('sv_hoverBox');
                    var structure = {
                        components: [
                            testUtils.mockFactory.createStructure('someType', {id: "comp"})
                        ]
                    };
                    siteData.updatePageStructure(currentPageId, structure).setComponentBehaviors('comp', this.behaviors.items, currentPageId);
                    var pageJson = siteData.getPageData(currentPageId);
                    var comp2Behaviors = "[{\"action\":\"modeChangeIn\",\"name\":\"FloatIn\",\"delay\":0,\"duration\":1.2,\"params\":{\"direction\":\"right\"},\"targetId\":\"\"}]";

                    var nextStructure = {
                        components: [
                            testUtils.mockFactory.createStructure('someType', {id: "comp"}),
                            testUtils.mockFactory.createStructure('someType', {id: "comp2"})
                        ]
                    };

                    var reactProps = getProps(pageJson.structure);
                    var actionsAspect = reactProps.siteAPI.getSiteAspect("actionsAspect");
                    spyOn(actionsAspect, 'registerBehaviors');

                    var page = getPage(reactProps);
                    siteData.updatePageStructure(currentPageId, nextStructure)
                        .setComponentBehaviors('comp', this.behaviors.items, currentPageId)
                        .setComponentBehaviors('comp2', comp2Behaviors, currentPageId);
                    utils.dataFixer.fix(pageJson);
                    var nextReactProps = _.assign({}, reactProps, {
                        structure: pageJson.structure
                    });
                    page.componentWillUpdate(nextReactProps, page.state);

                    expect(actionsAspect.registerBehaviors).toHaveBeenCalledWith("comp", pageId, JSON.parse(this.behaviors.items));
                    expect(actionsAspect.registerBehaviors).toHaveBeenCalledWith("comp2", pageId, JSON.parse(comp2Behaviors));
                });
            });
        });

        xdescribe("when some page did layout", function () {
            var relayoutedPage;

            function afterPageDidRelayout(options) {
                pageId = options.pageId;
                relayoutedPage = getPage(getProps({
                    id: "site",
                    components: [
                        {
                            id: "page",
                            components: [{id: "comp"}, {}]
                        }
                    ]
                }));

                relayoutedPage.componentDidLayout = jasmine.createSpy();
                relayoutedPage.refs.comp.componentDidLayout = jasmine.createSpy();

                relayoutedPage.pageDidLayout();
            }

            it("should recursively notify components if it is an active page", function () {
                afterPageDidRelayout({pageId: currentPageId});

                expect(relayoutedPage.componentDidLayout).toHaveBeenCalled();
                expect(relayoutedPage.refs.comp.componentDidLayout).toHaveBeenCalled();
            });

            it("should not recursively notify components if it is inactive page", function () {
                afterPageDidRelayout({pageId: "otherPage"});

                expect(relayoutedPage.componentDidLayout).not.toHaveBeenCalled();
                expect(relayoutedPage.refs.comp.componentDidLayout).not.toHaveBeenCalled();
            });
        });

        describe("site pages structure", function () {
            beforeEach(function () {
                this.structure = {
                    id: "site",
                    components: [
                        {id: "header"},
                        {
                            id: "SITE_PAGES",
                            componentType: "wysiwyg.viewer.components.PageGroup",
                            components: []
                        }
                    ],
                    layout: {}
                };
                var pageStructure = {
                    id: currentPageId,
                    components: [{id: "pageComp"}],
                    layout: {}
                };
                siteData.pagesData[currentPageId] = {
                    structure: pageStructure
                };
                siteData.setRootNavigationInfo({pageId: currentPageId});
            });

            it("should put only the refs for the comps of the master on the outer page", function () {
                var master = getPage(getProps(this.structure));

                expect(_.keys(master.refs).sort()).toEqual(["site", "header", "SITE_PAGES"].sort());
            });

            it("should pass PageGroup specific props", function () {
                var master = getPage(getProps(this.structure));

                expect(master.renderedCompPropsMap.SITE_PAGES.createPage).toBeDefined();
            });
        });

        describe("page special props", function () {
            it("should set page width to 320 if mobile", function () {
                spyOn(siteData, "isMobileView").and.returnValue(true);
                var structure = {
                    id: "somePage",
                    type: "Page",
                    components: [],
                    mobileComponents: [],
                    layout: {}
                };
                var page = getPage(getProps(structure)).refs.somePage;
                expect(page.style.width).toBe('320px');

            });

            it("should set width to 980 if not mobile of facebook", function () {
                var structure = {
                    id: "somePage",
                    type: "Page",
                    layout: {
                        anchors: [],
                        width: 100
                    }
                };

                var page = getPage(getProps(structure)).refs.somePage;
                expect(page.style.width).toBe('980px');
            });

            it("should leave with as is if not page", function () {
                spyOn(siteData, "isMobileView").and.returnValue(true);
                var structure = {
                    id: "somePage",
                    type: "Comp",
                    layout: {
                        anchors: [],
                        width: 100
                    },
                    components: [],
                    mobileComponents: []
                };

                var page = getPage(getProps(structure)).refs.somePage;
                expect(page.style.width).toBe('100px');
            });
        });

        describe("during execution of mode change", function () {
            var leavingChildStructure = {
                "layout": {},
                "id": "leaving-child",
                "type": "Component"
            };
            var enteringChildStructure = {
                "layout": {},
                "id": "new-child",
                "type": "Component"
            };
            var transitioningChildInactiveStructure = {
                "layout": {
                    "x": 90,
                    "y": 63,
                    "width": 142,
                    "height": 40
                },
                "id": "transitioning-child",
                "type": "Component"
            };
            var transitioningChildActiveStructure = {
                "layout": {
                    "x": 0,
                    "y": 0,
                    "width": 0,
                    "height": 0
                },
                "id": "transitioning-child",
                "type": "Component",
                "componentType": "DummyType"
            };
            var hoverBoxModesStructure = {
                "definitions": [
                    {
                        "modeId": "hover-mode",
                        "type": "HOVER",
                        "label": "MODE_LABEL_FROM_PRESET",
                        "params": ""
                    }
                ]
            };
            var anotherCompModesStructure = {
                "definitions": [
                    {
                        'modeId': "another-comp-hover-mode",
                        "type": "HOVER",
                        "label": "MODE_LABEL_FROM_PRESET",
                        "params": ""
                    }
                ]
            };

            var anotherCompTransitioiningChildInactiveStructure = {
                "id": "another-comp-transitioning-child",
                "type": "Component",
                "layout": {
                    "x": 0,
                    "y": 0
                }
            };
            var anotherCompTransitioiningChildActiveStructure = {
                "id": "another-comp-transitioning-child",
                "type": "Component",
                "layout": {
                    "x": 1,
                    "y": 1
                }
            };
            var anotherCompLeavingChildStructure = {
                "id": "another-comp-leaving-child",
                "type": "Component",
                "layout": {
                    "x": 0,
                    "y": 0
                }
            };

            function getModefulPageStructure(isHoverBoxModeActive, isAnotherCompModeActive) {
                return {
                    "type": "Page",
                    "id": "my-page",
                    "layout": {},
                    "components": [
                        {
                            "layout": {},
                            "id": "hover-box",
                            "modes": hoverBoxModesStructure,
                            "components": isHoverBoxModeActive ? [transitioningChildActiveStructure, enteringChildStructure] : [leavingChildStructure, transitioningChildInactiveStructure]
                        },
                        {
                            "id": "another-comp-in-page",
                            "modes": anotherCompModesStructure,
                            "layout": {},
                            "components": isAnotherCompModeActive ? [anotherCompTransitioiningChildActiveStructure] : [anotherCompTransitioiningChildInactiveStructure, anotherCompLeavingChildStructure]
                        }

                    ]
                };
            }

            function getPropsWithActiveModes(structure, activeModes) {
                var props = getProps(structure);
                props.activeModes = activeModes;
                return props;
            }

            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('sv_hoverBox');

                var pageStructure = getModefulPageStructure(false, false);
                siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageStructure.id, pageStructure)
                    .setCurrentPage(pageStructure.id);
                pageId = pageStructure.id;
                currentPageId = pageStructure.id;

                var pageProps = getPropsWithActiveModes(pageStructure, {});
                this.actionsAspect = pageProps.siteAPI.getSiteAspect('actionsAspect');
                spyOn(this.actionsAspect, 'executeAction');
                this.node = window.document.createElement('div');
                this.pageComp = testUtils.getComponentFromReactClass(wixPageReact, pageProps, this.node);

                var activeModes = {
                    'my-page': {
                        'hover-mode': true
                    }
                };
                var nextPageStructure = getModefulPageStructure(true, false);
                siteData.updatePageStructure(nextPageStructure.id, nextPageStructure);

                pageProps = getPropsWithActiveModes(nextPageStructure, activeModes);
                this.actionsAspect = pageProps.siteAPI.getSiteAspect('actionsAspect');
                spyOn(this.actionsAspect, 'executeAction');
                testUtils.getComponentFromReactClass(wixPageReact, pageProps, this.node);
            });

            describe('before animations', function () {
                it('should render leaving components', function () {
                    expect(_.keys(this.pageComp.refs)).toContain("leaving-child");
                });

                it('should render entering components', function () {
                    expect(_.keys(this.pageComp.refs)).toContain("new-child");
                });

                it('should render the new values of transitioning components', function () {
                    expect(_.keys(this.pageComp.refs)).toContain("transitioning-child");
                    expect(this.pageComp.refs["transitioning-child"].props.structure).toEqual(transitioningChildActiveStructure);
                });

                it('should trigger animations for mode', function () {
                    expect(this.actionsAspect.executeAction).toHaveBeenCalledWith('modeChange', triggerTypesConsts.MODE_CHANGED_INIT, {
                        pageId: 'my-page',
                        modeChanges: {
                            'hover-mode': true
                        },
                        componentAnimations: {
                            'hover-box': 'transition',
                            'new-child': 'enter',
                            'leaving-child': 'leave',
                            'transitioning-child': 'transition'
                        },
                        transitioningComponentsPrevLayout: jasmine.any(Object),
                        onComplete: jasmine.any(Function)
                    });
                });
            });

            describe("during animations when there's another render", function () {
                beforeEach(function () {
                    var activeModes = {
                        'my-page': {
                            'hover-mode': true
                        }
                    };
                    var nextPageStructure = getModefulPageStructure(true, false);
                    var nextPageProps = getPropsWithActiveModes(nextPageStructure, activeModes);
                    this.actionsAspect = nextPageProps.siteAPI.getSiteAspect('actionsAspect');
                    spyOn(this.actionsAspect, 'executeAction');

                    testUtils.getComponentFromReactClass(wixPageReact, nextPageProps, this.node);
                });

                it("should keep rendering leaving components that are still animating", function () {
                    expect(_.keys(this.pageComp.refs)).toContain(["leaving-child"]);
                });

                it("should not trigger any animations", function () {
                    expect(this.actionsAspect.executeAction).not.toHaveBeenCalled();
                });

            });

            describe('after animations', function () {
                it('should not render leaving components', function () {
                    this.pageComp.handleModeChangeAnimationsFinished({
                        "hover-box": 'transition',
                        "leaving-child": 'leave',
                        "new-child": 'enter',
                        "transitioning-child": 'transition'
                    });
                    expect(_.keys(this.pageComp.refs)).not.toContain(["leaving-child"]);
                });

                it('should render entering components', function () {
                    this.pageComp.handleModeChangeAnimationsFinished({
                        "hover-box": 'transition',
                        "leaving-child": 'leave',
                        "new-child": 'enter',
                        "transitioning-child": 'transition'
                    });
                    expect(_.keys(this.pageComp.refs)).toContain(["new-child"]);
                });

                it('should render new values of transitioning components', function () {
                    this.pageComp.handleModeChangeAnimationsFinished({
                        "hover-box": 'transition',
                        "leaving-child": 'leave',
                        "new-child": 'enter',
                        "transitioning-child": 'transition'
                    });
                    expect(_.keys(this.pageComp.refs)).toContain(["transitioning-child"]);
                    expect(this.pageComp.refs["transitioning-child"].props.structure).toEqual(transitioningChildActiveStructure);
                });

                it('should render a leaving component when it\'s parent has finished animating but it has not', function () {
                    this.pageComp.handleModeChangeAnimationsFinished({
                        "hover-box": "transition"
                    });
                    this.pageComp.forceUpdate();
                    expect(_.keys(this.pageComp.refs)).toContain(["leaving-child"]);
                });
            });

            describe("with multiple mode change executions", function () {
                describe("when a mode change is triggered while another-mode-change animations are still playing", function () {
                    beforeEach(function () {
                        var activeModes = {
                            'my-page': {
                                'hover-mode': true,
                                'another-comp-hover-mode': true
                            }
                        };

                        var nextPageStructure = getModefulPageStructure(true, true);
                        var nextPageProps = getPropsWithActiveModes(nextPageStructure, activeModes);

                        this.actionsAspect = nextPageProps.siteAPI.getSiteAspect('actionsAspect');
                        spyOn(this.actionsAspect, 'executeAction');

                        siteData.updatePageStructure(nextPageStructure.id, nextPageStructure);
                        testUtils.getComponentFromReactClass(wixPageReact, nextPageProps, this.node);
                    });

                    it("should keep rendering leaving components that are still animating", function () {
                        expect(_.keys(this.pageComp.refs)).toContain("leaving-child");
                    });

                    it('should trigger new animations for the new mode', function () {
                        expect(this.actionsAspect.executeAction).toHaveBeenCalledWith('modeChange', triggerTypesConsts.MODE_CHANGED_INIT, {
                            pageId: 'my-page',
                            modeChanges: {
                                'another-comp-hover-mode': true
                            },
                            componentAnimations: {
                                'another-comp-in-page': 'transition',
                                'another-comp-transitioning-child': 'transition',
                                'another-comp-leaving-child': 'leave'
                            },
                            transitioningComponentsPrevLayout: jasmine.any(Object),
                            onComplete: jasmine.any(Function)
                        });
                    });

                    describe("after the first mode finished animating", function () {
                        beforeEach(function () {
                            this.actionsAspect.executeAction.calls.reset();
                            this.pageComp.handleModeChangeAnimationsFinished({
                                "my-page": "transition",
                                "hover-box": "transition",
                                "leaving-child": "leave",
                                "transitioning-child": "transition",
                                "new-child": "enter"
                            });
                            this.pageComp.forceUpdate();
                        });

                        it("should keep rendering leaving components of the later mode change", function () {
                            expect(_.keys(this.pageComp.refs)).toContain("another-comp-leaving-child");
                        });

                        it("should not render leaving components of the first mode change", function () {
                            expect(_.keys(this.pageComp.refs)).not.toContain("leaving-child");
                        });
                    });
                });

                describe("when a couple of mode changes are triggered together", function () {
                    beforeEach(function () {
                        var activeModes = {
                            'my-page': {
                                'another-comp-hover-mode': true
                            }
                        };

                        var nextPageStructure = getModefulPageStructure(false, true);
                        var nextPageProps = getPropsWithActiveModes(nextPageStructure, activeModes);

                        this.actionsAspect = nextPageProps.siteAPI.getSiteAspect('actionsAspect');
                        spyOn(this.actionsAspect, 'executeAction');

                        siteData.updatePageStructure(nextPageStructure.id, nextPageStructure);
                        testUtils.getComponentFromReactClass(wixPageReact, nextPageProps, this.node);
                    });

                    it('should trigger all right animation types for the new/updated animations', function () {
                        expect(this.actionsAspect.executeAction).toHaveBeenCalledWith('modeChange', triggerTypesConsts.MODE_CHANGED_INIT, {
                            pageId: 'my-page',
                            modeChanges: {
                                'hover-mode': false,
                                'another-comp-hover-mode': true
                            },
                            componentAnimations: {
                                'hover-box': 'transition',
                                'new-child': 'leave',
                                'leaving-child': 'enter',
                                'transitioning-child': 'transition',
                                'another-comp-in-page': 'transition',
                                'another-comp-transitioning-child': 'transition',
                                'another-comp-leaving-child': 'leave'
                            },
                            transitioningComponentsPrevLayout: jasmine.any(Object),
                            onComplete: jasmine.any(Function)
                        });
                    });

                    it('should render the correct components', function () {
                        var renderedComps = _.keys(this.pageComp.refs);
                        expect(renderedComps).toContain("new-child");
                        expect(renderedComps).toContain("transitioning-child");
                        expect(renderedComps).toContain("leaving-child");
                        expect(renderedComps).toContain("another-comp-transitioning-child");
                        expect(renderedComps).toContain("another-comp-leaving-child");
                    });
                });

                describe("when the mode change is a reverse of a currently executing mode change", function () {
                    beforeEach(function () {
                        var activeModes = {};

                        var nextPageStructure = getModefulPageStructure(false, false);
                        var nextPageProps = getPropsWithActiveModes(nextPageStructure, activeModes);

                        this.actionsAspect = nextPageProps.siteAPI.getSiteAspect('actionsAspect');
                        spyOn(this.actionsAspect, 'executeAction');

                        siteData.updatePageStructure(nextPageStructure.id, nextPageStructure);
                        testUtils.getComponentFromReactClass(wixPageReact, nextPageProps, this.node);
                    });

                    it("should trigger reverse animations of currently playing components", function () {
                        expect(this.actionsAspect.executeAction).toHaveBeenCalledWith('modeChange', triggerTypesConsts.MODE_CHANGED_INIT, {
                            pageId: 'my-page',
                            modeChanges: {
                                'hover-mode': false
                            },
                            componentAnimations: {
                                'hover-box': 'transition',
                                'new-child': 'leave',
                                'leaving-child': 'enter',
                                'transitioning-child': 'transition'
                            },
                            transitioningComponentsPrevLayout: jasmine.any(Object),
                            onComplete: jasmine.any(Function)
                        });
                    });
                });
            });
        });

        describe('page visibility', function () {

            function renderSimplePageComp() {
                return getPage(getProps({
                    id: "site",
                    components: [
                        {
                            id: "page",
                            components: [{id: "comp"}, {}]
                        }
                    ]
                }));
            }

            it('should be hidden before re-layout', function () {
                var pageComp = renderSimplePageComp();
                expect(ReactDOM.findDOMNode(pageComp).style.visibility).toEqual('hidden');
            });

            it('should be hidden after re-layout if page widgets are not ready', function () {
                var pageComp = renderSimplePageComp();
                var widgetAspect = pageComp.props.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(widgetAspect, 'isContextReady').and.callFake(function (rootId) {
                    return rootId !== pageComp.props.rootId;
                });
                pageComp.componentDidLayout();
                expect(ReactDOM.findDOMNode(pageComp).style.visibility).toEqual('hidden');
            });

            it('should be empty after re-layout if all page widgets are ready', function () {
                var pageComp = renderSimplePageComp();
                var widgetAspect = pageComp.props.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(widgetAspect, 'isContextReady').and.callFake(function (rootId) {
                    return rootId === pageComp.props.rootId;
                });
                pageComp.componentDidLayout();
                expect(ReactDOM.findDOMNode(pageComp).style.visibility).toEqual('');
            });
        });
    });
});
