define([
    'lodash',
    'react',
    'reactDOM',
    'utils',
    'testUtils',
    'skins',
    'core/components/skinBasedComp',
	'core/components/baseCompMixin',
	'core/core/SiteDataAPI'
], function (_, React, ReactDOM, utils, testUtils, skins, skinBasedComp, baseCompMixin, SiteDataAPI) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    describe('skinBasedComp mixin', function () {

        function getMockComponent(skinProperties) {
            return {
                mixins: [skinBasedComp],
                getSkinProperties: function () {
                    return skinProperties || {};
                }
            };
        }

        describe('baseCompMixin', function () {

            it('should use updateRootRefDataStyles for the root ref data of the component', function () {
                spyOn(baseCompMixin.baseComp, 'updateRootRefDataStyles').and.callFake(function (refData) {
                    refData.className = 'test-class';
                    refData.style.height = 100;
                });
                var props = _.defaults({styleId: 's1'}, testUtils.mockFactory.mockProps());
                props.structure.componentType = 'someComp';

                var rootRefData = {style: {width: 100}};
                var definition = getMockComponent({"": rootRefData});
                var mock = testUtils.getComponentFromDefinition(definition, props);

                expect(baseCompMixin.baseComp.updateRootRefDataStyles).toHaveBeenCalledWith(rootRefData);
                var node = ReactDOM.findDOMNode(mock.refs[""]);
                expect(node.style.width).toEqual('100px');
                expect(node.style.height).toEqual('100px');
                expect(node.className).toContain('test-class');
            });
        });

        describe("run common previewExtension functions", function () {
            var skinProperties = {key: 'val'};

            it("should call transformRefData with the skinProperties", function () {
                var mockCompClass = getMockComponent(skinProperties);
                mockCompClass.transformRefData = jasmine.createSpy('transformRefData');

                var mockComp = React.createClass(mockCompClass);
                var compProps = testUtils.mockFactory.mockProps().setSkin('skins.core.VerySimpleSkin');
                compProps.structure.componentType = 'someComp';

                React.addons.TestUtils.renderIntoDocument(React.createElement(mockComp, compProps));

                expect(mockCompClass.transformRefData).toHaveBeenCalledWith(skinProperties);
            });

            it("should call getTransformedCssStates", function () {
                var mockCompClass = getMockComponent(skinProperties);
                mockCompClass.getTransformedCssStates = jasmine.createSpy('getTransformedCssStates');

                var mockComp = React.createClass(mockCompClass);
                var compProps = testUtils.mockFactory.mockProps().setSkin('skins.core.VerySimpleSkin');
                compProps.structure.componentType = 'someComp';

                React.addons.TestUtils.renderIntoDocument(React.createElement(mockComp, compProps));

                expect(mockCompClass.getTransformedCssStates).toHaveBeenCalled();
            });
        });

        describe("transformSkinProperties", function () {
            function buildComponent(skinProps, transformSkinProperties) {
                var Mock = {
                    mixins: [skinBasedComp],

                    getSkinProperties: function () {
                        return skinProps;
                    }
                };
                var mockComp = React.createClass(Mock);

                var compProps = testUtils.mockFactory.mockProps().setSkin('skins.core.VerySimpleSkin');
                compProps.transformSkinProperties = transformSkinProperties;
                compProps.structure.componentType = 'someComp';

                return React.addons.TestUtils.renderIntoDocument(React.createElement(mockComp, compProps));
            }

            it('should call to props.transformSkinProperties with the result of getSkinProperties of the component', function () {
                var skinProps = {};

                var transformSkinProperties = jasmine.createSpy('transformSkinProperties').and.returnValue({});

                buildComponent(skinProps, transformSkinProperties);

                expect(transformSkinProperties).toHaveBeenCalledWith(skinProps);
            });

            it('should use the result of transformSkinProperties as to skinsRenderer', function () {
                var transformedProps = {
                    '': {
                        title: 'This is a title'
                    }
                };

                var transformSkinProperties = jasmine.createSpy('transformSkinProperties').and.returnValue(transformedProps);

                spyOn(skins.skinsRenderer, 'renderSkinHTML').and.callThrough();

                buildComponent({}, transformSkinProperties);

                expect(skins.skinsRenderer.renderSkinHTML).toHaveBeenCalledWith(jasmine.any(Array), transformedProps, undefined, jasmine.any(String), jasmine.any(Object), jasmine.any(Object), jasmine.any(Object));
            });
        });

        describe("style", function () {
            it('should return the correct results for getStyleProperty', function () {
                var props = testUtils.mockFactory.mockProps();

                props.compTheme = {
                    style: {
                        properties: {
                            param1: 3
                        }
                    }
                };

                var definition = {
                    mixins: [skinBasedComp],
                    getSkinProperties: function () {
                        return {'': {className: 'class' + this.getStyleProperty('param1', 1)}};
                    }
                };

                var mock = testUtils.getComponentFromDefinition(definition, props);
                var node = ReactDOM.findDOMNode(mock.refs[""]);
                expect(node.classList).toContain(['class3']);
            });
        });

        describe("states", function () {
            function getMockComponentWithState(getTransformedCssStates) {
                var props = testUtils.mockFactory.mockProps();
                props.structure.componentType = 'someComp';

                var definition = getMockComponent();
                definition.getInitialState = function () {
                    return {
                        state: {}
                    };
                };

                if (getTransformedCssStates) {
                    definition.getTransformedCssStates = _.noop;
                }
                return testUtils.getComponentFromDefinition(definition, props);
            }

            it("should take css states from $ prefixed states", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({$a: 's'}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('s');
                    done();
                });
            });

            it("should add multiple css states with whitespace between them", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({'$a': 'p', '$b': 's'}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('p s');
                    done();
                });
            });

            it("should add ignore states whilch are not prefixed with $", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({'$a': 's', 'b': 'e'}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('s');
                    done();
                });
            });

            it("should not add the 'data-state' attr if there are no css states, empty objects", function () {
                var mock = getMockComponentWithState();
                var node = ReactDOM.findDOMNode(mock.refs[""]);
                expect(node.attributes['data-state']).toBeUndefined();
            });

            it("should not add the 'data-state' attr if there are no css states, undefined", function () {
                var props = testUtils.mockFactory.mockProps();
                props.structure.componentType = 'someComp';

                var definition = getMockComponent();
                var mock = testUtils.getComponentFromDefinition(definition, props);
                var node = ReactDOM.findDOMNode(mock.refs[""]);
                expect(node.attributes['data-state']).toBeUndefined();
            });


            //THESE TESTS SHOULD BE REMOVED WHEN NO ONE USES cssState anymore
            it("should take states from state", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({'cssState': {'a': 's'}}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('s');
                    done();
                });
            });

            it("should add multiple states with whitespace between them", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({'cssState': {'a': 'p', 'b': 's'}}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('p s');
                    done();
                });
            });

            it("should ignore cssState if $ prefixed states present", function (done) {
                var mock = getMockComponentWithState();
                mock.setState({'$a': 's', 'cssState': {'b': 'bla'}}, function () {
                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.attributes['data-state'].value).toEqual('s');
                    done();
                });
            });

            it("should call getTransformedCssStates", function (done) {
                var mock = getMockComponentWithState(true);
                spyOn(mock, 'getTransformedCssStates');
                mock.forceUpdate(function () {
                    expect(mock.getTransformedCssStates).toHaveBeenCalled();
                    done();
                });
            });

        });

        describe("createChildComponent mixin", function () {
            var boundCreateChildComponent, objectPassedToCompConstructor, mockDataItem, mockParentComp;
            var resultObj = {result: "result"};

            // Mock compFactory

            beforeEach(function () {
                spyOn(utils.compFactory, 'getCompClass').and.callFake(function () {
                                            return function (props) {
                                                objectPassedToCompConstructor = props;
                                                return resultObj;
                                            };
                                        });
                objectPassedToCompConstructor = null;
                mockDataItem = {id: "_mockDataItemId"};

                var parentSiteData = testUtils.mockFactory.mockSiteData();
                parentSiteData.isDebugMode = function() {
                    return false;
                };

                // Create a mock component
                mockParentComp = {
                    props: {
                        siteData: parentSiteData,
                        pageData: "mockPageData",
                        compProp: "mockCompProp",
                        id: "mockId",
                        styleId: "mockId",
                        structure: {
                            styleId: "mockId"
                        }
                    },
                    getDataByQuery: function () {
                        return mockDataItem;
                    },
                    getSkinExports: function () {
                        return {
                            mockSkinPartName: {
                                skin: 'mockSkin'
                            }
                        };
                    }
                };
                boundCreateChildComponent = skinBasedComp.createChildComponent.bind(mockParentComp);
            });

            it("should create a component instance using the provided class and return the result", function () {
                var result = boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(utils.compFactory.getCompClass).toHaveBeenCalled();
                expect(result).toBe(resultObj);
            });

            it("should use some of the parent props to defined the the props of the created component instance, except for isHidden property :)", function () {
                boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(objectPassedToCompConstructor.siteData).toEqual(mockParentComp.props.siteData);
                expect(objectPassedToCompConstructor.compProp).toEqual(_.omit(mockParentComp.props.compProp, 'isHidden'));
            });

            it("should set the id of the new component instance to be a concatenation of the parent id and data item id", function () {
                boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(objectPassedToCompConstructor.id).toBe(mockParentComp.props.id + mockDataItem.id);
            });

            it("should use the provided skin as the skin of the created component instance", function () {
                boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(objectPassedToCompConstructor.skin).toBe("mockSkin");
            });

            it("should use the provided styleId as the styleId of the created component instance", function () {
                boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(objectPassedToCompConstructor.styleId).toBe("mockIdmockSkinPartName");
            });

            it("should add a structure prop to the created component instance with the provided className as componentType (For use by QA automation)", function () {
                boundCreateChildComponent(mockDataItem, "mock.class.name", "mockSkinPartName");
                expect(objectPassedToCompConstructor.structure.componentType).toBe("mock.class.name");
            });

            describe('id prop', function () {
                var dataItemId = 'someDataItemId';

                it('should set the id of the component to be the parent id + the data item id', function () {
                    boundCreateChildComponent({id: dataItemId}, "mock.class.name", "mockSkinPartName");
                    expect(objectPassedToCompConstructor.id).toEqual(mockParentComp.props.id + dataItemId);
                });

                it('should take the id prop from extra params obj', function () {
                    boundCreateChildComponent(undefined, "mock.class.name", "mockSkinPartName", {
                        id: 'customId',
                        ref: 'someRef'
                    });
                    expect(objectPassedToCompConstructor.id).toEqual('customId');
                });

                it('should override the id prop from extra params obj even if data item is passed', function () {
                    boundCreateChildComponent({id: dataItemId}, "mock.class.name", "mockSkinPartName", {id: 'customId'});
                    expect(objectPassedToCompConstructor.id).toEqual('customId');
                });

                it('should throw if data item is undefined and no custom id was supplied as an extra prop', function () {
                    function createWithInvalidId() {
                        boundCreateChildComponent(undefined, "mock.class.name", "mockSkinPartName");
                    }

                    expect(createWithInvalidId).toThrow(new Error('Unable to set child comp id - no data item\\custom id were passed'));
                });
            });

            describe('ref prop', function () {
                var dataItemId = 'someDataItemId';

                it('should set the ref of the component to be the data item id', function () {
                    boundCreateChildComponent({id: dataItemId}, "mock.class.name", "mockSkinPartName");
                    expect(objectPassedToCompConstructor.ref).toEqual(dataItemId);
                });

                it('should take the ref prop from extra params obj', function () {
                    boundCreateChildComponent(undefined, "mock.class.name", "mockSkinPartName", {
                        id: 'customId',
                        ref: 'customRef'
                    });
                    expect(objectPassedToCompConstructor.ref).toEqual('customRef');
                });

                it('should override the ref prop from extra params obj even if data item is passed', function () {
                    boundCreateChildComponent({id: dataItemId}, "mock.class.name", "mockSkinPartName", {ref: 'customRef'});
                    expect(objectPassedToCompConstructor.ref).toEqual('customRef');
                });

                it('should throw if data item is undefined and no custom ref was supplied as an extra prop', function () {
                    function createWithInvalidRef() {
                        boundCreateChildComponent(undefined, "mock.class.name", "mockSkinPartName", {id: 'customId'});
                    }

                    expect(createWithInvalidRef).toThrow(new Error('Unable to set child comp ref - no data item\\custom ref were passed'));
                });
            });

            describe('refInParent prop', function () {
                it('should be the data item id', function () {
                    boundCreateChildComponent({id: 'dataItemId1'}, "mock.class.name", "mockSkinPartName");
                    expect(objectPassedToCompConstructor.refInParent).toEqual('dataItemId1');
                });

                it('should be \'\' if data item is undefined', function () {
                    boundCreateChildComponent(undefined, "mock.class.name", "mockSkinPartName", {id: 'id', ref: 'ref'});
                    expect(objectPassedToCompConstructor.refInParent).toEqual('');
                });
            });
        });

        describe('render collapsed components', function () {

            beforeEach(function () {
                openExperiments('collapseComponent');
            });

            describe('not in editor mode', function () {
                beforeEach(function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData({renderFlags: {componentViewMode: 'preview'}});

                    this.mockCompProps = testUtils.mockFactory.mockProps(mockSiteData);
                    this.mockCompProps.structure.componentType = 'someComp';
                });

                it('should add attribute "data-collapsed" if isCollapsed property is true', function () {
                    var props = this.mockCompProps.setCompProp({id: 'prop', isCollapsed: true});

                    var definition = getMockComponent();
                    var mock = testUtils.getComponentFromDefinition(definition, props);

                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.getAttribute('data-collapsed')).toEqual('true');
                });

                it('should not add attribute "data-collapsed" if collapseComponent experiment is close', function () {
                    testUtils.experimentHelper.closeExperiments('collapseComponent');
                    var props = this.mockCompProps.setCompProp({id: 'prop', isCollapsed: true});

                    var definition = getMockComponent();
                    var mock = testUtils.getComponentFromDefinition(definition, props);

                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.getAttribute('data-collapsed')).toEqual(null);
                });

                it('should not add attribute "data-collapsed" if isCollapsed property is false', function () {
                    var props = this.mockCompProps.setCompProp({id: 'prop', isCollapsed: false});

                    var definition = getMockComponent();
                    var mock = testUtils.getComponentFromDefinition(definition, props);

                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.getAttribute('data-collapsed')).toEqual(null);
                });

                it('should not add attribute "data-collapsed" if isCollapsed property is undefined', function () {
                    var definition = getMockComponent();
                    var mock = testUtils.getComponentFromDefinition(definition, this.mockCompProps);

                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.getAttribute('data-collapsed')).toEqual(null);
                });
            });

            describe('in editor mode', function () {
                beforeEach(function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData({renderFlags: {componentViewMode: 'editor'}});

                    this.mockCompProps = testUtils.mockFactory.mockProps(mockSiteData);
                    this.mockCompProps.structure.componentType = 'someComp';
                });

                it('should not add attribute "data-collapsed" if isCollapsed property is true', function () {
                    var props = this.mockCompProps.setCompProp({id: 'prop', isCollapsed: true});

                    var definition = getMockComponent();
                    var mock = testUtils.getComponentFromDefinition(definition, props);

                    var node = ReactDOM.findDOMNode(mock.refs[""]);
                    expect(node.getAttribute('data-collapsed')).toEqual(null);
                });
            });
        });

        describe('Modes', function () {

            function buildCompWithHoverMode(props){
                return buildCompWithModes.call(this, {
                    definitions: [{
                        modeId: 'mode-1',
                        type: 'unsupported'
                    }, {
                        modeId: 'mode-2',
                        type: 'HOVER'
                    }]
                }, props);
            }

            function buildCompWithScrollModes(props){
                return buildCompWithModes.call(this, {
                    definitions: [{
                        modeId: 'mode-1',
                        type: 'SCROLL',
                        params: {
                            scrollPos: 500
                        }
                    }, {
                        modeId: 'mode-2',
                        type: 'SCROLL',
                        params: {
                            scrollPos: 1000
                        }
                    }]
                }, props);
            }

            function buildCompWithModes(modes, props) {
                var mockCompDefinition = getMockComponent({});

                props = _.assign({}, {
                    rootId: 'mainPage',
                    skin: 'wysiwyg.viewer.skins.area.RoundArea',
                    viewerPrivateServices: {
                        'siteDataAPI': this.siteDataAPI
                    },
                    siteData: this.siteData,
                    siteAPI: this.siteAPI,
                    structure: {
                        id: 'comp-id',
                        modes: modes
                    }
                }, props);
                props.structure.componentType = 'someComp';

                props = testUtils.santaTypesBuilder.getComponentProps(mockCompDefinition, props, this.siteData, this.siteAPI);

                var mockCompClass = React.createClass(mockCompDefinition);
                return React.addons.TestUtils.renderIntoDocument(React.createElement(mockCompClass, props));
            }

            beforeEach(function () {
                openExperiments('sv_hoverBox');
                var siteData = testUtils.mockFactory.mockSiteData();
                this.siteDataAPI = SiteDataAPI.createSiteDataAPIAndDal(siteData).siteDataAPI;
                var mockSite = testUtils.mockFactory.mockWixSiteReact(siteData, null, {});
                this.siteAPI = testUtils.mockFactory.mockSiteAPI(siteData, mockSite, {
                    siteDataAPI: this.siteDataAPI
                });
                spyOn(this.siteAPI, 'activateModeById');
                spyOn(this.siteAPI, 'deactivateModeById');
                this.siteData = this.siteAPI.getSiteData();
            });

            describe('when component structure supports a HOVER mode in DESKTOP VIEW', function () {
                beforeEach(function () {
                    this.componentWithHoverMode = buildCompWithHoverMode.call(this, {});
                });

                it('should attach mouse-enter to the component to activate the hover mode', function () {
                    var node = this.componentWithHoverMode.refs[""];

                    React.addons.TestUtils.Simulate.mouseEnter(node);

                    expect(this.siteAPI.activateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-2');
                });

                it('should attach mouse-leave to the component to deactivate the hover mode', function () {
                    var node = this.componentWithHoverMode.refs[""];

                    React.addons.TestUtils.Simulate.mouseLeave(node);

                    expect(this.siteAPI.deactivateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-2');
                });
            });

            describe('when component structure supports a HOVER mode in MOBILE VIEW', function () {
                beforeEach(function () {
                    spyOn(this.siteData, 'isMobileView').and.returnValue(true);
                    this.componentWithHoverMode = buildCompWithHoverMode.call(this, {});
                });

                it('should not have mouse-enter on the component and not activate the hover mode', function () {
                    var node = this.componentWithHoverMode.refs[""];

                    this.siteAPI.activateModeById.calls.reset();

                    React.addons.TestUtils.Simulate.mouseEnter(node);

                    expect(this.siteAPI.activateModeById).not.toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-2');
                });

                it('should not have mouse-leave on the component and not deactivate the hover mode', function () {
                    var node = this.componentWithHoverMode.refs[""];

                    this.siteAPI.activateModeById.calls.reset();

                    React.addons.TestUtils.Simulate.mouseLeave(node);

                    expect(this.siteAPI.deactivateModeById).not.toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-2');
                });
            });

            describe('when component structure supports a HOVER mode but doesnt have mobileDefaultMode in props', function () {
                it('should activate the hover mode when in mobile view in viewer', function () {
                    spyOn(this.siteData, 'isMobileView').and.returnValue(true);
                    buildCompWithHoverMode.call(this);

                    expect(this.siteAPI.activateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-2');
                });
            });

            describe('when component have mobileDefaultMode in props', function () {
                it('should activate the mode in mobileDefaultMode when in mobile view in viewer', function () {
                    spyOn(this.siteData, 'isMobileView').and.returnValue(true);
                    buildCompWithHoverMode.call(this, {compProp: {mobileDisplayedModeId: 'mode-1'}});

                    expect(this.siteAPI.activateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-1');
                });

                it('should NOT activate the mode in mobileDefaultMode when in mobile view in editor', function () {
                    spyOn(this.siteData, 'isMobileView').and.returnValue(true);
                    spyOn(this.siteData, 'isViewerMode').and.returnValue(false);
                    buildCompWithHoverMode.call(this, {compProp: {mobileDisplayedModeId: 'mode-1'}});

                    expect(this.siteAPI.activateModeById).not.toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-1');
                });
            });

            describe('when component structure supports scroll modes', function () {

                beforeEach(function(){
                    openExperiments('dynamicHeader');
                });

                it('should register to scroll', function () {
                    var scrollAspect = this.siteAPI.getSiteAspect('windowScrollEvent');
                    spyOn(scrollAspect, 'registerToScroll').and.callThrough();

                    this.compWithScrollModes = buildCompWithScrollModes.call(this, {});

                    expect(scrollAspect.registerToScroll).toHaveBeenCalled();
                    expect(this.compWithScrollModes.onScroll).toBeDefined();
                });

                describe('when scrolling', function () {

                    function getCompWithScrollModes(activeModes) {
                        return buildCompWithScrollModes.call(this, {
                            getActiveModes: jasmine.createSpy('getActiveModes').and.returnValue(activeModes),
                            activateModeById: jasmine.createSpy('activateModeById'),
                            switchModesByIds: jasmine.createSpy('switchModesByIds'),
                            deactivateModeById: jasmine.createSpy('deactivateModeById')
                        });
                    }

                    it('should activate the mode with scroll position less than and closest to current site scroll position', function () {
                        var compWithScrollModes = getCompWithScrollModes.call(this, null);

                        compWithScrollModes.onScroll({y: 600});

                        expect(compWithScrollModes.props.activateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-1');
                    });

                    it('should not activate scroll mode that is already active', function () {
                        var compWithScrollModes = getCompWithScrollModes.call(this, {
                            mainPage: {
                                'mode-1': true
                            }
                        });

                        compWithScrollModes.onScroll({y: 601});

                        expect(compWithScrollModes.props.activateModeById).not.toHaveBeenCalled();
                    });

                    it('should switch modes when scrolling from one scroll mode to another', function () {
                        var compWithScrollModes = getCompWithScrollModes.call(this, {
                            mainPage: {
                                'mode-1': true
                            }
                        });

                        compWithScrollModes.onScroll({y: 1001});

                        expect(compWithScrollModes.props.switchModesByIds).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-1', 'mode-2');
                    });

                    it('should deactivate mode when no mode has scroll position below the current site scroll position', function () {
                        var compWithScrollModes = getCompWithScrollModes.call(this, {
                            mainPage: {
                                'mode-1': true
                            }
                        });

                        compWithScrollModes.onScroll({y: 200});

                        expect(compWithScrollModes.props.deactivateModeById).toHaveBeenCalledWith('comp-id', 'mainPage', 'mode-1');
                    });
                });

            });
        });
    });
});
