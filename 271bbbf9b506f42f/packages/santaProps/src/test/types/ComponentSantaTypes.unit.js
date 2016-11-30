define(['testUtils', 'santaProps/types/modules/ComponentSantaTypes'], function (/** testUtils */ testUtils, ComponentSantaTypes) {
    'use strict';

    describe('ComponentSantaTypes.', function () {

        it('structure should return the component structure', function () {
            var compStructure = {
                componentType: 'mockCompType',
                layout: {x: 0, y: 1},
                dataQuery: '#data1'
            };

            var siteData = testUtils.mockFactory.mockSiteData();

            var structure = ComponentSantaTypes.structure.fetch({siteData: siteData}, {structure: compStructure});
            var structureRequired = ComponentSantaTypes.structure.isRequired.fetch({siteData: siteData}, {structure: compStructure});

            expect(structure).toEqual(compStructure);
            expect(structureRequired).toEqual(compStructure);
        });

        it('id should return the component id', function () {
            var compStructure = {
                id: 'mockId',
                componentType: 'mockCompType',
                layout: {x: 0, y: 1},
                dataQuery: '#data1'
            };

            var siteData = testUtils.mockFactory.mockSiteData();

            var id = ComponentSantaTypes.id.fetch({siteData: siteData}, {structure: compStructure});
            var idRequired = ComponentSantaTypes.id.isRequired.fetch({siteData: siteData}, {structure: compStructure});

            expect(id).toEqual('mockId');
            expect(idRequired).toEqual('mockId');
        });

        it('key should return the component id', function () {
            var compStructure = {
                id: 'mockId',
                componentType: 'mockCompType',
                layout: {x: 0, y: 1},
                dataQuery: '#data1'
            };

            var siteData = testUtils.mockFactory.mockSiteData();

            var key = ComponentSantaTypes.key.fetch({siteData: siteData}, {structure: compStructure});
            var keyRequired = ComponentSantaTypes.key.isRequired.fetch({siteData: siteData}, {structure: compStructure});

            expect(key).toEqual('mockId');
            expect(keyRequired).toEqual('mockId');
        });

        it('ref should return the component id', function () {
            var compStructure = {
                id: 'mockId',
                componentType: 'mockCompType',
                layout: {x: 0, y: 1},
                dataQuery: '#data1'
            };

            var siteData = testUtils.mockFactory.mockSiteData();

            var ref = ComponentSantaTypes.ref.fetch({siteData: siteData}, {structure: compStructure});
            var refRequired = ComponentSantaTypes.ref.isRequired.fetch({siteData: siteData}, {structure: compStructure});

            expect(ref).toEqual('mockId');
            expect(refRequired).toEqual('mockId');
        });

        it('refInParent should return the component id', function () {
            var compStructure = {
                id: 'mockId',
                componentType: 'mockCompType',
                layout: {x: 0, y: 1},
                dataQuery: '#data1'
            };

            var siteData = testUtils.mockFactory.mockSiteData();

            var refInParent = ComponentSantaTypes.refInParent.fetch({siteData: siteData}, {structure: compStructure});
            var refInParentRequired = ComponentSantaTypes.refInParent.isRequired.fetch({siteData: siteData}, {structure: compStructure});

            expect(refInParent).toEqual('mockId');
            expect(refInParentRequired).toEqual('mockId');
        });

        it('pageId should return the component\'s rootId', function () {
            var siteData = testUtils.mockFactory.mockSiteData();

            var pageId = ComponentSantaTypes.pageId.fetch({siteData: siteData}, {rootId: 'mockRootId'});
            var pageIdRequired = ComponentSantaTypes.pageId.isRequired.fetch({siteData: siteData}, {rootId: 'mockRootId'});

            expect(pageId).toEqual('mockRootId');
            expect(pageIdRequired).toEqual('mockRootId');
        });

        it('rootId should return the component\'s rootId', function () {
            var siteData = testUtils.mockFactory.mockSiteData();

            var rootId = ComponentSantaTypes.rootId.fetch({siteData: siteData}, {rootId: 'mockRootId'});
            var rootIdRequired = ComponentSantaTypes.rootId.isRequired.fetch({siteData: siteData}, {rootId: 'mockRootId'});

            expect(rootId).toEqual('mockRootId');
            expect(rootIdRequired).toEqual('mockRootId');
        });

        it('currentUrlPageId should return the current url page id', function () {
            var siteData = testUtils.mockFactory.mockSiteData();

            var rootNavigationInfo = ComponentSantaTypes.currentUrlPageId.fetch({siteData: siteData});
            var rootNavigationInfoRequired = ComponentSantaTypes.currentUrlPageId.isRequired.fetch({siteData: siteData});

            expect(rootNavigationInfo).toEqual('currentPage');
            expect(rootNavigationInfoRequired).toEqual('currentPage');
        });

        it('styleId should return the component\'s style id from the loadedStyles map', function () {
            var loadedStyles = {
                styleId0: 's666'
            };
            var compStructure = {
                styleId: 'styleId0'
            };

            var styleId = ComponentSantaTypes.styleId.fetch({stylesMap: loadedStyles}, {structure: compStructure});
            var styleIdRequired = ComponentSantaTypes.styleId.isRequired.fetch({stylesMap: loadedStyles}, {structure: compStructure});

            expect(styleId).toEqual('s666');
            expect(styleIdRequired).toEqual('s666');
        });

        describe('skin', function () {

            it('should return the skin from the component structure', function () {
                var compStructure = {
                    skin: 'mock.skin'
                };

                var skin = ComponentSantaTypes.skin.fetch({}, {structure: compStructure});
                var skinRequired = ComponentSantaTypes.skin.isRequired.fetch({}, {structure: compStructure});

                expect(skin).toEqual('mock.skin');
                expect(skinRequired).toEqual('mock.skin');
            });

            it('should return the skin from the component style', function () {
                var props = testUtils.mockFactory.mockProps().setThemeStyle({
                    id: 'styleId0',
                    skin: 'mock.style.skin'
                });

                var compStructure = {
                    styleId: props.styleId,
                    skin: 'mock.skin'
                };

                var skin = ComponentSantaTypes.skin.fetch({siteData: props.siteData}, {structure: compStructure});
                var skinRequired = ComponentSantaTypes.skin.isRequired.fetch({siteData: props.siteData}, {structure: compStructure});

                expect(skin).toEqual('mock.style.skin');
                expect(skinRequired).toEqual('mock.style.skin');
            });

        });

        it('style should return the component style', function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            var compStructure = {
                layout: {
                    x: 10,
                    y: 20,
                    width: 30,
                    height: 40,
                    position: 'relative'
                }
            };

            var style = ComponentSantaTypes.style.fetch({siteAPI: siteAPI}, {structure: compStructure});
            var styleRequired = ComponentSantaTypes.style.isRequired.fetch({siteAPI: siteAPI}, {structure: compStructure});

            var expectedStyle = {
                left: 10,
                top: 20,
                bottom: '',
                right: '',
                width: 30,
                height: 40,
                position: 'relative'
            };
            expect(style).toEqual(expectedStyle);
            expect(styleRequired).toEqual(expectedStyle);
        });

        it('compBehaviors should return the component behaviors', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            var props = testUtils.mockFactory.mockProps(siteData);
            var mockBehavior = testUtils.mockFactory.behaviorMocks.comp(props.structure.id, 'someFuncName', {});
            var expectedResult = [{name: mockBehavior.name, params: mockBehavior.params, callback: undefined}];

            props.siteAPI.getSiteAspect('behaviorsAspect').registerBehavior(mockBehavior);
            var compBehaviors = ComponentSantaTypes.compBehaviors.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});

            expect(compBehaviors).toEqual(expectedResult);
        });

        it('required compBehaviors should return the component behaviors', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            var props = testUtils.mockFactory.mockProps(siteData);
            var mockBehavior = testUtils.mockFactory.behaviorMocks.comp(props.structure.id, 'someFuncName', {});
            var expectedResult = [{name: mockBehavior.name, params: mockBehavior.params, callback: undefined}];

            props.siteAPI.getSiteAspect('behaviorsAspect').registerBehavior(mockBehavior);
            var compBehaviorsRequired = ComponentSantaTypes.compBehaviors.isRequired.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});

            expect(compBehaviorsRequired).toEqual(expectedResult);
        });

        it('compBehaviors should return the empty array to in case no behavior was registered', function(){
            var siteData = testUtils.mockFactory.mockSiteData();
            var props = testUtils.mockFactory.mockProps(siteData);

            var compBehaviors = ComponentSantaTypes.compBehaviors.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});
            var compBehaviorsRequired = ComponentSantaTypes.compBehaviors.isRequired.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});

            expect(compBehaviors).toEqual([]);
            expect(compBehaviorsRequired).toEqual([]);
        });

        it('compProp should return the component properties', function () {
            var propItem = {
                id: 'propId1',
                prop1: 'val1',
                prop2: 'val2'
            };
            var props = testUtils.mockFactory.mockProps().setCompProp(propItem);

            var compProp = ComponentSantaTypes.compProp.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});
            var compPropRequired = ComponentSantaTypes.compProp.isRequired.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});

            expect(compProp).toEqual(propItem);
            expect(compPropRequired).toEqual(propItem);
        });

        it('compData should return the component data', function () {
            var dataItem = {
                id: 'dataItem1',
                data1: 'val1',
                data2: 'val2'

            };
            var props = testUtils.mockFactory.mockProps().setCompData(dataItem);

            var compData = ComponentSantaTypes.compData.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});
            var compDataRequired = ComponentSantaTypes.compData.isRequired.fetch({siteData: props.siteData, siteAPI: props.siteAPI}, {structure: props.structure});

            expect(compData).toEqual(dataItem);
            expect(compDataRequired).toEqual(dataItem);
        });

        it('compActions should return teh comp actions from the behaviors site aspect', function () {
            var siteAPI = testUtils.mockFactory.mockSiteAPI();
            siteAPI.registerMockSiteAspect('behaviorsAspect', {
                getActions: function (type, id) {
                    var mockActions = {
                        comp: {
                            someId: {some: 'actions'}
                        }
                    };

                    return mockActions[type][id];
                }
            });

            var compStructure = {
                id: 'someId'
            };

            var compActions = ComponentSantaTypes.compActions.fetch({siteAPI: siteAPI}, {structure: compStructure});
            var compActionRequired = ComponentSantaTypes.compActions.isRequired.fetch({siteAPI: siteAPI}, {structure: compStructure});

            expect(compActions).toEqual({some: 'actions'});
            expect(compActionRequired).toEqual({some: 'actions'});
        });

        it('theme should return the component theme style', function () {
            var styleItem = {
                id: 'styleId1',
                skin: 'some.skin',
                style: {
                    some: 'style'
                }
            };
            var props = testUtils.mockFactory.mockProps().setThemeStyle(styleItem);

            var theme = ComponentSantaTypes.theme.fetch({siteData: props.siteData}, {structure: props.structure});
            var themeRequired = ComponentSantaTypes.theme.isRequired.fetch({siteData: props.siteData}, {structure: props.structure});

            expect(theme).toEqual(styleItem);
            expect(themeRequired).toEqual(styleItem);
        });
    });
});
