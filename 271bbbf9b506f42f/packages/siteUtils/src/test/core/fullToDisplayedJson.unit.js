define(['lodash', 'testUtils',
    'siteUtils/core/fullToDisplayedJson'], function (_, testUtils, fullToDisplayedJson) {
    'use strict';

    describe("fullToDisplayedJson", function () {

        var openExperiments = testUtils.experimentHelper.openExperiments;
        var defaultCompId = 'comp-1';

        function createComponent(id, structure, modeOverrides, isHiddenByModes) {
            var comp = {
                id: id || defaultCompId,
                componentType: 'mockComponent'
            };
            _.assign(comp, structure);
            if (modeOverrides) {
                comp.modes = {
                    overrides: modeOverrides
                };
            }
            if (_.isBoolean(isHiddenByModes)) {
                comp.modes = comp.modes || {};
                comp.modes.isHiddenByModes = isHiddenByModes;
            }
            return comp;
        }

        function getDisplayedSimpleComp(compJson, overrideIndex) {
            var comp = _.cloneDeep(compJson);
            if (_.isNumber(overrideIndex)) {
                var override = comp.modes.overrides[overrideIndex];
                _.assign(comp, override);
            }
            if (comp.modes) {
                var defs = comp.modes.definitions;
                delete comp.modes;
                if (defs) {
                    comp.modes = {definitions: defs};
                }
            }
            delete comp.modeIds;
            delete comp.isHiddenByModes;
            return comp;
        }

        function getDisplayedContainer(compJson, overrideIndex) {
            var children = compJson.components;
            var comp = getDisplayedSimpleComp(compJson, overrideIndex);

            if (children) {
                comp.components = children;
            }
            return comp;
        }


        beforeEach(function () {
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.fullPage = this.mockSiteData.pagesData.currentPage;
        });
        describe('a component with no children', function () {
            describe('component without modes', function () {
                it('should set the default structure given a pointer without activated modes or overrides', function () {
                    var modelessComponent = {
                        id: 'modeless-comp-id',
                        componentType: 'mockComponent',
                        boo: 'booboo',
                        foo: {
                            bar: 'vaz',
                            mispar: '5',
                            fakeData: ['fake', 4, 'fake2']
                        }
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(modelessComponent, {}, 'currentPage');
                    expect(displayed.structure).toEqual(modelessComponent);
                });
            });

            describe('component with overrides', function () {
                beforeEach(function () {
                    this.compWithOverrides = createComponent(defaultCompId,
                        {boo: 'booo', someData: 'some data'},
                        [{modeIds: ['mode1'], someData: 'overridden data'}]);
                });

                it('should return the default structure if active modes dont correspond component overrides', function () {
                    var clonedComp = _.cloneDeep(this.compWithOverrides);
                    var displayed = fullToDisplayedJson.getDisplayedJson(this.compWithOverrides, {'mode2': true}, 'currentPage');

                    expect(this.compWithOverrides).toEqual(clonedComp);
                    var expected = getDisplayedSimpleComp(this.compWithOverrides);
                    expect(displayed.structure).toEqual(expected);
                });

                it('should return the structure with overrides given a comp with active mode', function () {
                    var clonedComp = _.cloneDeep(this.compWithOverrides);
                    var pageActiveModes = {currentPage: {'mode1': true}};

                    var displayed = fullToDisplayedJson.getDisplayedJson(this.compWithOverrides, pageActiveModes, 'currentPage');

                    expect(this.compWithOverrides).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(this.compWithOverrides, 0));
                });

                it("should return structure with the right override, according to active, if there are multiple overrides", function () {
                    var comp = createComponent(defaultCompId, {boo: 'boo'}, [
                        {modeIds: ['mode1'], boo: 'goo'},
                        {modeIds: ['mode2'], boo: 'yoo'}
                    ]);
                    var clonedComp = _.cloneDeep(comp);
                    var pageActiveModes = {currentPage: {'mode2': true}};

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(comp).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(clonedComp, 1));
                });

                it('should return structure with overrides, when the override is triggered by 2 modes, and both active', function () {
                    var comp = createComponent(defaultCompId, {boo: 'boo'}, [
                        {modeIds: ['mode1', 'mode3'], boo: 'goo'},
                        {modeIds: ['mode2'], boo: 'yoo'}
                    ]);
                    var clonedComp = _.cloneDeep(comp);
                    var pageActiveModes = {
                        currentPage: {'mode1': true, mode3: true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(comp).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(clonedComp, 0));
                });

                it('should return structure with no overrides if there is an override triggered by 2 modes, but only one of them is active', function () {
                    var comp = createComponent(defaultCompId, {boo: 'boo'}, [
                        {modeIds: ['mode1', 'mode3'], boo: 'goo'},
                        {modeIds: ['mode2'], boo: 'yoo'}
                    ]);
                    var clonedComp = _.cloneDeep(comp);
                    var pageActiveModes = {
                        currentPage: {mode3: true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(comp).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(clonedComp, null));
                });

                it('should return structure with overridden nested props', function () {
                    var comp = createComponent(defaultCompId, {boo: 'boo', nested: {a: 1, b: 2}}, [
                        {modeIds: ['mode1'], nested: {a: 30}}
                    ]);
                    var clonedComp = _.cloneDeep(comp);
                    var pageActiveModes = {
                        currentPage: {'mode1': true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(comp).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(clonedComp, 0));
                });

                it('should return structure with overridden array props', function () {
                    var comp = createComponent(defaultCompId, {arr: [1, 2, 3]}, [
                        {modeIds: ['mode2'], arr: [1, 3, 6]}
                    ]);
                    var clonedComp = _.cloneDeep(comp);
                    var pageActiveModes = {
                        currentPage: {'mode2': true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(comp).toEqual(clonedComp);
                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(clonedComp, 0));
                });
            });

            describe('isHiddenByModes flag on component structure', function () {
                it('should return undefined if component is hidden', function () {
                    var comp = createComponent(defaultCompId, {}, [], true);

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, {}, 'currentPage');

                    expect(displayed.structure).toBeUndefined();
                });

                it('should not include the component in structure if isHiddenByModes=true by default', function () {
                    var compStructures = createComponent(defaultCompId, {}, [], true);
                    var container = createComponent('cont', {components: [compStructures]});
                    var pageActiveModes = {
                        currentPage: {'mode1': true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(container, pageActiveModes, 'currentPage');

                    expect(displayed.structure.components).toBeEmpty();
                });

                it('should add the component if an override corresponding active modes has isHiddenByModes=false', function () {
                    var comp = createComponent(defaultCompId, {}, [{
                        isHiddenByModes: false,
                        modeIds: ['mode1', 'mode2'],
                        someData: 'Some Data'
                    }], true);
                    var pageActiveModes = {
                        currentPage: {
                            mode1: true,
                            mode3: true,
                            mode2: true
                        }
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(comp, pageActiveModes, 'currentPage');

                    expect(displayed.structure).toEqual(getDisplayedSimpleComp(comp, 0));
                });
            });
        });

        describe('component with children', function () {
            beforeEach(function () {
                this.container2 = {
                    id: 'container-2',
                    componentType: 'mockComponent',
                    type: 'Container',
                    customProps: {
                        x: 10, y: 10, width: 450, height: 300
                    },
                    components: [
                        {
                            id: 'button-1',
                            componentType: 'mockComponent',
                            customProps: {x: 1, y: 1, width: 100, height: 20}
                        },
                        {
                            id: 'image-1',
                            componentType: 'mockComponent',
                            customProps: {x: 1, y: 50, width: 200, height: 100}
                        }],
                    modes: {
                        definitions: [{
                            modeId: 'mode1'
                        },
                            {
                                modeId: 'mode2'
                            },
                            {
                                modeId: 'mode3'
                            }]
                    }
                };
            });

            describe('default structure remains unchanged', function () {
                it('should set component with all its children if no active modes present', function () {
                    var container = createComponent('cont', {
                        components: [
                            createComponent('comp1', {boo: 'asdf'}),
                            createComponent('comp2', {blabla: {a: 3, b: 3}})
                        ]
                    });
                    var clonedComp = _.cloneDeep(container);

                    var displayed = fullToDisplayedJson.getDisplayedJson(container, {}, 'currentPage');


                    expect(displayed.structure).toEqual(container);
                    expect(container).toEqual(clonedComp);
                });

                it('should set component with all its children if active modes dont match component overrides or its children overrides', function () {
                    var container = createComponent('cont', {
                        modes: {definitions: [{modeId: 'mode1'}, {modeId: 'mode2'}]},
                        components: [
                            createComponent('comp1', {boo: 'asdf'}, [{
                                modeIds: ['mode2'],
                                isHiddenByModes: true
                            }]),
                            createComponent('comp2', {blabla: {a: 3, b: 3}})
                        ]
                    }, [{
                        modeIds: ['mode1'],
                        isHiddenByModes: true
                    }]);

                    var clonedComp = _.cloneDeep(container);
                    var pageActiveModes = {
                        currentPage: {mode3: true}
                    };

                    var displayed = fullToDisplayedJson.getDisplayedJson(container, pageActiveModes, 'currentPage');

                    expect(container).toEqual(clonedComp);
                    var expected = getDisplayedContainer(clonedComp, null);
                    expected.components = _.map(clonedComp.components, function (comp) {
                        return getDisplayedSimpleComp(comp);
                    });
                    expect(displayed.structure).toEqual(expected);

                });
            });

            describe('structure changes due to modes', function () {
                describe('children with applied overrides', function () {
                    it('should apply overrides for direct children', function () {
                        var childWithMode = createComponent('comp1', {boo: 'asdf'}, [{
                            modeIds: ['mode2'],
                            boo: 'aaaa'
                        }]);
                        var container = createComponent('cont', {
                            modes: {definitions: [{modeId: 'mode1'}, {modeId: 'mode2'}]},
                            components: [
                                childWithMode,
                                createComponent('comp2', {blabla: {a: 3, b: 3}})
                            ]
                        });
                        var pageActiveModes = {
                            currentPage: {mode2: true}
                        };

                        var clonedContainer = _.cloneDeep(container);
                        var displayed = fullToDisplayedJson.getDisplayedJson(container, pageActiveModes, 'currentPage');

                        expect(container).toEqual(clonedContainer);
                        var expected = getDisplayedContainer(clonedContainer);
                        expected.components[0] = getDisplayedSimpleComp(childWithMode, 0);
                        expect(displayed.structure).toEqual(expected);
                    });

                    it('should apply overrides for indirect children', function () {
                        var compWithModes = createComponent('comp2', {name: 'barnie'}, [
                            {modeIds: ['mode1'], name: 'lulu'},
                            {modeIds: ['horseMode'], name: 'pete'}
                        ]);
                        var container = createComponent('cont1', {
                            modes: {definitions: [{modeId: 'mode1'}, {modeId: 'horseMode'}]},
                            components: [
                                createComponent('comp1', {'boo': 3}),
                                createComponent('cont2', {
                                    components: [
                                        compWithModes
                                    ]
                                })
                            ]
                        });
                        var pageActiveModes = {
                            currentPage: {horseMode: true}
                        };

                        var clonedContainer = _.cloneDeep(container);
                        var displayed = fullToDisplayedJson.getDisplayedJson(container, pageActiveModes, 'currentPage');

                        expect(container).toEqual(clonedContainer);
                        var expected = getDisplayedContainer(container);
                        expected.components[1].components[0] = getDisplayedSimpleComp(compWithModes, 1);

                        expect(displayed.structure).toEqual(expected);
                    });
                });

                describe('children with isHiddenByModes', function () {
                    it('should include a component with children whose overrides isHiddenByModes are falsy', function () {
                        var container = createComponent('cont', {
                            modes: {definitions: [{modeId: 'mode2'}, {modeId: 'horseMode'}]},
                            components: [
                                createComponent('comp1', {'name': 'yossi'}),
                                createComponent('comp2', {name: 'yaffa'}, [{
                                    modeIds: ['mode2'],
                                    isHiddenByModes: true
                                }])
                            ]
                        });
                        var pageActiveModes = {
                            currentPage: {mode2: true}
                        };

                        var clonedContainer = _.cloneDeep(container);
                        var displayed = fullToDisplayedJson.getDisplayedJson(container, pageActiveModes, 'currentPage');

                        expect(container).toEqual(clonedContainer);
                        var expected = getDisplayedContainer(container);
                        expected.components.pop();
                        expect(displayed.structure).toEqual(expected);
                    });
                });
            });

            describe('page and master page', function () {
                describe('page', function () {
                    it('should set the page with all of its default structure when there are no active modes', function () {
                        var comp = createComponent('cont', {
                            name: 'yossi',
                            components: [createComponent('comp1', {'boo': 'asd'})]
                        });
                        this.mockSiteData.addPageWithData('pageToTest', {}, [comp]);
                        var page = this.mockSiteData.pagesData.pageToTest;

                        var clonedPage = _.cloneDeep(page);

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, {}, 'pageToTest');

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);

                    });

                    describe('when active modes dont correspond components on page', function () {

                        it('should set the page with all of its default structure', function () {
                            var comp = createComponent('comp1', {'name': 'yossi'}, [{
                                modeIds: ['mode3'],
                                isHiddenByModes: true
                            }]);

                            this.mockSiteData.addPageWithData('pageToTest', {}, [comp]);
                            var page = this.mockSiteData.pagesData.pageToTest;
                            var pageActiveModes = {
                                pageToTest: {mode33: true}
                            };
                            var clonedPage = _.cloneDeep(page);

                            var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, 'pageToTest');

                            expect(page).toEqual(clonedPage);
                            var expected = clonedPage;
                            expected.structure.components = [getDisplayedSimpleComp(comp)];
                            expect(displayed).toEqual(expected);
                        });
                    });

                    it('should set the page with all sub components which do not correspond isHiddenByModes=true', function () {
                        var comp = createComponent('comp1', {'name': 'yossi'}, [{
                            modeIds: ['mode3'],
                            isHiddenByModes: true
                        }]);

                        this.mockSiteData.addPageWithData('pageToTest', {}, [createComponent('comp2'), comp, createComponent('comp3')]);
                        var page = this.mockSiteData.pagesData.pageToTest;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            pageToTest: {mode3: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, 'pageToTest');

                        expect(page).toEqual(clonedPage);
                        var expected = clonedPage;
                        var comps = expected.structure.components;
                        comps[1] = comps[2];
                        comps.pop();
                        expect(displayed).toEqual(expected);
                    });

                    it("should generate the displayed structure for both desktop & mobile components", function () {
                        var structure = {
                            name: 'yossi',
                            modes: {
                                isHiddenByModes: true,
                                overrides: [{
                                    modeIds: ['mode-foo'],
                                    isHiddenByModes: false
                                }]
                            },
                            components: [createComponent('comp1', {'boo': 'asd'})]
                        };

                        var pageComps = [createComponent('container', structure)];
                        var mobileComps = [createComponent('mobileContainer', structure)];

                        this.mockSiteData.addPageWithData('pageToTest', {}, pageComps, mobileComps);
                        var page = this.mockSiteData.pagesData.pageToTest;

                        var pageActiveModes = {pageToTest: {'mode-foo': true}};

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, 'pageToTest');

                        expect(displayed.structure.components).not.toBeEmpty();
                        expect(displayed.structure.components[0].modes).toBeEmpty();
                        expect(displayed.structure.mobileComponents).not.toBeEmpty();
                        expect(displayed.structure.mobileComponents[0].modes).toBeEmpty();
                    });
                });

                describe('master page', function () {
                    it('should set the default structure of the master page when there are no active modes', function () {
                        var comps = [createComponent('comp1'), createComponent('comp2')];
                        this.mockSiteData.setPageComponents(comps, 'masterPage', false);
                        var page = this.mockSiteData.pagesData.masterPage;
                        var clonedPage = _.cloneDeep(page);

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, {}, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });

                    it('should set the structure of the master page to partial structure corresponding active modes and overrides', function () {
                        var comps = [createComponent('comp1'), createComponent('comp2', {}, [{
                            modeIds: ['mode3'],
                            isHiddenByModes: true
                        }])];
                        this.mockSiteData.setPageComponents(comps, 'masterPage', false);
                        var page = this.mockSiteData.pagesData.masterPage;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            "masterPage": {mode3: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        var expected = clonedPage;
                        expected.structure.children.pop();
                        expect(displayed).toEqual(expected);
                    });

                    it("should apply overrides of mobile components", function () {

                    });
                });
            });

            describe('data items', function () {
                describe('document_data', function () {
                    it('on a page - should set all of the document_data for any set of active modes', function () {
                        this.mockSiteData.addPageWithData('pageToTest', {}, []);
                        this.mockSiteData.addData({id: 'dd', data: 'my_mock_data'}, 'pageToTest');
                        var page = this.mockSiteData.pagesData.pageToTest;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            pageToTest: {mode3: true, mode2: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });

                    it('on masterPage - should set all of the document_data for any set of active modes', function () {
                        this.mockSiteData.addPageWithData('masterPage', {}, []);
                        this.mockSiteData.addData({id: 'mm', data: 'my_mock_data'}, 'masterPage');
                        var page = this.mockSiteData.pagesData.masterPage;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            "masterPage": {mode3: true, mode2: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });
                });

                describe('component_properties', function () {
                    it('should set all of the component_properties for any set of active modes', function () {
                        this.mockSiteData.addPageWithData('pageToTest', {}, []);
                        this.mockSiteData.addProperties({id: 'dd', data: 'my_mock_properties'}, 'pageToTest');
                        var page = this.mockSiteData.pagesData.pageToTest;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            "masterPage": {mode3: true, mode2: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });

                    it('on masterPage - should set all of the component_properties for any set of active modes', function () {
                        this.mockSiteData.addPageWithData('masterPage', {}, []);
                        this.mockSiteData.addProperties({id: 'mm', data: 'my_mock_properties'}, 'masterPage');
                        var page = this.mockSiteData.pagesData.masterPage;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            "masterPage": {mode3: true, mode2: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });
                });

                describe('theme_data', function () {
                    it('should set all of the theme_data for any set of active modes', function () {
                        this.mockSiteData.addPageWithData('masterPage', {}, []);
                        this.mockSiteData.addCompTheme({id: 'mm', data: 'my_mock_theme'}, 'masterPage');
                        var page = this.mockSiteData.pagesData.masterPage;
                        var clonedPage = _.cloneDeep(page);
                        var pageActiveModes = {
                            "masterPage": {mode3: true, mode2: true}
                        };

                        var displayed = fullToDisplayedJson.getDisplayedJson(page, pageActiveModes, page.structure.id);

                        expect(page).toEqual(clonedPage);
                        expect(displayed).toEqual(clonedPage);
                    });
                });
            });
        });

        describe('partialProperties', function () {
            function addPropertyItemsToPage(mockSiteData, pageId) {
                this.basePropertiesItem = {
                    id: 'basePropQuery',
                    type: 'some-type',
                    property1: 'base-prop1'
                };
                this.partialsProps = {
                    id: 'partialsPropsQuery',
                    type: 'some-type',
                    property1: 'base-prop-partial1',
                    property2: 'new-prop!'
                };

                mockSiteData.addProperties(this.basePropertiesItem, pageId);
                mockSiteData.addProperties(this.partialsProps, pageId);
            }

            function initMockPage() {
                this.pageId = 'pageToTest';
                var componentOverrides = [{
                    modeIds: ['modeX'],
                    propertyQuery: 'partialsPropsQuery',
                    layout: {
                        x: 11,
                        y: 22,
                        width: 33
                    }
                }];
                this.compWithPartials = createComponent('comp-with-partials', {propertyQuery: 'basePropQuery'}, componentOverrides);

                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.mockSiteData.addPageWithData(this.pageId, {}, [this.compWithPartials]);

                addPropertyItemsToPage.call(this, this.mockSiteData, this.pageId);

                this.pageStructure = this.mockSiteData.pagesData[this.pageId];
            }

            beforeEach(function () {
                openExperiments('sv_hoverBox');
                initMockPage.call(this);
            });

            describe('a single component', function () {
                describe('component with properties partials corresponding ActiveModes', function () {
                    describe('when there is a single active mode', function () {
                        it('should replace the original propertyQuery on the displayed json structure with overrides propertyQuery', function () {
                            var pageActiveModes = {
                                pageToTest: {'modeX': true}
                            };

                            var displayedJson = fullToDisplayedJson.getDisplayedJson(this.compWithPartials, pageActiveModes, this.pageId);

                            var expectedDisplayedJson = _.omit(this.compWithPartials, 'modes');
                            _.merge(expectedDisplayedJson, {
                                layout: {x: 11, y: 22, width: 33},
                                propertyQuery: 'partialsPropsQuery'
                            });
                            expect(displayedJson.structure).toEqual(expectedDisplayedJson);
                        });
                    });

                    xdescribe('when there are multiple active modes', function () {
                        describe('when modes overlap', function () {
                            it('should', function () {
                                var test = 'test';
                                var implemented = 'implmeneted';
                                expect(test).toBe(implemented);
                            });
                        });

                        describe('when modes are disjoint sets', function () {
                            it('should', function () {
                                var test = 'test';
                                var implemented = 'implmeneted';
                                expect(test).toBe(implemented);
                            });
                        });
                    });
                });

                describe('component with properties partials NOT corresponding ActiveModes', function () {
                    it('should return the component structure without any applied overrides', function () {
                        var pageActiveModes = {
                            pageToTest: {'non-existent-mode': true}
                        };

                        var displayedJson = fullToDisplayedJson.getDisplayedJson(this.compWithPartials, pageActiveModes, this.pageId);

                        expect(displayedJson.structure).toEqual(_.omit(this.compWithPartials, 'modes'));
                    });

                    it('should return the same page data items (/properties/design...) as the full json', function () {
                        var fullPage = this.mockSiteData.pagesData[this.pageId];
                        var pageActiveModes = {
                            pageToTest: {'non-existent-mode': true}
                        };

                        var displayedJson = fullToDisplayedJson.getDisplayedJson(fullPage, pageActiveModes, this.pageId);

                        expect(displayedJson.data).toEqual(fullPage.data);
                    });
                });
            });

            describe('single page', function () {
                describe('when there are corresponding ActiveModes', function () {
                    it('should return displayedJSON Data with partial data items and page structure items', function () {
                        var pageActiveModes = {
                            pageToTest: {'modeX': true}
                        };

                        var actualDisplayedJsonData = fullToDisplayedJson.getDisplayedJson(this.pageStructure, pageActiveModes, this.pageId).data;

                        expect(actualDisplayedJsonData.component_properties[this.basePropertiesItem.id]).toEqual(this.basePropertiesItem);
                        expect(actualDisplayedJsonData.component_properties[this.partialsProps.id]).toEqual(this.partialsProps);
                    });
                });
            });

            describe('pagesData', function () {
                beforeEach(function () {
                    this.activeModes = {};
                });

                describe('when there are corresponding ActiveModes', function () {
                    it('should return the displayedJSON with all data items (overrides & structure) for all pages', function () {
                        var expectedDisplayedData = _.cloneDeep(this.pageStructure.data);
                        expectedDisplayedData.component_properties = {};
                        expectedDisplayedData.component_properties[this.basePropertiesItem.id] = this.basePropertiesItem;
                        expectedDisplayedData.component_properties[this.partialsProps.id] = this.partialsProps;
                        this.activeModes[this.pageId] = {'modeX': true};

                        var actualDisplayedJson = fullToDisplayedJson.getDisplayedJson(this.mockSiteData.pagesData, this.activeModes, this.pageId);
                        var actualPageData = actualDisplayedJson[this.pageId].data;

                        var numberOfPagesOnPagesData = 3;
                        expect(_.size(actualDisplayedJson)).toEqual(numberOfPagesOnPagesData);
                        expect(actualPageData.component_properties[this.basePropertiesItem.id]).toEqual(expectedDisplayedData.component_properties[this.basePropertiesItem.id]);
                    });
                });
            });
        });
    });
});
