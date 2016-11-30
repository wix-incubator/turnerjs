define(['lodash', 'testUtils', 'utils',
    'coreUtils',
    'documentServices/constants/constants',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/privateServices/FullJsonUpdater',
    'documentServices/mockPrivateServices/privateServicesHelper'], function
    (_, testUtils, utils, coreUtils, constants, DesignSchemas, PropertiesSchemas, FullJsonUpdater, privateServicesHelper) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    describe('FullJsonUpdater', function () {
        function getComponent(pointers, id, pageId, viewMode) {
            var mode = viewMode || constants.VIEW_MODES.DESKTOP;
            var pagePointer = pointers.components.getPage(pageId || 'page1', mode);
            return pointers.components.getComponent(id, pagePointer);
        }

        function initWithPageComps(pageComps, propertiesItems, designItems) {
            var mockSiteData = testUtils.mockFactory.mockSiteData(null, true)
                .addPageWithDefaults('mainPage', pageComps, []);

            _.forEach(propertiesItems, function(propertyItem) {
                mockSiteData.addProperties(propertyItem, 'mainPage');
            });
            _.forEach(designItems, function(designItem) {
                mockSiteData.addDesign(designItem, 'mainPage');
            });

            var dalInners = privateServicesHelper.mockDalInners(mockSiteData);

            this.pointers = dalInners.pointers;
            this.fullJsonDal = dalInners.fullJsonDal;
            this.fullJsonUpdater = dalInners.fullJsonUpdater;
            this.displayedJsonDal = dalInners.displayedDal;
        }

        function setActiveModesInPage(pageId, pageActiveModes) {
            var activeModesPointer = this.pointers.general.getActiveModes();
            var activeModes = this.displayedJsonDal.get(activeModesPointer);
            activeModes[pageId] = pageActiveModes;
            this.displayedJsonDal.set(activeModesPointer, activeModes);
        }

        function getPageComps() {
            return [{
                componentType: 'compType',
                id: 'container1',
                layout: {},
                modes: {
                    definitions: [{
                        modeId: 'container-abc-mode',
                        type: 'mode-type'
                    },
                    {
                        modeId: 'modeForDesign',
                        type: 'mode-type2'
                    }]
                },
                components: [{
                    componentType: 'compType',
                    id: 'child',
                    layout: {x: 2, y: 10},
                    components: [{
                        id: 'innerChild1',
                        layout: {x: 200},
                        propertyQuery: 'propQuery-innerChild1',
                        dataQuery: '#dataQuery-innerChild1',
                        designQuery: '#designQuery-innerChild1'
                    }, {
                        id: 'innerChild2',
                        layout: {y: 100}
                    }]
                }]
            }, {
                componentType: 'compType',
                id: 'container2',
                layout: {},
                components: [{
                    componentType: 'compType',
                    id: 'child2',
                    layout: {},
                    components: []
                }]
            }];
        }

        beforeEach(function () {
            var pageComps = getPageComps();
            initWithPageComps.call(this, pageComps);
        });

        describe('onSet', function () {

            describe('when changed value is a component inner field', function () {
                describe('when field is not overridable', function () {
                    it('should update the value on the default structure', function () {
                        this.compPointer = getComponent(this.pointers, 'child', 'mainPage');
                        var fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'data');
                        var newData = 'hello';

                        this.fullJsonUpdater.onSet(fieldPointer, newData);

                        expect(this.fullJsonDal.get(fieldPointer)).toEqual(newData);
                    });
                });

                describe('when there are no active modes', function () {
                    it('should update the value on the default structure', function () {
                        this.compPointer = getComponent(this.pointers, 'child', 'mainPage');
                        var fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                        var newLayout = {x: 5};

                        this.fullJsonUpdater.onSet(fieldPointer, newLayout);

                        expect(this.fullJsonDal.get(fieldPointer)).toEqual(newLayout);
                    });
                });

                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.pageId = 'mainPage';
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        this.fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                        this.fullJsonDal.set(this.fieldPointer, {x: 100, y: 200});
                        this.activeMode = 'mode1';
                        var pagePointer = this.pointers.components.getPage(this.pageId, 'DESKTOP');
                        this.fullJsonDal.merge(pagePointer, {
                            modes: {
                                definitions: [{
                                    modeId: this.activeMode
                                }]
                            }
                        });
                        setActiveModesInPage.call(this, this.pageId, {mode1: true});
                    });

                    describe('when field is overridable', function () {
                        it('should update the value on the relevant override structure', function () {
                            var originalLayout = this.fullJsonDal.get(this.fieldPointer);
                            var newLayout = {x: 0, y: 50};

                            this.fullJsonUpdater.onSet(this.fieldPointer, newLayout);
                            var comp = this.fullJsonDal.get(this.compPointer);

                            expect(comp.layout).toEqual(originalLayout);
                            expect(comp.modes.overrides[0].layout).toEqual(newLayout);
                        });
                    });

                    describe('when inner property of overridable field is changed', function(){
                        beforeEach(function(){
                            this.fullJsonDal.merge(this.compPointer, {
                                modes: {
                                    idNotDisplayed: false,
                                    definitions: [],
                                    overrides: [{
                                        modeIds: [this.activeMode],
                                        layout: {
                                            x: 50,
                                            y: 300
                                        }
                                    }]
                                }
                            });
                        });

                        it('should update the inner property on the override object', function(){
                            this.fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                            var fieldInnerPointer = this.pointers.getInnerPointer(this.fieldPointer, 'x');
                            var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                            var originalOverride = this.fullJsonDal.get(overridesPointer)[0];
                            var originalLayout = this.fullJsonDal.get(this.fieldPointer);
                            var newX = originalOverride.layout.x + 20;

                            this.fullJsonUpdater.onSet(fieldInnerPointer, newX);
                            var comp = this.fullJsonDal.get(this.compPointer);

                            expect(comp.layout).toEqual(originalLayout);
                            expect(comp.modes.overrides[0].layout.y).toEqual(originalOverride.layout.y);
                            expect(comp.modes.overrides[0].layout.x).toEqual(newX);
                        });
                    });

                    describe('when field is inner property of overrideable field, like width in layout', function () {
                        it('should create new override with the value if override does not exist');

                        it('should merge the new value to the existing override if override already exists');
                    });


                });

                describe('when there is a default mode on an ancestor and no other active mode', function(){

                });
            });

            xdescribe('when changed value is an array of children components', function () {
                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.pageId = 'mainPage';
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        setActiveModesInPage.call(this, this.pageId, {mode1: true});
                    });

                    describe('when all children exist in full json children', function () {
                        it('should update the relevant overrides for all children components recursively', function () {
                            var childrenContainerPointer = this.pointers.components.getChildrenContainer(this.compPointer);
                            var newChildren = [{
                                id: 'innerChild2',
                                layout: {width: 52}
                            }, {
                                id: 'innerChild1',
                                layout: {height: 13}
                            }];

                            this.fullJsonUpdater.onSet(childrenContainerPointer, newChildren);
                            var updatedChildrenContainer = this.fullJsonDal.get(childrenContainerPointer);

                            expect(updatedChildrenContainer.length).toEqual(newChildren.length);
                            expect(updatedChildrenContainer[0].modes.overrides[0].layout).toEqual(newChildren[0].layout);
                            expect(updatedChildrenContainer[1].modes.overrides[0].layout).toEqual(newChildren[1].layout);

                        });
                    });

                    describe('when there are children in full json that are not in the new children array', function () {
                        it('it should set isHiddenByModes to true for those children that are only in the full json, in the relevant override');
                    });

                    describe('when there are children in the new array that do not exist in full json', function () {
                        it('should add the new children to parent structure, and set children default isHiddenByModes to true, and isHiddenByModes false under the relevant override');
                    });
                });
            });

            describe('when changed value is a component with no children', function () {
                describe('when no active modes', function () {
                    describe('when no overridable fields are changed', function () {
                        beforeEach(function () {
                            this.compPointer = getComponent(this.pointers, 'container1', 'mainPage');
                        });
                        it('should update the component default structure with the changes', function () {
                            var comp = {
                                id: 'container1',
                                blabla: 'comp2',
                                blabla2: '#1',
                                modes: {
                                    definitions: [{
                                        modeId: 'meaningless-mode',
                                        type: 'all-modes-are-taken-from-full-and-not-displayed-json'
                                    }]
                                }
                            };
                            var modesOnFull = _.clone(this.fullJsonDal.get(this.compPointer).modes);

                            this.fullJsonUpdater.onSet(this.compPointer, comp);


                            expect(this.fullJsonDal.get(this.compPointer)).toEqual(_.assign(comp, {modes: modesOnFull}));
                        });

                        it('should maintain any overrides already defined on the component', function () {
                            var modesPointer = this.pointers.componentStructure.getModes(this.compPointer);
                            this.fullJsonDal.set(modesPointer, {
                                overrides: [{
                                    id: 'some override',
                                    layout: {}
                                }]
                            });
                            var comp = {
                                id: 'container1',
                                blabla: 'comp2',
                                blabla2: '#1'
                            };

                            this.fullJsonUpdater.onSet(this.compPointer, comp);

                            var result = this.fullJsonDal.get(this.compPointer);
                            expect(result.modes.overrides).toBeDefined();
                        });
                    });

                    describe('when changed fields include overridable fields', function () {
                        it('should update the component default structure with the changes', function () {
                            var compPointer = getComponent(this.pointers, 'container1', 'mainPage');
                            var comp = {
                                id: 'container1',
                                blabla: 'comp2',
                                blabla2: '#1',
                                layout: {
                                    y: 20
                                },
                                modes: {
                                    definitions: [{
                                        modeId: 'meaningless-mode',
                                        type: 'all-modes-are-taken-from-full-and-not-displayed-json'
                                    }]
                                }
                            };
                            var modesInFull = _.clone(this.fullJsonDal.get(compPointer).modes);

                            this.fullJsonUpdater.onSet(compPointer, comp);

                            expect(this.fullJsonDal.get(compPointer)).toEqual(_.assign(comp, {modes: modesInFull}));
                        });
                    });
                });

                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.pageId = 'mainPage';
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        var pagePointer = getComponent(this.pointers, this.pageId, this.pageId);
                        this.fullJsonDal.merge(pagePointer, {
                            modes: {
                                definitions: [{
                                    modeId: 'pageMode1',
                                    type: coreUtils.siteConstants.COMP_MODES_TYPES.DEFAULT
                                }, {
                                    modeId: 'pageMode2',
                                    type: coreUtils.siteConstants.COMP_MODES_TYPES.HOVER
                                }]
                            }
                        });
                        setActiveModesInPage.call(this, this.pageId, {pageMode1: true});
                    });

                    describe('when the component exists in the full json', function () {
                        describe('when no overridable fields are changed', function () {
                            it('should update the component default structure with the changes', function () {
                                var comp = {
                                    id: 'child',
                                    blabla: 'comp2',
                                    blabla2: '#1'
                                };

                                this.fullJsonUpdater.onSet(this.compPointer, comp);

                                expect(this.fullJsonDal.get(this.compPointer)).toEqual(comp);
                            });
                        });

                        describe('when changed fields include overridable fields', function () {
                            describe('when changed field is layout (or partial layout - i.e. "width" is missing)', function() {

                                beforeEach(function() {
                                    setActiveModesInPage.call(this, this.pageId, {'container-abc-mode': true});
                                });

                                describe('when layout is missing in the corresponding override object', function() {
                                    it('should set the given layout to the corresponding override, with default values of the regular layout', function() {
                                        var fullComp = this.fullJsonDal.get(this.compPointer);
                                        expect(fullComp.modes).not.toBeDefined();

                                        fullComp.layout = {
                                            x: 5
                                        };
                                        this.fullJsonUpdater.onSet(this.compPointer, fullComp);

                                        var updatedFullComp = this.fullJsonDal.get(this.compPointer);
                                        expect(updatedFullComp.modes).toBeDefined();
                                        expect(updatedFullComp.modes.overrides[0].layout).toEqual({x: 5, y: 10});
                                    });
                                });

                                describe('when layout already exists in the corresponding override object', function() {
                                    it('should merge the given layout to the corresponding override layout', function() {
                                        var fullComp = this.fullJsonDal.get(this.compPointer);
                                        expect(fullComp.modes).not.toBeDefined();

                                        fullComp.layout = {
                                            y: 18
                                        };
                                        this.fullJsonUpdater.onSet(this.compPointer, fullComp);

                                        var updatedFullComp = this.fullJsonDal.get(this.compPointer);
                                        expect(updatedFullComp.modes).toBeDefined();
                                        expect(updatedFullComp.modes.overrides[0].layout).toEqual({x: 2, y: 18});
                                    });
                                });
                            });

                            describe('when the active mode has relevant override on the component', function () {
                                beforeEach(function () {
                                    var modesPointer = this.pointers.componentStructure.getModes(this.compPointer);
                                    this.defaultLayout = {foo: 'bar'};
                                    var layoutPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                                    this.fullJsonDal.set(layoutPointer, this.defaultLayout);
                                    this.fullJsonDal.set(modesPointer, {
                                        definitions: [],
                                        overrides: [{
                                            modeIds: ['pageMode2'],
                                            layout: {y: 10}
                                        }, {
                                            modeIds: ['pageMode1'],
                                            layout: {y: 10}
                                        }]
                                    });
                                });

                                it('should update the relevant override', function () {
                                    var comp = {
                                        id: 'child',
                                        blabla: 'comp2',
                                        blabla2: '#1',
                                        layout: {
                                            y: 20,
                                            x: 10
                                        }
                                    };

                                    this.fullJsonUpdater.onSet(this.compPointer, comp);
                                    var updatedComp = this.fullJsonDal.get(this.compPointer);

                                    expect(updatedComp.layout).toEqual(this.defaultLayout);
                                    expect(updatedComp.modes.overrides[0].layout).not.toEqual(comp.layout);
                                    expect(updatedComp.modes.overrides[1].layout).toEqual(comp.layout);
                                });
                            });

                            describe('when the active mode does not have relevant override on the component', function () {

                                beforeEach(function () {
                                    var childParentPointer = this.pointers.components.getParent(this.compPointer);
                                    this.fullJsonDal.merge(childParentPointer, {
                                        modes: {
                                            definitions: [{
                                                modeId: 'mode-shtut'
                                            }]
                                        }
                                    });
                                    setActiveModesInPage.call(this, this.pageId, {'mode-shtut': true});
                                });

                                it('should create and update the relevant override', function () {
                                    var comp = {
                                        id: 'child',
                                        blabla: 'comp2',
                                        blabla2: '#1',
                                        layout: {
                                            y: 20,
                                            x: 10
                                        }
                                    };

                                    this.fullJsonUpdater.onSet(this.compPointer, comp);
                                    var updatedComp = this.fullJsonDal.get(this.compPointer);

                                    expect(updatedComp.modes.overrides[0].layout).toEqual(comp.layout);
                                });
                            });
                        });
                    });
                });
            });

            describe('when changed value is a component with children components', function () {
                beforeEach(function () {
                    this.overriddenLayout = {x: 10, y: 100, rotationInDegrees: 55};
                    this.compWithChildren = {
                        id: 'child',
                        layout: this.overriddenLayout,
                        components: [{
                            id: 'innerChild1',
                            layout: this.overriddenLayout
                        }, {
                            id: 'innerChild2',
                            layout: this.overriddenLayout
                        }]
                    };
                });

                describe('when there are no active modes', function() {
                    beforeEach(function () {
                        this.pageId = 'masterPage';
                        this.masterPagePointer = getComponent(this.pointers, this.pageId, this.pageId, 'MOBILE');
                        this.valueToSet = this.fullJsonDal.get(this.masterPagePointer);
                        this.valueToSet.mobileComponents.push({
                            id: 'BACK_TO_TOP_BUTTON',
                            layout: {
                                x: 10, y: 10,
                                width: 10, height: 10
                            },
                            componentType: 'components/components/backToTopButton/backToTopButton',
                            type: 'Component'
                        });
                    });
                    describe('when there are new children in the value that do not exist in the JSON from before', function() {
                        it('should set the new children in the structure to the JSON as usual', function() {
                            var backToTopButtonPointer = getComponent(this.pointers, 'BACK_TO_TOP_BUTTON', 'masterPage', 'MOBILE');
                            expect(backToTopButtonPointer).toBeNull();

                            this.fullJsonUpdater.onSet(this.masterPagePointer, this.valueToSet);

                            backToTopButtonPointer = getComponent(this.pointers, 'BACK_TO_TOP_BUTTON', 'masterPage', 'MOBILE');
                            expect(this.fullJsonDal.get(backToTopButtonPointer)).toEqual(_.last(this.valueToSet.mobileComponents));
                        });
                    });
                });

                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', 'mainPage');
                        setActiveModesInPage.call(this, 'mainPage', {mode1: true});
                        var childParentPointer = this.pointers.components.getParent(this.compPointer);
                        this.fullJsonDal.merge(childParentPointer, {
                            modes: {
                                definitions: [{
                                    modeId: 'mode1'
                                }]
                            }
                        });
                    });

                    describe('when all children exist in the json', function () {
                        it('should update the relevant overrides for all children components recursively', function () {
                            this.fullJsonUpdater.onSet(this.compPointer, this.compWithChildren);

                            var innerChildPointer = getComponent(this.pointers, 'innerChild1', 'mainPage');
                            var innerChild = this.fullJsonDal.get(innerChildPointer);

                            expect(innerChild.modes).toBeDefined();
                            expect(innerChild.modes.overrides[0].layout).toEqual(this.overriddenLayout);
                        });
                    });

                    describe('when there are new children that do not exist in the json', function () {
                        beforeEach(function () {
                            this.innerChild3Layout = {
                                x: 11,
                                y: 22,
                                r: 33
                            };
                            this.compWithChildren.components.push({
                                id: 'innerChild3',
                                layout: this.innerChild3Layout
                            });
                        });

                        it('should add the new child with isHiddenByModes true by default and false on override', function () {
                            this.fullJsonUpdater.onSet(this.compPointer, this.compWithChildren);

                            var innerChildPointer = getComponent(this.pointers, 'innerChild3', 'mainPage');
                            var innerChild = this.fullJsonDal.get(innerChildPointer);

                            expect(innerChild).toBeDefined();
                            expect(innerChild.modes.isHiddenByModes).toEqual(true);
                            expect(innerChild.modes.overrides[0].isHiddenByModes).toEqual(false);
                            expect(innerChild.modes.overrides[0].layout).toEqual(this.innerChild3Layout);
                        });
                    });

                    describe('when there are children in the json that do not exist in the new structure', function () {
                        beforeEach(function () {
                            this.missingChild = this.compWithChildren.components.pop();
                        });

                        it('should set isHiddenByModes true as override to the missing children', function () {
                            this.fullJsonUpdater.onSet(this.compPointer, this.compWithChildren);

                            var innerChildPointer = getComponent(this.pointers, this.missingChild.id, 'mainPage');
                            var innerChild = this.fullJsonDal.get(innerChildPointer);

                            expect(innerChild).toBeDefined();
                            expect(innerChild.modes.overrides[0].isHiddenByModes).toEqual(true);
                        });

                        it('should keep the order of new children with the hidden children', function () {
                            this.compWithChildren.components.unshift({
                                id: 'innerChild3',
                                layout: this.overriddenLayout
                            });

                            this.fullJsonUpdater.onSet(this.compPointer, this.compWithChildren);

                            var childrenPointer = this.pointers.getInnerPointer(this.compPointer, 'components');
                            var children = this.fullJsonDal.get(childrenPointer);

                            expect(children.length).toEqual(3);
                            expect(children[0].id).toEqual('innerChild3');
                            expect(children[1].id).toEqual('innerChild2');
                            expect(children[2].id).toEqual('innerChild1');
                        });
                    });
                });
            });

            describe('when changed value is a page *component*', function() {
                it('setting value using mobile pointer should not override desktop structure', function() {
                    var masterPageDesktopPointer = this.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var masterPageMobilePointer = this.pointers.components.getMasterPage(constants.VIEW_MODES.MOBILE);
                    var masterPage = this.fullJsonDal.get(masterPageDesktopPointer);
                    masterPage.children = [{
                        id: 'SITE_HEADER',
                        componentType: 'wysiwyg.viewer.components.HeaderContainer',
                        components: [{
                            id: 'desktop-header-child'
                        }]
                    }];
                    masterPage.mobileComponents = [{
                        id: 'SITE_HEADER',
                        componentType: 'wysiwyg.viewer.components.HeaderContainer',
                        components: [{
                            id: 'mobile-header-child'
                        }]
                    }];

                    this.fullJsonDal.set(masterPageDesktopPointer, masterPage);
                    this.fullJsonUpdater.onSet(masterPageMobilePointer, masterPage);

                    expect(this.fullJsonDal.get(masterPageDesktopPointer)).toEqual(masterPage);
                });
            });

            describe('pages', function () {
                describe('when setting full page object', function () {
                    it('should throw an exception', function () {
                        var pagePointer = this.pointers.page.getPagePointer('mainPage');
                        var newPagesData = {someProp: ''};

                        var setMethod = function () {
                            this.fullJsonUpdater.onSet(pagePointer, newPagesData);
                        }.bind(this);

                        expect(setMethod).toThrow();
                    });
                });

                describe('when setting data on master page', function () {
                    it('should update the data', function () {
                        var pageDataPointer = this.pointers.page.getPageData('masterPage');
                        var innerDataPointer = this.pointers.getInnerPointer(pageDataPointer, 'someProp');

                        var newPagesData = 'some value';
                        this.fullJsonUpdater.onSet(innerDataPointer, newPagesData);

                        expect(this.fullJsonDal.get(innerDataPointer)).toEqual(newPagesData);
                    });
                });

                describe('when setting new pagesData', function () {
                    it('should throw an exception', function () {
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var newPagesData = {someProp: ''};

                        var setMethod = function () {
                            this.fullJsonUpdater.onSet(pagesDataPointer, newPagesData);
                        }.bind(this);

                        expect(setMethod).toThrow();
                    });
                });
            });
        });

        describe('onMerge', function () {

            beforeEach(function() {
                this.pageId = 'mainPage';
            });

            describe('pages', function () {
                describe('when merging into page object', function () {
                    it('should throw an exception', function () {
                        var pagePointer = this.pointers.page.getPagePointer(this.pageId);
                        var newPagesData = {someProp: ''};

                        var setMethod = function () {
                            this.fullJsonUpdater.onMerge(pagePointer, newPagesData);
                        }.bind(this);

                        expect(setMethod).toThrow();
                    });
                });

                describe('when setting data on master page', function () {
                    it('should update the data', function () {
                        var pageDataPointer = this.pointers.page.getPageData(this.pageId);
                        var innerDataPointer = this.pointers.getInnerPointer(pageDataPointer, 'someProp');

                        var newPagesData = {props1: 'some value'};
                        this.fullJsonDal.set(innerDataPointer, newPagesData);
                        this.fullJsonUpdater.onMerge(innerDataPointer, newPagesData);

                        expect(this.fullJsonDal.get(innerDataPointer)).toEqual(newPagesData);
                    });
                });

                describe('when setting new pagesData', function () {
                    it('should throw an exception', function () {
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var newPagesData = {someProp: ''};

                        var setMethod = function () {
                            this.fullJsonUpdater.onMerge(pagesDataPointer, newPagesData);
                        }.bind(this);

                        expect(setMethod).toThrow();
                    });
                });
            });

            describe('when changed value is a component inner field', function () {
                describe('when field is not overridable', function () {
                    it('should update the value on the default structure', function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        var newData = {foo: 'hello'};

                        this.fullJsonUpdater.onMerge(this.compPointer, newData);

                        var fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'foo');
                        expect(this.fullJsonDal.get(fieldPointer)).toEqual(newData.foo);
                    });
                });

                describe('when there are no active modes', function () {
                    it('merge to the component object - should add to the value on the default structure', function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        var newLayout = {layout: {x: 5}};

                        this.fullJsonUpdater.onMerge(this.compPointer, newLayout);

                        expect(this.fullJsonDal.get(this.compPointer).layout).toEqual(newLayout.layout);
                    });

                    it('merge to the layout object - should add to the value on the default structure', function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        var layoutPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                        var originalLayout = this.fullJsonDal.get(layoutPointer);
                        var newLayout = {x: 5};

                        this.fullJsonUpdater.onMerge(layoutPointer, newLayout);

                        var expectedLayout = _.assign(originalLayout, newLayout);
                        expect(this.fullJsonDal.get(layoutPointer)).toEqual(expectedLayout);
                    });
                });

                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        this.fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                        this.fullJsonDal.set(this.fieldPointer, {x: 100, y: 200});
                        this.activeMode = 'mode1';
                        var pagePointer = this.pointers.components.getPage(this.pageId, 'DESKTOP');
                        this.fullJsonDal.merge(pagePointer, {
                            modes: {
                                definitions: [{
                                    modeId: this.activeMode
                                }]
                            }
                        });
                        setActiveModesInPage.call(this, this.pageId, {mode1: true});
                    });

                    describe('when field is overridable and override does not exist', function () {
                        it('should add to the value and the relevant override structure', function () {
                            var originalLayout = this.fullJsonDal.get(this.fieldPointer);
                            var newLayout = {layout: {x: 0, y: 50}};

                            this.fullJsonUpdater.onMerge(this.compPointer, newLayout);
                            var comp = this.fullJsonDal.get(this.compPointer);

                            expect(comp.layout).toEqual(originalLayout);
                            expect(comp.modes.overrides[0].modeIds).toEqual([this.activeMode]);
                            expect(comp.modes.overrides[0].layout).toEqual(newLayout.layout);
                        });

                        it('should add to the value and the relevant override structure - deep merge', function () {
                            var originalLayout = this.fullJsonDal.get(this.fieldPointer);
                            var newLayout = {x: 0, y: 50};

                            this.fullJsonUpdater.onMerge(this.fieldPointer, newLayout);
                            var comp = this.fullJsonDal.get(this.compPointer);

                            expect(comp.layout).toEqual(originalLayout);
                            expect(comp.modes.overrides[0].modeIds).toEqual([this.activeMode]);
                            expect(comp.modes.overrides[0].layout).toEqual(_.assign(originalLayout, newLayout));
                        });
                    });

                    describe('when field is overridable and override exists', function(){
                        beforeEach(function(){
                            this.fullJsonDal.merge(this.compPointer, {
                                modes: {
                                    idNotDisplayed: false,
                                    definitions: [],
                                    overrides: [{
                                        modeIds: [this.activeMode],
                                        layout: {
                                            x: 50,
                                            z: 80
                                        }
                                    }]
                                }
                            });
                        });

                        it('should add/change the inner property on the override object', function(){
                            this.fieldPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                            var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                            var originalOverride = this.fullJsonDal.get(overridesPointer)[0];
                            var originalDefaultLayout = this.fullJsonDal.get(this.fieldPointer);
                            var newY = 20;
                            var newZ = 30;
                            var newLayout = {y: newY, z: newZ};

                            this.fullJsonUpdater.onMerge(this.fieldPointer, newLayout);
                            var comp = this.fullJsonDal.get(this.compPointer);

                            expect(comp.layout).toEqual(originalDefaultLayout);
                            expect(comp.modes.overrides[0].layout.x).toEqual(originalOverride.layout.x);
                            expect(comp.modes.overrides[0].layout.y).toEqual(newY);
                            expect(comp.modes.overrides[0].layout.z).toEqual(newZ);
                        });
                    });
                });
            });

            describe('when changed value is a component with no children', function () {
                describe('when no active modes', function () {
                    describe('when no overridable fields are changed', function () {
                        beforeEach(function () {
                            this.compPointer = getComponent(this.pointers, 'container1', this.pageId);
                        });

                        it('should maintain any overrides already defined on the component', function () {
                            var modesPointer = this.pointers.componentStructure.getModes(this.compPointer);
                            this.fullJsonDal.set(modesPointer, {
                                overrides: [{
                                    id: 'some override',
                                    layout: {}
                                }]
                            });
                            var comp = {
                                id: 'container1',
                                blabla: 'comp2',
                                blabla2: '#1'
                            };

                            this.fullJsonUpdater.onMerge(this.compPointer, comp);

                            var result = this.fullJsonDal.get(this.compPointer);
                            expect(result.modes.overrides).toBeDefined();
                        });
                    });
                });

                describe('when there are ancestor active modes', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        this.activeMode = 'mode1';
                        var pagePointer = this.pointers.components.getPage(this.pageId, 'DESKTOP');
                        this.fullJsonDal.merge(pagePointer, {
                            modes: {
                                definitions: [{
                                    modeId: this.activeMode
                                }]
                            }
                        });
                        this.fullJsonDal.merge(this.compPointer, {
                            layout: {x: 0, y: 0},
                            designQuery: 'originalDesign',
                            componentType: 'originalCompType'
                        });
                        setActiveModesInPage.call(this, this.pageId, {mode1: true});
                    });

                    describe('when merged object contains overridable fields', function () {
                        it('should create overrides with the relevant fields', function () {
                            var objToMerge = {
                                layout: {x: 500, y: -10},
                                designQuery: 'myDesign',
                                componentType: 'typeFromMerge'
                            };

                            this.fullJsonUpdater.onMerge(this.compPointer, objToMerge);

                            var comp = this.fullJsonDal.get(this.compPointer);
                            var override = comp.modes.overrides[0];
                            expect(comp.modes.overrides.length).toEqual(1);
                            expect(comp.componentType).toEqual(objToMerge.componentType);
                            expect(override.layout).toEqual(objToMerge.layout);
                            expect(override.designQuery).toEqual(objToMerge.designQuery);
                            expect(override.componentType).not.toBeDefined();

                        });
                    });
                });

                describe('when there are active modes of the component being merged', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        this.activeMode = 'ownMode';
                        this.fullJsonDal.merge(this.compPointer, {
                            layout: {x: 0, y: 0},
                            designQuery: 'originalDesign',
                            componentType: 'originalCompType',
                            modes: {
                                definitions: [{
                                    modeId: this.activeMode
                                }],
                                overrides: []
                            }
                        });
                        setActiveModesInPage.call(this, this.pageId, {ownMode: true});
                    });
                    describe('when merged object contains overridable fields', function () {
                        it('should only create overrides with fields that are allowed for self override', function () {
                            var objToMerge = {
                                layout: {x: 500, y: -10},
                                designQuery: 'myDesign',
                                componentType: 'typeFromMerge'
                            };

                            this.fullJsonUpdater.onMerge(this.compPointer, objToMerge);

                            var comp = this.fullJsonDal.get(this.compPointer);
                            var override = comp.modes.overrides[0];
                            expect(comp.modes.overrides.length).toEqual(1);
                            expect(override.modeIds).toEqual([this.activeMode]);
                            expect(comp.componentType).toEqual(objToMerge.componentType);
                            expect(comp.layout).toEqual(objToMerge.layout);
                            expect(override.layout).not.toBeDefined();
                            expect(override.designQuery).toEqual(objToMerge.designQuery);
                            expect(override.componentType).not.toBeDefined();
                        });
                    });
                });
            });

            describe('when changed value is a component with children components', function () {
                beforeEach(function () {
                    this.overriddenLayout = {x: 10, y: 100, rotationInDegrees: 55};
                    this.compWithChildren = {
                        id: 'child',
                        layout: this.overriddenLayout,
                        components: [{
                            id: 'innerChild1',
                            layout: this.overriddenLayout
                        }, {
                            id: 'innerChild2',
                            layout: this.overriddenLayout
                        }]
                    };
                });
                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                        setActiveModesInPage.call(this, 'mainPage', {mode1: true});
                        var childParentPointer = this.pointers.components.getParent(this.compPointer);
                        this.fullJsonDal.merge(childParentPointer, {
                            modes: {
                                definitions: [{
                                    modeId: 'mode1'
                                }]
                            }
                        });
                    });

                    describe('when all children exist in the json', function () {
                        it('should update the relevant overrides for all children components recursively', function () {
                            this.fullJsonUpdater.onMerge(this.compPointer, this.compWithChildren);

                            var innerChildPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                            var innerChild = this.fullJsonDal.get(innerChildPointer);

                            expect(innerChild.modes).toBeDefined();
                            expect(innerChild.modes.overrides[0].layout).toEqual(this.overriddenLayout);
                        });
                    });

                    describe('when there are new children that do not exist in the json', function () {
                        beforeEach(function () {
                            this.compWithChildren.components.push({
                                id: 'innerChild3',
                                layout: this.overriddenLayout
                            });
                        });

                        it('should add the new child with isHiddenByModes true by default and false on override', function () {
                            this.fullJsonUpdater.onMerge(this.compPointer, this.compWithChildren);

                            var innerChildPointer = getComponent(this.pointers, 'innerChild3', this.pageId);
                            var innerChild = this.fullJsonDal.get(innerChildPointer);

                            expect(innerChild).toBeDefined();
                            expect(innerChild.modes.isHiddenByModes).toEqual(true);
                            expect(innerChild.modes.overrides[0].isHiddenByModes).toEqual(false);
                        });
                    });

                    describe('when there are children in the json that do not exist in the new structure', function () {
                        beforeEach(function () {
                            this.missingChild = this.compWithChildren.components.pop();
                        });

                        it('should add isHiddenByModes true in the missing children overrides', function () {
                            var innerChildPointer = getComponent(this.pointers, this.missingChild.id, this.pageId);

                            this.fullJsonUpdater.onMerge(this.compPointer, this.compWithChildren);

                            expect(this.fullJsonDal.get(innerChildPointer)).toBeDefined();
                            expect(this.fullJsonDal.get(innerChildPointer).modes.overrides[0].isHiddenByModes).toEqual(true);
                        });
                    });
                });
            });

            describe('when pointer is to Layout', function() {

                beforeEach(function() {
                    this.compPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                    this.layoutPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                });

                describe('when there are NO active modes -', function() {
                    beforeEach(function() {
                        setActiveModesInPage.call(this, this.pageId, {'container-abc-mode': false});
                    });

                    it('should merge the layout values directly into the structure', function() {
                        var layoutToMerge = {
                            x: 38,
                            width: 150,
                            rotationAngle: 278
                        };
                        expect(this.fullJsonDal.get(this.layoutPointer)).not.toEqual(layoutToMerge);


                        this.fullJsonUpdater.onMerge(this.layoutPointer, layoutToMerge);

                        var updatedLayout = this.fullJsonDal.get(this.layoutPointer);
                        expect(updatedLayout.x).toEqual(layoutToMerge.x);
                        expect(updatedLayout.width).toEqual(layoutToMerge.width);
                        expect(updatedLayout.rotationAngle).toEqual(layoutToMerge.rotationAngle);
                    });
                });

                describe('when there are active modes -', function() {

                    beforeEach(function() {
                        this.modeId = 'container-abc-mode';
                        setActiveModesInPage.call(this, this.pageId, {'container-abc-mode': true});
                        this.compModesPointer = this.pointers.getInnerPointer(this.compPointer, 'modes');
                        this.compOverridesPointer = this.pointers.getInnerPointer(this.compPointer, ['modes', 'overrides']);

                        this.structureLayout = this.fullJsonDal.get(this.layoutPointer);
                    });

                    describe('when there is no layout set to the corresponding overrides', function() {
                        it('should merge the passed value with the structure layout to the overrides object corresponding the active modes', function () {
                            var layoutToMerge = {
                                y: 38,
                                width: 150,
                                rotationAngle: 278
                            };
                            var componentOverrides = this.fullJsonDal.get(this.compOverridesPointer);
                            var matchingOverridesObject = _.filter(componentOverrides, 'modeIds', [this.modeId]);
                            expect(matchingOverridesObject).toBeEmpty();

                            this.fullJsonUpdater.onMerge(this.layoutPointer, layoutToMerge);

                            var mergedLayoutToExpect = _.assign({}, this.structureLayout, layoutToMerge);
                            componentOverrides = this.fullJsonDal.get(this.compOverridesPointer);
                            var correspondingOverrides = _(componentOverrides).filter('modeIds', [this.modeId]).first();
                            expect(correspondingOverrides.layout).toEqual(mergedLayoutToExpect);
                        });
                    });

                    describe('when there is already a layout set to the corresponding overrides', function() {

                        beforeEach(function() {
                            this.initialLayoutToMerge = {
                                y: 38,
                                width: 150,
                                rotationAngle: 278
                            };
                            this.fullJsonUpdater.onSet(this.layoutPointer, this.initialLayoutToMerge);
                        });

                        it('should merge the passed value with the existing layout and the structure layout to the overrides object corresponding the active modes', function() {
                            var layoutToMerge = {
                                boo: 6,
                                width: 400
                            };

                            this.fullJsonUpdater.onMerge(this.layoutPointer, layoutToMerge);

                            var mergedLayoutToExpect = _.assign({}, this.structureLayout, this.initialLayoutToMerge, layoutToMerge);
                            var componentOverrides = this.fullJsonDal.get(this.compOverridesPointer);
                            var correspondingOverrides = _(componentOverrides).filter('modeIds', [this.modeId]).first();
                            expect(correspondingOverrides.layout).toEqual(mergedLayoutToExpect);
                        });
                    });
                });
            });
        });

        describe('onPush', function () {

            beforeEach(function() {
                this.pageId = 'mainPage';
            });

            describe('when container pointer is not in pagesData', function() {
                it('should throw an error', function() {
                    var value = {
                        id: 'mock-comp-id',
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.SiteButton',
                        layout: {}
                    };
                    var index = 0;
                    var pointerToPush = this.pointers.components.getUnattached('mock-comp-id', 'DESKTOP');
                    var nonPagesDataPointer = this.pointers.general.getRuntimePointer();

                    var self = this;
                    expect(function() {
                        self.fullJsonUpdater.onPush(nonPagesDataPointer, value, pointerToPush, index);
                    }).toThrow('updates outside of pagesData should be done only through full json DAL');
                });
            });

            describe('when container pointer is in pagesData', function() {
                describe('when value is a component', function() {

                    describe('when there are no active modes', function() {
                        beforeEach(function () {
                            this.compPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                            this.compToPush = {
                                id: 'innerChild1',
                                type: 'Component',
                                componentType: 'some.wysiwyg.comp.type',
                                layout: {
                                    key1: 'val1',
                                    key2: 'val2',
                                    key3: 'val3'
                                }
                            };
                            this.fullJsonDal.remove(this.compPointer);
                            var parentPointer = getComponent(this.pointers, 'child', this.pageId);
                            this.pointerToPushNewComp = this.pointers.components.getChildrenContainer(parentPointer);
                        });

                        it('should add the component to the full JSON at the specified index', function() {
                            this.fullJsonUpdater.onPush(this.pointerToPushNewComp, this.compToPush, this.compPointer, 1);

                            expect(this.fullJsonDal.get(this.pointerToPushNewComp)[1]).toEqual(this.compToPush);
                        });

                        it('should add the component to the full JSON without modes property', function() {
                            this.fullJsonUpdater.onPush(this.pointerToPushNewComp, this.compToPush, this.compPointer, 0);

                            expect(this.fullJsonDal.get(this.pointerToPushNewComp)[0].modes).not.toBeDefined();
                        });
                    });

                    describe('when there are active modes', function() {

                        beforeEach(function () {
                            this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                            setActiveModesInPage.call(this, this.pageId, {mode1: true});
                        });

                        describe('when the component does not exist in the full json', function () {
                            beforeEach(function () {
                                this.fullJsonDal.remove(this.compPointer);
                                var parentPointer = getComponent(this.pointers, 'container1', this.pageId);
                                this.fullJsonDal.merge(parentPointer, {
                                    modes: {
                                        definitions: [{
                                            modeId: 'mode1'
                                        }]
                                    }
                                });
                                this.pointerToPushNewComp = this.pointers.components.getChildrenContainer(parentPointer);
                            });

                            it('should add the component to the full json with isHiddenByModes true', function () {
                                var comp = {
                                    id: 'child',
                                    blabla: 'comp2',
                                    blabla2: '#1',
                                    layout: {
                                        y: 20
                                    }
                                };
                                var newCompPointer = {
                                    id: 'child',
                                    type: 'DESKTOP'
                                };

                                this.fullJsonUpdater.onPush(this.pointerToPushNewComp, comp, newCompPointer);

                                var updatedChildrenOfParent = this.fullJsonDal.get(this.pointerToPushNewComp);
                                var compInJson = _.last(updatedChildrenOfParent);

                                expect(compInJson.id).toEqual(comp.id);
                                expect(compInJson.layout).toEqual(comp.layout);
                                expect(compInJson.modes.isHiddenByModes).toEqual(true);
                            });

                            it('should add the component to the full json with isHiddenByModes true, in the right position', function () {
                                var comp = {
                                    id: 'child2',
                                    blabla: 'comp2',
                                    blabla2: '#1',
                                    layout: {
                                        y: 20
                                    }
                                };
                                var newCompPointer = {
                                    id: 'child2',
                                    type: 'DESKTOP'
                                };

                                this.fullJsonUpdater.onPush(this.pointerToPushNewComp, comp, newCompPointer, 0);

                                var updatedChildrenOfParent = this.fullJsonDal.get(this.pointerToPushNewComp);
                                var compInJson = _.first(updatedChildrenOfParent);

                                expect(compInJson.id).toEqual(comp.id);
                                expect(compInJson.layout).toEqual(comp.layout);
                                expect(compInJson.modes.isHiddenByModes).toEqual(true);
                            });

                            it('should create an override for the component with isHiddenByModes false', function () {
                                var comp = {
                                    id: 'child2',
                                    blabla: 'comp2',
                                    blabla2: '#1',
                                    layout: {
                                        y: 20,
                                        randomLayoutProperty: 'Value'
                                    }
                                };
                                var newCompPointer = {
                                    id: 'child2',
                                    type: 'DESKTOP'
                                };

                                this.fullJsonUpdater.onPush(this.pointerToPushNewComp, comp, newCompPointer);

                                var compInJson = this.fullJsonDal.get(newCompPointer);
                                expect(compInJson.modes.overrides[0].isHiddenByModes).toEqual(false);
                                expect(compInJson.modes.isHiddenByModes).toEqual(true);
                            });
                        });
                    });
                });
            });
        });

        describe('onRemove', function () {

            beforeEach(function() {
                this.pageId = 'mainPage';
            });

            describe('when value is a page', function () {
                it('should throw an exception', function () {
                    var pagePointer = this.pointers.page.getPagePointer(this.pageId);

                    var setMethod = function () {
                        this.fullJsonUpdater.onRemove(pagePointer);
                    }.bind(this);

                    expect(setMethod).toThrow();
                });
            });

            describe('when there are no active modes', function () {
                it('should remove value from full json', function () {
                    var compPointer = getComponent(this.pointers, 'child', this.pageId);
                    var compBeforeRemove = this.fullJsonDal.get(compPointer);

                    this.fullJsonUpdater.onRemove(compPointer);

                    expect(compBeforeRemove).toBeDefined();
                    expect(this.fullJsonDal.get(compPointer)).not.toBeDefined();
                });
            });

            describe('when there are active modes', function () {
                beforeEach(function () {
                    var pagePointer = this.pointers.components.getPage(this.pageId, 'DESKTOP');
                    this.fullJsonDal.merge(pagePointer, {
                        modes: {
                            definitions: [{
                                modeId: 'mode1',
                                type: utils.siteConstants.COMP_MODES_TYPES.DEFAULT
                            }, {
                                modeId: 'mode2',
                                type: utils.siteConstants.COMP_MODES_TYPES.HOVER
                            }]
                        }
                    });
                    setActiveModesInPage.call(this, this.pageId, {mode1: true});
                });

                describe('when deleted item is a component', function () {
                    beforeEach(function () {
                        this.compPointer = getComponent(this.pointers, 'child', this.pageId);
                    });
                    describe('when component is displayed in regular or some other mode', function () {
                        it('should add isHiddenByModes true to the current active mode', function () {
                            this.fullJsonUpdater.onRemove(this.compPointer);
                            var updatedComponent = this.fullJsonDal.get(this.compPointer);

                            expect(updatedComponent).toBeDefined();
                            expect(updatedComponent.modes.overrides[0].isHiddenByModes).toEqual(true);
                        });

                        it('should create an override for the current active mode, if it does not exist, and there are other overrides', function(){
                            var parentPointer = this.pointers.components.getParent(this.compPointer);
                            var parentModeDefinitionsPointer = this.pointers.componentStructure.getModesDefinitions(parentPointer);
                            var parentModeDefinitions = this.fullJsonDal.get(parentModeDefinitionsPointer);

                            var activeModesPointer = this.pointers.general.getActiveModes();
                            var activeModes = this.displayedJsonDal.get(activeModesPointer);
                            activeModes[this.pageId][parentModeDefinitions[0].modeId] = true;
                            this.displayedJsonDal.set(activeModesPointer, activeModes);
                            var compLayoutPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                            this.fullJsonUpdater.onSet(compLayoutPointer, {x: 50, y:100});

                            activeModes[this.pageId][parentModeDefinitions[0].modeId] = false;
                            activeModes[this.pageId][parentModeDefinitions[1].modeId] = true;
                            this.displayedJsonDal.set(activeModesPointer, activeModes);
                            this.fullJsonUpdater.onRemove(this.compPointer);

                            var updatedComponent = this.fullJsonDal.get(this.compPointer);
                            expect(updatedComponent).toBeDefined();
                            expect(updatedComponent.modes.overrides[0].isHiddenByModes).toBeFalsy();
                            expect(updatedComponent.modes.overrides[1].isHiddenByModes).toEqual(true);
                        });
                    });

                    describe('when current mode is the only mode where the component is displayed', function () {
                        beforeEach(function () {
                            var layoutPointer = this.pointers.getInnerPointer(this.compPointer, 'layout');
                            setActiveModesInPage.call(this, this.pageId, {mode1: false, mode2: true});
                            this.fullJsonUpdater.onSet(layoutPointer, {x: 100, y: 200}); //create override
                            this.fullJsonUpdater.onRemove(this.compPointer);
                            setActiveModesInPage.call(this, this.pageId, {mode1: true, mode2: false});
                            this.fullJsonUpdater.onSet(layoutPointer, {x: 100, y: 200}); //create override
                        });

                        it('should delete the component from the full json', function () {
                            var compBefore = this.fullJsonDal.get(this.compPointer);
                            this.fullJsonUpdater.onRemove(this.compPointer);
                            var updatedComponent = this.fullJsonDal.get(this.compPointer);

                            expect(compBefore).toBeDefined();
                            expect(updatedComponent).not.toBeDefined();
                        });
                    });

                    describe('when the component is displayed when no modes are active', function () {
                        it('should delete the component from the full json, if it is not displayed in any possible mode of parent', function () {
                            setActiveModesInPage.call(this, 'mainPage', {mode1: true, mode2: false});
                            this.fullJsonUpdater.onRemove(this.compPointer);

                            setActiveModesInPage.call(this, 'mainPage', {mode1: false, mode2: true});
                            this.fullJsonUpdater.onRemove(this.compPointer);

                            var updatedComponent = this.fullJsonDal.get(this.compPointer);
                            expect(updatedComponent).not.toBeDefined();
                        });
                    });

                    describe('when the component is not displayed when no modes are active', function () {
                        beforeEach(function(){
                            var modesPointer = this.pointers.componentStructure.getModes(this.compPointer);
                            this.fullJsonDal.set(modesPointer, {
                                isHiddenByModes: true,
                                definitions: [],
                                overrides: []
                            });
                        });
                        it('should delete the component from the full json, if no mode explicitly displays component', function () {
                            setActiveModesInPage.call(this, 'mainPage', {mode1: true, mode2: false});

                            this.fullJsonUpdater.onRemove(this.compPointer);

                            var updatedComponent = this.fullJsonDal.get(this.compPointer);
                            expect(updatedComponent).not.toBeDefined();
                        });
                    });
                });

                describe('when deleted item is not a component', function () {
                    it('should remove value from full json', function () {

                        expect(true).toEqual(true);
                    });
                });
            });
        });

        describe('when updating values outside of pagesData', function () {
            beforeEach(function () {
                this.pointer = this.pointers.general.getEditorData();
            });

            it('should throw onSet', function () {
                var setMethod = function () {
                    this.fullJsonUpdater.onSet(this.pointer, {shtut: 'gmura'});
                }.bind(this);

                expect(setMethod).toThrow();
            });

            it('should throw onPush', function () {
                var pushMethod = function () {
                    this.fullJsonUpdater.onPush(this.pointer, {shtut: 'gmura'});
                }.bind(this);


                expect(pushMethod).toThrow();
            });

            it('should throw onMerge', function () {
                var mergeMethod = function () {
                    this.fullJsonUpdater.onMerge(this.pointer, {shtut: 'gmura'});
                }.bind(this);

                expect(mergeMethod).toThrow();
            });

            it('should throw onRemove', function () {
                var removeMethod = function () {
                    this.fullJsonUpdater.onRemove(this.pointer);
                }.bind(this);

                expect(removeMethod).toThrow();
            });
        });

        describe('Partials experiments', function() {

            function getDataPointer(compPointer, pageId) {
                var dataQuery = this.fullJsonDal.get(compPointer).dataQuery;
                return this.pointers.data.getDataItem(dataQuery, pageId);
            }

            function getPropertiesPointer(compPointer, pageId) {
                var propQuery = this.fullJsonDal.get(compPointer).propertyQuery;
                return this.pointers.data.getPropertyItem(propQuery, pageId, compPointer);
            }

            function getDesignPointer(compPointer, pageId) {
                var designQuery = this.fullJsonDal.get(compPointer).designQuery;
                var designId = designQuery ? designQuery.substr(1) : null;
                return this.pointers.data.getDesignItem(designId, pageId, compPointer);
            }

            beforeEach(function() {
                openExperiments(['sv_hoverBox']);
                this.pageId = 'mainPage';
                var pageComps = getPageComps();
                this.basePropertiesItem = {
                    id: 'propQuery-innerChild1',
                    type: 'some-type',
                    property1: 'base-prop1',
                    property2: 'base-prop2'
                };
                this.baseDesignItem = {
                    id: 'designQuery-innerChild1',
                    type: 'MockSchemaType1',
                    property1: 'base-design-prop1',
                    property2: 'base-design-prop2'
                };
                initWithPageComps.call(this, pageComps, [this.basePropertiesItem], [this.baseDesignItem]);
            });

            describe('onSet', function() {
                describe('when data pointer is to "design"', function() {

                    beforeEach(function() {
                        PropertiesSchemas.MockPropertiesSchemaType = {allOf: [{properties: {}}]};
                        DesignSchemas.MockSchemaType = {properties: {}};
                        this.child1Pointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                    });

                    describe('when there are no active modes', function() {
                        it('should set the passed value to the design item, replacing the existing one if exists', function() {
                            var newDesignData = {
                                property5: 'some-other-design-data',
                                type: 'MockSchemaType1'
                            };
                            var designDataPointer = getDesignPointer.call(this, this.child1Pointer, this.pageId);

                            this.fullJsonUpdater.onSet(designDataPointer, newDesignData);

                            expect(this.fullJsonDal.get(designDataPointer)).toEqual(newDesignData);
                        });
                    });

                    describe('when there are active modes', function() {

                        describe('when there are NO existing design partials on the component matching the active modes', function() {

                            beforeEach(function() {
                                this.designDataPointer = getDesignPointer.call(this, this.child1Pointer, this.pageId);
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: true});
                            });

                            describe('when the design data value has no references', function() {
                                it('should not change the original design data item content except its ID', function() {
                                    var designDataWithoutRefs = {
                                        type: 'MockSchemaType',
                                        property1: 'design-override-1'
                                    };
                                    this.fullJsonUpdater.onSet(this.designDataPointer, designDataWithoutRefs);
                                    expect(this.fullJsonDal.get(this.designDataPointer)).toEqual(designDataWithoutRefs);

                                    var designDataOnStructurePointer = getDesignPointer.call(this, this.child1Pointer, this.pageId);
                                    function withoutID(obj) {
                                        return _.omit(obj, 'id');
                                    }
                                    var newDesignItem = this.fullJsonDal.get(designDataOnStructurePointer);
                                    expect(withoutID(newDesignItem)).toEqual(withoutID(this.baseDesignItem));
                                    expect(newDesignItem.id).not.toEqual(this.baseDesignItem.id);
                                });

                                it('should create new design partials item and set its query to the component override matching the active mode', function() {
                                    this.fullJsonUpdater.onSet(this.designDataPointer, {
                                        type: 'MockSchemaType',
                                        property1: 'design-override-1'
                                    });
                                    var child1ModesOverridesPointer = this.pointers.getInnerPointer(this.child1Pointer, ['modes', 'overrides']);
                                    var overrides = this.fullJsonDal.get(child1ModesOverridesPointer);
                                    var designOverride = _.first(overrides);

                                    expect(designOverride).toEqual({
                                        modeIds: ['modeForDesign'],
                                        designQuery: jasmine.any(String)
                                    });
                                    expect(designOverride.designQuery).not.toEqual(this.designDataPointer.id);
                                });

                                it('should create new design partials item and set it to the page data', function() {
                                    var partialDesignItem = {
                                        type: 'MockSchemaType',
                                        property2: 'design-override-2',
                                        booboo: 'kuku-override!'
                                    };
                                    this.fullJsonUpdater.onSet(this.designDataPointer, partialDesignItem);
                                    var child1ModesOverridesPointer = this.pointers.getInnerPointer(this.child1Pointer, ['modes', 'overrides']);
                                    var modeOverrides = _.first(this.fullJsonDal.get(child1ModesOverridesPointer));
                                    expect(modeOverrides.modeIds).toEqual(['modeForDesign']);

                                    var partialDesignQuery = modeOverrides.designQuery.substr(1);
                                    var designPartialItemPointer = this.pointers.data.getDesignItem(partialDesignQuery, this.pageId);

                                    expect(this.fullJsonDal.get(designPartialItemPointer)).toEqual(_.assign({}, partialDesignItem, {id: jasmine.any(String)}));
                                });
                            });

                            describe('when the design data value has references', function() {

                                function addMockTypesToDesignSchemas() {
                                    DesignSchemas.MockSchemaType1 = {
                                        'properties': {
                                            'propRef': {'type': ['string', 'null'], 'pseudoType': ['ref']}
                                        }
                                    };
                                    DesignSchemas.MockSchemaType2 = {properties: {}};
                                }

                                function addDesignItemToBeReferredToDAL() {
                                    this.referredDesignItem = {
                                        type: 'MockSchemaType2',
                                        id: 'design-item-2',
                                        propSimple: 'deepValue'
                                    };

                                    this.refDataPointer = this.pointers.data.getDesignItem(this.referredDesignItem.id, this.pageId);
                                    this.fullJsonDal.set(this.refDataPointer, this.referredDesignItem);
                                }

                                function createDesignItemWithRef() {
                                    return {
                                        id: 'designQuery-innerChild1',
                                        type: 'MockSchemaType1',
                                        propSimple: 'value',
                                        propRef: '#design-item-2'
                                    };
                                }

                                beforeEach(function() {
                                    addMockTypesToDesignSchemas();
                                    addDesignItemToBeReferredToDAL.call(this);
                                    this.designDataWithRefs = createDesignItemWithRef();
                                    this.designDataPointer = getDesignPointer.call(this, this.child1Pointer, this.pageId);
                                    setActiveModesInPage.call(this, 'mainPage', {'modeForDesign': true});
                                });

                                it('should not change the design item referenced from the structure of the component', function() {
                                    var existingDesignDataItem = this.fullJsonDal.get(this.designDataPointer);
                                    expect(existingDesignDataItem).toEqual(this.baseDesignItem);
                                    expect(existingDesignDataItem).not.toEqual(_.assign({}, this.designDataWithRefs, {id: jasmine.any(String)}));

                                    this.fullJsonUpdater.onSet(this.designDataPointer, this.designDataWithRefs);

                                    expect(this.fullJsonDal.get(this.designDataPointer)).toEqual(this.designDataWithRefs);
                                });

                                it('should clone the entire data item chain from the set design item', function() {
                                    this.fullJsonUpdater.onSet(this.designDataPointer, this.designDataWithRefs);

                                    expect(this.fullJsonDal.get(this.designDataPointer)).not.toEqual(this.baseDesignItem);

                                    var childOverridesPointer = this.pointers.componentStructure.getModesOverrides(this.child1Pointer);
                                    var designItemOverridePointer = this.pointers.getInnerPointer(childOverridesPointer, [0, 'designQuery']);
                                    var ovrDesignItemQuery = this.fullJsonDal.get(designItemOverridePointer);
                                    var ovrDesignItemPointer = this.pointers.data.getDesignItem(ovrDesignItemQuery.substr(1), this.pageId);
                                    var ovrDesignItemInDal = this.fullJsonDal.get(ovrDesignItemPointer);

                                    expect(ovrDesignItemInDal).toEqual(this.designDataWithRefs);

                                    var newReferredItemPointer = this.pointers.data.getDesignItem(ovrDesignItemInDal.propRef.replace('#', ''), this.pageId);
                                    expect(this.fullJsonDal.get(newReferredItemPointer)).toEqual(this.referredDesignItem);
                                });
                            });
                        });

                        describe('when there are already existing design partials on the component matching the active modes', function() {

                            beforeEach(function() {
                                this.designDataPointer = getDesignPointer.call(this, this.child1Pointer, this.pageId);
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: true});
                                this.fullJsonUpdater.onSet(this.designDataPointer, {
                                    type: 'MockSchemaType',
                                    property1: 'design-override-1'
                                });
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: false});
                            });

                            it('should merge the set partials with the existing design item to the data', function() {
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: true});

                                this.fullJsonUpdater.onSet(this.designDataPointer, {
                                    type: 'MockSchemaType',
                                    property2: 'design-override-2'
                                });

                                expect(this.fullJsonDal.get(this.designDataPointer)).toEqual({
                                    id: this.designDataPointer.id,
                                    type: 'MockSchemaType',
                                    property1: 'design-override-1',
                                    property2: 'design-override-2'
                                });
                            });
                        });
                    });
                });

                describe('when data pointer is to "properties"', function() {
                    describe('when there are no active modes', function() {
                        it('should set the passed value to the properties item on the page as usual', function() {
                            this.compPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                            var propertyDataPointer = getPropertiesPointer.call(this, this.compPointer, this.pageId);
                            var newData = {
                                property1: 'prop1-value',
                                property2: 'prop2-value',
                                type: 'prop-type'
                            };

                            this.fullJsonUpdater.onSet(propertyDataPointer, newData);

                            expect(this.fullJsonDal.get(propertyDataPointer)).toEqual(newData);
                        });
                    });

                    describe('when there are active modes', function() {

                        beforeEach(function() {
                            this.compPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                            this.propertyDataPointer = getPropertiesPointer.call(this, this.compPointer, this.pageId);
                            setActiveModesInPage.call(this, 'mainPage', {"container-abc-mode": true});
                        });

                        describe('when there are NO existing partials for corresponding component overrides on modes', function() {
                            it('should write the propertiesQuery of the existing property item to the modes.overrides of the component, corresponding ancestor active modes', function() {
                                var overridingProperties = {
                                    property1: 'prop1-new-value',
                                    property4: 'prop4-value'
                                };

                                this.fullJsonUpdater.onSet(this.propertyDataPointer, overridingProperties);

                                var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                                expect(this.fullJsonDal.get(overridesPointer).length).toBe(1);
                                expect(this.fullJsonDal.get(overridesPointer)[0]).toEqual({
                                    modeIds: ['container-abc-mode'],
                                    propertyQuery: this.propertyDataPointer.id
                                });
                            });

                            it('should create a new property item with the overriding data.', function() {
                                var overridingPropertiesItem = {
                                    property2: 'prop2-new-value',
                                    property4: 'prop4-value',
                                    type: 'some-type'
                                };

                                this.fullJsonUpdater.onSet(this.propertyDataPointer, overridingPropertiesItem);

                                var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                                var partialPropertiesItemQuery = this.fullJsonDal.get(overridesPointer)[0].propertyQuery;
                                var partialPropertiesItemId = partialPropertiesItemQuery.replace('#', '');
                                var partialPropertiesPointer = this.pointers.data.getPropertyItem(partialPropertiesItemId, this.pageId);
                                expect(this.fullJsonDal.get(partialPropertiesPointer)).toEqual(overridingPropertiesItem);
                            });
                        });

                        describe('when there are already existing partials, for corresponding component overrides on modes', function() {

                            beforeEach(function() {
                                this.existingPartialProperties = {
                                    id: 'id-123',
                                    property2: 'prop2-new-value',
                                    property4: 'prop4-value',
                                    type: 'MockPropertiesSchemaType'
                                };

                                setActiveModesInPage.call(this, 'mainPage', {"container-abc-mode": true});
                                this.fullJsonUpdater.onSet(this.propertyDataPointer, this.existingPartialProperties);
                                setActiveModesInPage.call(this, 'mainPage', {"container-abc-mode": false});
                            });

                            describe('when modes are active and match existing overrides', function() {
                                it('should *Merge* the new properties diff to the corresponding existing overriding properties item', function() {
                                    setActiveModesInPage.call(this, 'mainPage', {"container-abc-mode": true});
                                    var partialProperties = {
                                        id: 'id-234',
                                        property4: 'a-new-overriding-value',
                                        type: 'MockPropertiesSchemaType'
                                    };

                                    this.fullJsonUpdater.onSet(this.propertyDataPointer, partialProperties);

                                    var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                                    var partialPropertiesItemQuery = this.fullJsonDal.get(overridesPointer)[0].propertyQuery;
                                    var partialPropertiesItemId = partialPropertiesItemQuery.replace('#', '');
                                    var partialPropertiesPointer = this.pointers.data.getPropertyItem(partialPropertiesItemId, this.pageId);
                                    var expectedProperties = _.assign({}, this.existingPartialProperties, _.omit(partialProperties, 'id'));
                                    expect(this.fullJsonDal.get(partialPropertiesPointer)).toEqual(expectedProperties);
                                });
                            });

                            describe('when modes are NOT active', function() {
                                it('should update the base properties item as usual (and verify overrides didnt change)', function() {
                                    var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                                    var partialPropertiesItemQuery = this.fullJsonDal.get(overridesPointer)[0].propertyQuery;
                                    var partialPropertiesPointer = this.pointers.data.getPropertyItem(partialPropertiesItemQuery, this.pageId);
                                    var partialPropertiesBefore = this.fullJsonDal.get(partialPropertiesPointer);

                                    setActiveModesInPage.call(this, 'mainPage', {"container-abc-mode": false});

                                    var partialProperties = {
                                        property4: 'a-new-partial-value',
                                        type: 'some-type2'
                                    };

                                    var propertyDataPointer = getPropertiesPointer.call(this, this.compPointer, this.pageId);
                                    this.fullJsonUpdater.onSet(propertyDataPointer, partialProperties);

                                    expect(this.fullJsonDal.get(partialPropertiesPointer)).toEqual(partialPropertiesBefore);
                                    expect(this.fullJsonDal.get(propertyDataPointer)).toEqual(partialProperties);
                                });
                            });
                        });
                    });
                });

                describe('when pointer is to "data"', function() {

                    beforeEach(function() {
                        this.compPointer = getComponent(this.pointers, 'innerChild1', 'mainPage');
                        this.dataItemPointer = getDataPointer.call(this, this.compPointer, 'mainPage');
                        this.newData = {
                            data1: 'data1-value',
                            data2: 'data2-value',
                            data3: 'data3-value'
                        };
                    });

                    describe('when there are no active modes', function() {
                        it('should set the data to the "data" item regularly without partials on the page', function() {
                            this.fullJsonUpdater.onSet(this.dataItemPointer, this.newData);

                            expect(this.fullJsonDal.get(this.dataItemPointer)).toEqual(this.newData);
                        });
                    });

                    describe('when there are active modes', function() {
                        it('should set the data to the "data" item regularly without partials on the page', function() {
                            setActiveModesInPage.call(this, 'mainPage', {hoverMode: true});

                            this.fullJsonUpdater.onSet(this.dataItemPointer, this.newData);

                            expect(this.fullJsonDal.get(this.dataItemPointer)).toEqual(this.newData);
                        });
                    });
                });
            });

            describe('onMerge', function() {

                beforeEach(function() {
                    PropertiesSchemas.MockPropertiesSchemaType = {allOf: [{properties: {
                        refProperty: {"type": ["string", "null"], "pseudoType": ["ref"]}
                    }}]};
                    DesignSchemas.MockSchemaType = {properties: {}};
                    this.compPointer = getComponent(this.pointers, 'innerChild1', this.pageId);
                });

                describe('when there are NO active modes', function() {
                    describe('when pointer is to properties data', function() {

                        beforeEach(function() {
                            this.propertyDataPointer = getPropertiesPointer.call(this, this.compPointer, this.pageId);
                        });

                        it('should merge the properties data as usual to the default property item pointed from the structure', function () {
                            var propertiesToMerge = {
                                id: 'propQuery-innerChild1',
                                property1: 'hello',
                                property2: 'base-prop2',
                                property3: 'merge',
                                type: 'some-type'
                            };
                            expect(this.fullJsonDal.get(this.propertyDataPointer)).not.toEqual(propertiesToMerge);

                            this.fullJsonUpdater.onMerge(this.propertyDataPointer, propertiesToMerge);

                            expect(this.fullJsonDal.get(this.propertyDataPointer)).toEqual(propertiesToMerge);
                        });
                    });

                    describe('when pointer is to design data', function() {

                        beforeEach(function() {
                            this.designDataPointer = getDesignPointer.call(this, this.compPointer, this.pageId);
                        });

                        it('should merge the design data as usual to the default design item pointed from the structure', function () {
                            var designToMerge = {
                                id: 'designQuery-innerChild1',
                                property1: 'hello',
                                property2: 'base-prop2',
                                zz: 'top rocks!',
                                type: 'some-design-type'
                            };
                            expect(this.fullJsonDal.get(this.designDataPointer)).toEqual(this.baseDesignItem);
                            expect(this.fullJsonDal.get(this.designDataPointer)).not.toEqual(designToMerge);

                            this.fullJsonUpdater.onMerge(this.designDataPointer, designToMerge);

                            expect(this.fullJsonDal.get(this.designDataPointer)).toEqual(designToMerge);
                        });
                    });
                });

                describe('when there are active modes', function() {
                    describe('when pointer is to properties data', function() {

                        beforeEach(function() {
                            this.propertyDataPointer = getPropertiesPointer.call(this, this.compPointer, this.pageId);
                            setActiveModesInPage.call(this, 'mainPage', {});
                        });

                        describe('when there are no pre-existing overrides', function () {
                            it('should throw an exception', function () {
                                var propertiesToMerge = {
                                    id: 'propQuery-innerChild1',
                                    property1: 'hello',
                                    type: 'some-type'
                                };
                                setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': true});

                                var fn = this.fullJsonUpdater.onMerge.bind(this.fullJsonUpdater, this.propertyDataPointer, propertiesToMerge);
                                expect(fn).toThrow(new Error('Can\'t merge value to non-existent properties overrides.'));
                            });
                        });

                        describe('when there are already existing overrides for mode', function () {

                            function initPropertiesPartials(isItemWithDeepReference) {
                                setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': true});
                                var partialPropertiesToSet;
                                if (!isItemWithDeepReference) {
                                    partialPropertiesToSet = {
                                        id: 'propQuery-innerChild1',
                                        property1: 'partials-from-set',
                                        type: 'MockPropertiesSchemaType'
                                    };
                                } else {
                                    var refedPointer = this.pointers.data.getPropertyItem('referenced-propItem-id', this.pageId);
                                    this.fullJsonDal.set(refedPointer, {
                                        id: 'referenced-propItem-id',
                                        foo: 'BAR',
                                        type: 'MockPropertiesSchemaType'
                                    });
                                    partialPropertiesToSet = {
                                        id: 'propQuery-innerChild1',
                                        refProperty: '#referenced-propItem-id',
                                        type: 'MockPropertiesSchemaType'
                                    };
                                }
                                this.fullJsonUpdater.onSet(this.propertyDataPointer, partialPropertiesToSet);
                                setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': false});

                                var overridesPointer = this.pointers.componentStructure.getModesOverrides(this.compPointer);
                                var partialPropertiesItemQuery = this.fullJsonDal.get(overridesPointer)[0].propertyQuery;
                                var partialPropertiesItemId = partialPropertiesItemQuery.replace('#', '');
                                this.partialPropertiesPointer = this.pointers.data.getPropertyItem(partialPropertiesItemId, this.pageId);
                            }

                            describe('when the properties overrides has no references to other property item (it has only shallow values)', function() {
                                beforeEach(function () {
                                    initPropertiesPartials.call(this, false);
                                });

                                it('should merge the properties diff to the correct existing overrides partials for active modes', function () {
                                    var propertiesToMerge = {
                                        id: 'propQuery-innerChild1',
                                        property1: 'partials-from-merge1',
                                        property2: 'partials-from-merge2',
                                        type: 'MockPropertiesSchemaType'
                                    };

                                    var existingPropertyItem = this.fullJsonDal.get(this.partialPropertiesPointer);
                                    expect(existingPropertyItem).not.toEqual(propertiesToMerge);

                                    setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': true});
                                    this.fullJsonUpdater.onMerge(this.propertyDataPointer, propertiesToMerge);

                                    expect(this.fullJsonDal.get(this.propertyDataPointer)).not.toEqual(this.basePropertiesItem);
                                    expect(this.fullJsonDal.get(this.partialPropertiesPointer)).toEqual(_.assign({}, existingPropertyItem, _.omit(propertiesToMerge, 'id')));
                                });
                            });

                            describe('when the properties overrides reference another property item, which is the one changed', function() {
                                beforeEach(function () {
                                    initPropertiesPartials.call(this, true);
                                });

                                it('should merge the value, to the referenced(/nested) item of the overriding properties item', function() {
                                    setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': true});

                                    this.propertyDataPointer.refPath = ['refProperty'];
                                    var valueToMerge = {
                                        id: 'new-generated-id',
                                        foo: 'BUZZ',
                                        type: 'MockPropertiesSchemaType'
                                    };

                                    this.fullJsonUpdater.onMerge(this.propertyDataPointer, valueToMerge);

                                    var referencedPropertyPointer = this.pointers.data.getPropertyItem('referenced-propItem-id', this.pageId);
                                    expect(this.fullJsonDal.get(referencedPropertyPointer)).toEqual(_.assign({}, valueToMerge, {id: jasmine.any(String)}));
                                });
                            });
                        });
                    });

                    describe('when pointer is to design data', function() {
                        beforeEach(function() {
                            this.designDataPointer = getDesignPointer.call(this, this.compPointer, this.pageId);
                            setActiveModesInPage.call(this, 'mainPage', {});
                        });

                        describe('when there are NO pre-existing partials', function() {
                            it('should throw an exception', function() {
                                var designPropsToMerge = {
                                    property1: 'booboo'
                                };

                                setActiveModesInPage.call(this, 'mainPage', {'container-abc-mode': true});

                                var fn = this.fullJsonUpdater.onMerge.bind(this.fullJsonUpdater, this.designDataPointer, designPropsToMerge);
                                expect(fn).toThrow(new Error('Can\'t merge value to non-existent design overrides.'));
                            });
                        });

                        describe('when there are pre-existing partials', function() {

                            beforeEach(function() {
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: true});
                                this.fullJsonUpdater.onSet(this.designDataPointer, {property1: 'juju', property2: 15, type: 'MockSchemaType'});
                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: false});
                            });

                            it('should merge the given value to the existing partials item', function() {
                                var designPropsToMerge = {
                                    type: 'MockSchemaType',
                                    property1: 'booboo'
                                };

                                setActiveModesInPage.call(this, 'mainPage', {modeForDesign: true});
                                this.fullJsonUpdater.onMerge(this.designDataPointer, designPropsToMerge);

                                var modesOverride = this.fullJsonDal.get(this.pointers.componentStructure.getModesOverrides(this.compPointer))[0];
                                var designQuery = modesOverride.designQuery.substr(1);
                                var partialDesignPointer = this.pointers.data.getDesignItem(designQuery, this.pageId);
                                expect(modesOverride.modeIds).toEqual(['modeForDesign']);
                                expect(this.fullJsonDal.get(partialDesignPointer)).toEqual({
                                    id: jasmine.any(String),
                                    property1: 'booboo',
                                    property2: 15,
                                    type: 'MockSchemaType'
                                });
                            });
                        });
                    });
                });

                describe('when data pointer is NOT to properties data', function() {

                    beforeEach(function() {
                        spyOn(this.fullJsonDal, 'getPointerJsonType').and.returnValue(constants.JSON_TYPES.FULL);
                        spyOn(this.fullJsonDal, 'merge');
                        this.pointerTypesToCheck = ['data', 'theme', 'general'];
                    });

                    it('should merge the value to the base (not partials) to the full dal even when there are active modes', function() {
                        setActiveModesInPage.call(this, 'mainPage', {someActiveModeId: true});
                        _.forEach(this.pointerTypesToCheck, function(pointerType) {
                            var pointerToBaseAndNotToPartialsItem = {type: pointerType, id: 'a-random-pointer-id'};
                            var value = {
                                'kiki': 'vivi'
                            };

                            this.fullJsonUpdater.onMerge(pointerToBaseAndNotToPartialsItem, value);

                            expect(this.fullJsonDal.merge).toHaveBeenCalledWith(pointerToBaseAndNotToPartialsItem, value);
                        }, this);
                    });
                });
            });
        });
    });
});
