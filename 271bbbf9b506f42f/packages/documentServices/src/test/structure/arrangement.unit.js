define(['testUtils',
        'lodash',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/constants/constants',
        'documentServices/hooks/hooks',
        'documentServices/component/component',
        'documentServices/component/componentsDefinitionsMap',
        'documentServices/structure/utils/arrangement'],
    function (testUtils,
              _,
              privateServicesHelper,
              constants,
              hooks,
              component,
              componentsDefinitionsMap,
              arrangement) {
        'use strict';

        var controllerType = 'platform.components.AppController';
        var compType = 'wysiwyg.viewer.components.SiteButton';

        function getCompPointer(ps, compId, pageId) {
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        function getChildrenComps(ps, childrenPointers) {
            return _.map(childrenPointers, function (childPointer) {
                return ps.dal.get(childPointer);
            });
        }

        function createSiteButtonWithOverrides(buttonId, activeModeId) {
            return {
                'id': buttonId,
                'type': 'Component',
                'skin': 'wysiwyg.viewer.skins.button.BasicButton',
                'layout': {
                    'width': 142,
                    'height': 40,
                    'x': 20,
                    'y': 15
                },
                'componentType': 'wysiwyg.viewer.components.SiteButton',
                'data': {
                    'type': 'LinkableButton',
                    'label': 'Contact Us'
                },
                'props': {
                    'type': 'ButtonProperties',
                    'align': 'center',
                    'margin': 0
                },
                'style': 'b1',
                'modes': {
                    'isHiddenByModes': true,
                    'overrides': [{
                        'modeIds': [activeModeId],
                        'isHiddenByModes': false
                    }]
                }
            };
        }

        function createComponentWithModes(compId) {
            var regularModeId = compId + "-regular";
            var hoverModeId = compId + "-hover";
            return {
                id: compId,
                type: 'Component',
                componentType: 'wysiwyg.viewer.components.HoverBox',
                skin: "wysiwyg.viewer.skins.mediaContainer.DefaultMediaContainer",
                layout: {
                    x: Math.round(Math.random() * 1000), y: 0,
                    width: 300, height: 300
                },
                modes: {
                    definitions: [{
                        "modeId": regularModeId,
                        "type": "DEFAULT"
                    }, {
                        "modeId": hoverModeId,
                        "type": "HOVER"
                    }]
                },
                components: [createSiteButtonWithOverrides(compId + '-button1-', regularModeId),
                    createSiteButtonWithOverrides(compId + '-button2-', hoverModeId)]
            };
        }

        function createMockComp(componentType, data, properties) {
            var result = testUtils.mockFactory.createCompStructure(componentType, data, properties);
            result.compStructure.style = _(componentsDefinitionsMap[componentType].styles)
                .keys()
                .first();
            if (data) {
                result.compData.type = _.first(componentsDefinitionsMap[componentType].dataTypes);
            }
            if (properties) {
                result.compProps.type = componentsDefinitionsMap[componentType].propertyType;
            }
            return result;
        }

        function createValidCompDefinition(componentType, data, properties){
            var mockedComp = createMockComp(componentType, data, properties);
            return _.assign(mockedComp.compStructure, {
                data: mockedComp.compData,
                props: mockedComp.compProps
            });
        }

        describe('Arrange components order', function () {
            var privateServices, siteData;
            var childComps = [
                {id: 'first', data: 'someData1', layout: {}},
                {id: 'second', data: 'someData2', layout: {}},
                {id: 'third', data: 'someData3', layout: {}}
            ];
            beforeEach(function () {
                siteData = testUtils.mockFactory.mockSiteData();
                siteData.addPageWithDefaults('page1', [{
                    id: 'container',
                    data: 'containerData',
                    componentType: 'mobile.core.components.Container',
                    type: 'Container',
                    layout: {},
                    components: _.clone(childComps)
                }]);
                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('Should prevent most-forward child component from moving forward, and allow others', function () {
                var secondCanMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'second', 'page1'));
                var thirdCanMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'third', 'page1'));

                expect(secondCanMoveForward).toEqual(true);
                expect(thirdCanMoveForward).toEqual(false);

            });

            it('Should prevent most-forward child component from moving backwards, and allow others', function () {
                var firstCanMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'first', 'page1'));
                var thirdCanMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'third', 'page1'));

                expect(firstCanMoveBackward).toEqual(false);
                expect(thirdCanMoveBackward).toEqual(true);
            });

            it('should return false for page component when checking if comp can change DOM order', function () {
                var pagePointer = getCompPointer(privateServices, 'page1', 'page1');
                var canPageMoveBackward = arrangement.canMoveBackward(privateServices, pagePointer);
                var canPageMoveForward = arrangement.canMoveForward(privateServices, pagePointer);

                expect(canPageMoveBackward).toEqual(false);
                expect(canPageMoveForward).toEqual(false);
            });

            it('Should move the component to a lower index under it\'s parent components array and update viewer', function () {
                var childComponentsPointer, newChildComps;
                var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                arrangement.moveBackward(privateServices, getCompPointer(privateServices, 'third', 'page1'));
                childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                var actualOrder = _.pluck(newChildComps, 'id');
                expect(actualOrder).toEqual(['first', 'third', 'second']);

            });

            it('should trigger ARRANGEMENT.MOVE_AFTER after moving backwards with the old and new indices', function () {
                var hookFn = jasmine.createSpy('arrangement move-after hook');
                var childPtr = getCompPointer(privateServices, 'third', 'page1');
                hooks.registerHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, hookFn);

                arrangement.moveBackward(privateServices, childPtr);

                expect(hookFn).toHaveBeenCalledWith(privateServices, childPtr, 2, 1);
                hooks.unregisterAllHooks();
            });

            it('Should move the component to a higher index under it\'s parent components array and update viewer', function () {
                var childComponentsPointer, newChildComps;
                var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                arrangement.moveForward(privateServices, getCompPointer(privateServices, 'second', 'page1'));
                childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                var actualOrder = _.pluck(newChildComps, 'id');
                expect(actualOrder).toEqual(['first', 'third', 'second']);
            });

            it('should trigger ARRANGEMENT.MOVE_AFTER after moving forwards with the old and new indices', function () {
                var hookFn = jasmine.createSpy('arrangement move-after hook');
                var childPtr = getCompPointer(privateServices, 'second', 'page1');
                hooks.registerHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, hookFn);

                arrangement.moveForward(privateServices, childPtr);

                expect(hookFn).toHaveBeenCalledWith(privateServices, childPtr, 1, 2);
                hooks.unregisterAllHooks();
            });

            describe('moveToFront', function() {
                it('Should move the component to the last index under it\'s parent components array and update viewer', function () {
                    var childComponentsPointer, newChildComps;
                    var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                    arrangement.moveToFront(privateServices, getCompPointer(privateServices, 'first', 'page1'));
                    childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                    newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                    var actualOrder = _.pluck(newChildComps, 'id');
                    expect(actualOrder).toEqual(['second', 'third', 'first']);
                });

                it('should trigger ARRANGEMENT.MOVE_AFTER after moving to front with the old and new indices', function () {
                    var hookFn = jasmine.createSpy('arrangement move-after hook');
                    var childPtr = getCompPointer(privateServices, 'first', 'page1');
                    hooks.registerHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, hookFn);

                    arrangement.moveToFront(privateServices, childPtr);

                    expect(hookFn).toHaveBeenCalledWith(privateServices, childPtr, 0, 2);
                    hooks.unregisterAllHooks();
                });

                it('Should throw an error if component can\'t move forward and moveForward or moveToFront is called', function () {
                    var moveForward = arrangement.moveForward.bind(arrangement, privateServices, getCompPointer(privateServices, 'third', 'page1'));
                    var moveToFront = arrangement.moveToFront.bind(arrangement, privateServices, getCompPointer(privateServices, 'third', 'page1'));

                    expect(moveForward).toThrow();
                    expect(moveToFront).toThrow();
                });

                describe('when component has modes', function() {
                    beforeEach(function() {
                        this.pageId = 'page1';
                        this.pointers = privateServices.pointers;
                        var page = this.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                        this.pointerToPageComps = this.pointers.getInnerPointer(page, 'components');

                        var compWithModes = createComponentWithModes('comp-with-modes');
                        this.compPointer = this.pointers.components.getUnattached('comp-with-modes', constants.VIEW_MODES.DESKTOP);
                        privateServices.dal.full.push(this.pointerToPageComps, compWithModes, this.compPointer, 0);
                    });

                    it('should not be the only component in the page', function() {
                        expect(privateServices.dal.get(this.pointerToPageComps).length).toBeGreaterThan(1);
                    });

                    it('should move the component with modes to the front, and preserve the overrides of its children', function() {
                        var numberOfChildrenInParent = privateServices.dal.get(this.pointerToPageComps).length;

                        arrangement.moveToFront(privateServices, this.compPointer);

                        expect(privateServices.dal.get(this.pointerToPageComps)[numberOfChildrenInParent - 1].id).toEqual('comp-with-modes');
                        var compWithModesChildren = privateServices.dal.full.get(this.compPointer).components;
                        _.forEach(compWithModesChildren, function(child) {
                            expect(_.get(child, 'modes.overrides')).toBeDefined();
                        });
                    });
                });
            });

            describe('moveToBack', function() {

                it('Should move the component to the first index under it\'s parent components array and update viewer', function () {
                    var childComponentsPointer, newChildComps;
                    var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                    arrangement.moveToBack(privateServices, getCompPointer(privateServices, 'third', 'page1'));
                    childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                    newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                    var actualOrder = _.pluck(newChildComps, 'id');
                    expect(actualOrder).toEqual(['third', 'first', 'second']);
                });

                it('should trigger ARRANGEMENT.MOVE_AFTER after moving to back with the old and new indices', function () {
                    var hookFn = jasmine.createSpy('arrangement move-after hook');
                    var childPtr = getCompPointer(privateServices, 'third', 'page1');
                    hooks.registerHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, hookFn);

                    arrangement.moveToBack(privateServices, childPtr);

                    expect(hookFn).toHaveBeenCalledWith(privateServices, childPtr, 2, 0);
                    hooks.unregisterAllHooks();
                });

                it('Should throw an error if component can\'t move backward and moveBackward or moveToBack is called', function () {
                    var moveBackward = arrangement.moveBackward.bind(arrangement, privateServices, getCompPointer(privateServices, 'first', 'page1'));
                    var moveToBack = arrangement.moveToBack.bind(arrangement, privateServices, getCompPointer(privateServices, 'first', 'page1'));

                    expect(moveBackward).toThrow();
                    expect(moveToBack).toThrow();
                });

                describe('when component has modes', function() {
                    beforeEach(function() {
                        this.pageId = 'page1';
                        this.pointers = privateServices.pointers;
                        var page = this.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                        this.pointerToPageComps = this.pointers.getInnerPointer(page, 'components');

                        var compWithModes = createComponentWithModes('comp-with-modes');
                        this.compPointer = this.pointers.components.getUnattached('comp-with-modes', constants.VIEW_MODES.DESKTOP);
                        privateServices.dal.full.push(this.pointerToPageComps, compWithModes, this.compPointer);
                    });

                    it('should not be the only component in the page', function() {
                        expect(privateServices.dal.get(this.pointerToPageComps).length).toBeGreaterThan(1);
                    });

                    it('should move the component with modes to the front, and preserve the overrides of its children', function() {
                        expect(privateServices.dal.get(this.pointerToPageComps)[0].id).not.toEqual('comp-with-modes');

                        arrangement.moveToBack(privateServices, this.compPointer);

                        expect(privateServices.dal.get(this.pointerToPageComps)[0].id).toEqual('comp-with-modes');
                        var compWithModesChildren = privateServices.dal.full.get(this.compPointer).components;
                        _.forEach(compWithModesChildren, function(child) {
                            expect(_.get(child, 'modes.overrides')).toBeDefined();
                        });
                    });
                });
            });

            it('Should move the component to index under it\'s parent components array and update viewer', function () {
                var childComponentsPointer, newChildComps;
                var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                arrangement.moveToIndex(privateServices, getCompPointer(privateServices, 'third', 'page1'), 0);
                childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                var actualOrder = _.pluck(newChildComps, 'id');
                expect(actualOrder).toEqual(['third', 'first', 'second']);
            });

            it('Should move the component to index under it\'s parent components array and update viewer', function () {
                var childComponentsPointer, newChildComps;
                var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                arrangement.moveToIndex(privateServices, getCompPointer(privateServices, 'second', 'page1'), 2);
                childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                var actualOrder = _.pluck(newChildComps, 'id');
                expect(actualOrder).toEqual(['first', 'third', 'second']);
            });

            it('should trigger ARRANGEMENT.MOVE_AFTER after moving to specific index with the old and new indices', function () {
                var hookFn = jasmine.createSpy('arrangement move-after hook');
                var childPtr = getCompPointer(privateServices, 'third', 'page1');
                hooks.registerHook(hooks.HOOKS.ARRANGEMENT.MOVE_AFTER, hookFn);

                arrangement.moveToIndex(privateServices, childPtr, 0);

                expect(hookFn).toHaveBeenCalledWith(privateServices, childPtr, 2, 0);
                hooks.unregisterAllHooks();
            });

            it('Should throw an error if component can\'t move to index and moveToIndex is called', function () {
                var moveToSmallIndex = arrangement.moveToIndex.bind(arrangement, privateServices, getCompPointer(privateServices, 'third', 'page1'), -1);
                var moveToLargeIndex = arrangement.moveToIndex.bind(arrangement, privateServices, getCompPointer(privateServices, 'third', 'page1'), 3);
                var moveToUndefinedIndex = arrangement.moveToIndex.bind(arrangement, privateServices, getCompPointer(privateServices, 'third', 'page1'));

                expect(moveToSmallIndex).toThrow();
                expect(moveToLargeIndex).toThrow();
                expect(moveToUndefinedIndex).toThrow();
            });

            describe('when there are both fixed and non-fixed components', function () {
                beforeEach(function () {
                    childComps = [
                        {id: 'fixed1', layout: {fixedPosition: true}},
                        {id: 'nonFixed1', layout: {fixedPosition: false}},
                        {id: 'fixed2', layout: {fixedPosition: true}},
                        {id: 'nonFixed2', layout: {fixedPosition: false}}
                    ];
                    siteData = testUtils.mockFactory.mockSiteData();
                    siteData.addPageWithDefaults('page1', [{
                        id: 'container',
                        data: 'containerData',
                        componentType: 'mobile.core.components.Container',
                        type: 'Container',
                        layout: {},
                        children: childComps
                    }]);
                    privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });
                describe('moveForward', function () {
                    it('should move a fixed component in front of the next fixed component', function () {
                        var childComponentsPointer, newChildComps;
                        var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                        arrangement.moveForward(privateServices, getCompPointer(privateServices, 'fixed1', 'page1'));
                        childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                        newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                        var actualOrder = _.pluck(newChildComps, 'id');
                        expect(actualOrder).toEqual(['fixed2', 'nonFixed1', 'fixed1', 'nonFixed2']);
                    });

                    it('should move a nonFixed component in front of the next nonfixed component', function () {
                        var childComponentsPointer, newChildComps;
                        var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                        arrangement.moveForward(privateServices, getCompPointer(privateServices, 'nonFixed1', 'page1'));
                        childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                        newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                        var actualOrder = _.pluck(newChildComps, 'id');
                        expect(actualOrder).toEqual(['fixed1', 'nonFixed2', 'fixed2', 'nonFixed1']);
                    });

                });

                describe('canCompMoveForward', function () {
                    it('for a fixed component it should return true when there are more fixed components after it in the array', function () {

                        var canMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'fixed1', 'page1'));

                        expect(canMoveForward).toBe(true);
                    });

                    it('for a fixed component it should return false when there are no more fixed components after it in the array, even if there are nonFixed components after it', function () {

                        var canMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'fixed2', 'page1'));

                        expect(canMoveForward).toBe(false);
                    });

                    it('for a nonFixed component it should return true when there are more nonFixed components after it in the array', function () {

                        var canMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'nonFixed1', 'page1'));

                        expect(canMoveForward).toBe(true);
                    });

                    it('for a nonFixed component it should return false when there are no more nonFixed components after it in the array, even if there are fixed components after it', function () {

                        childComps.push({id: 'fixed3', layout: {fixedPosition: true}});
                        var canMoveForward = arrangement.canMoveForward(privateServices, getCompPointer(privateServices, 'nonFixed2', 'page1'));

                        expect(canMoveForward).toBe(false);
                    });
                });

                describe('moveBackward', function () {

                    describe('when the component has NO modes', function() {
                        it('should move a fixed component behind the next fixed component', function () {
                            var childComponentsPointer, newChildComps;
                            var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                            arrangement.moveBackward(privateServices, getCompPointer(privateServices, 'fixed2', 'page1'));
                            childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                            newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                            var actualOrder = _.pluck(newChildComps, 'id');
                            expect(actualOrder).toEqual(['fixed2', 'nonFixed1', 'fixed1', 'nonFixed2']);
                        });

                        it('should move a fixed component behind the first fixed component before it even if there are more than one fixed components before it', function () {
                            var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                            var containerChildrenPointer = privateServices.pointers.components.getChildrenContainer(containerPointer);
                            privateServices.dal.push(containerChildrenPointer, {id: 'fixed3', layout: {fixedPosition: true}});

                            arrangement.moveBackward(privateServices, getCompPointer(privateServices, 'fixed3', 'page1'));

                            var childComponentPointers = privateServices.pointers.components.getChildren(containerPointer);
                            var newChildComps = getChildrenComps(privateServices, childComponentPointers);
                            var actualOrder = _.pluck(newChildComps, 'id');
                            expect(actualOrder).toEqual(['fixed1', 'nonFixed1', 'fixed3', 'nonFixed2', 'fixed2']);
                        });


                        it('should move a nonFixed component behind the next nonfixed component', function () {
                            var childComponentsPointer, newChildComps;
                            var parentPointer = getCompPointer(privateServices, 'container', 'page1');

                            arrangement.moveBackward(privateServices, getCompPointer(privateServices, 'nonFixed2', 'page1'));
                            childComponentsPointer = privateServices.pointers.components.getChildren(parentPointer);
                            newChildComps = getChildrenComps(privateServices, childComponentsPointer);

                            var actualOrder = _.pluck(newChildComps, 'id');
                            expect(actualOrder).toEqual(['fixed1', 'nonFixed2', 'fixed2', 'nonFixed1']);
                        });


                        it('should move a nonFixed component behind the first nonfixed component before it even if there are more than one nonFixed components before it', function () {
                            var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                            var containerChildrenPointer = privateServices.pointers.components.getChildrenContainer(containerPointer);
                            privateServices.dal.push(containerChildrenPointer, {id: 'nonFixed3', layout: {fixedPosition: false}});

                            arrangement.moveBackward(privateServices, getCompPointer(privateServices, 'nonFixed3', 'page1'));

                            var childComponentsPointer = privateServices.pointers.components.getChildren(containerPointer);
                            var newChildComps = getChildrenComps(privateServices, childComponentsPointer);
                            var actualOrder = _.pluck(newChildComps, 'id');
                            expect(actualOrder).toEqual(['fixed1', 'nonFixed1', 'fixed2', 'nonFixed3', 'nonFixed2']);
                        });
                    });
                });

                describe('canCompMoveBackward', function () {
                    it('for a fixed component it should return true when there are more fixed components before it in the array', function () {

                        var canMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'fixed2', 'page1'));

                        expect(canMoveBackward).toBe(true);
                    });

                    it('for a fixed component it should return false when there are no more fixed components before it in the array, even if there are nonFixed components before it', function () {

                        childComps.unshift({id: 'nonFixed0', layout: {fixedPosition: false}});
                        var canMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'fixed1', 'page1'));

                        expect(canMoveBackward).toBe(false);
                    });

                    it('for a nonFixed component it should return true when there are more nonFixed components before it in the array', function () {

                        var canMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'nonFixed2', 'page1'));

                        expect(canMoveBackward).toBe(true);
                    });

                    it('for a nonFixed component it should return false when there are no more nonFixed components before it in the array, even if there are fixed components before it', function () {

                        childComps.unshift({id: 'fixed0', layout: {fixedPosition: true}});
                        var canMoveBackward = arrangement.canMoveBackward(privateServices, getCompPointer(privateServices, 'nonFixed1', 'page1'));

                        expect(canMoveBackward).toBe(false);
                    });
                });

            });

            describe('when there are both appController and other components', function () {
                beforeEach(function () {
                    siteData = testUtils.mockFactory.mockSiteData();
                    siteData.addPageWithDefaults('page1');
                    //    testUtils.mockFactory.createStructure(controllerType, {}, 'controller1'),
                    //    testUtils.mockFactory.createStructure(compType, {}, 'comp1'),
                    //    testUtils.mockFactory.createStructure(controllerType, {}, 'controller2'),
                    //    testUtils.mockFactory.createStructure(compType, {}, 'comp2')
                    //]);
                    privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                describe('canCompMoveForward', function () {
                    it('it should return false when appController is the only component in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);

                        var canMoveForward = arrangement.canMoveForward(privateServices, controllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('it should return false when there is another appController in front of it in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var firstControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var firstControllerRef = component.getComponentToAddRef(privateServices, pagePointer, firstControllerStructure);
                        var secondControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var secondControllerRef = component.getComponentToAddRef(privateServices, pagePointer, secondControllerStructure);

                        component.add(privateServices, firstControllerRef, pagePointer, firstControllerStructure);
                        component.add(privateServices, secondControllerRef, pagePointer, secondControllerStructure);

                        var canMoveForward = arrangement.canMoveForward(privateServices, firstControllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('it should return false when there are both an appController and a regular component in front of it in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var firstControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var firstControllerRef = component.getComponentToAddRef(privateServices, pagePointer, firstControllerStructure);
                        var secondControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var secondControllerRef = component.getComponentToAddRef(privateServices, pagePointer, secondControllerStructure);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);

                        component.add(privateServices, firstControllerRef, pagePointer, firstControllerStructure);
                        component.add(privateServices, secondControllerRef, pagePointer, secondControllerStructure);
                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);

                        var canMoveForward = arrangement.canMoveForward(privateServices, firstControllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('for a non controller component it should return false when there are no more non controller components after it in the array, even if there are controller components after it', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);

                        var canMoveForward = arrangement.canMoveForward(privateServices, buttonRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('for a non controller component it should return true when there are more non controller components after it in the array, even if there controller components after it', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);
                        var anotherButtonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var anotherButtonRef = component.getComponentToAddRef(privateServices, pagePointer, anotherButtonStructure);

                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);
                        component.add(privateServices, anotherButtonRef, pagePointer, anotherButtonStructure);

                        var canMoveForward = arrangement.canMoveForward(privateServices, buttonRef);

                        expect(canMoveForward).toBeTruthy();
                    });
                });

                describe('canCompMoveBackward', function () {
                    it('it should return false when appController is the only component in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);

                        var canMoveForward = arrangement.canMoveBackward(privateServices, controllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('it should return false when there is another appController behind it in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var firstControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var firstControllerRef = component.getComponentToAddRef(privateServices, pagePointer, firstControllerStructure);
                        var secondControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var secondControllerRef = component.getComponentToAddRef(privateServices, pagePointer, secondControllerStructure);

                        component.add(privateServices, firstControllerRef, pagePointer, firstControllerStructure);
                        component.add(privateServices, secondControllerRef, pagePointer, secondControllerStructure);

                        var canMoveForward = arrangement.canMoveBackward(privateServices, secondControllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('it should return false when there are both an appController and a regular component behind it in the page', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var firstControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var firstControllerRef = component.getComponentToAddRef(privateServices, pagePointer, firstControllerStructure);
                        var secondControllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var secondControllerRef = component.getComponentToAddRef(privateServices, pagePointer, secondControllerStructure);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);

                        component.add(privateServices, firstControllerRef, pagePointer, firstControllerStructure);
                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, secondControllerRef, pagePointer, secondControllerStructure);

                        var canMoveForward = arrangement.canMoveBackward(privateServices, secondControllerRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('for a non controller component it should return false when there are no more non controller components behind it, even if there are controller components behind it', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);
                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);

                        var canMoveForward = arrangement.canMoveBackward(privateServices, buttonRef);

                        expect(canMoveForward).toBeFalsy();
                    });

                    it('for a non controller component it should return true when there are more non controller components behind it, even if there controller components behind it', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);
                        var anotherButtonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var anotherButtonRef = component.getComponentToAddRef(privateServices, pagePointer, anotherButtonStructure);

                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);
                        component.add(privateServices, anotherButtonRef, pagePointer, anotherButtonStructure);

                        var canMoveForward = arrangement.canMoveBackward(privateServices, anotherButtonRef);

                        expect(canMoveForward).toBeTruthy();
                    });
                });

                describe('moveForward', function () {
                    it('should throw for an appController component', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);

                        var moveForward = arrangement.moveForward.bind(arrangement, privateServices, controllerRef);

                        expect(moveForward).toThrow();
                    });

                    it('should move a non appController component in front of the next non appController component', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure, 'button1');
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure, 'controller');
                        var anotherButtonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var anotherButtonRef = component.getComponentToAddRef(privateServices, pagePointer, anotherButtonStructure, 'button2');

                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);
                        component.add(privateServices, anotherButtonRef, pagePointer, anotherButtonStructure);

                        arrangement.moveForward(privateServices, buttonRef);

                        var childComponentPointers = privateServices.pointers.components.getChildren(pagePointer);
                        var newChildComps = getChildrenComps(privateServices, childComponentPointers);
                        var actualOrder = _.pluck(newChildComps, 'id');
                        expect(actualOrder).toEqual(['button2', 'controller', 'button1']);
                    });
                });

                describe('moveBackward', function () {
                    it('should throw for an appController component', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure);

                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);

                        var moveForward = arrangement.moveBackward.bind(arrangement, privateServices, controllerRef);

                        expect(moveForward).toThrow();
                    });

                    it('should move a non appController component in front of the next non appController component', function () {
                        var pagePointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var buttonRef = component.getComponentToAddRef(privateServices, pagePointer, buttonStructure, 'button1');
                        var controllerStructure = createValidCompDefinition(controllerType, testUtils.mockFactory.dataMocks.controllerData());
                        var controllerRef = component.getComponentToAddRef(privateServices, pagePointer, controllerStructure, 'controller');
                        var anotherButtonStructure = createValidCompDefinition(compType, testUtils.mockFactory.dataMocks.buttonData(), {});
                        var anotherButtonRef = component.getComponentToAddRef(privateServices, pagePointer, anotherButtonStructure, 'button2');

                        component.add(privateServices, buttonRef, pagePointer, buttonStructure);
                        component.add(privateServices, controllerRef, pagePointer, controllerStructure);
                        component.add(privateServices, anotherButtonRef, pagePointer, anotherButtonStructure);

                        arrangement.moveBackward(privateServices, anotherButtonRef);

                        var childComponentPointers = privateServices.pointers.components.getChildren(pagePointer);
                        var newChildComps = getChildrenComps(privateServices, childComponentPointers);
                        var actualOrder = _.pluck(newChildComps, 'id');
                        expect(actualOrder).toEqual(['button2', 'controller', 'button1']);
                    });
                });

            });
        });


    });
