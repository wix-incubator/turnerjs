define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/componentValidations',
    'documentServices/theme/theme',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/constants/constants'
], function (_, testUtils, privateServicesHelper, componentValidations, theme, componentsDefinitionsMap, constants) {
    'use strict';

    describe('Component: skin and style ', function () {
        var mockComponentDefinitionMap = _.defaults({
            mockTypeWithSystemStyleId: {styles: {'systemStyleId': 'someDefaultSkin'}},
            mockTypeWithSkin: {styles: {skin: 'mockSkin'}}
        }, componentsDefinitionsMap);

        var mocks = {
            'documentServices/component/componentValidations': componentValidations,
            'documentServices/theme/theme': theme,
            'documentServices/component/componentsDefinitionsMap': mockComponentDefinitionMap
        };

        testUtils.requireWithMocks('documentServices/component/componentStylesAndSkinsAPI', mocks, function (componentStylesAndSkinsAPI) {

            function getCompPointer(ps, compId, pageId) {
                var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return ps.pointers.components.getComponent(compId, page);
            }

            var privateServices;
            var siteData;
            beforeEach(function () {
                siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage');
                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });


            describe('getComponentSkin', function () {
                it('should get the component skin from the structure if comp has no style set.', function () {
                    var skinNameFromStructure = 'skinNameFromStructure';
                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', skin: skinNameFromStructure}]);
                    var pointer = getCompPointer(privateServices, 'comp', 'page1');

                    var result = componentStylesAndSkinsAPI.skin.get(privateServices, pointer);

                    expect(result).toBe(skinNameFromStructure);
                });

                it('should get the component skin from its style if set.', function () {
                    var skinNameFromStyle = 'skinNameFromStyle';
                    spyOn(theme.styles, 'get').and.returnValue({skin: skinNameFromStyle});

                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', skin: 'someSkin', styleId: 'styleToUse'}]);
                    var pointer = getCompPointer(privateServices, 'comp', 'page1');

                    var result = componentStylesAndSkinsAPI.skin.get(privateServices, pointer);

                    expect(result).toBe(skinNameFromStyle);
                });
            });

            describe('setComponentSkin', function () {
                var pointer;
                beforeEach(function () {
                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', skin: 'someSkin'}]);
                    pointer = getCompPointer(privateServices, 'comp', 'page1');
                });

                it('should successfully set the component skin', function () {
                    var newSkinName = 'mockSkin';
                    spyOn(componentValidations, 'validateSetSkinParams').and.returnValue({success: true});

                    componentStylesAndSkinsAPI.skin.set(privateServices, pointer, newSkinName);
                    var skin = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'skin'));
                    expect(skin).toBe(newSkinName);
                });

                it('should throw error and not create any side effects if validation fails', function () {
                    spyOn(componentValidations, 'validateSetSkinParams').and.returnValue({success: false, error: 'errorMessage'});

                    expect(componentStylesAndSkinsAPI.skin.set.bind(componentStylesAndSkinsAPI, privateServices, pointer, 'someCoolSkin')).toThrow();
                    var skin = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'skin'));
                    expect(skin).toBe('someSkin');
                });
            });

            describe('getComponentStyleId', function () {
                it('should return the component style', function () {
                    var styleId = 'mockStyleId';
                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', styleId: styleId}]);
                    var pointer = getCompPointer(privateServices, 'comp', 'page1');

                    var result = componentStylesAndSkinsAPI.style.getId(privateServices, pointer);

                    expect(result).toEqual(styleId);
                });
            });

            describe('setComponentStyleId', function () {
                var pointer;
                beforeEach(function () {
                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', styleId: 'someStyle', componentType: 'mockTypeWithSystemStyleId', skin: 'someOldSkin'}]);
                    pointer = getCompPointer(privateServices, 'comp', 'page1');
                    this.getStyleSpy = spyOn(theme.styles, 'get').and.returnValue(true);

                });

                describe('in case it should succseed', function () {
                    beforeEach(function () {
                        spyOn(componentValidations, 'validateSetStyleIdParams').and.returnValue({success: true});
                    });
                    it('should successfully set the component style ID', function () {
                        var newStyleId = 'newMockStyleId';

                        componentStylesAndSkinsAPI.style.setId(privateServices, pointer, newStyleId);
                        var style = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        expect(style).toBe(newStyleId);
                    });

                    it('should successfully set the component style ID in case the id belongs to a system style which is not yet registered', function () {
                        var systemStyleId = 'systemStyleId';

                        componentStylesAndSkinsAPI.style.setId(privateServices, pointer, systemStyleId);

                        var style = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        expect(style).toBe(systemStyleId);
                    });

                    it('should sync the skin in the component\'s structure with the skin in the style', function () {
                        var newStyleId = 'newMockStyleId';
                        var newSkinName = 'someNewSkin';
                        this.getStyleSpy.and.returnValue({
                            skin: newSkinName
                        });

                        componentStylesAndSkinsAPI.style.setId(privateServices, pointer, newStyleId);

                        var componentSkin = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'skin'));

                        expect(componentSkin).toEqual(newSkinName);
                    });

                    it('should execute the theme onChange event listener and callback after set id was done', function () {
                        var newStyleId = 'newMockStyleId';
                        var callback = jasmine.createSpy('callback');
                        this.getStyleSpy.and.returnValue({
                            style: {
                                properties: 'properties'
                            }
                        });
                        spyOn(theme.events.onChange, 'executeListeners');
                        componentStylesAndSkinsAPI.style.setId(privateServices, pointer, newStyleId, callback);
                        expect(callback).toHaveBeenCalledWith({styleProperties: 'properties'});
                        expect(theme.events.onChange.executeListeners).toHaveBeenCalled();
                    });
                });
                describe('in case it should fail', function () {

                    it('should throw error and not create any side effects if validation fails', function () {
                        spyOn(componentValidations, 'validateSetStyleIdParams').and.returnValue({success: false, error: 'errorMessage'});

                        expect(componentStylesAndSkinsAPI.style.setId.bind(componentStylesAndSkinsAPI, privateServices, pointer, 'someStyleId')).toThrow();
                        var style = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        expect(style).toBe('someStyle');
                    });
                    it('should throw an error in case the id belongs to a style that does not exist', function () {
                        var systemStyleNotExist = 'newId';
                        spyOn(componentValidations, 'validateSetStyleIdParams').and.returnValue({success: true});
                        this.getStyleSpy.and.returnValue(false);

                        var error = new Error('Style id - ' + systemStyleNotExist + ' is not a known system style id.');
                        expect(componentStylesAndSkinsAPI.style.setId.bind(componentStylesAndSkinsAPI, privateServices, pointer, systemStyleNotExist)).toThrow(error);
                    });
                });
            });

            xdescribe('setComponentCustomStyle', function () {
                describe('should succeed in these scenarios', function () {
                    var currentStyle;
                    var customStyleId = 'customStyleId';
                    //var wasStyleRegistered;


                    var pointer;
                    beforeEach(function () {
                        currentStyle = {
                            id: 'currentStyleId',
                            skin: 'skinValue',
                            style: {
                                properties: {exampleProp: 'exampleValue'},
                                propertiesSource: {exampleProp: 'value'}
                            }
                        };

                        privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', styleId: 'currentStyleId', componentType: 'mockTypeWithSkin'}])
                            .addCompTheme(currentStyle);
                        pointer = getCompPointer(privateServices, 'comp', 'page1');

                        spyOn(componentValidations, 'validateComponentCustomStyleParams').and.returnValue({success: true});
                        spyOn(componentValidations, 'validateSetStyleIdParams').and.returnValue({success: true});
                    });

                    it('not providing skin, style properties or ID -> skin + style properties should be taken from current style, ID generated', function () {
                        var generatedId = 'generatedId';
                        componentStylesAndSkinsAPI.style.setCustom(privateServices, generatedId, pointer);
                        var compStyleId = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        var styleItem = privateServices.dal.get(privateServices.pointers.data.getThemeItem(generatedId));

                        expect(compStyleId).toEqual(generatedId);
                        expect(styleItem.id).toEqual(generatedId);
                        expect(styleItem.skin).toEqual(currentStyle.skin);
                        expect(styleItem.style.properties).toEqual(currentStyle.style.properties);
                        expect(styleItem.style.propertiesSource).toEqual(currentStyle.style.propertiesSource);
                    });

                    it('providing ID and skin BUT NO style properties -> ID + skin taken from params, properties taken from current style', function () {
                        var overridingSkin = 'customSkin';
                        spyOn(theme.styles, 'get').and.returnValue(currentStyle);

                        componentStylesAndSkinsAPI.style.setCustom(privateServices, customStyleId, pointer, overridingSkin, null, customStyleId);

                        var compStyleId = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        var styleItem = privateServices.dal.get(privateServices.pointers.data.getThemeItem(customStyleId));
                        expect(compStyleId).toEqual(customStyleId);
                        expect(styleItem.id).toEqual(customStyleId);
                        expect(styleItem.skin).toEqual(overridingSkin);
                        expect(styleItem.style.properties).toEqual({});
                        expect(styleItem.style.propertiesSource).toEqual({});
                    });

                    it('providing ID AND skin AND style properties -> ID + skin + properties taken from params, propertiesSource generated', function () {
                        var overridingSkin = 'customSkin';
                        var overridingProperties = {
                            'exampleValueProp1': 'exampleValueProp1',
                            'exampleValueProp2': 'exampleValueProp2',
                            'exampleThemeProp': 'exampleThemeProp'
                        };
                        var expectedGeneratedPropertiesSource = {
                            'exampleValueProp1': 'value',
                            'exampleValueProp2': 'value',
                            'exampleThemeProp': 'theme'
                        };
                        //spyOn(theme.styles, 'get').and.returnValue(currentStyle);
                        spyOn(theme.colors, 'get').and.callFake(function (ps, value) {
                            return value === 'exampleThemeProp';
                        });

                        componentStylesAndSkinsAPI.style.setCustom(privateServices, customStyleId, pointer, overridingSkin, overridingProperties, customStyleId);

                        var resultCustomStyleIdUsedInDal = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        var resultCustomStyle = privateServices.dal.get(privateServices.pointers.data.getThemeItem(customStyleId));
                        expect(resultCustomStyleIdUsedInDal).toEqual(customStyleId);
                        expect(resultCustomStyle.id).toEqual(customStyleId);
                        expect(resultCustomStyle.skin).toEqual(overridingSkin);
                        expect(resultCustomStyle.style.properties).toEqual(overridingProperties);
                        expect(resultCustomStyle.style.propertiesSource).toEqual(expectedGeneratedPropertiesSource);
                    });

                    it('providing ID AND skin to a component with no current style -> ID + skin from params, properties empty (default)', function () {
                        var overridingSkin = 'customSkin';
                        //spyOn(theme.styles, 'get').and.callFake(function () {
                        //    return wasStyleRegistered;
                        //});

                        componentStylesAndSkinsAPI.style.setCustom(privateServices, customStyleId, pointer, overridingSkin, null, customStyleId);

                        var resultCustomStyleIdUsedInDal = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'styleId'));
                        var resultCustomStyle = privateServices.dal.get(privateServices.pointers.data.getThemeItem(customStyleId));
                        expect(resultCustomStyleIdUsedInDal).toEqual(customStyleId);
                        expect(resultCustomStyle.id).toEqual(customStyleId);
                        expect(resultCustomStyle.skin).toEqual(overridingSkin);
                        expect(resultCustomStyle.style.properties).toEqual({});
                        expect(resultCustomStyle.style.propertiesSource).toEqual({});
                    });

                    describe('adding a custom style to a component should fail in these scenarios', function () {
                        it('should throw error and not create any side effects if validation fails', function () {
                            spyOn(componentValidations, 'validateComponentCustomStyleParams').and.returnValue({success: false, error: 'errorMessage'});
                            //spyOn(theme.styles, 'update');
                            //spyOn(privateServices.dal, 'set');

                            var resultStyleId = "mockStyleId";
                            expect(componentStylesAndSkinsAPI.style.setCustom.bind(componentStylesAndSkinsAPI, privateServices, resultStyleId, pointer)).toThrow();
                            expect(componentStylesAndSkinsAPI.style.setCustom.bind(componentStylesAndSkinsAPI, privateServices, resultStyleId, pointer, "mockStyleId")).toThrow();
                            expect(componentStylesAndSkinsAPI.style.setCustom.bind(componentStylesAndSkinsAPI, privateServices, resultStyleId, pointer, "mockStyleId", "mockSkin")).toThrow();
                            expect(componentStylesAndSkinsAPI.style.setCustom.bind(componentStylesAndSkinsAPI, privateServices, resultStyleId, pointer, "mockStyleId", "mockSkin", {})).toThrow();
                            expect(theme.styles.update).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});