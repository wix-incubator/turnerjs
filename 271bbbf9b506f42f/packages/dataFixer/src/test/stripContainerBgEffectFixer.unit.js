define(['lodash', 'dataFixer/plugins/stripContainerBgEffectFixer', 'dataFixer/plugins/behaviorsDataFixer'], function (_, stripContainerBgEffectFixer, behaviorsDataFixer) {
    'use strict';

    describe('stripContainerBgEffectFixer', function () {
        var json;
        var expectedParallaxBehavior = {action: 'bgScrub', name: 'BackgroundParallax', duration: 1, delay: 0};
        var mobileCompOnlyBehaviors = '[{"action":"bgScrub","name":"BackgroundParallax","duration":1,"delay":500}]';

        beforeEach(function () {
            json = {
                structure: {
                    id: 'pageToFix',
                    components: [
                        {
                            id: 'scroll',
                            componentType: 'wysiwyg.viewer.components.StripContainer',
                            designQuery: '#validQuery'
                        },
                        {
                            id: 'parallax',
                            componentType: 'wysiwyg.viewer.components.StripContainer',
                            designQuery: '#validQuery2'
                        },
                        {
                            id: 'parallaxBehavior',
                            componentType: 'wysiwyg.viewer.components.StripContainer',
                            designQuery: '#validQuery3',
                            behaviors: '[{"action":"someAction"},{"name": "ContainerFixedBg", "action": "bgScrub"}]'
                        },
                        {
                            "id": 'parallaxOnMobileOnly',
                            designQuery: '#validQuery4',
                            componentType: 'wysiwyg.viewer.components.StripContainer'
                        }
                    ],
                    mobileComponents: [
                        {
                            id: 'parallaxMobile',
                            componentType: 'wysiwyg.viewer.components.StripContainer',
                            designQuery: '#validMobileQuery',
                            behaviors: '[{"name": "ContainerFixedBg", "action": "bgScrub"}]'
                        },
                        {
                            "id": 'parallaxOnMobileOnly',
                            componentType: 'wysiwyg.viewer.components.StripContainer',
                            designQuery: '#validMobileQuery2',
                            behaviors: mobileCompOnlyBehaviors
                        }
                    ]
                },
                data: {
                    design_data: {
                        'validQuery': {
                            background: '#scrollQuery'
                        },
                        'validMobileQuery': {
                            background: '#parallaxMobileQuery'
                        },
                        'validMobileQuery2': {
                            background: '#parallaxMobileQuery2'
                        },
                        'validQuery2': {
                            background: '#parallaxQuery'
                        },
                        'validQuery3': {
                            background: '#parallaxBehaviorsQuery'
                        },
                        'validQuery4': {
                            background: '#parallaxBehaviorsQuery'
                        },
                        'scrollQuery': {
                            scrollType: 'scroll'
                        },
                        'parallaxQuery': {
                            scrollType: 'parallax'
                        },
                        'parallaxBehaviorsQuery': {
                            scrollType: 'parallax'
                        },
                        'parallaxMobileQuery': {
                            scrollType: 'parallax'
                        },
                        'parallaxMobileQuery2': {
                            scrollType: 'parallax'
                        }
                    }
                }
            };
        });

        describe('if no stripContainer', function () {

            it('should do nothing', function () {
                _.forEach(json.structure.components, function (comp) {
                    comp.componentType = 'someComp';
                });
                _.forEach(json.structure.mobileComponents, function (comp) {
                    comp.componentType = 'someComp';
                });
                var jsonBefore = _.cloneDeep(json);
                stripContainerBgEffectFixer.exec(json);

                expect(json).toEqual(jsonBefore);
            });
        });

        describe('if stripContainer', function () {
            it('should set all scrollType to "none"', function () {
                stripContainerBgEffectFixer.exec(json);
                var items = json.data.design_data;
                expect(items.scrollQuery.scrollType).toEqual('none');
                expect(items.parallaxQuery.scrollType).toEqual('none');
                expect(items.parallaxBehaviorsQuery.scrollType).toEqual('none');
                expect(items.parallaxMobileQuery.scrollType).toEqual('none');
            });

            it('should not add behavior when scrollType === scroll', function () {
                behaviorsDataFixer.exec(json);

                stripContainerBgEffectFixer.exec(json);

                var comps = json.structure.components;
                var scrollComp = _.find(comps, {id: 'scroll'});
                expect(scrollComp.behaviorQuery).toBeUndefined();
            });

            function getParsedBehaviors(behaviorQuery) {
                var behaviorsDataItem = _.get(json, ['data', 'behaviors_data', behaviorQuery], {});
                return JSON.parse(behaviorsDataItem.items);
            }

            it('should add behavior when scrollType !== scroll', function(){
                behaviorsDataFixer.exec(json);

                stripContainerBgEffectFixer.exec(json);

                var comps = json.structure.components;
                var expectedBehavior = [expectedParallaxBehavior];
                var parallaxComp = _.find(comps, {id: 'parallax'});
                expect(parallaxComp.behaviorQuery).toBeDefined();
                expect(getParsedBehaviors(parallaxComp.behaviorQuery)).toEqual(expectedBehavior);
            });

            it('should add behavior when scrollType !== scroll and keep other behaviors', function () {
                behaviorsDataFixer.exec(json);
                var comps = json.structure.components;

                stripContainerBgEffectFixer.exec(json);

                var parallaxBehaviorComp = _.find(comps, {id: 'parallaxBehavior'});
                var migratedBehaviorsString = getParsedBehaviors(parallaxBehaviorComp.behaviorQuery);
                expect(parallaxBehaviorComp.behaviorQuery).toBeDefined();
                expect(_.find(migratedBehaviorsString, {action: 'someAction'})).toBeDefined();
                expect(_.find(migratedBehaviorsString, {name: 'BackgroundParallax'})).toBeDefined();
            });

            it('should remove old ContainerFixedBg', function () {
                behaviorsDataFixer.exec(json);
                var comps = json.structure.components;

                stripContainerBgEffectFixer.exec(json);

                var parallaxBehaviorComp = _.find(comps, {id: 'parallaxBehavior'});
                expect(parallaxBehaviorComp.behaviorQuery).toBeDefined();
                expect(_.find(getParsedBehaviors(parallaxBehaviorComp.behaviorQuery), {name: 'ContainerFixedBg'})).toBeUndefined();
            });

            it('should remove behaviors from mobile comps', function () {
                behaviorsDataFixer.exec(json);

                stripContainerBgEffectFixer.exec(json);

                var comps = json.structure.mobileComponents;
                var parallaxComp = _.find(comps, {id: 'parallaxMobile'});
                expect(parallaxComp.behaviorQuery).toBeUndefined();
            });

            //due to SE-17166
            it('in case desktop comp does not have behaviors and mobile comp does have - should not take old format behaviors from mobile and should remove mobile behaviors from structure', function(){
                behaviorsDataFixer.exec(json);

                stripContainerBgEffectFixer.exec(json);

                var mobileComp = _.find(json.structure.mobileComponents, {id: 'parallaxOnMobileOnly'});
                expect(mobileComp.behaviors).toBeUndefined();
                expect(_.map(_.get(json, 'data.behaviors_data'), 'items')).not.toContain(mobileCompOnlyBehaviors);
            });

        });
    });

});
