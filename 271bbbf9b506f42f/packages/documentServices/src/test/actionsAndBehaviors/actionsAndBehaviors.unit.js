define([
    'lodash', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'definition!documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel'

], function(_, testUtils, privateServicesHelper, actionsAndBehaviorsDef, constants, dataModel) {
    "use strict";

    describe('Actions and Behaviors public API', function() {
        var mockActionsEditorSchema = {
            getSchema: function () {
                return {
                    action1: {
                        groups: ['group1', 'group2']
                    },
                    action2: {
                        groups: ['group3', 'group4']
                    }
                };
            }
        };

        var mockAnimationsEditorSchema = [
            {
                name: 'animation1',
                groups: ['group1', 'group2'],
                params: {key: 'value1'}

            },
            {
                name: 'animation2',
                groups: ['group3', 'group4'],
                params: {key: 'value2'}
            }
        ];
        var mockTransitionsEditorSchema = [
            {
                name: 'transition1',
                groups: ['group4', 'group5'],
                legacyName: 'legacyTrans1'
            },
            {
                name: 'transition2',
                groups: ['group4', 'group5'],
                legacyName: 'legacyTrans2'
            }
        ];

        var TEST_ANIMATIONS = ['group1', 'group2'];
        var EXTRA_TEST_ANIMATIONS = ['group3', 'group4'];
        var NONE = [];

        var mockAllowedGroups = {
            getSchema: function () {
                return {
                    'AllComponents': TEST_ANIMATIONS,
                    'CompType1': NONE,
                    'CompType2': undefined,
                    'CompType3': TEST_ANIMATIONS.concat(EXTRA_TEST_ANIMATIONS)
                };
            }
        };

        var mockComponentApi = {
            getType: function() {
                return 'CompType3';
            }
        };

        var actionsAndBehaviors = actionsAndBehaviorsDef(
            _,
            mockAllowedGroups,
            mockActionsEditorSchema,
            mockAnimationsEditorSchema,
            mockTransitionsEditorSchema,
            mockComponentApi,
            constants,
            dataModel
        );
        var mockPrivateServices;

        function getCompPointer(ps, compId, pageId){
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        describe('Actions behaviors and animations static lists', function() {
            beforeEach(function() {
                mockPrivateServices = mockPrivateServices || privateServicesHelper.mockPrivateServices();
            });
            it('getActionNames: should be all the action names in actions schema', function() {
                var names = actionsAndBehaviors.getActionNames();
                expect(names).toEqual(['action1', 'action2']);
            });

            it('getBehaviorDefinition: should return a behavior definitions', function() {
                var def = actionsAndBehaviors.getBehaviorDefinition(mockPrivateServices, 'animation1');
                expect(def).toEqual(_.find(mockAnimationsEditorSchema, {name: 'animation1'}));
            });

            it('getBehaviorNames: should return all behaviors names', function() {
                var names = actionsAndBehaviors.getBehaviorNames(mockPrivateServices);
                expect(names).toEqual(['animation1', 'animation2']);
            });

            it('getBehaviorNames: should return no behavior names for CompType1 (defined with no animation groups)', function() {
                var names = actionsAndBehaviors.getBehaviorNames(mockPrivateServices, 'CompType1');
                expect(names).toEqual([]);
            });

            it('getBehaviorNames: should return "animation1" for CompType2 (defined with default animation groups)', function() {
                var names = actionsAndBehaviors.getBehaviorNames(mockPrivateServices, 'CompType2');
                expect(names).toEqual(['animation1']);
            });

            it('getBehaviorNames: should return "animation1" and "animation2" for CompType3 (defined with custom animation groups)', function() {
                var names = actionsAndBehaviors.getBehaviorNames(mockPrivateServices, 'CompType3');
                expect(names).toEqual(['animation1', 'animation2']);
            });
        });

        describe('Component getters', function(){
            var siteData;
            var compPointer;

            beforeEach(function() {
                siteData = testUtils.mockFactory.mockSiteData();
                var pageId = siteData.getCurrentUrlPageId();
                var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify([{"key":"value"}])});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                compPointer = getCompPointer(mockPrivateServices, compStructure.id, pageId);
            });
            it('getComponentBehaviors: should get all behaviors defined on a component as a parsed JSON', function() {
                var behaviors = actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer);
                expect(behaviors).toEqual([{key: 'value'}]);
            });
        });

        describe('Component setters', function(){
                var mockGoodBehavior = {
                    action: "action1",
                    targetId: "targetId",
                    duration: "1",
                    delay: "1",
                    name: "animation1"
                };
                var mockGoodBehavior2 = {
                    action: "action2",
                    targetId: "targetId",
                    duration: "1",
                    delay: "1",
                    name: "animation2"
                };
                var mockBadBehavior = {"action": "badAction", "name": "badAnimation"};
                var siteData;
                beforeEach(function(){
                    siteData = testUtils.mockFactory.mockSiteData();
                });

                it('setComponentBehavior: should set passed behavior to a component', function() {
                    var pageId = siteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify([mockGoodBehavior])});
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(mockPrivateServices, compStructure.id, pageId);

                    actionsAndBehaviors.setComponentBehavior(mockPrivateServices, compPointer, mockGoodBehavior);
                    expect(actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer)).toEqual([mockGoodBehavior]);

                    actionsAndBehaviors.setComponentBehavior(mockPrivateServices, compPointer, mockGoodBehavior2, 'action2');
                    expect(actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer)).toEqual([mockGoodBehavior, mockGoodBehavior2]);
                });

                xit('setComponentBehavior: should not set passed behavior if the component does not accept behaviors', function() {
                    spyOn(mockPrivateServices.dal, 'get').and.returnValue('CompType1');
                    var badAnimationFunc = function() {
                        actionsAndBehaviors.setComponentBehavior(mockPrivateServices, 'comp', mockGoodBehavior);
                    };
                    expect(badAnimationFunc).toThrow();

                });

                it('setComponentBehavior: should not set passed  behavior if it is malformed', function() {
                    var badBehaviorFunc = function() {
                        actionsAndBehaviors.setComponentBehavior(mockPrivateServices, 'comp', mockBadBehavior);
                    };
                    expect(badBehaviorFunc).toThrow();

                });

                it('removeComponentSingleBehavior: should remove a behavior from a component', function() {
                    var pageId = siteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify([mockGoodBehavior, mockGoodBehavior2])});
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(mockPrivateServices, compStructure.id, pageId);

                    actionsAndBehaviors.removeComponentSingleBehavior(mockPrivateServices, compPointer, 'animation1', 'action1');

                    expect(actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer)).toEqual([mockGoodBehavior2]);
                });

                it('removeComponentSingleBehavior: should completely remove behaviors if behaviors array is empty', function() {
                    var pageId = siteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify([mockGoodBehavior])});
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(mockPrivateServices, compStructure.id, pageId);

                    actionsAndBehaviors.removeComponentSingleBehavior(mockPrivateServices, compPointer, 'animation1', 'action1');

                    expect(actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer)).toBe(null);
                });

                it('removeComponentBehaviors: should remove behaviors from a component', function() {
                    var pageId = siteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, {behaviors: JSON.stringify([mockGoodBehavior])});
                    mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(mockPrivateServices, compStructure.id, pageId);

                    actionsAndBehaviors.removeComponentBehaviors(mockPrivateServices, compPointer);

                    expect(actionsAndBehaviors.getComponentBehaviors(mockPrivateServices, compPointer)).toBe(null);
                });

            }
        );

        describe('Page transitions setter and getter', function() {
            var siteData;
            beforeEach(function(){
                siteData = testUtils.mockFactory.mockSiteData();
                siteData.setPageComponents([{id: constants.COMP_IDS.PAGE_GROUP, propertyQuery: 'props'}], 'masterPage');
                siteData.addProperties({id: 'props'});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                this.pageGroupPropsPointer = mockPrivateServices.pointers.data.getPropertyItem('props', 'masterPage');
            });

            it('getPageTransitionsNames: should get a list all legacy transition names', function() {
                var transitions = actionsAndBehaviors.getPageTransitionsNames(mockPrivateServices);

                expect(transitions).toEqual(['legacyTrans1', 'legacyTrans2']);
            });

            it('getPagesTransition: should get a transition name from pageGroup', function() {
                mockPrivateServices.dal.merge(this.pageGroupPropsPointer, {transition: 'someTransition'});

                var transition = actionsAndBehaviors.getPagesTransition(mockPrivateServices);
                expect(transition).toEqual('someTransition');
            });

            it('setPagesTransition: should set a transition name to pageGroup', function() {
                actionsAndBehaviors.setPagesTransition(mockPrivateServices, 'legacyTrans1');
                var pageGroupProps = mockPrivateServices.dal.get(this.pageGroupPropsPointer);
                expect(pageGroupProps.transition).toBe('legacyTrans1');
            });

            it('setPagesTransition: should not set a transition name to pageGroup if validation fails', function() {
                var badTransitionFunc = function() {
                    actionsAndBehaviors.setPagesTransition(mockPrivateServices, 'badTransition');
                };
                expect(badTransitionFunc).toThrow();
            });

        });

        describe('Preview related API', function() {

            it('executeAction: should execute an action as if its trigger was called', function() {
                var aspect = {
                    executeAction: jasmine.createSpy('aspectSpy')
                };
                spyOn(mockPrivateServices.siteAPI, 'getSiteAspect').and.returnValue(aspect);

                actionsAndBehaviors.executeAction(mockPrivateServices, 'actionName');
                expect(aspect.executeAction).toHaveBeenCalledWith('actionName');
            });

            it('previewAnimation: should preview an animation on a component', function() {
                //TODO
            });
        });

        describe('updateBehavior', function(){
                beforeEach(function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var currentPageId = mockSiteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', mockSiteData, currentPageId);
                    var anotherCompStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', mockSiteData, currentPageId);
                    this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                    var currentPageRef = this.mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
                    this.compRef = this.mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);
                    this.anotherCompRef = this.mockPS.pointers.components.getComponent(anotherCompStructure.id, currentPageRef);
                    //utils.dataFixer.fix(mockSiteData.getPageData(currentPageId));
                });

                it('should update component behavior object with the passed one', function(){
                    var widgetInstanceId = 'myWidgetInstanceId';
                    var behaviorTargetRef = {id: widgetInstanceId};
                    var newBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName');
                    var newAction = testUtils.mockFactory.actionMocks.comp('click');

                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, newAction, behaviorTargetRef, newBehavior);

                    expect(actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef)).toEqual([{
                        behavior: _.set(newBehavior, 'targetId', behaviorTargetRef.id),
                        action: _.set(newAction, 'sourceId', this.compRef.id)
                    }]);
                });

                it('should not add an already existing behavior to the component behaviors', function(){
                    var widgetInstanceId = 'myWidgetInstanceId';
                    var behaviorTargetRef = {id: widgetInstanceId};
                    var newBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName');
                    var newAction = testUtils.mockFactory.actionMocks.comp('click');

                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, newAction, behaviorTargetRef, newBehavior);
                    var expectedResult = actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef);

                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, newAction, behaviorTargetRef, newBehavior);

                    var componentBehaviors = actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef);
                    expect(componentBehaviors).toEqual(expectedResult);
                });

                it('should update an already existing behavior if it has new values', function(){
                    var widgetInstanceId = 'myWidgetInstanceId';
                    var behaviorTargetRef = {id: widgetInstanceId};
                    var behavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName');
                    var behaviorWithChanges = _.defaults({params: {callbackId: 'anotherCallbackName'}}, behavior);
                    var newAction = testUtils.mockFactory.actionMocks.comp('click');

                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, newAction, behaviorTargetRef, behavior);
                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, newAction, behaviorTargetRef, behaviorWithChanges);

                    var componentBehaviors = actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef);
                    expect(componentBehaviors).toEqual([{
                        behavior: _.set(behaviorWithChanges, 'targetId', behaviorTargetRef.id),
                        action: _.set(newAction, 'sourceId', this.compRef.id)
                    }]);
                });

                it('should update the behaviors only in the given source ref', function(){
                    var behaviorTargetRef = {id: 'myWidgetInstanceId'};
                    var newBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName');
                    var actionOnOneSource = testUtils.mockFactory.actionMocks.comp('click');
                    var actionOnSecondSource = testUtils.mockFactory.actionMocks.comp('hover');

                    actionsAndBehaviors.updateBehavior(this.mockPS, this.compRef, actionOnOneSource, behaviorTargetRef, newBehavior);
                    actionsAndBehaviors.updateBehavior(this.mockPS, this.anotherCompRef, actionOnSecondSource, behaviorTargetRef, newBehavior);

                    var result = actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef);

                    expect(result).toEqual([{
                        behavior: _.set(newBehavior, 'targetId', behaviorTargetRef.id),
                        action: _.set(actionOnOneSource, 'sourceId', this.compRef.id)
                    }]);
                });
            }
        );

        describe('removeBehavior', function(){
            var refs, mockPS;

            beforeEach(function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                mockSiteData.addPageWithDefaults('popup1', []);
                mockSiteData.addPageWithDefaults('popup2', []);
                mockSiteData.addPageWithDefaults('popup3', []);
                var currentPageId = mockSiteData.getPrimaryPageId();

                mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

                refs = {
                    currentPage: mockPS.pointers.page.getPagePointer(currentPageId),
                    popup1: mockPS.pointers.page.getPagePointer('popup1'),
                    popup2: mockPS.pointers.page.getPagePointer('popup2'),
                    popup3: mockPS.pointers.page.getPagePointer('popup3')
                };
            });

            describe('when page opens popup1 in desktop mode, and popup2 in mobile mode', function () {
                var actions, behaviors;

                beforeEach(function () {
                    actions = {
                        load: testUtils.mockFactory.actionMocks.comp('load')
                    };

                    behaviors = {
                        openPopup1: testUtils.mockFactory.behaviorMocks.site('openPopup', null, {openInMobile: false}),
                        openPopup2: testUtils.mockFactory.behaviorMocks.site('openPopup', null, {openInMobile: true})
                    };

                    actionsAndBehaviors.updateBehavior(mockPS, refs.currentPage, actions.load, refs.popup1, behaviors.openPopup1);
                    actionsAndBehaviors.updateBehavior(mockPS, refs.currentPage, actions.load, refs.popup2, behaviors.openPopup2);
                });

                describe('when "open popup1" behavior is removed from current page "on load"', function () {
                    it('should remove "open popup1", but should not remove "open popup2" behavior', function () {
                        actionsAndBehaviors.removeBehavior(mockPS, refs.currentPage, {
                            type: 'comp',
                            name: 'load'
                        }, refs.popup1, {
                            type: 'site',
                            name: 'openPopup'
                        });

                        expect(actionsAndBehaviors.getBehaviors(mockPS, refs.currentPage)).toEqual([{
                            action: jasmine.objectContaining({
                                type: 'comp',
                                name: 'load'
                            }),
                            behavior: jasmine.objectContaining({
                                type: 'site',
                                name: 'openPopup',
                                targetId: 'popup2'
                            })
                        }]);
                    });
                });

                describe('when trying to remove unexisting behavior', function () {
                    it('should not remove anything', function () {
                        actionsAndBehaviors.removeBehavior(mockPS, refs.currentPage, {
                            type: 'comp',
                            name: 'load'
                        }, refs.popup3);

                        expect(actionsAndBehaviors.getBehaviors(mockPS, refs.currentPage).length).toBe(2);
                    });
                });
            });
        });

        describe('hasBehavior', function(){
                var refs, mockPS;

                beforeEach(function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    mockSiteData.addPageWithDefaults('popup1', []);
                    mockSiteData.addPageWithDefaults('popup2', []);
                    var currentPageId = mockSiteData.getPrimaryPageId();

                    mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

                    refs = {
                        currentPage: mockPS.pointers.page.getPagePointer(currentPageId),
                        popup1: mockPS.pointers.page.getPagePointer('popup1'),
                        popup2: mockPS.pointers.page.getPagePointer('popup2')
                    };
                });

                describe('when page1 opens popup1 and popup2', function () {
                    var loadAction, openPopupBehavior;

                    beforeEach(function () {
                        loadAction = testUtils.mockFactory.actionMocks.comp('load');
                        openPopupBehavior = testUtils.mockFactory.behaviorMocks.site('openPopup', null);

                        actionsAndBehaviors.updateBehavior(mockPS, refs.currentPage, loadAction, refs.popup1, openPopupBehavior);
                        actionsAndBehaviors.updateBehavior(mockPS, refs.currentPage, loadAction, refs.popup2, openPopupBehavior);
                    });

                    it('has openPopup1 behavior on currentPage load', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, loadAction, refs.popup1, openPopupBehavior);

                        expect(result).toBe(true);
                    });

                    it('has openPopup2 behavior on currentPage load', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, loadAction, refs.popup2, openPopupBehavior);

                        expect(result).toBe(true);
                    });

                    it('has no openPopup currentPage behavior on currentPage load', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, loadAction, refs.currentPage, openPopupBehavior);

                        expect(result).toBe(false);
                    });

                    it('has no other behaviors behaviors between currentPage.onload and popup1', function () {
                        var otherBehavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName');
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, loadAction, refs.currentPage, otherBehavior);

                        expect(result).toBe(false);
                    });

                    it('has behaviors related to popup1 from currentPage', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, null, refs.popup1, null);

                        expect(result).toBe(true);
                    });

                    it('has behaviors related to popup2 from currentPage', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.currentPage, null, refs.popup2, null);

                        expect(result).toBe(true);
                    });

                    it('has no behaviors related to popup2 from popup1', function () {
                        var result = actionsAndBehaviors.hasBehavior(mockPS, refs.popup1, null, refs.popup2, null);

                        expect(result).toBe(false);
                    });
                });
            }
        );

        describe('getBehaviors', function(){

                beforeEach(function(){
                    this.mockSiteData = testUtils.mockFactory.mockSiteData();
                });

                it('should return an empty array if there are no behaviors on actionSourceRef', function(){
                    var currentPageId = this.mockSiteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, currentPageId);
                    this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var currentPageRef = this.mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
                    this.compRef = this.mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                    var result = actionsAndBehaviors.getBehaviors(this.mockPS, this.compRef);

                    expect(result).toEqual([]);
                });

                it('should return the added behaviors of the given source ref', function(){
                    var currentPageId = this.mockSiteData.getCurrentUrlPageId();
                    var behavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName', 'myWidgetInstanceId');
                    var action = testUtils.mockFactory.actionMocks.comp('click');
                    var expectedResult = [{behavior: behavior, action: action}];
                    var compDataObj = {behaviors: JSON.stringify(expectedResult)};
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, currentPageId, compDataObj);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var currentPageRef = mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);


                    var result = actionsAndBehaviors.getBehaviors(mockPS, compRef);

                    expect(result).toEqual(expectedResult);
                });
            }
        );
    });
});
