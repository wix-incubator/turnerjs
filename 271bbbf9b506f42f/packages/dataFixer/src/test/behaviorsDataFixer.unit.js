define(['lodash', 'testUtils', 'dataFixer/plugins/behaviorsDataFixer'], function(_, testUtils, behaviorsDataFixer) {
    'use strict';

    describe('behaviorsDataFixer', function() {

        function buildDesktopComponentWithBehaviors(compType, behaviors) {
            var compStructure = {
                behaviors: behaviors || '[{"action":"screenIn","name":"SpinIn","delay":0,"duration":1.2,"params":{"cycles":2,"direction":"cw"},"targetId":""}]'
            };
            return testUtils.mockFactory.createStructure(compType, compStructure);
        }

        function buildMobileComponentAndAddToPage(compType, mockSiteData, pageId, compId) {
            return testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, {}, true, compId);
        }

        function getExpectedBehaviorsDataItem(newBehaviorsOnStructure, compBehaviors) {
            var expectedBehaviorDataItem = {
                id: _.trimLeft(newBehaviorsOnStructure, '#'),
                type: 'ObsoleteBehaviorsList',
                items: compBehaviors
            };
            return expectedBehaviorDataItem;
        }

        describe('when component with behaviors is on a regular page', function(){

            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.pageId = 'myTestPage';
                this.compType = 'someType';
                this.comp = buildDesktopComponentWithBehaviors(this.compType);
                this.mockSiteData.addPageWithDefaults(this.pageId, [this.comp]);
            });

            it('should move the component behavior to the page behaviors_data map ', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                var compBehaviors = this.comp.behaviors;

                behaviorsDataFixer.exec(pageJson);

                var behaviorQuery = _.get(pageJson, 'structure.components.0.behaviorQuery');
                var behaviorsDataItem = _.get(pageJson, ['data', 'behaviors_data', behaviorQuery]);
                expect(behaviorsDataItem).toEqual(getExpectedBehaviorsDataItem(behaviorQuery, compBehaviors));

            });

            it('should set the new behavior data item to behaviorQuery property', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.get(pageJson, 'structure.components.0');
                var behaviorQuery = compStructure.behaviorQuery;
                expect(behaviorQuery).toBeDefined();
            });

            it('should remove the behaviors property from the component structure', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.get(pageJson, 'structure.components.0');
                expect(compStructure.behaviors).toBeUndefined();
            });

            it('should set the behaviorQuery of the desktop component to the corresponding mobile component', function(){
                var mobileComp = buildMobileComponentAndAddToPage(this.compType, this.mockSiteData, this.pageId, this.comp.id);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.get(pageJson, 'structure.components.0');
                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(mobileCompStructure.behaviorQuery).toEqual(compStructure.behaviorQuery);
            });

            it('should do nothing if a component with behaviors was already migrated', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);
                var pageBefore = _.cloneDeep(pageJson);
                behaviorsDataFixer.exec(pageJson);

                expect(pageJson).toEqual(pageBefore);
            });
        });

        describe('when component with behaviors is on the masterPage', function(){
            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.pageId = 'masterPage';
                this.compType = 'someType';
                this.comp = buildDesktopComponentWithBehaviors(this.compType);
                testUtils.mockFactory.addCompToPage(this.mockSiteData, this.pageId, this.comp);
            });

            it('should move the component behavior to the page behaviors_data map ', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                var compBehaviors = this.comp.behaviors;

                behaviorsDataFixer.exec(pageJson);

                var behaviorQuery = _.find(pageJson.structure.children, {id: this.comp.id}).behaviorQuery;
                var behaviorsDataItem = _.get(pageJson, ['data', 'behaviors_data', behaviorQuery]);
                expect(behaviorsDataItem).toEqual(getExpectedBehaviorsDataItem(behaviorQuery, compBehaviors));

            });

            it('should set the new behavior data item to behaviorQuery property', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.children, {id: this.comp.id});
                var behaviorQuery = compStructure.behaviorQuery;
                expect(behaviorQuery).toBeDefined();
            });

            it('should remove the behaviors property from the component structure', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.children, {id: this.comp.id});
                expect(compStructure.behaviors).toBeUndefined();
            });

            it('should set the behaviorQuery of the desktop component to the corresponding mobile component', function(){
                var mobileComp = buildMobileComponentAndAddToPage(this.compType, this.mockSiteData, this.pageId, this.comp.id);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.find(pageJson.structure.children, {id: this.comp.id});
                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(mobileCompStructure.behaviorQuery).toEqual(compStructure.behaviorQuery);
            });

            it('should do nothing if a component with behaviors was already migrated', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);
                var pageBefore = _.cloneDeep(pageJson);
                behaviorsDataFixer.exec(pageJson);

                expect(pageJson).toEqual(pageBefore);
            });
        });

        describe('when one of the components with behaviors is a child of a container in the page', function(){
            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.pageId = 'myTestPage';
                this.compType = 'someType';
                this.comp = buildDesktopComponentWithBehaviors(this.compType);
                this.anotherCompType = 'anotherType';
                var anotherCompBehavior = '[{"action":"screenIn","name":"Reveal","delay":0,"duration":1.2,"params":{"direction":"left"},"targetId":""}]';
                this.anotherComp = buildDesktopComponentWithBehaviors(this.anotherCompType, anotherCompBehavior);
                var containerStructure = {
                    components: [this.comp]
                };
                var container = testUtils.mockFactory.createStructure('mobile.core.components.Container', containerStructure);
                this.mockSiteData.addPageWithDefaults(this.pageId, [container, this.anotherComp]);
            });

            it('should move the components behaviors to the page behaviors_data map ', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                var firstCompBehaviors = this.comp.behaviors;
                var secondCompBehaviors = this.anotherComp.behaviors;

                behaviorsDataFixer.exec(pageJson);

                var firstBehaviorsQuery = _.get(pageJson, 'structure.components.0.components.0.behaviorQuery');
                var secondBehaviorQuery = _.get(pageJson, 'structure.components.1.behaviorQuery');
                var firstBehaviorsDataItem = _.get(pageJson, ['data', 'behaviors_data', _.trimLeft(firstBehaviorsQuery, '#')]);
                var secondBehaviorsDataItem = _.get(pageJson, ['data', 'behaviors_data', _.trimLeft(secondBehaviorQuery, '#')]);
                expect(firstBehaviorsDataItem).toEqual(getExpectedBehaviorsDataItem(firstBehaviorsQuery, firstCompBehaviors));
                expect(secondBehaviorsDataItem).toEqual(getExpectedBehaviorsDataItem(secondBehaviorQuery, secondCompBehaviors));

            });

            it('should set the new behavior data items to the components behaviorQuery properties', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var firstBehaviorsQuery = _.get(pageJson, 'structure.components.0.components.0.behaviorQuery');
                var secondBehaviorsQuery = _.get(pageJson, 'structure.components.1.behaviorQuery');
                expect(firstBehaviorsQuery).toBeDefined();
                expect(secondBehaviorsQuery).toBeDefined();
            });

            it('should remove the behaviors properties from the components structures', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var firstCompStructure = _.get(pageJson, 'structure.components.0.components.0');
                var secondCompStructure = _.get(pageJson, 'structure.components.1');
                expect(firstCompStructure.behaviors).toBeUndefined();
                expect(secondCompStructure.behaviors).toBeUndefined();
            });

            it('should set the behaviorQuery of the desktop components to the corresponding mobile components', function(){
                var firstMobileComp = buildMobileComponentAndAddToPage(this.compType, this.mockSiteData, this.pageId, this.comp.id);
                var secondMobileComp = buildMobileComponentAndAddToPage(this.anotherCompType, this.mockSiteData, this.pageId, this.anotherComp.id);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var firstCompStructure = _.get(pageJson, 'structure.components.0.components.0');
                var secondCompStructure = _.get(pageJson, 'structure.components.1');
                var firstMobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: firstMobileComp.id});
                var secondMobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: secondMobileComp.id});
                expect(firstMobileCompStructure.behaviorQuery).toEqual(firstCompStructure.behaviorQuery);
                expect(secondMobileCompStructure.behaviorQuery).toEqual(secondCompStructure.behaviorQuery);
            });

            it('should do nothing if a component with behaviors was already migrated', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);
                var pageBefore = _.cloneDeep(pageJson);
                behaviorsDataFixer.exec(pageJson);

                expect(pageJson).toEqual(pageBefore);
            });

        });

        describe('when page has behaviors', function(){
            beforeEach(function(){
                var pagePartialStructure = {
                    behaviors: '[{"action":"screenIn","name":"SpinIn","delay":0,"duration":1.2,"params":{"cycles":2,"direction":"cw"},"targetId":""}]'
                };
                this.pageId = 'myTestPage';
                this.mockSiteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(this.pageId, [])
                    .updatePageStructure(this.pageId, pagePartialStructure);
            });

            it('should move the component behavior to the page behaviors_data map ', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);
                var pageBehaviors = pageJson.structure.behaviors;

                behaviorsDataFixer.exec(pageJson);

                var behaviorQuery = _.get(pageJson, 'structure.behaviorQuery');
                var behaviorsDataItem = _.get(pageJson, ['data', 'behaviors_data', behaviorQuery]);
                expect(behaviorsDataItem).toEqual(getExpectedBehaviorsDataItem(behaviorQuery, pageBehaviors));

            });

            it('should set the new behavior data item to behaviorQuery property', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var behaviorQuery = _.get(pageJson, 'structure.behaviorQuery');
                expect(behaviorQuery).toBeDefined();
            });

            it('should remove the behaviors property from the component structure', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                expect(_.get(pageJson, 'structure.behaviors')).toBeUndefined();
            });

            it('should do nothing if a page with behaviors was already migrated', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);
                var pageBefore = _.cloneDeep(pageJson);
                behaviorsDataFixer.exec(pageJson);

                expect(pageJson).toEqual(pageBefore);
            });
        });

        describe('when component does not have behaviors', function(){
            beforeEach(function(){
                this.comp = testUtils.mockFactory.createStructure('mobile.core.components.Container');
                this.pageId = 'myTestPage';
                this.mockSiteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId, [this.comp]);
            });

            it('should not create a behaviors data item in behaviors_data map', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var behaviorsDataItems = _.get(pageJson, ['data', 'behaviors_data']);
                expect(_.isEmpty(behaviorsDataItems)).toBe(true);

            });

            it('behaviorQuery property on the component structure should not exist', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.get(pageJson, 'structure.components.0');
                var behaviorQuery = compStructure.behaviorQuery;
                expect(behaviorQuery).toBeUndefined();
            });

            it('behaviors property should remain undefined', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var compStructure = _.get(pageJson, 'structure.components.0');
                expect(compStructure.behaviors).toBeUndefined();
            });

            it('behaviorQuery property on the corresponding mobile component should not be set', function(){
                var mobileComp = buildMobileComponentAndAddToPage(this.compType, this.mockSiteData, this.pageId, this.comp.id);
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                var mobileCompStructure = _.find(pageJson.structure.mobileComponents, {id: mobileComp.id});
                expect(mobileCompStructure.behaviorQuery).toBeUndefined();
            });

            it('should create behaviors_data map anyway', function(){
                var pageJson = this.mockSiteData.getPageData(this.pageId);

                behaviorsDataFixer.exec(pageJson);

                expect(_.get(pageJson, 'data.behaviors_data')).toEqual({});
            });

        });
    });
});
