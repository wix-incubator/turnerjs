define([
        'react',
        'lodash',
        'testUtils',
        'utils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/services/fieldsLayout',
        'documentServices/theme/theme',
        'wixappsCore',
        'documentServices/wixapps/services/lists',
        'documentServices/wixapps/services/types',
        'documentServices/wixapps/services/views',
        'documentServices/wixapps/utils/richTextFieldLayoutUtils',
        'documentServices/wixapps/utils/appPart2LayoutUtils'
    ],
    function (React, _, testUtils, utils, privateServicesHelper, fieldsLayout, theme, wixappsCore, listsDS, typesDS, viewsDS, richTextFieldLayoutUtils, appPart2LayoutUtils) {
        'use strict';


        describe('Wixapps fieldsLayout', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            function getViewPart(viewObj, fieldName) {
                return _.first(utils.objectUtils.filter(viewObj, function (obj) {
                    return obj.viewPartIdForTest === fieldName;
                }));
            }

            var appbuilderData, testListId, fakePS, allStyles;

            var compRef = {id: 'oger', type: 'MOBILE'};

            beforeEach(function () {
                allStyles = {
                    'wp1': {}
                };
                appbuilderData = {
                    descriptor: {
                        'views': {
                            'testTypeId|testViewName': {
                                'forType': 'testTypeId',
                                'name': 'testViewName',
                                'comp': {
                                    'items': [
                                        {
                                            'layout': {
                                                'min-width': 0
                                            },
                                            'comp': {
                                                'items': [
                                                    {
                                                        'viewPartIdForTest': 'title',
                                                        'data': 'title',
                                                        'comp': {
                                                            'items': [
                                                                {
                                                                    'layout': {
                                                                        'text-align': 'left'
                                                                    },
                                                                    'data': 'title',
                                                                    'comp': {
                                                                        'name': 'Label',
                                                                        'underline': true,
                                                                        nullValue: null, // intentional, for making sure that code does not break
                                                                        undefinedValue: undefined
                                                                    },
                                                                    labelFakeViewProp: 'label value from view',
                                                                    'id': 'fld_hhrsh1qx43_proxy'
                                                                }
                                                            ],
                                                            'hidden': false,
                                                            'name': 'TextField',
                                                            'labelPosition': 'none'
                                                        },
                                                        'id': 'fld_hhrsh1qx43'
                                                    }
                                                ],
                                                'name': 'FieldBox',
                                                'orientation': 'vertical'
                                            },
                                            'id': 'Top'
                                        },
                                        {
                                            'comp': {
                                                'items': [
                                                    {
                                                        'layout': {
                                                            'min-width': 200,
                                                            'box-flex': 1
                                                        },
                                                        'comp': {
                                                            'items': [
                                                                {
                                                                    'viewPartIdForTest': 'image',
                                                                    'data': 'image',
                                                                    'comp': {
                                                                        'items': [
                                                                            {
                                                                                'data': 'image',
                                                                                'comp': {
                                                                                    'name': 'Image',
                                                                                    'imageMode': 'fill'
                                                                                },
                                                                                'id': 'fld_hhrsgeey34_proxy'
                                                                            }
                                                                        ],
                                                                        'box-align': 'left',
                                                                        'hidden': true,
                                                                        'name': 'Field'
                                                                    },
                                                                    fieldFakeViewProp: 'field value from view',
                                                                    'id': 'fld_hhrsgeey34'
                                                                }
                                                            ],
                                                            'name': 'FieldBox',
                                                            'orientation': 'vertical'
                                                        },
                                                        'id': 'Center'
                                                    }
                                                ],
                                                'name': 'HBox'
                                            },
                                            'id': 'def_3'
                                        }
                                    ],
                                    'name': 'VBox'
                                },
                                'id': 'def_0'
                            }
                        },
                        'types': {
                            'testTypeId': {
                                'name': 'testTypeId',
                                'displayName': 'General 2',
                                'version': 0,
                                'baseTypes': [],
                                'fields': [
                                    {
                                        'searchable': false,
                                        'name': 'title',
                                        'displayName': 'Title',
                                        'computed': false,
                                        'defaultValue': 'I\'m a Title',
                                        'type': 'String'
                                    },
                                    {
                                        'searchable': false,
                                        'name': 'links',
                                        'displayName': '',
                                        'computed': false,
                                        'defaultValue': {
                                            '_type': 'wix:Map'
                                        },
                                        'type': 'wix:Map'
                                    },
                                    {
                                        'searchable': false,
                                        'name': 'image',
                                        'displayName': 'Image',
                                        'computed': false,
                                        'defaultValue': {
                                            'src': 'images/items/bloom.jpg',
                                            'width': 1280,
                                            'height': 850,
                                            'title': '',
                                            '_type': 'wix:Image'
                                        },
                                        'type': 'wix:Image'
                                    },
                                    {
                                        'searchable': false,
                                        'name': 'fieldNotInTheViw',
                                        'displayName': 'fieldNotInTheViw',
                                        'computed': false,
                                        'defaultValue': '',
                                        'type': 'String'
                                    }
                                ]
                            }
                        },
                        'parts': {
                            'testListId': {
                                'displayName': 'My items',
                                'dataSelector': 'testDataSelectorId',
                                'type': 'testTypeId',
                                'viewName': 'testViewName'
                            }
                        }
                    }
                };

                testListId = 'testListId';
                fakePS = getPrivateServices(appbuilderData);

                var mockProxies = {
                    TextField: React.createClass({
                        displayName: 'TextField',
                        mixins: [wixappsCore.baseProxy],
                        statics: {
                            width: {type:'compProp', defaultValue: 100, path: 'comp'},
                            labelPosition: {type:'compProp', defaultValue: 'barvazOger'},
                            textFieldFakeViewProp: {type: 'viewProp', defaultValue: 'textFieldViewPropDefault'}
                        }
                    }),
                    Label: React.createClass({
                        displayName: 'Label',
                        mixins: [wixappsCore.baseProxy],
                        statics: {
                            componentType: 'wysiwyg.viewer.components.WRichText',
                            underline: {type:'compProp', defaultValue: false},
                            bold: {type:'compProp', defaultValue: false},
                            labelFakeViewProp: {type: 'viewProp', defaultValue: 'labelViewPropDefault'}
                        }
                    }),
                    Field: React.createClass({
                        displayName: 'Field',
                        mixins: [wixappsCore.baseProxy],
                        statics: {
                            'box-align': {type:'compProp', defaultValue: 'center'},
                            heightMode: {type:'compProp', defaultValue: 'auto'},
                            fieldFakeViewProp: {type: 'viewProp', defaultValue: 'fieldViewPropDefault'}
                        }
                    }),
                    Image: React.createClass({
                        displayName: 'Image',
                        mixins: [wixappsCore.baseProxy],
                        statics: {
                            componentType: 'WPhoto',
                            imageMode: {type:'compProp', defaultValue: 'crop'},
                            showZoom: {type:'compProp', defaultValue: true},
                            imageFakeViewProp: {type: 'viewProp', defaultValue: 'imageViewPropDefault'}
                        }
                    })
                };

                spyOn(theme.styles, 'getAll').and.returnValue(allStyles);
                spyOn(wixappsCore.proxyFactory, 'getProxyClass').and.callFake(function (name) {
                    return mockProxies[name];
                });
            });

            describe('getField', function() {

                it('should return default values for fields that do not exist in the view', function() {
                    // TODO: in the future
                });

                it('should return null when view def does not exist', function() {
                    appbuilderData.descriptor.views = {};
                    fakePS = getPrivateServices(appbuilderData);
                    var titleProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    var imageProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(titleProps).toEqual(null);
                    expect(imageProps).toEqual(null);
                });

                it('should return only allowed attributes', function() {
                    expect(_.keys(fieldsLayout.getField(fakePS, testListId, 'title')).sort()).toEqual(['componentType', 'fontClass', 'name', 'displayName', 'type', 'hidden', 'width', 'labelPosition', 'layout', 'textFieldFakeViewProp', 'underline', 'bold', 'labelFakeViewProp'].sort());
                    expect(_.keys(fieldsLayout.getField(fakePS, testListId, 'image')).sort()).toEqual(['componentType', 'style', 'name', 'displayName', 'type', 'hidden', 'box-align', 'heightMode', 'layout', 'fieldFakeViewProp', 'imageMode', 'showZoom', 'imageFakeViewProp'].sort());
                });

                it('should return the component type according to the inner view comp', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'title').componentType).toEqual('wysiwyg.viewer.components.WRichText');
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').componentType).toEqual('WPhoto');
                });

                it('should return the right type def properties for the field', function() {
                    var typeDefProps = ['name', 'displayName', 'type'];
                    var titleProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    var imageProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(_.pick(titleProps, typeDefProps)).toEqual({name: 'title', displayName: 'Title', type: 'String'});
                    expect(_.pick(imageProps, typeDefProps)).toEqual({name: 'image', displayName: 'Image', type: 'wix:Image'});
                });

                it('should return the style ID from the inner view comp', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').style).toEqual('wp1');
                });

                it('should return viewProps of the field view with fallback to their default value', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'title').textFieldFakeViewProp).toEqual('textFieldViewPropDefault');
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').fieldFakeViewProp).toEqual('field value from view');
                });

                it('should return compProps of the field view with fallback to their default value', function() {
                    var titleProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    var imageProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(titleProps.width).toEqual(100);
                    expect(titleProps.labelPosition).toEqual('none');
                    expect(imageProps['box-align']).toEqual('left');
                    expect(imageProps.heightMode).toEqual('auto');
                });

                it('should return viewProps of the inner view comp with fallback to their default value', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'title').labelFakeViewProp).toEqual('label value from view');
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').imageFakeViewProp).toEqual('imageViewPropDefault');
                });

                it('should return compProps of the inner view comp with fallback to their default value', function() {
                    var titleProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    var imageProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(titleProps.underline).toEqual(true);
                    expect(titleProps.bold).toEqual(false);
                    expect(imageProps.imageMode).toEqual('fill');
                    expect(imageProps.showZoom).toEqual(true);
                });

                it('should return the hidden value according to the field view and not the inner view comp', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'title').hidden).toEqual(false);
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').hidden).toEqual(true);
                });

                it('should return the layout value according to the inner view comp and not the field view', function() {
                    expect(fieldsLayout.getField(fakePS, testListId, 'title').layout).toEqual({'text-align': 'left'});
                    expect(fieldsLayout.getField(fakePS, testListId, 'image').layout).toEqual({});
                });

            });

            describe('getAll', function () {

                it('should return null when view def does not exist', function() {
                    appbuilderData.descriptor.views = {};
                    fakePS = getPrivateServices(appbuilderData);

                    var fields = fieldsLayout.getAll(fakePS, testListId);
                    expect(fields).toEqual(null);
                });

                it('should return an array of getField results for each field that exists in the view', function() {
                    var expectedTitleProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    var expectedImageProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    var expectedAll = [expectedTitleProps, expectedImageProps];

                    var fields = fieldsLayout.getAll(fakePS, testListId);
                    expect(fields).toEqual(expectedAll);
                });

                it('should return the fields in the same order as in the type definition', function() {
                    var fieldsWithoutChange = fieldsLayout.getAll(fakePS, testListId);

                    var testTypeDef = listsDS.getType(fakePS, testListId);
                    testTypeDef.fields = _.sortBy(testTypeDef.fields, 'name');
                    spyOn(listsDS, 'getType').and.returnValue(testTypeDef);
                    var fieldsWithOrderChange = fieldsLayout.getAll(fakePS, testListId);

                    expect(_.findIndex(fieldsWithoutChange, {name: 'title'})).toBeLessThan(_.findIndex(fieldsWithoutChange, {name: 'image'}));
                    expect(_.findIndex(fieldsWithOrderChange, {name: 'title'})).toBeGreaterThan(_.findIndex(fieldsWithOrderChange, {name: 'image'}));
                });

            });

            describe('set', function () {

                it('should not modify the given value object', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.underline = 'new underline value';
                    titleFieldProps.bold = 'new bold value';

                    var givenProps = _.cloneDeep(titleFieldProps);

                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);
                    expect(titleFieldProps).toEqual(givenProps);
                });

                it('should allow setting an inner comp prop', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.underline = false; // change value defined in the view
                    titleFieldProps.bold = true; // change a value that was received from the defaults
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.underline).toEqual(false);
                    expect(titleFieldPropsAfterSet.bold).toEqual(true);
                });

                it('set should call appPart2LayoutUtils.updateAppPart2MinWidth with compRef, the changedProps and the new viewDef', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.underline = true;
                    titleFieldProps.hidden = true;

                    spyOn(appPart2LayoutUtils, 'updateAppPart2MinWidth');

                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                    var titleViewPart = getViewPart(currentData, 'title');
                    expect(titleViewPart.comp.hidden).toEqual(true);
                    expect(appPart2LayoutUtils.updateAppPart2MinWidth).toHaveBeenCalledWith(fakePS, compRef, {hidden: true}, currentData.descriptor.views['testTypeId|testViewName']);
                });

                it('should allow setting an inner view prop', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.labelFakeViewProp = 'new view prop value for label'; // change value defined in the view
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);
                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.labelFakeViewProp).toEqual('new view prop value for label');

                    var imageFieldProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    imageFieldProps.imageFakeViewProp = 'new view prop value for image'; // change default value
                    fieldsLayout.set(fakePS, compRef, testListId, imageFieldProps);
                    var imageFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(imageFieldPropsAfterSet.imageFakeViewProp).toEqual('new view prop value for image');
                });

                it('should allow setting a field comp prop', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.width = '333';
                    titleFieldProps.labelPosition = 'new label position';
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.width).toEqual('333');
                    expect(titleFieldPropsAfterSet.labelPosition).toEqual('new label position');
                });

                it('should allow setting a field view prop', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.textFieldFakeViewProp = 'new view prop value for text field'; // change default value
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);
                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.textFieldFakeViewProp).toEqual('new view prop value for text field');

                    var imageFieldProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    imageFieldProps.fieldFakeViewProp = 'new view prop value for field'; // change value defined in the view
                    fieldsLayout.set(fakePS, compRef, testListId, imageFieldProps);
                    var imageFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(imageFieldPropsAfterSet.fieldFakeViewProp).toEqual('new view prop value for field');
                });

                it('should set hidden comp prop on the field only', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.hidden = 'new hidden value';
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.hidden).toEqual('new hidden value');

                    var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                    var titleViewPart = getViewPart(currentData, 'title');
                    expect(titleViewPart.comp.hidden).toEqual('new hidden value');
                    expect(titleViewPart.comp.items[0].comp.hidden).not.toEqual('new hidden value');
                });

                it('should set layout view prop on the inner comp only', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.layout = {fake: 'new fake layout'};
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.layout).toEqual({fake: 'new fake layout'});

                    var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                    var titleViewPart = getViewPart(currentData, 'title');
                    expect(titleViewPart.comp.items[0].layout).toEqual({fake: 'new fake layout'});
                    expect(titleViewPart.layout).not.toEqual({fake: 'new fake layout'});
                });

                it('should set style on the inner comp only', function() {
                    var imageFieldProps = fieldsLayout.getField(fakePS, testListId, 'image');
                    imageFieldProps.style = 'new style';
                    allStyles[imageFieldProps.style] = {};
                    fieldsLayout.set(fakePS, compRef, testListId, imageFieldProps);

                    var imageFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'image');
                    expect(imageFieldPropsAfterSet.style).toEqual('new style');

                    var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                    var titleViewPart = getViewPart(currentData, 'image');
                    expect(titleViewPart.comp.items[0].comp.style).toEqual('new style');
                    expect(titleViewPart.comp.style).not.toEqual('new style');
                });

                it('should not set a default value that is missing in the view definition', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.bold = false; // same as the default value that is not in the view def currently
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                    var titleViewPart = getViewPart(currentData, 'title');
                    expect(titleViewPart.comp.items[0].comp.bold).toBeUndefined();
                });

                it('should not set a prop that is not a comp prop, a view prop or style', function() {
                    var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                    titleFieldProps.componentType = 'new componentType';
                    titleFieldProps.displayName = 'new displayName';
                    titleFieldProps.type = 'new type';
                    titleFieldProps.nonExisting = 'new nonExisting';
                    fieldsLayout.set(fakePS, compRef, testListId, titleFieldProps);

                    var titleFieldPropsAfterSet = fieldsLayout.getField(fakePS, testListId, 'title');
                    expect(titleFieldPropsAfterSet.componentType).toEqual('wysiwyg.viewer.components.WRichText');
                    expect(titleFieldPropsAfterSet.name).toEqual('title');
                    expect(titleFieldPropsAfterSet.displayName).toEqual('Title');
                    expect(titleFieldPropsAfterSet.type).toEqual('String');
                    expect(titleFieldPropsAfterSet.nonExisting).toBeUndefined();
                });

                it('should not modify any other attribute of the view definition beside the requested one', function() {
                    var viewDefBeforeChange = fakePS.dal.getByPath(['wixapps', 'appbuilder', 'descriptor', 'views', 'testTypeId|testViewName']);
                    fieldsLayout.set(fakePS, compRef, testListId, {name: 'title', bold: 'new bold value'});

                    var viewDefAfterChange = fakePS.dal.getByPath(['wixapps', 'appbuilder', 'descriptor', 'views', 'testTypeId|testViewName']);
                    expect(viewDefAfterChange).not.toEqual(viewDefBeforeChange);

                    var titleAfterChange = getViewPart(viewDefBeforeChange, 'title');
                    titleAfterChange.comp.items[0].comp.bold = 'new bold value'; // adding the bold property manually to the right place.

                    expect(viewDefBeforeChange).toEqual(viewDefAfterChange);
                });

            });

            describe('for WRichText components', function() {

                describe('getField', function() {

                    it('should return attributes after conversion using richTextFieldLayoutUtils', function() {
                        var fakeConvertedProps = {'fake': 'fake parsed props'};
                        spyOn(richTextFieldLayoutUtils, 'convertViewDefPropsToFieldProps').and.callFake(function (privateServices, viewDefProp) {
                            if (viewDefProp.name === 'title') {
                                return fakeConvertedProps;
                            }
                        });
                        var titleFieldProps = fieldsLayout.getField(fakePS, testListId, 'title');
                        expect(titleFieldProps).toEqual(fakeConvertedProps);
                    });
                });

                describe('set', function() {

                    it('should set the given properties after conversion using richTextFieldLayoutUtils', function() {
                        var titlePropsToSet = {name: 'title', fake: 'fake for test'};
                        var fakeConvertedProps = {name: 'title', bold: 'test bold value', underline: 'test underline value'};
                        spyOn(richTextFieldLayoutUtils, 'convertFieldPropsToViewDefProps').and.returnValue(fakeConvertedProps);

                        fieldsLayout.set(fakePS, compRef, testListId, titlePropsToSet);

                        var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                        var titleViewPart = getViewPart(currentData, 'title');
                        expect(richTextFieldLayoutUtils.convertFieldPropsToViewDefProps.calls.count()).toEqual(1);
                        expect(titleViewPart.comp.items[0].comp.bold).toEqual('test bold value');
                        expect(titleViewPart.comp.items[0].comp.underline).toEqual('test underline value');
                    });

                    it('should allow setting style to null', function() {
                        var titlePropsToSet = {name: 'title', fake: 'fake for test'};
                        var fakeConvertedProps = {name: 'title', style: null};
                        spyOn(richTextFieldLayoutUtils, 'convertFieldPropsToViewDefProps').and.returnValue(fakeConvertedProps);

                        var currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                        var titleViewPart = getViewPart(currentData, 'title');
                        expect(titleViewPart.comp.items[0].comp.style).not.toEqual(null);

                        fieldsLayout.set(fakePS, compRef, testListId, titlePropsToSet);
                        expect(richTextFieldLayoutUtils.convertFieldPropsToViewDefProps.calls.count()).toEqual(1);
                        currentData = fakePS.dal.getByPath(['wixapps', 'appbuilder']);
                        titleViewPart = getViewPart(currentData, 'title');
                        expect(titleViewPart.comp.items[0].comp.style).toEqual(null);
                    });
                });

            });
        });
    });
