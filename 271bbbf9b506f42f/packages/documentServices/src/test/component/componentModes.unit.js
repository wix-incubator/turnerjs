define(['lodash',
    'utils',
    'testUtils',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/component/componentModes',
    'documentServices/mobileConversion/mobileActions'], function
    (_, utils, testUtils, constants,
     privateServicesHelper,
     componentService,
     dataModel,
     /** componentModes */ componentModes,
     mobileActions) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    describe('Component Modes module', function () {

        var ps;

        beforeEach(function () {
            openExperiments('sv_hoverBox');
            this.componentDef = getComponentDef();
            this.mobileCompDef = getComponentDef();
            var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage', [this.componentDef], [this.mobileCompDef]);

            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            this.compPointer = ps.pointers.components.getComponent('modefulCompIdInTest', getMainPageCompRef());
            this.mobileCompPointer = ps.pointers.components.getComponent('modefulCompIdInTest', getMobileMainPageCompRef());
        });

        function getMainPageCompRef() {
            return ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
        }

        function getMobileMainPageCompRef() {
            return ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.MOBILE);
        }

        function getComponentDef() {
            return {
                "id": "modefulCompIdInTest",
                "layout": {
                    "width": 800, "height": 700,
                    "x": 100, "y": 100,
                    "fixedPosition": false,
                    "scale": 1.0, "rotationInDegrees": 0.0,
                    "anchors": []
                },
                "type": "Container",
                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                "componentType": "mobile.core.components.Container",
                "components": [{
                    "id": "child-comp",
                    "type": "Container",
                    "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                    "componentType": "mobile.core.components.Container",
                    "components": [],
                    "layout": {},
                    "data": null,
                    "props": null
                }, {
                    "id": "child-comp-with-overrides-and-definitions",
                    "type": "Container",
                    "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                    "componentType": "mobile.core.components.Container",
                    "layout": {
                        "height": 3,
                        "y": 4,
                        "bla": 100,
                        "kishkush": true
                    },
                    "data": null,
                    "props": null,
                    "modes": {
                        "isHiddenByModes": false,
                        "definitions": [{
                            "modeId": "hoody",
                            "label": "users-label",
                            "type": "HOVER",
                            "params": null
                        }, {
                            "modeId": "hoody-default",
                            "label": "users-label-2",
                            "type": "DEFAULT",
                            "params": null
                        }],
                        "overrides": [{
                            "modeIds": ['myCoolModeId'],
                            "isHiddenByModes": false,
                            "layout": {
                                "bestPropEver": "new",
                                "almostAsGoodProp": "wohooo"
                            }
                        }]
                    }
                }, {
                    "id": "child-comp-with-overrides",
                    "type": "Container",
                    "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                    "componentType": "mobile.core.components.Container",
                    "layout": {
                        "height": 3,
                        "y": 4,
                        "bla": 100,
                        "kishkush": true
                    },
                    "data": null,
                    "props": null,
                    "modes": {
                        "isHiddenByModes": false,
                        "definitions": [],
                        "overrides": [{
                            "modeIds": ['myCoolModeId'],
                            "isHiddenByModes": false,
                            "layout": {
                                "bestPropEver": "new",
                                "almostAsGoodProp": "wohooo"
                            }
                        }]
                    }
                },
                    createSerializedChildCompInHiddenMode(),
                    createSerializedCompHiddenByDefault()],
                "data": null,
                "props": null,
                "modes": {
                    "definitions": [
                        {
                            "modeId": "myCoolModeId",
                            "label": "users-label",
                            "type": "HOVER",
                            "params": null
                        }, {
                            "modeId": "myCoolModeId-2",
                            "label": "users-label-2",
                            "type": "DEFAULT",
                            "params": null
                        }, {
                            "modeId": "myCoolModeId-3",
                            "label": "users-label-2",
                            "type": "APPLICATIVE",
                            "params": []
                        }],
                    "overrides": [{
                        "modeIds": ['myCoolModeId'],
                        "isHiddenByModes": false,
                        "layout": {
                            "bestPropEver": "new",
                            "almostAsGoodProp": "wohooo"
                        }
                    }, {
                        "modeIds": ['myCoolModeId', 'modeId-Y'],
                        "isHiddenByModes": true
                    }]
                }
            };
        }

        function createSerializedChildCompInHiddenMode() {
            return {
                "id": "child-comp-hidden-in-mode",
                "type": "Container",
                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                "componentType": "mobile.core.components.Container",
                "layout": {
                    "height": 3,
                    "y": 4,
                    "bla": 100,
                    "kishkush": true
                },
                "data": null,
                "props": null,
                "modes": {
                    "isHiddenByModes": false,
                    "definitions": [],
                    "overrides": [{
                        "modeIds": ['myCoolModeId'],
                        "isHiddenByModes": true
                    }, {
                        "modeIds": ["myCoolModeId-2"],
                        "isHiddenByModes": false,
                        "layout": {
                            "secondModeProp": "new"
                        }
                    }]
                }
            };
        }

        function createSerializedCompHiddenByDefault() {
            return {
                "id": "child-comp-hidden-in-applicative",
                "type": "Container",
                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                "componentType": "mobile.core.components.Container",
                "layout": {
                    "bla": 100,
                    "kishkush": true
                },
                "components": [],
                "data": null,
                "props": null,
                "modes": {
                    "isHiddenByModes": true,
                    "definitions": [],
                    "overrides": [{
                        "modeIds": ['myCoolModeId'],
                        "isHiddenByModes": false,
                        "layout": {
                            "foo5": "bar5"
                        }
                    }, {
                        "modeIds": ['myCoolModeId-2']
                    }]
                }
            };
        }

        describe('API', function () {
            it('should ensure the component in test exists in the document', function () {
                var compType = componentService.getType(ps, this.compPointer);

                expect(compType).toBe('mobile.core.components.Container');
            });

            describe('getModeTypes', function () {
                it('should return a list of all possible modes to create on components', function () {
                    var modeTypes = componentModes.getModeTypes();

                    expect(modeTypes).toEqual(utils.siteConstants.COMP_MODES_TYPES);
                });
            });

            describe('getMobileActiveModesMap', function () {
                it('should return a map of modes active on the page', function () {
                    var activeModesMap = componentModes.getMobileActiveModesMap(ps, 'mainPage');
                    expect(activeModesMap).toEqual({hoody: true, myCoolModeId: true});
                });
            });

            describe('getComponentModes', function () {
                it('should return all the modes defined on a component', function () {
                    var modesDefinedOnComponent = componentModes.getComponentModes(ps, this.compPointer);
                    var modesInComponentDefinition = this.componentDef.modes.definitions;

                    expect(modesDefinedOnComponent).toEqual(modesInComponentDefinition);
                });
            });

            describe('getComponentModesAvailableInView', function () {
                it('for a desktop component - should return all the modes defined on a component', function () {
                    var modesDefinedOnComponent = componentModes.getComponentModesAvailableInView(ps, this.compPointer);
                    var modesInComponentDefinition = this.componentDef.modes.definitions;

                    expect(modesDefinedOnComponent).toEqual(modesInComponentDefinition);
                });

                it('for a mobile component without mobileDisplayedModeId - should return the hover mode', function () {
                    var modesDefinedOnComponent = componentModes.getComponentModesAvailableInView(ps, this.mobileCompPointer);
                    var modesInComponentDefinition = this.mobileCompDef.modes.definitions;
                    var hoverMode = _.filter(modesInComponentDefinition, 'type', utils.siteConstants.COMP_MODES_TYPES.HOVER);

                    expect(modesDefinedOnComponent).toEqual(hoverMode);
                });

                it('for a mobile component with mobileDisplayedModeId property - should return property', function () {
                    var modesInComponentDefinition = this.mobileCompDef.modes.definitions;
                    var applicativeMode = _.filter(modesInComponentDefinition, 'type', 'APPLICATIVE');
                    dataModel.updatePropertiesItem(ps, this.compPointer, {mobileDisplayedModeId: applicativeMode[0].modeId});
                    var modesDefinedOnComponent = componentModes.getComponentModesAvailableInView(ps, this.mobileCompPointer);

                    expect(modesDefinedOnComponent).toEqual(applicativeMode);
                });
            });

            describe('setComponentDisplayMode', function () {
                it('should update the property of the desktop component', function () {
                    var applicativeMode = _.filter(this.mobileCompDef.modes.definitions, 'type', 'APPLICATIVE');
                    mobileActions.setComponentDisplayMode(ps, this.mobileCompPointer, applicativeMode.modeId);

                    var desktopCompProp = dataModel.getPropertiesItem(ps, this.compPointer);
                    expect(desktopCompProp.mobileDisplayedModeId).toEqual(applicativeMode.modeId);
                });

                it('should reAdd the components deleted from the current displayed mode before switching modes.', function () {
                    var childCompPointer = ps.pointers.components.getChildren(this.mobileCompPointer)[0];
                    mobileActions.hiddenComponents.hide(ps, childCompPointer);
                    var hiddenComps = mobileActions.hiddenComponents.get(ps, 'mainPage');
                    expect(hiddenComps.length).toEqual(1);
                    var applicativeMode = _.filter(this.mobileCompDef.modes.definitions, 'type', 'APPLICATIVE');

                    mobileActions.setComponentDisplayMode(ps, this.mobileCompPointer, applicativeMode.modeId);

                    hiddenComps = mobileActions.hiddenComponents.get(ps, 'mainPage');
                    expect(hiddenComps.length).toEqual(0);

                });
            });

            describe('getComponentModesByType', function () {
                it('should get all component mode definitions by a ModeType', function () {
                    var MODE_TYPE = 'HOVER';
                    var componentHoverModes = componentModes.getComponentModesByType(ps, this.compPointer, MODE_TYPE);
                    var hoverModesInDefinition = [_.find(this.componentDef.modes.definitions, {type: MODE_TYPE})];

                    expect(componentHoverModes).toEqual(hoverModesInDefinition);

                    var MODE_TYPE_NOT_ON_COMP = 'SOME_MODE_TYPE_NOT_ON_COMP';
                    var modesNotDefinedOnComponent = componentModes.getComponentModesByType(ps, this.compPointer, MODE_TYPE_NOT_ON_COMP);
                    expect(_.isEmpty(modesNotDefinedOnComponent)).toBeTruthy();
                });
            });

            describe('addComponentModeDefinition', function () {
                it('should not add a mode definition to a component if Mode Type is invalid', function () {
                    var MODE_TYPE = 'INVALID_MODE_TYPE';
                    var numberOfModesBeforeAdd = _.size(componentModes.getComponentModes(ps, this.compPointer));
                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    expect(function(){
                        componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, MODE_TYPE);
                    }).toThrowError();

                    var numberOfModesAfterAdd = _.size(componentModes.getComponentModes(ps, this.compPointer));
                    expect(numberOfModesBeforeAdd).toBe(numberOfModesAfterAdd);
                });

                it('should add a Mode definition to a component if Mode Type is valid', function () {
                    var MODE_TYPE = utils.siteConstants.COMP_MODES_TYPES.HOVER;

                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, MODE_TYPE);
                    var addedModeDef = componentModes.getComponentModeById(ps, this.compPointer, addedModeId);
                    expect(addedModeDef).toEqual(jasmine.objectContaining({
                        modeId: jasmine.any(String),
                        type: MODE_TYPE,
                        label: null,
                        params: null
                    }));
                });

                it('should add the params to the new mode', function () {
                    var MODE_TYPE = utils.siteConstants.COMP_MODES_TYPES.HOVER;
                    var params = {
                        param1: 'value1',
                        param2: 'value2'
                    };

                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, MODE_TYPE, params);
                    var addedModeDef = componentModes.getComponentModeById(ps, this.compPointer, addedModeId);
                    expect(addedModeDef.params).toEqual(params);
                });

                it('should add a default mode if it does not exist yet', function () {
                    var modeType = utils.siteConstants.COMP_MODES_TYPES.HOVER;

                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, modeType);

                    var defaultModes = componentModes.getComponentModesByType(ps, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);
                    expect(defaultModes.length).toEqual(1);
                });

                it('should not add a default mode if it already exists', function () {
                    var modeType = utils.siteConstants.COMP_MODES_TYPES.HOVER;
                    var anotherModeType = utils.siteConstants.COMP_MODES_TYPES.SCROLL;
                    var hoverModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, hoverModeId, this.compPointer, modeType);
                    var initialDefaultModesCounter = componentModes.getComponentModesByType(ps, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT).length;

                    var scrollModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, scrollModeId, this.compPointer, anotherModeType);
                    var defaultModesCounter = componentModes.getComponentModesByType(ps, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT).length;

                    expect(initialDefaultModesCounter).toEqual(1);
                    expect(defaultModesCounter).toEqual(1);
                });
            });

            describe('removeComponentMode', function () {
                it('should remove a Mode definition from a component', function () {
                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, 'HOVER');
                    expect(componentModes.getComponentModeById(ps, this.compPointer, addedModeId)).toBeTruthy();

                    componentModes.removeComponentMode(ps, this.compPointer, addedModeId);

                    var hoverModes = componentModes.getComponentModesByType(ps, this.compPointer, 'HOVER');
                    expect(_.find(hoverModes, {'modeId': addedModeId})).toBeFalsy();
                });

                it('should deactivate an active mode before removing it', function() {
                    var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, 'HOVER');
                    componentModes.addComponentModeDefinition(ps, 'defaultModeId', this.compPointer, 'DEFAULT');
                    componentModes.activateComponentMode(ps, this.compPointer, addedModeId);

                    expect(componentModes.getComponentActiveModeIds(ps, this.compPointer)[addedModeId]).toBeTruthy();

                    componentModes.removeComponentMode(ps, this.compPointer, addedModeId);

                    var hoverModes = componentModes.getComponentModesByType(ps, this.compPointer, 'HOVER');
                    expect(_.find(hoverModes, {'modeId': addedModeId})).toBeFalsy();
                    expect(componentModes.getComponentActiveModeIds(ps, this.compPointer)[addedModeId]).toBeFalsy();
                });
            });

            describe('removeAllOverrides', function () {
                it('should remove all of the component Overriding modes', function () {
                    var overrides = componentModes.overrides.getAllOverrides(ps, this.compPointer);
                    expect(_.isEmpty(overrides)).toBeFalsy();

                    componentModes.overrides.removeAllOverrides(ps, this.compPointer);

                    var updatedOverrides = componentModes.overrides.getAllOverrides(ps, this.compPointer);
                    expect(_.isEmpty(updatedOverrides)).toBeTruthy();
                });
            });

            describe('showComponentOnlyInModesCombination', function() {
                it('should set isHiddenByModes=true on the default structure', function() {
                    var componentModesStructure = ps.dal.full.get(this.compPointer).modes;
                    expect(componentModesStructure && componentModesStructure.isHiddenByModes).toBeFalsy();

                    var visibleModeIds = ['myCoolModeId'];
                    componentModes.overrides.showComponentOnlyInModesCombination(ps, this.compPointer, visibleModeIds);

                    componentModesStructure = ps.dal.full.get(this.compPointer).modes;
                    expect(componentModesStructure.isHiddenByModes).toBeTruthy();
                });

                it('should set isHiddenByModes=false on the override object corresponding the passed in modeIds', function() {
                    var visibleModeIds = ['myCoolModeId'];
                    componentModes.overrides.showComponentOnlyInModesCombination(ps, this.compPointer, visibleModeIds);

                    var componentModesStructure = ps.dal.full.get(this.compPointer).modes;
                    var matchingOverrides = _.filter(componentModesStructure.overrides, function(ovr) {
                        return _.isEqual(ovr.modeIds, visibleModeIds);
                    });
                    expect(matchingOverrides.length).toBe(1);
                    expect(matchingOverrides[0].isHiddenByModes).toBe(false);
                });

                it('should remove all overrides not corresponding the passed in modeIds', function() {
                    var visibleModeIds = ['myCoolModeId'];
                    componentModes.overrides.showComponentOnlyInModesCombination(ps, this.compPointer, visibleModeIds);

                    var componentModesStructure = ps.dal.full.get(this.compPointer).modes;
                    expect(componentModesStructure.overrides.length).toBe(1);
                    expect(componentModesStructure.overrides[0].modeIds).toEqual(visibleModeIds);
                });
            });
        });

        describe('Active components Modes', function () {
            describe('when default mode exists', function () {
                it('should return default mode if NO other modes of component are active', function () {
                    var defaultMode = componentModes.getComponentModesByType(ps, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT)[0];
                    var defaultModeId = defaultMode.modeId;
                    componentModes.activateComponentMode(ps, this.compPointer, 'some-active-mode-id-not-defined-on-component');

                    var activeModes = componentModes.getComponentActiveModeIds(ps, this.compPointer);

                    expect(activeModes[defaultModeId]).toBeTruthy();
                });

                it('should return active modes of a component if there are "registered" active modes on SiteData', function () {
                    var defaultModeId = componentModes.getModeToAddId(ps, this.compPointer);
                    componentModes.addComponentModeDefinition(ps, defaultModeId, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);
                    var compWithModes = ps.dal.get(this.compPointer);
                    var modeIdDefinedOnComponent = _.first(compWithModes.modes.definitions).modeId;
                    componentModes.activateComponentMode(ps, this.compPointer, modeIdDefinedOnComponent);

                    var activeModes = componentModes.getComponentActiveModeIds(ps, this.compPointer);

                    expect(activeModes[modeIdDefinedOnComponent]).toBeTruthy();
                    expect(activeModes[defaultModeId]).toBeFalsy();
                });

                it('should return active mode ids of the first ancestor with active modes', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));
                    componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');

                    var activeModeOfFirstAncestorWithActiveModes = componentModes.getFirstAncestorActiveModes(ps, childCompPointer);

                    expect(activeModeOfFirstAncestorWithActiveModes).toEqual({'myCoolModeId': true});
                });

                it('should return empty object if no active modes', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));

                    var firstActiveModeOfAnAncestor = componentModes.getFirstAncestorActiveModes(ps, childCompPointer);

                    expect(firstActiveModeOfAnAncestor).toEqual({});
                });
            });
        });

        describe('get displayed children', function () {
            beforeEach(function () {
                this.numOfChildren = 10;
                var i, child;
                var childrenContainerPointer = ps.pointers.components.getChildrenContainer(this.compPointer);
                this.children = [];

                for (i = 0; i < this.numOfChildren; i++) {
                    child = getComponentDef();
                    child.id = child.id + '-' + i;
                    delete child.modes;
                    this.children.push(child);
                }
                ps.dal.set(childrenContainerPointer, this.children);
            });

            describe('when there are no active modes', function () {
                it('should return all children if they are displayed', function () {
                    var childrenPointers = ps.pointers.components.getChildren(this.compPointer);

                    expect(childrenPointers.length).toEqual(this.numOfChildren);
                });

                it('should return only displayed children', function () {
                    //var indexToHide = 3;
                    //var childrenContainerPointer = ps.pointers.components.getChildrenContainer(this.compPointer);
                    //var childToHidePointer = ps.pointers.getInnerPointer(childrenContainerPointer, indexToHide);
                    //
                    //componentModes.hideCompOnDefaultMode(ps, childToHidePointer);
                    //var childrenPointers = ps.pointers.components.getChildren(this.compPointer);
                    //
                    //expect(childrenPointers.length).toEqual(this.numOfChildren - 1);
                    //expect(ps.dal.get(childrenPointers[indexToHide])).not.toEqual(this.children[indexToHide]);
                });
            });
        });

        describe('shouldDeleteComponentFromFullJson', function () {
            it('should return true if no active modes affect the component', function () {
                var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));

                expect(componentModes.shouldDeleteComponentFromFullJson(ps, childCompPointer)).toEqual(true);
            });

            it('should return false if an active mode affects the component', function () {
                var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));

                componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');

                expect(componentModes.shouldDeleteComponentFromFullJson(ps, childCompPointer)).toEqual(false);
            });
        });

        describe('applyComponentToMode', function() {
            it('should apply a component in one mode to another with all of its overrides except "isHiddenByModes"', function() {
                var targetModeId = 'myCoolModeId-2';
                var mainPagePointer = getMainPageCompRef(ps);
                var compPointer = ps.pointers.full.components.getComponent('child-comp-hidden-in-applicative', mainPagePointer);
                var serializedComponent = createSerializedCompHiddenByDefault();
                serializedComponent.activeModes = {'myCoolModeId': true};
                var componentsToApplyToMode = [{
                    compRef: compPointer,
                    compDefinition: serializedComponent
                }];

                ps.siteAPI.activateModeById('modefulCompIdInTest', mainPagePointer.id, targetModeId);
                componentModes.overrides.applyComponentToMode(ps, componentsToApplyToMode, targetModeId);

                expect(ps.dal.get(compPointer).layout).toEqual({
                    "foo5": "bar5"
                });
            });
        });

        describe('applyCurrentToAllModes', function () {
            describe('no active mode', function () {
                it('should delete all mode overrides', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-with-overrides-and-definitions', getMainPageCompRef(ps));

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var fullChildComp = ps.dal.full.get(childCompPointer);
                    expect(fullChildComp.modes.overrides).toEqual([]);
                });

                it('should reset isHiddenByModes', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-hidden-in-mode', getMainPageCompRef(ps));

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var fullChildComp = ps.dal.full.get(childCompPointer);
                    expect(fullChildComp.modes.isHiddenByModes).toBe(false);
                });

                it('should keep mode definitions', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-with-overrides-and-definitions', getMainPageCompRef(ps));
                    var childModeDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(childCompPointer);
                    var initialModeDefinitions = ps.dal.full.get(childModeDefinitionsPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var fullChildComp = ps.dal.get(childCompPointer);
                    expect(fullChildComp.modes.definitions).not.toEqual([]);
                    expect(fullChildComp.modes.definitions).toEqual(initialModeDefinitions);
                });

                it('should do nothing when there are no overrides defined on the component', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));
                    var displayedChildComp = ps.dal.get(childCompPointer);
                    var fullChildComp = ps.dal.full.get(childCompPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var resultDisplayedComp = ps.dal.get(childCompPointer);
                    var resultFullChildComp = ps.dal.full.get(childCompPointer);
                    expect(fullChildComp).toEqual(resultFullChildComp);
                    expect(displayedChildComp).toEqual(resultDisplayedComp);
                });

                it('should also work on the hoverBox comp itself', function () {
                    var compPointer = ps.pointers.components.getComponent('modefulCompIdInTest', getMainPageCompRef(ps));
                    componentModes.activateComponentMode(ps, compPointer, 'myCoolModeId');
                    var overridingLayoutPointer = componentModes.overrides.getOverridePointerByActiveModes(ps, compPointer);
                    var overridingLayout = ps.dal.full.get(overridingLayoutPointer).layout;

                    componentModes.overrides.applyCurrentToAllModes(ps, compPointer);

                    var resultFullComp = ps.dal.full.get(compPointer);

                    expect(resultFullComp.layout).toEqual(overridingLayout);
                    expect(resultFullComp.modes.overrides).toEqual([]);
                });
            });

            describe('active mode', function () {
                beforeEach(function () {
                    componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');
                });

                it('should merge active overrides to structure mode and delete all mode overrides', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-with-overrides', getMainPageCompRef(ps));
                    var displayedChildComp = ps.dal.get(childCompPointer);
                    var fullChildComp = ps.dal.full.get(childCompPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var resultFullChildComp = ps.dal.full.get(childCompPointer);
                    expect(fullChildComp.layout).not.toEqual(displayedChildComp.layout);
                    expect(resultFullChildComp.layout).toEqual(displayedChildComp.layout);
                    expect(resultFullChildComp.modeIds).toBeUndefined();
                    expect(resultFullChildComp.isHiddenByModes).toBeUndefined();
                });

                it('should display hidden in mode comp in that mode after other mode was applied', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-hidden-in-applicative', getMainPageCompRef(ps));
                    var displayedChildComp = ps.dal.get(childCompPointer);
                    var fullChildComp = ps.dal.full.get(childCompPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);
                    componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId-2');

                    var resultDisplayedChildComp = ps.dal.get(childCompPointer);
                    expect(fullChildComp.modes.isHiddenByModes).toBe(true);
                    expect(displayedChildComp).toBeDefined();
                    expect(resultDisplayedChildComp).toBeDefined();
                });

                it('should keep mode definitions', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp-with-overrides-and-definitions', getMainPageCompRef(ps));
                    var childModeDefinitionsPointer = ps.pointers.componentStructure.getModesDefinitions(childCompPointer);
                    var initialModeDefinitions = ps.dal.full.get(childModeDefinitionsPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var fullChildComp = ps.dal.get(childCompPointer);
                    expect(fullChildComp.modes.definitions).not.toEqual([]);
                    expect(fullChildComp.modes.definitions).toEqual(initialModeDefinitions);
                });

                it('should do nothing when there are no overrides defined on the component', function () {
                    var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));
                    var displayedChildComp = ps.dal.get(childCompPointer);
                    var fullChildComp = ps.dal.full.get(childCompPointer);

                    componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                    var resultDisplayedComp = ps.dal.get(childCompPointer);
                    var resultFullChildComp = ps.dal.full.get(childCompPointer);
                    expect(fullChildComp).toEqual(resultFullChildComp);
                    expect(displayedChildComp).toEqual(resultDisplayedComp);
                });
            });
        });

        describe('getFirstAncestorWithActiveModes', function () {

            it('when a mode is active - should return the first ancestor with active modes', function () {
                var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));
                componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');

                var firsAncestorWithActiveMode = componentModes.getFirstAncestorWithActiveModes(ps, childCompPointer);

                expect(firsAncestorWithActiveMode).toEqual(this.compPointer);
            });

            it('when a (default) mode is active - should return the first ancestor with active modes', function () {
                componentModes.resetAllActiveModes(ps);
                componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');
                var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));
                var defaultModeId = componentModes.getModeToAddId(ps, this.compPointer);
                componentModes.addComponentModeDefinition(ps, defaultModeId, this.compPointer, 'DEFAULT');
                componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);
                componentModes.activateComponentMode(ps, this.compPointer, defaultModeId);

                var firsAncestorWithActiveMode = componentModes.getFirstAncestorWithActiveModes(ps, childCompPointer);

                expect(firsAncestorWithActiveMode).toEqual(this.compPointer);
            });

            it('should return null if there is no ancestor with active modes', function () {
                var childCompPointer = ps.pointers.components.getComponent('child-comp', getMainPageCompRef(ps));

                var firsAncestorWithActiveMode = componentModes.getFirstAncestorWithActiveModes(ps, childCompPointer);

                expect(firsAncestorWithActiveMode).toEqual(null);
            });
        });

        describe('isComponentDisplayedInModes', function () {
            var childCompPointer;

            beforeEach(function () {
                componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');
                childCompPointer = ps.pointers.components.getComponent('child-comp-hidden-in-applicative', getMainPageCompRef(ps));
            });

            it('should return true if comp is displayed in modes', function () {
                expect(componentModes.isComponentDisplayedInModes(ps, childCompPointer, ['myCoolModeId'])).toBeTruthy();

            });

            it('should return false if comp is not displayed in modes', function () {
                expect(componentModes.isComponentDisplayedInModes(ps, childCompPointer, ['myCoolModeId-2'])).toBeFalsy();
            });
        });

        describe('isComponentDisplayedByDefault', function () {
            var childCompPointer;

            beforeEach(function () {
                var addedModeId = componentModes.getModeToAddId(ps, this.compPointer);
                componentModes.addComponentModeDefinition(ps, addedModeId, this.compPointer, 'DEFAULT');
                componentModes.activateComponentMode(ps, this.compPointer, 'myCoolModeId');
                childCompPointer = ps.pointers.components.getComponent('child-comp-hidden-in-applicative', getMainPageCompRef(ps));
            });

            it('should return false if comp is not displayed in default mode', function () {
                expect(componentModes.isComponentDisplayedByDefault(ps, childCompPointer)).toBeFalsy();
            });

            it('should return true if comp is displayed in default mode', function(){
                componentModes.overrides.applyCurrentToAllModes(ps, childCompPointer);

                expect(componentModes.isComponentDisplayedByDefault(ps, childCompPointer)).toBeTruthy();
            });
        });

        describe('resetAllActiveModes', function() {
            beforeEach(function() {
                var activeModesPointer = ps.pointers.general.getActiveModes();
                var activeModes = {};
                var pageId = getMainPageCompRef(ps).id;
                activeModes[pageId] = {
                    'myCoolModeId': true,
                    'myCoolModeId-2': true
                };
                ps.dal.merge(activeModesPointer, activeModes); //we have to bypass the module API because it only allows 1 active mode through DS
                ps.siteAPI.createDisplayedPage(pageId);
                componentModes.resetAllActiveModes(ps);
            });

            it('should clear all active modes and turn on default modes', function() {
                var compActiveModes = componentModes.getComponentActiveModeIds(ps, this.compPointer);
                var compDefaultModes = componentModes.getComponentModesByType(ps, this.compPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);

                expect(compActiveModes[compDefaultModes[0].modeId]).toBeTruthy();
            });

            it('should create a correct displayed page', function() {
                var compHiddenInModePointer = ps.pointers.components.getComponent('child-comp-hidden-in-mode', getMainPageCompRef(ps));
                expect(compHiddenInModePointer).toEqual({id: 'child-comp-hidden-in-mode', type: 'DESKTOP'});
                expect(ps.dal.get(compHiddenInModePointer).layout.secondModeProp).toBeDefined();

                var compWithOverridesInModesPointer = ps.pointers.components.getComponent('child-comp-with-overrides-and-definitions', getMainPageCompRef(ps));
                expect(ps.dal.get(compWithOverridesInModesPointer).layout.bestPropEver).toBeUndefined();
            });
        });

        describe('removeDesignBehaviorsFromAllModes', function () {

            var behaviors;

            var hoverModeId = 'myCoolModeId';
            var defaultModeId = 'defaultModeId';

            var hoverDesignItem;

            var defaultDesignItem;

            var videoDesignItem;

            beforeEach(function () {
                behaviors = [{trigger: 'in', "type": "animation", "part": "media", 'name': 'Scale', 'params': {duration: 0.5, delay: 2}},
                    {trigger: 'out', "type": "animation", "part": "overlay", 'name': 'Zoom', 'params': {duration: 0.5, delay: 2}}];

                hoverDesignItem = {
                    id : 'coolDesignItem',
                    type: 'BackgroundMedia',
                    background: {
                        mediaRef: {
                            type: 'Image'
                        }
                    },
                    dataChangeBehaviors: behaviors
                };

                defaultDesignItem = {
                    id : 'defaultDesignItem',
                    type: 'BackgroundMedia',
                    background: {
                        someProp: 'thisIsJustSomeProp',
                        mediaRef: {
                            type: 'Image'
                        },
                        mediaTransforms: {
                            scale: 2
                        }
                    },
                    dataChangeBehaviors: behaviors
                };

                videoDesignItem = {
                    id : 'videoDesignItem',
                    type: 'BackgroundMedia',
                    background: {
                        mediaRef: {
                            type: 'WixVideo',
                            autoplay: false
                        }
                    },
                    dataChangeBehaviors: behaviors
                };

                dataModel.updateDesignItem(ps, this.compPointer, defaultDesignItem);

                componentModes.addComponentModeDefinition(ps, defaultModeId, this.compPointer, 'DEFAULT', {});

                var overridesPointer = ps.pointers.componentStructure.getModesOverrides(this.compPointer);

                ps.dal.full.set(overridesPointer, [{
                        "modeIds": [hoverModeId],
                        "isHiddenByModes": false,
                        "designQuery": "#" + hoverDesignItem.id
                    }]
                );

                dataModel.addSerializedDesignItemToPage(ps, 'mainPage', hoverDesignItem, hoverDesignItem.id);
            });

            it('should delete the design behaviors with the specified design parts from all modes when design mediaRef = Image', function () {
                var design = dataModel.getDesignItemByModes(ps, this.compPointer, [defaultModeId]);
                expect(design.dataChangeBehaviors.length).toEqual(2);

                design = dataModel.getDesignItemByModes(ps, this.compPointer, [hoverModeId]);
                expect(design.dataChangeBehaviors.length).toEqual(2);

                var designParts = ['media', 'overlay'];
                componentModes.removeDesignBehaviorsFromAllModes(ps, this.compPointer, designParts);

                design = dataModel.getDesignItemByModes(ps, this.compPointer, [defaultModeId]);
                expect(design.dataChangeBehaviors.length).toEqual(0);

                design = dataModel.getDesignItemByModes(ps, this.compPointer, [hoverModeId]);
                expect(design.dataChangeBehaviors.length).toEqual(0);
            });

            it('should not delete behaviors in designParts that are not included', function(){
                var designParts = ['media'];
                componentModes.removeDesignBehaviorsFromAllModes(ps, this.compPointer, designParts);

                var design = dataModel.getDesignItem(ps, this.compPointer);
                expect(design.dataChangeBehaviors.length).toEqual(1);
                expect(design.dataChangeBehaviors[0].part).toEqual('overlay');
            });

            it('should set mediaTransform to {scale: 1} if media is Image', function(){
                var designParts = ['media', 'overlay'];
                componentModes.removeDesignBehaviorsFromAllModes(ps, this.compPointer, designParts);

                var design = dataModel.getDesignItem(ps, this.compPointer);
                expect(design.background.mediaTransforms.scale).toEqual(1);
            });

            it('should set autoplay to true and not delete behaviors if media is WixVideo', function(){
                dataModel.addSerializedDesignItemToPage(ps, 'mainPage', videoDesignItem, videoDesignItem.id);

                var overridesPointer = ps.pointers.componentStructure.getModesOverrides(this.compPointer);

                ps.dal.full.set(overridesPointer, [{
                        "modeIds": [hoverModeId],
                        "isHiddenByModes": false,
                        "designQuery": "#" + videoDesignItem.id
                    }]
                );

                var designParts = ['media', 'overlay'];
                componentModes.removeDesignBehaviorsFromAllModes(ps, this.compPointer, designParts);

                var design = dataModel.getDesignItemByModes(ps, this.compPointer, [hoverModeId]);
                expect(design.background.mediaRef.autoplay).toBeTruthy();
                expect(design.dataChangeBehaviors.length).toEqual(2);
            });
        });
    });
});
