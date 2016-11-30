define([
    'lodash',
    'testUtils',
    'santaProps/propsBuilder/componentPropsBuilder',
    'santaProps/utils/propsSelectorsFactory'
], function(_,
            /** testUtils */ testUtils,
            /** core.componentPropsBuilder */ componentPropsBuilder,
            propsSelectorsFactory){
    "use strict";

    var openExperiments = testUtils.experimentHelper.openExperiments;

    function getDefaultStyleObject(){
        return {
            top: '',
            bottom: '',
            left: '',
            right: '',
            width: '',
            height: '',
            position: ''
        };
    }

    function getCompStructure(compId, dataQuery, propertyQuery) {
        return {
            id: compId,
            componentType: compId + 'Type',
            type: 'Component',
            skin: 'skin1',
            propertyQuery: propertyQuery,
            dataQuery: dataQuery,
            styleId: 'style1'
        };
    }

    describe("componentPropsBuilder", function(){
        beforeEach(function(){
            this.structure = {
                "id": "comp1",
                "styleId": "style1",
                "skin": "skin1"
            };

            this.siteAPI = testUtils.mockFactory.mockSiteAPI();
            this.siteData = this.siteAPI.getSiteData();
        });


        describe("general settings", function(){
            it("should set page id to master page if non passed", function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.rootId).toBe("masterPage");
            });
            it("should set page id to the passed page id", function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI, "pageTest");
                expect(props.rootId).toBe("pageTest");
            });

            it("should set styleId to the id in the stylesMap (by structure styleId) if present", function(){
                var stylesMap = {};
                stylesMap[this.structure.styleId] = "s1";
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI, undefined, stylesMap);
                expect(props.styleId).toBe("s1");
            });
            it("should set styleId to the id in the stylesMap (by skin) if present", function(){
                var stylesMap = {};
                stylesMap[this.structure.skin] = "s2";
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI, undefined, stylesMap);
                expect(props.styleId).toBe("s2");
            });
            it("should set styleId to structure styleId if no stylesMap passed", function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.styleId).toBe(this.structure.styleId);
            });
        });

        describe("skin", function(){
            it("should return the skin from the style if present", function(){
                var theme = {};
                theme[this.structure.styleId] = {skin: "styleSkin"};
                spyOn(this.siteData, "getAllTheme").and.returnValue(theme);

                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.skin).toBe("styleSkin");
            });
            it("should return the structure skin if no styleId", function(){
                delete this.structure.styleId;
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.skin).toBe(this.structure.skin);
            });
            it("should return the structure skin if style id isn't in the map", function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.skin).toBe(this.structure.skin);
            });
        });

        describe("comp position and layout", function(){
            it("should return default style object with position absolute if no structure layout", function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);

                var defaultStyleObject = getDefaultStyleObject();
                defaultStyleObject.position = 'absolute';
                expect(props.style).toEqual(defaultStyleObject);
            });
            it("should add the comp layout if there is structure layout", function(){
                this.structure.layout = {'y': 2};
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.style.position).toBe("absolute");
                expect(props.style.top).toBe(2);
            });
            it("should return position: fixed for components that have fixedPosition=true in the layout", function () {
                this.structure.layout = {'x': 0, 'y': 10, 'fixedPosition': true};
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.style.position).toBe("fixed");
            });
            it('component style object should contain all defaults style properties', function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);

                var defaultStyleObject = getDefaultStyleObject();
                expect(_.keys(props.style)).toContain(_.keys(defaultStyleObject));
            });
        });

        describe('comp actions', function () {
            it('should set compActions as an empty array if no action is registered for the component', function () {
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                expect(props.compActions).toEqual({});
            });

            it('should set compActions with the actions that are registered for the component', function () {
                var behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                var compId = this.structure.id;
                var action = {
                    type: 'comp',
                    sourceId: compId,
                    name: 'click'
                };

                var actionsAndBehaviors = [{action: action, behavior: {}}];
                var pageId = this.siteData.getCurrentUrlPageId();
                behaviorsAspect.setBehaviorsForActions(actionsAndBehaviors, pageId);

                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI, pageId);
                var expected = {};
                expected[action.name] = action;
                expect(props.compActions).toEqual(expected);
            });

            it('should set compActions only with the actions with type "comp" that are registered for the component', function () {
                var behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                var compId = this.structure.id;
                var action = {
                    type: 'comp',
                    sourceId: compId,
                    name: 'click'
                };
                var action2 = _.defaults({type: 'otherType'}, action);
                var actionsAndBehaviors = [{action: action, behavior: {}}, {action: action2, behavior: {}}];
                var pageId = this.siteData.getCurrentUrlPageId();
                behaviorsAspect.setBehaviorsForActions(actionsAndBehaviors, pageId);

                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI, pageId);
                var expected = {};
                expected[action.name] = action;
                expect(props.compActions).toEqual(expected);
            });
        });

        describe('wix code binding', function() {

            it('should get compData from the runtimeDal', function () {
                var compId = 'comp1';
                var pageId = 'page1';
                var dataQuery = compId + 'DataQuery';

                var structure = getCompStructure(compId, dataQuery);
                var compData = {id: dataQuery, barvaz: 'oger', shahar: 'zur'};

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId)
                    .addData(compData, pageId);

	            siteData.setRootNavigationInfo({pageId: pageId});
	            var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var newData = {barvaz: 1, shahar: 1};
                siteAPI.getRuntimeDal().setCompData(compId, newData);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compData).toEqual(_.defaults(newData, compData));
            });

            it('should get compProp from the runtimeDal', function () {
                var compId = 'comp1';
                var pageId = 'page1';
                var propertyQuery = compId + 'PropQuery';

                var structure = getCompStructure(compId, undefined, propertyQuery);
                var compProp = {id: propertyQuery, shai: 'boten', batata: 'afuya'};

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId)
                    .addProperties(compProp, pageId);

	            siteData.setRootNavigationInfo({pageId: pageId});
                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var newProp = {shai: 'boten1', batata: 'afuya2'};
                siteAPI.getRuntimeDal().setCompProps(compId, newProp);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compProp).toEqual(_.defaults(newProp, compProp));
            });
        });

        describe("properties and data", function(){
            it("should set properties if present in the structure", function(){
                var compId = 'comp1';
                var pageId = 'page1';
                var propertyQuery = compId + 'PropQuery';

                var structure = getCompStructure(compId, undefined, propertyQuery);
                var compProp = {id: propertyQuery, shai: 'boten', batata: 'afuya'};

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId)
                    .addProperties(compProp, pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compProp).toEqual(compProp);
            });

            it("should return an empty properties dict if not present in the structure", function(){
                var compId = 'comp1';
                var pageId = 'page1';

                var structure = getCompStructure(compId, undefined, undefined);

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compProp).toEqual({});
            });

            it("should set data if present in the structure", function(){
                var compId = 'comp1';
                var pageId = 'page1';
                var dataQuery = compId + 'DataQuery';

                var structure = getCompStructure(compId, dataQuery);
                var compData = {id: dataQuery, barvaz: 'oger', shahar: 'zur'};

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId)
                    .addData(compData, pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compData).toEqual(compData);
            });
            it("should not set data if not present in the structure", function(){
                var compId = 'comp1';
                var pageId = 'page1';

                var structure = getCompStructure(compId);

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId);

                expect(props.compData).toBeUndefined();
            });

        });

        describe('specific component props', function() {

            it('should get props for component', function() {
                openExperiments('santaTypes');
                var compId = _.uniqueId('comp1');
                var pageId = 'page1';

                var structure = getCompStructure(compId);

                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([structure], pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);

                var stylesMap = {'skin': 's1'};

                var compDefinition = {
                    propTypes: {
                        myUniqueProp: {
                            fetch: function(state, props){
                                expect(state.siteData).toBe(siteAPI.getSiteData());
                                expect(state.siteAPI).toBe(siteAPI);
                                expect(state.stylesMap).toBe(stylesMap);
                                expect(props.structure).toBe(structure);
                                expect(props.rootId).toBe(pageId);
                                return 'wow';
                            }
                        }
                    }
                };

                propsSelectorsFactory.registerComponent(structure.componentType, compDefinition);

                var props = componentPropsBuilder.getCompProps(structure, siteAPI, pageId, stylesMap);

                expect(props.myUniqueProp).toBe('wow');
            });
        });

        describe('comp behaviors', function(){
            it('should set the component registered behaviors to compBehaviors props', function(){
                var behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                var mockBehavior = testUtils.mockFactory.behaviorMocks.comp(this.structure.id, 'someFuncName', {});
                behaviorsAspect.registerBehavior(mockBehavior);
                var expectedResult = [{name: mockBehavior.name, params: mockBehavior.params, callback: undefined}];

                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);

                expect(props.compBehaviors).toEqual(expectedResult);
            });

            it('should set an empty array to compBehaviors props in case no behavior was registered', function(){
                var props = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);

                expect(props.compBehaviors).toEqual([]);
            });

            it('should clear the registered behaviors for the component', function(){//should find a better way to do this ugly thing
                var behaviorsAspect = this.siteAPI.getSiteAspect('behaviorsAspect');
                var mockBehavior = testUtils.mockFactory.behaviorMocks.comp(this.structure.id, 'myFuncName', {});
                behaviorsAspect.registerBehavior(mockBehavior);

                var firstProps = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);
                var secondProps = componentPropsBuilder.getCompProps(this.structure, this.siteAPI);

                expect(firstProps.compBehaviors).not.toEqual(secondProps.compBehaviors);
                expect(secondProps.compBehaviors).toEqual([]);
            });
        });
    });
});
