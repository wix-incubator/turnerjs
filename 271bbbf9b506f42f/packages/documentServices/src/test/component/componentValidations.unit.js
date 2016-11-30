define(['lodash', 'testUtils',
    'fake!documentServices/page/pageData',
    'fake!documentServices/dataAccessLayer/DataAccessLayer',
    'fake!documentServices/theme/theme',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/componentDeprecation'
], function (_, testUtils, pageData, FakeDataAccessLayer, theme, constants, privateServicesHelper, deprecation) {
    'use strict';

    var ps,
        siteData,

        ERRORS = {
            COMPONENT_DOES_NOT_EXIST: 'component param does not exist',
            INVALID_COMPONENT_STRUCTURE: 'invalid component structure',
            INVALID_CONTAINER_STRUCTURE: 'invalid container structure',
            CANNOT_ADD_COMPONENT_TO_MOBILE_PATH: 'cannot add component to mobile path',
            CANNOT_DELETE_MASTER_PAGE: 'cannot delete master page',
            SITE_MUST_HAVE_AT_LEAST_ONE_PAGE: 'site must have at least one page',
            CANNOT_DELETE_MOBILE_COMPONENT: 'cannot delete mobile component',
            CUSTOM_ID_MUST_BE_STRING: 'customId must be a string',
            COMPONENT_IS_NOT_CONTAINER: 'component is not a container',
            LAYOUT_PARAM_IS_INVALID: 'layout param is invalid',
            LAYOUT_PARAM_IS_NOT_ALLOWED: 'layout param is not allowed',
            LAYOUT_PARAM_MUST_BE_NUMERIC: 'layout param must be numeric',
            LAYOUT_PARAM_ROTATATION_INVALID_RANGE: 'rotationInDegrees must be a valid range (0-360)',
            LAYOUT_PARAM_CANNOT_BE_NEGATIVE: 'layout param cannot be a negative value',
            CANNOT_DELETE_HEADER_COMPONENT: 'cannot delete a header component',
            CANNOT_DELETE_FOOTER_COMPONENT: 'cannot delete a footer component',
            SKIN_PARAM_MUST_BE_STRING: 'skin name param must be a string',
            CANNOT_SET_BOTH_SKIN_AND_STYLE: 'skin cannot be set if style already exists',
            STYLE_ID_PARAM_MUST_BE_STRING: 'style id param must be a string',
            STYLE_ID_PARAM_DOES_NOT_EXIST: 'style id param does not exist and cannot be set',
            STYLE_ID_PARAM_ALREADY_EXISTS: 'style id param already exists and cannot be overridden with custom style',
            STYLE_PROPERTIES_PARAM_MUST_BE_OBJECT: 'style properties param must be an object',
            COMPONENT_IS_DEPRECATED: 'cannot add because component was deprecated'
        },

        ALLOWED_MOBILE_COMPONENTS = ['wysiwyg.viewer.components.mobile.TinyMenu',
            'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton',
            'wysiwyg.viewer.components.mobile.ExitMobileModeButton'],

        ALLOWED_LAYOUT_PARAMS = ['x', 'y', 'width', 'height', 'scale', 'rotationInDegrees', 'fixedPosition', 'docked'];

    describe('Document Services - Component Validations', function () {
        var mocks = {
            'documentServices/page/pageData': pageData,
            'documentServices/dataAccessLayer/DataAccessLayer': FakeDataAccessLayer,
            'documentServices/theme/theme': theme,
            'documentServices/component/componentDeprecation': deprecation
        };

        testUtils.requireWithMocks('documentServices/component/componentValidations', mocks, function (compValidations) {
            describe('Validate Component To Set', function () {
                beforeEach(function () {
                    ps = privateServicesHelper.mockPrivateServices();
                    this.isMobileSpy = spyOn(ps.pointers.components, 'isMobile').and.returnValue(false);
                });
                var validComponentStructure = {
                    'astyle': 'wp3',
                    'skin': 'wysiwyg.viewer.skins.photo.RoundPhoto',
                    'componentType': 'wysiwyg.viewer.components.WPhoto'
                };

                var corruptedComponentStructure = {
                    'comp': 'type',
                    'da': 'ta',
                    'pro': 'ps'
                };

                var containerWithCorruptedChildren = {
                    'astyle': 'wp3',
                    'skin': 'wysiwyg.viewer.skins.photo.RoundPhoto',
                    'componentType': 'wysiwyg.viewer.components.WPhoto',
                    'components': [corruptedComponentStructure, corruptedComponentStructure]
                };

                it('Should fail when trying to pass non-string custom id', function () {
                    var result;
                    var customIds = [1000, null, false, [], {}];

                    _.forEach(customIds, function (customId) {
                        result = compValidations.validateComponentToSet(ps, null, validComponentStructure, customId);
                        expect(result).toEqual({success: false, error: ERRORS.CUSTOM_ID_MUST_BE_STRING});
                    });
                });

                it('Should fail when trying to add a component with a corrupted child', function () {
                    var result = compValidations.validateComponentToSet(ps, null, containerWithCorruptedChildren);

                    expect(result).toEqual({success: false, error: ERRORS.INVALID_COMPONENT_STRUCTURE});
                });

                xit('Should successfully pass validations for correct component path and structure', function () {
                    var customId = 'Custom-Id2';
                    validComponentStructure.componentType = _.sample(ALLOWED_MOBILE_COMPONENTS); // Tests should not ever be random (_.sample)
                    this.isMobileSpy.and.returnValue(true);

                    var result = compValidations.validateComponentToSet(ps, null, validComponentStructure, customId);

                    expect(result).toEqual({success: true});
                });

                it('should fail if component type is not in componentDefinitionMap', function () {
                    var compWithUnfamiliarType = {
                        'style': 'wp3',
                        'skin': 'nonFamiliarCompTypeSkin',
                        'componentType': 'nonFamiliarCompType',
                        'components': []
                    };
                    var result = compValidations.validateComponentToSet(ps, null, compWithUnfamiliarType);

                    expect(result).toEqual({success: false, error: ERRORS.INVALID_COMPONENT_STRUCTURE});
                });

                it("should fail if component data doesn't match componentType in componentDefinitionMap", function () {
                    var compWithUnfamiliarData = {
                        'style': 'bgis1',
                        'skin': 'skins.viewer.bgimagestrip.BgImageStripSkin',
                        'componentType': 'wysiwyg.viewer.components.BgImageStrip',
                        'data': {type: 'nonFamiliarCompData'},
                        'props': {type: 'BgImageStripUnifiedProperties'}

                    };
                    var result = compValidations.validateComponentToSet(ps, null, compWithUnfamiliarData);

                    expect(result).toEqual({success: false, error: ERRORS.INVALID_COMPONENT_STRUCTURE});
                });

                it("should fail if component props doesn't match componentType in componentDefinitionMap", function () {
                    var compWithUnfamiliarData = {
                        'style': 'bgis1',
                        'skin': 'skins.viewer.bgimagestrip.BgImageStripSkin',
                        'componentType': 'wysiwyg.viewer.components.BgImageStrip',
                        'props': 'nonFamiliarCompProps'

                    };
                    var result = compValidations.validateComponentToSet(ps, null, compWithUnfamiliarData);

                    expect(result).toEqual({success: false, error: ERRORS.INVALID_COMPONENT_STRUCTURE});
                });
            });

            describe('Validate Component To Add', function(){
                beforeEach(function () {
                    ps = privateServicesHelper.mockPrivateServices();
                    this.isMobileSpy = spyOn(ps.pointers.components, 'isMobile').and.returnValue(false);
                });

                var structure = {
                    'astyle': 'wp3',
                    'skin': 'wysiwyg.viewer.skins.photo.RoundPhoto',
                    'componentType': 'wysiwyg.viewer.components.WPhoto'
                };

                it('Should fail when trying to add a component to a mobile path', function () {
                    this.isMobileSpy.and.returnValue(true);

                    var result = compValidations.validateComponentToAdd(ps, null, structure);

                    expect(result).toEqual({success: false, error: ERRORS.CANNOT_ADD_COMPONENT_TO_MOBILE_PATH});
                });

                it('Should fail when trying to add a deprecated component', function () {
                    spyOn(deprecation, 'isComponentDeprecated').and.returnValue(true);
                    spyOn(deprecation, 'getDeprecationMessage').and.returnValue(ERRORS.COMPONENT_IS_DEPRECATED);

                    var result = compValidations.validateComponentToAdd(ps, null, structure, ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP));

                    expect(result).toEqual({success: false, error: ERRORS.COMPONENT_IS_DEPRECATED});
                });

                it('Should succeed when trying to add a NOT deprecated component', function () {
                    spyOn(deprecation, 'isComponentDeprecated').and.returnValue(false);

                    var result = compValidations.validateComponentToAdd(ps, null, structure, ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP));

                    expect(result).toEqual({success: true});
                });
            });

            describe('Validate Component To Delete', function () {
                function getCompPointer(privateServices, compId, pageId) {
                    var page = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    return privateServices.pointers.components.getComponent(compId, page);
                }

                beforeEach(function () {
                    siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage');
                    ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                it('Should fail when trying to delete a master page', function () {

                    var materPointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var result = compValidations.validateComponentToDelete(ps, materPointer);
                    expect(result).toEqual({success: false, error: ERRORS.CANNOT_DELETE_MASTER_PAGE});
                });

                it('Should fail when trying to delete the last page component', function () {
                    spyOn(pageData, 'getNumberOfPages').and.returnValue(1);
                    var pagePointer = ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
                    var result = compValidations.validateComponentToDelete(ps, pagePointer);

                    expect(result).toEqual({success: false, error: ERRORS.SITE_MUST_HAVE_AT_LEAST_ONE_PAGE});
                });

                it('Should successfully pass validations when trying to delete popup', function () {
                    siteData.addPopupPageWithDefaults('popup');
                    var pagePointer = ps.pointers.components.getPage('popup', constants.VIEW_MODES.DESKTOP);
                    var result = compValidations.validateComponentToDelete(ps, pagePointer);

                    expect(result).toEqual({success: true});
                });

                it('Should fail when trying to delete header component', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'header', componentType: constants.COMP_TYPES.HEADER}]);
                    var compPointer = getCompPointer(ps, 'header', 'page1');
                    var result = compValidations.validateComponentToDelete(ps, compPointer);

                    expect(result).toEqual({success: false, error: ERRORS.CANNOT_DELETE_HEADER_COMPONENT});
                });

                it('Should fail when trying to delete footer component', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'comp', componentType: constants.COMP_TYPES.FOOTER}]);
                    var compPointer = getCompPointer(ps, 'comp', 'page1');

                    var result = compValidations.validateComponentToDelete(ps, compPointer);

                    expect(result).toEqual({success: false, error: ERRORS.CANNOT_DELETE_FOOTER_COMPONENT});
                });

                it('Should successfully pass validations for correct componentPath', function () {
                    siteData.addPageWithDefaults('page1', [{id: 'comp', componentType: 'someType'}]);
                    var compPointer = getCompPointer(ps, 'comp', 'page1');

                    var result = compValidations.validateComponentToDelete(ps, compPointer);

                    expect(result).toEqual({success: true});
                });
            });

            describe('Validate Layout Params', function () {
                it('Should fail when passed with an invalid param', function () {
                    var param = 'NOT_ALLOWED_PARAM';
                    var value = 'someValue';

                    var result = compValidations.validateLayoutParam(param, value);

                    expect(result).toEqual({success: false, error: ERRORS.LAYOUT_PARAM_IS_NOT_ALLOWED});
                });

                xit('Should fail for a non numeric value', function () {
                    var result;
                    var numericParams = ['x', 'y', 'width', 'height', 'scale', 'rotationInDegrees'];
                    var param = _.sample(numericParams);  // Tests should not ever be random (_.sample)
                    var values = ['lorem', true, '!@#', undefined, null];

                    _.forEach(values, function (value) {
                        result = compValidations.validateLayoutParam(param, value);
                        expect(result).toEqual({success: false, error: ERRORS.LAYOUT_PARAM_MUST_BE_NUMERIC});
                    });
                });

                it('Should fail for non negative params ( given negative values )', function () {
                    var result;
                    var numericParams = ['x', 'y', 'width', 'height', 'scale', 'rotationInDegrees'];
                    var nonNegativeParams = _.without(numericParams, 'x', 'y');
                    var value = -5;

                    _.forEach(nonNegativeParams, function (params) {
                        result = compValidations.validateLayoutParam(params, value);
                        expect(result).toEqual({success: false, error: ERRORS.LAYOUT_PARAM_CANNOT_BE_NEGATIVE});
                    });
                });

                it('Should fail for invalid rotation degree values', function () {
                    var result;
                    var params = 'rotationInDegrees';
                    var rotationDegreesValues = [361, 480];

                    _.forEach(rotationDegreesValues, function (value) {
                        result = compValidations.validateLayoutParam(params, value);
                        expect(result).toEqual({success: false, error: ERRORS.LAYOUT_PARAM_ROTATATION_INVALID_RANGE});
                    });
                });

                it('Should successfully set negative values for "x" and "y" params', function () {
                    var result;
                    var params = ['x', 'y'];
                    var value = -5;

                    _.forEach(params, function (param) {
                        result = compValidations.validateLayoutParam(param, value);
                        expect(result).toEqual({success: true});
                    });
                });

                it('Should successfully pass validations for correct layout params', function () {
                    var result;
                    var params = _.clone(ALLOWED_LAYOUT_PARAMS);
                    var value = 5;

                    _.forEach(params, function (param) {
                        result = compValidations.validateLayoutParam(param, value);
                        expect(result).toEqual({success: true});
                    });
                });
            });

            describe('validateSetSkinParams', function () {
                it('should pass validation', function () {
                    var newSkinName = 'mockSkin';
                    var result = compValidations.validateSetSkinParams(ps, null, newSkinName);

                    expect(result).toEqual({success: true});
                });

                it('should fail to pass validation when a component style is already set', function () {
                    spyOn(theme.styles, 'get').and.returnValue({});
                    var result = compValidations.validateSetSkinParams(ps, null, 'someCoolSkin');

                    expect(result).toEqual({success: false, error: ERRORS.CANNOT_SET_BOTH_SKIN_AND_STYLE});
                });

                it('should fail to pass validation when providing a non-string skin', function () {
                    var nonStringParams = [
                        {},
                        [],
                        5,
                        true,
                        false
                    ];

                    var result;
                    _.forEach(nonStringParams, function (nonStringParam) {
                        result = compValidations.validateSetSkinParams(ps, null, nonStringParam);
                        expect(result).toEqual({success: false, error: ERRORS.SKIN_PARAM_MUST_BE_STRING});
                    });
                });
            });

            describe('validateSetStyleIdParams', function () {
                it('should pass validation', function () {
                    var newStyleId = 'newMockStyleId';

                    spyOn(theme.styles, 'get').and.returnValue({});
                    var result = compValidations.validateSetStyleIdParams(ps, newStyleId);

                    expect(result).toEqual({success: true});
                });

                it('should fail to pass validation when providing a non-existing style', function () {
                    var newStyleId = 'newMockStyleId';
                    var result = compValidations.validateSetStyleIdParams(ps, newStyleId);

                    expect(result).toEqual({success: false, error: ERRORS.STYLE_ID_PARAM_DOES_NOT_EXIST});
                });

                it('should fail to pass validation when providing a non-string style', function () {
                    var nonStringStyleIds = [
                        [],
                        {},
                        true,
                        false,
                        2
                    ];
                    var result;

                    _.forEach(nonStringStyleIds, function (nonStringStyle) {
                        result = compValidations.validateSetStyleIdParams(ps, nonStringStyle);
                        expect(result).toEqual({success: false, error: ERRORS.STYLE_ID_PARAM_MUST_BE_STRING});
                    });
                });
            });

            describe('validateComponentCustomStyleParams', function () {
                describe('should pass validation', function () {

                    it('should pass validation when providing all params, all being valid', function () {
                        var result;
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', {'paramName': 'paramValue'}, 'styleId');

                        expect(result).toEqual({success: true});
                    });

                    it('should pass validation when not providing optional style id', function () {
                        spyOn(theme.styles, 'get').and.returnValue({});

                        var result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', {'paramName': 'paramValue'}, null);

                        expect(result).toEqual({success: true});
                    });

                    it('should pass validation when not providing optional skin name', function () {
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        var result = compValidations.validateComponentCustomStyleParams(ps, null, {'paramName': 'paramValue'}, 'styleId');

                        expect(result).toEqual({success: true});
                    });

                    it('should pass validation when not providing optional style properties name', function () {
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        var result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', null, 'styleId');

                        expect(result).toEqual({success: true});
                    });
                });

                describe('should fail validation', function () {

                    it('should fail to pass validation when the provided style id already exists', function () {
                        var result;
                        spyOn(theme.styles, 'get').and.returnValue({id: 'someStyleId'});

                        result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', {}, 'styleId');

                        expect(result).toEqual({success: false, error: ERRORS.STYLE_ID_PARAM_ALREADY_EXISTS});
                    });

                    it('should fail to pass validation when the provided style id is not a string', function () {
                        var result;
                        var nonStringStyleIds = [
                            {},
                            [],
                            true,
                            false,
                            4
                        ];
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        _.forEach(nonStringStyleIds, function (nonStringStyle) {
                            result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', {}, nonStringStyle);
                            expect(result).toEqual({success: false, error: ERRORS.STYLE_ID_PARAM_MUST_BE_STRING});
                        });
                    });

                    it('should fail to pass validation when the provided skin name is not a string', function () {
                        var result;
                        var nonStringSkinNames = [
                            {},
                            [],
                            true,
                            false,
                            4
                        ];
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        _.forEach(nonStringSkinNames, function (nonStringSkin) {
                            result = compValidations.validateComponentCustomStyleParams(ps, nonStringSkin, {}, 'styleId');
                            expect(result).toEqual({success: false, error: ERRORS.SKIN_PARAM_MUST_BE_STRING});
                        });
                    });

                    it('should fail to pass validation when the provided style properties are not an object', function () {
                        var result;
                        var nonObjectStylePropertiesSet = [
                            [],
                            true,
                            false,
                            4,
                            ''
                        ];
                        spyOn(theme.styles, 'get').and.returnValue(null);

                        _.forEach(nonObjectStylePropertiesSet, function (nonObjectStyleProps) {
                            result = compValidations.validateComponentCustomStyleParams(ps, 'skinName', nonObjectStyleProps, 'styleId');
                            expect(result).toEqual({success: false, error: ERRORS.STYLE_PROPERTIES_PARAM_MUST_BE_OBJECT});
                        });
                    });
                });
            });
        });
    });
});
