define([
    'lodash', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'wixappsCore',
    'wixappsClassics',
    'documentServices/dataModel/dataModel',
    'documentServices/wixapps/services/classics',
    'documentServices/wixapps/utils/classicsPathUtils',
    'documentServices/wixapps/utils/classicsUtils',
    'utils',
    'documentServices/tpa/services/provisionService',
    'documentServices/siteMetadata/siteMetadata'
], function (_, testUtils, mockPrivateServicesHelper, wixappsCore, wixappsClassics, dataModel, classics, classicsPathUtils, classicsUtils, utils, provisionService, siteMetadata) {
    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;

    describe('Wixapps classics Document Services', function () {
        function createPrivateServicesWithDescriptor(packageName, descriptor) {
            var wixappsModel = {
                wixapps: {}
            };
            wixappsModel.wixapps[packageName] = {
                descriptor: descriptor
            };
            var siteData = testUtils.mockFactory.mockSiteData(wixappsModel);
            return mockPrivateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('loadTagNames', function () {
            var ps,
                requestsMadeToServer,
                baseUrl = 'http://host',
                storeId = 'storeId';
            beforeEach(function () {
                ps = createPrivateServicesWithDescriptor('blog');
                baseUrl = 'http://' + ps.siteAPI.getExternalBaseUrl();
                spyOn(ps.siteAPI, 'loadBatch').and.callFake(function(requests) {
                    requestsMadeToServer = requests;
                });
                spyOn(classics, 'getBlogInstanceId').and.returnValue(storeId);
                classics.loadTagNames(ps);
            });

            it('should make only one request', function () {
                expect(requestsMadeToServer.length).toBe(1);
            });

            it('the url of the request should be "<baseUrl>/apps/lists/1/GroupByAndCount?consistentRead=false"', function () {
                expect(requestsMadeToServer[0].url).toBe(baseUrl + '/apps/lists/1/GroupByAndCount?consistentRead=false');
            });

            it('the data of the request should be the right now', function () {
                expect(requestsMadeToServer[0].data).toEqual({
                    collectionId: 'Posts',
                    field: 'tags',
                    filter: {
                        "scheduled.iso": {
                            "$not": {
                                "$gt": "$now"
                            }
                        },
                        "draft": false,
                        "deleted": {"$ne": true}
                    },
                    type: 'Post',
                    storeId: storeId
                });
            });

            it('the force property of the request should be true', function () {
                expect(requestsMadeToServer[0].force).toBe(true);
            });

            it('the destination of the request should be ["wixapps", "blog", "tagNames"]', function () {
                expect(requestsMadeToServer[0].destination).toEqual(['wixapps', 'blog', 'tagNames']);
            });

            describe('the transformFunc of the request', function () {
                it('should return the keys of the payload', function () {
                    var payload = {a: 1, b: 2};
                    expect(requestsMadeToServer[0].transformFunc({payload: payload})).toEqual(Object.keys(payload));
                });

                it('should return [] if the payload is null', function () {
                    expect(requestsMadeToServer[0].transformFunc({payload: null})).toEqual([]);
                });
            });
        });

        describe('getTagNames', function () {
            it('should return what is saved in siteData.wixapps.blog.tagNames', function () {
                var tagNames = ['some tag'];
                var ps = createPrivateServicesWithDescriptor('blog');
                var blogTagsPath = classicsPathUtils.getBlogTagNamesPath();
                ps.dal.full.setByPath(blogTagsPath, tagNames);
                expect(classics.getTagNames(ps)).toEqual(tagNames);
            });
        });

        describe('reloadApp', function () {
            describe('when called', function () {

                function createPrivateServicesDALStub() {
                    return createMockPrivateServicesWithDAL(false);
                }

                function createPrivateServicesDALSpies() {
                    return createMockPrivateServicesWithDAL(true);
                }

                function createMockPrivateServicesWithDAL(areMethodsSpies) {

                    function createMockFunction() {
                        return areMethodsSpies ? jasmine.createSpy() : _.noop;
                    }

                    return {
                        dal: {
                            removeByPath: createMockFunction(),
                            getByPath: createMockFunction(),

                            full: {
                                setByPath: createMockFunction()
                            }
                        }
                    };
                }

                /**
                 * @param {!Object=} optionalOptions
                 */
                function invokeReloadApp(options) {
                    options = options || {};
                    if (!options.privateServices) {
                        options.privateServices = createPrivateServicesDALStub();
                    }
                    classics.reloadApp(options.privateServices, options.packageName);
                }

                beforeEach(function () {
                    spyOn(classics, 'getAllAppPartComps').and.callFake(function () {
                        return [1];
                    });

                });

                it('should call classicsPathUtils.getPackagePath', function () {
                    spyOn(classicsPathUtils, 'getPackagePath');
                    spyOn(classicsPathUtils, 'getPackageDescriptorPath');
                    invokeReloadApp();
                    expect(classicsPathUtils.getPackagePath).toHaveBeenCalled();
                });

                it('should call classicsPathUtils.getPackageDescriptorPath', function () {
                    spyOn(classicsPathUtils, 'getPackageDescriptorPath');
                    invokeReloadApp();
                    expect(classicsPathUtils.getPackageDescriptorPath).toHaveBeenCalled();
                });

                describe('classicsPathUtils.getPackagePath call', function () {
                    describe('first argument (packageName)', function () {
                        it('should be second argument (packageName) given to reloadApp', function () {
                            var packageName = {};
                            spyOn(classicsPathUtils, 'getPackagePath');
                            invokeReloadApp({packageName: packageName});
                            var firstArgument = classicsPathUtils.getPackagePath.calls.first().args[0];
                            expect(firstArgument).toBe(packageName);
                        });
                    });
                });

                it('should call dal.setByPath by setting package content to empty object', function () {
                    var dal = createPrivateServicesDALSpies().dal;

                    var packagePath = {};
                    spyOn(classicsPathUtils, 'getPackagePath').and.returnValue(packagePath);

                    invokeReloadApp({privateServices: {dal: dal}});
                    expect(dal.full.setByPath).toHaveBeenCalled();

                    var secondArgument = dal.full.setByPath.calls.first().args[1];
                    expect(Object.keys(secondArgument).length).toBe(0);
                });

                describe('first argument (privateServices) dal.setByPath call', function () {
                    describe('first argument', function () {
                        it('should be return value (packagePath) of classicsPathUtils.getPackagePath', function () {
                            var packagePath = {};
                            spyOn(classicsPathUtils, 'getPackagePath').and.returnValue(packagePath);
                            var dal = createPrivateServicesDALSpies().dal;
                            invokeReloadApp({privateServices: {dal: dal}});
                            var firstArgument = dal.full.setByPath.calls.first().args[0];
                            expect(firstArgument).toBe(packagePath);
                        });
                    });
                });

                describe('loading tag names', function () {
                    beforeEach(function () {
                        spyOn(classics, 'loadTagNames');
                    });

                    it('should be called if the given package is blog', function () {
                        invokeReloadApp({packageName: 'blog'});
                        expect(classics.loadTagNames).toHaveBeenCalled();
                    });

                    it('should not be called if the given package is not blog', function () {
                        invokeReloadApp({packageName: 'faq'});
                        expect(classics.loadTagNames).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe('getAvailableCustomizations', function () {
            var packageName = 'blog';
            var viewName = 'PostsListMediaLeft';
            var format = 'Mobile';
            var panelType = 'settings';
            var viewCustomizations = [
                {
                    a: 1,
                    panelType: panelType
                },
                {
                    b: 2,
                    panelType: panelType
                }
            ];
            var descriptors = {
                withOneView: {
                    views: [
                        {
                            name: viewName,
                            format: format,
                            customizations: viewCustomizations
                        }
                    ]
                },
                withOneViewWithArrayName: {
                    views: [
                        {
                            name: ['someView', viewName],
                            format: format,
                            customizations: viewCustomizations
                        }
                    ]
                },
                withTwoViews: {
                    views: [
                        {
                            name: viewName,
                            format: format,
                            customizations: viewCustomizations
                        },
                        {
                            name: 'someOtherView',
                            format: format,
                            customizations: [
                                {
                                    c: 3
                                }
                            ]
                        }
                    ]
                },
                withCustomizationsSpreadAcrossViews: {
                    views: [
                        {
                            name: viewName,
                            format: format,
                            customizations: viewCustomizations.slice(0, 1)
                        },
                        {
                            name: viewName,
                            format: format,
                            customizations: viewCustomizations.slice(1, viewCustomizations.length)
                        }
                    ]
                },
                withNoExplicitFormat: {
                    views: [
                        {
                            name: viewName,
                            customizations: viewCustomizations
                        }
                    ]
                },
                withCustomizationsSpreadAcrossViewsWithDifferentFormat: {
                    views: [
                        {
                            name: viewName,
                            format: 'Mobile',
                            customizations: viewCustomizations.slice(0, 1)
                        },
                        {
                            name: viewName,
                            format: '',
                            customizations: viewCustomizations.slice(1, viewCustomizations.length)
                        }
                    ]
                },
                withCustomizationsSpreadAcrossViewsWithDifferentForType: {
                    views: [
                        {
                            name: viewName,
                            forType: 'Array',
                            format: format,
                            customizations: viewCustomizations.slice(0, 1)
                        },
                        {
                            name: viewName,
                            forType: 'Post',
                            format: format,
                            customizations: viewCustomizations.slice(1, viewCustomizations.length)
                        }
                    ]
                },
                withSeveralCustomizationsForDifferentPanelTypes: {
                    views: [
                        {
                            name: viewName,
                            format: format,
                            customizations: viewCustomizations.concat({
                                c: 3,
                                panelType: 'some other type'
                            })
                        }
                    ]
                }
            };

            beforeEach(function() {
                viewCustomizations.forEach(function addInfoFromView(customization) {
                    customization.view = viewName;
                    customization.forType = customization.forType || 'Array';
                    customization.format = customization.format || format;
                });
            });

            it('should work correctly when one view exists', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withOneView);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when one view exists and it uses an array value for name', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withOneViewWithArrayName);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when two view exists', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withTwoViews);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when there are multiple definitions of the same view', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withCustomizationsSpreadAcrossViews);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should find nothing if searching with different format', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withOneView);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, 'format that is not found in the descriptor', panelType)).toEqual([]);
            });

            it('should work correctly when the view does not contain explicit format', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withNoExplicitFormat);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, '', panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when there are multiple definitions of the same view - each with a different format, and using format="*"', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withCustomizationsSpreadAcrossViewsWithDifferentFormat);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, '*', panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when there are multiple definitions of the same view - each with a different forType', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withCustomizationsSpreadAcrossViewsWithDifferentForType);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should work correctly when there are multiple definitions of the same view - each with a different forType', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, descriptors.withSeveralCustomizationsForDifferentPanelTypes);
                expect(classics.getAvailableCustomizations(ps, packageName, viewName, format, panelType)).toEqual(viewCustomizations);
            });

            it('should not mutate descriptor customizations', function () {
                var ps = createPrivateServicesWithDescriptor(packageName, {
                    views: [
                        {
                            name: viewName,
                            format: format,
                            customizations: [
                                {
                                    panelType: panelType,
                                    view: viewName,
                                    forType: 'Array',
                                    format: ''
                                }
                            ]
                        }
                    ]
                });

                var descriptor = classicsUtils.getDescriptor(ps, packageName);
                Object.freeze(descriptor.views[0].customizations[0]);

                classics.getAvailableCustomizations(ps, packageName, viewName, '*', panelType);
            });
        });

        describe('findCustomizationOverride', function () {
            var matchingAppLogicCustomization, appLogicCustomizations, rule;
            var mockPrivateServices = {};

            beforeEach(function () {
                matchingAppLogicCustomization = {
                    fieldId: 'TickerGallery',
                    forType: 'Array',
                    format: '',
                    key: 'comp.autoplayInterval',
                    type: 'AppPartCustomization',
                    value: '6',
                    view: 'TickerMediaBottom'
                };
                rule = {
                    fieldId: 'TickerGallery',
                    forType: 'Array',
                    format: '',
                    key: 'comp.autoplayInterval',
                    view: 'TickerMediaBottom'
                };
            });

            it('should return undefined if given an empty list of appLogicCustomizations', function () {
                expect(classics.findCustomizationOverride(mockPrivateServices, [], rule)).toBeUndefined();
            });

            it('should throw an error if given an illegal rule', function () {
                for (var key in rule) {
                    if (rule.hasOwnProperty(key)) {
                        continue;
                    }
                    var originalValue = rule[key];
                    delete rule[key];
                    expect(classics.findCustomizationOverride.bind(null, mockPrivateServices, [], rule)).toThrow(new Error('illegal rule'));
                    rule[key] = originalValue;
                }
            });

            describe('only one appLogicCustomization', function () {
                beforeEach(function () {
                    appLogicCustomizations = [matchingAppLogicCustomization];
                });

                it('should find it if has exactly the same fields as those of rule', function () {
                    expect(classics.findCustomizationOverride(mockPrivateServices, appLogicCustomizations, rule)).toBe(matchingAppLogicCustomization);
                });

                it('should return undefined if the customization has one of the fields different than those of rule', function () {
                    ['fieldId', 'forType', 'format', 'key', 'view'].forEach(function (fieldName) {
                        var originalValue = rule[fieldName];
                        rule[fieldName] = 'something else than the value of appLogicCustomization';
                        expect(classics.findCustomizationOverride(mockPrivateServices, appLogicCustomizations, rule)).toBeUndefined();
                        rule[fieldName] = originalValue;
                    });
                });
            });

            describe('several appLogicCustomizations', function () {
                beforeEach(function () {
                    var nonMatchingAppLogicCustomization = _.merge({}, matchingAppLogicCustomization, {fieldId: 'someOtherField'});
                    appLogicCustomizations = [nonMatchingAppLogicCustomization, matchingAppLogicCustomization];
                });

                it('should find it if it is the last one', function () {
                    expect(classics.findCustomizationOverride(mockPrivateServices, appLogicCustomizations, rule)).toBe(matchingAppLogicCustomization);
                });
            });
        });

        describe('findCustomizationDefaultValueFromDescriptor', function () {
            var packageName = 'blog';
            var viewName = 'some view';
            var format = '';
            var forType = 'Post';

            var rule;

            var descriptor = {
                packageName: 'blog',
                views: [
                    {
                        'name': viewName,
                        'forType': forType,
                        'customizations': []
                    },
                    {
                        'name': viewName,
                        'forType': forType,
                        'vars': {
                            'padding': 'testRes6',
                            'testVar6': {'$expr': 'testFunc6()'}
                        },
                        'comp': {
                            'items': [
                                {
                                    'id': 'testId2',
                                    'comp': {
                                        'maxLines': 'testRes2',
                                        'testProp2': {'$expr': 'testFunc2()'}
                                    }
                                },
                                {
                                    'comp': {
                                        'items': [
                                            {
                                                'id': 'testId3',
                                                'comp': {
                                                    'format': 'testRes3',
                                                    'testProp3': {'$expr': 'testFunc3()'}
                                                }
                                            }
                                        ]
                                    },
                                    'id': 'def_3'
                                },
                                {
                                    'comp': {
                                        'cases': {
                                            'default': [
                                                {
                                                    'id': 'postsGallery',
                                                    'comp': {
                                                        'autoplayInterval': '3'
                                                    }
                                                }
                                            ],
                                            'true': [
                                                {
                                                    'comp': {
                                                        'name': 'testRes4',
                                                        'testProp4': {'$expr': 'testFunc4()'}
                                                    },
                                                    'id': 'testId4'
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    'comp': {
                                        'templates': {
                                            'item': {
                                                'comp': {
                                                    'title': 'testRes5',
                                                    'testProp5': {'$expr': 'testFunc5()'}
                                                },
                                                'id': 'testId5'
                                            }
                                        }
                                    }
                                },
                                {
                                    'comp': {
                                        'name': 'SwitchBox',
                                        'cases': {
                                            'default': [
                                                {
                                                    'data': 'text',
                                                    'comp': {
                                                        'name': 'Label'
                                                    },
                                                    'layout': {
                                                        'width': '100%',
                                                        'spacerAfter': {
                                                            '$expr': 'add($padding)'
                                                        }
                                                    },
                                                    'id': 'testId8'
                                                }
                                            ],
                                            'false': [
                                                {
                                                    'data': 'text',
                                                    'comp': {
                                                        'name': 'ClippedParagraph2',
                                                        'max-chars': 'testRes8'
                                                    },
                                                    'layout': {
                                                        'width': '100%'
                                                    },
                                                    'id': 'testId8'
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        },
                        'customizations': [
                            {
                                'fieldId': 'testId7',
                                'key': 'contentExtend',
                                'format': format,
                                'input': {
                                    'name': 'checkbox',
                                    'falseVal': 'true',
                                    'label': '@BLOG_FEED_READ_MORE_BTN_SHOW@',
                                    'defaultVal': 'testRes7',
                                    'trueVal': 'false'
                                }
                            },
                            {
                                'fieldId': 'testId9',
                                'key': 'testKey9',
                                'format': format,
                                'input': {
                                    'name': 'checkbox',
                                    'falseVal': 'true',
                                    'label': '@BLOG_FEED_READ_MORE_BTN_SHOW@',
                                    'defaultVal': {'$expr': 'testFunc9()'},
                                    'trueVal': 'false'
                                }
                            }
                        ],
                        'id': 'def_0'
                    }
                ],
                customizations: [
                    {
                        'forType': forType,
                        'view': viewName,
                        'format': format,
                        'fieldId': 'testId1',
                        'key': 'layout.width',
                        'value': 'testRes1'
                    }
                ]
            };

            function createPrivateServices() {
                return createPrivateServicesWithDescriptor(packageName, descriptor);
            }

            beforeEach(function () {
                rule = {
                    view: viewName,
                    format: format,
                    forType: forType,
                    fieldId: 'enter the fieldId of your test',
                    key: 'enter the key of your test'
                };
            });

            it('should be found in the "customizations" section of the descriptor', function () {
                rule.fieldId = 'testId1';
                rule.key = 'layout.width';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes1');
            });

            it('should be found in the first level of "items" inside "comp"', function () {
                rule.fieldId = 'testId2';
                rule.key = 'comp.maxLines';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes2');
            });

            it('should evaluate expression value found in the first level of "items" inside "comp"', function () {
                rule.fieldId = 'testId2';
                rule.key = 'comp.testProp2';

                wixappsCore.FunctionLibrary.prototype.testFunc2 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc2.and.returnValue('testRes2');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes2');

                wixappsCore.FunctionLibrary.prototype.testFunc2.and.returnValue('otherTestRes2');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes2');

                delete wixappsCore.FunctionLibrary.prototype.testFunc2;
            });

            it('should be found in the second level of "items" inside "comp"', function () {
                rule.fieldId = 'testId3';
                rule.key = 'comp.format';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes3');
            });

            it('should evaluate expression value found in the second level of "items" inside "comp"', function () {
                rule.fieldId = 'testId3';
                rule.key = 'comp.testProp3';

                wixappsCore.FunctionLibrary.prototype.testFunc3 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc3.and.returnValue('testRes3');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes3');

                wixappsCore.FunctionLibrary.prototype.testFunc3.and.returnValue('otherTestRes3');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes3');

                delete wixappsCore.FunctionLibrary.prototype.testFunc3;
            });

            it('should be found in "cases" inside "comp"', function () {
                rule.fieldId = 'testId4';
                rule.key = 'comp.name';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes4');
            });

            it('should evaluate expression value found in "cases" inside "comp"', function () {
                rule.fieldId = 'testId4';
                rule.key = 'comp.testProp4';

                wixappsCore.FunctionLibrary.prototype.testFunc4 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc4.and.returnValue('testRes4');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes4');

                wixappsCore.FunctionLibrary.prototype.testFunc4.and.returnValue('otherTestRes4');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes4');

                delete wixappsCore.FunctionLibrary.prototype.testFunc4;
            });

            it('should be found in "templates" inside "comp"', function () {
                rule.fieldId = 'testId5';
                rule.key = 'comp.title';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes5');
            });

            it('should evaluate expression value found in "templates" inside "comp"', function () {
                rule.fieldId = 'testId5';
                rule.key = 'comp.testProp5';

                wixappsCore.FunctionLibrary.prototype.testFunc5 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc5.and.returnValue('testRes5');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes5');

                wixappsCore.FunctionLibrary.prototype.testFunc5.and.returnValue('otherTestRes5');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes5');

                delete wixappsCore.FunctionLibrary.prototype.testFunc5;
            });

            it('should be found in "vars"', function () {
                rule.fieldId = 'vars';
                rule.key = 'padding';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes6');
            });

            it('should evaluate expression value found in "vars"', function () {
                rule.fieldId = 'vars';
                rule.key = 'testVar6';

                wixappsCore.FunctionLibrary.prototype.testFunc6 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc6.and.returnValue('testRes6');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes6');

                wixappsCore.FunctionLibrary.prototype.testFunc6.and.returnValue('otherTestRes6');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes6');

                delete wixappsCore.FunctionLibrary.prototype.testFunc6;
            });

            it('should be found in in the "input" field of the customization inside the "views"', function () {
                rule.fieldId = 'testId7';
                rule.key = 'contentExtend';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes7');
            });

            it('should evaluate expression value found in in the "input" field of the customization inside the "views"', function () {
                rule.fieldId = 'testId9';
                rule.key = 'testKey9';

                wixappsCore.FunctionLibrary.prototype.testFunc9 = jasmine.createSpy();

                wixappsCore.FunctionLibrary.prototype.testFunc9.and.returnValue('testRes9');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes9');

                wixappsCore.FunctionLibrary.prototype.testFunc9.and.returnValue('otherTestRes9');
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('otherTestRes9');

                delete wixappsCore.FunctionLibrary.prototype.testFunc9;
            });

            it('should be found in in the "input" field of the customization inside the "views"', function () {
                rule.fieldId = 'testId8';
                rule.key = 'comp.max-chars';
                expect(classics.findCustomizationDefaultValueFromDescriptor(createPrivateServices(), packageName, rule)).toBe('testRes8');
            });
        });

        describe('get stuff from part definition', function () {
            var packageName = 'blog';
            var appPartName = 'appPartName';
            var views = ['viewName'];
            var allowRtl = true;

            function createPrivateServices() {
                return createPrivateServicesWithDescriptor(packageName, {
                    parts: [
                        {
                            id: appPartName,
                            views: views,
                            allowRtl: allowRtl
                        },
                        {
                            id: 'some other part id',
                            views: ['some other view']
                        }
                    ]
                });
            }

            it("should get the app part's view names from the descriptor", function () {
                expect(classics.getAvailableViewNames(createPrivateServices(), packageName, appPartName)).toEqual(views);
            });

            it('should tell whether an app part supports rtl', function () {
                expect(classics.isRTLAllowed(createPrivateServices(), packageName, appPartName)).toEqual(allowRtl);
            });
        });

        describe('can delete item', function () {

            function createPrivateServices() {
                var packageName = 'blog';
                var appPartName = 'appPartName';
                var views = ['viewName'];
                var allowRtl = true;
                return createPrivateServicesWithDescriptor(packageName, {
                    parts: [
                        {
                            id: appPartName,
                            views: views,
                            allowRtl: allowRtl
                        },
                        {
                            id: 'some other part id',
                            views: ['some other view']
                        }
                    ]
                });
            }

            it("return false for appPart FEED", function () {
                spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: blogAppPartNames.FEED});
                expect(classics.canDeleteComp(createPrivateServices(), {})).toEqual(false);
            });

            it("return false for appPart SINGLE_POST", function () {
                spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: blogAppPartNames.SINGLE_POST});
                expect(classics.canDeleteComp(createPrivateServices(), {})).toEqual(false);
            });

            it("return false appPart HERO_IMAGE", function () {
                testUtils.experimentHelper.openExperiments('sv_blogHeroImage');
                spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: blogAppPartNames.HERO_IMAGE});
                expect(classics.canDeleteComp(createPrivateServices(), {})).toEqual(false);
            });

            it("return undefined appPart HERO_IMAGE with experiment sv_blogStudioExperiment on", function () {
                testUtils.experimentHelper.openExperiments('sv_blogStudioExperiment');
                spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: blogAppPartNames.HERO_IMAGE});
                expect(classics.canDeleteComp(createPrivateServices(), {})).toEqual(undefined);
            });

            it('should tell whether an app part supports rtl', function () {
                spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: '11111'});
                expect(classics.canDeleteComp(createPrivateServices(), {})).not.toEqual(false);
            });
        });

        describe('provision', function () {
           var ps;

            beforeEach(function() {
                ps = createPrivateServicesWithDescriptor('blog');
                spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(siteMetadata.generalInfo, 'isFirstSave').and.returnValue(false);
            });

            it('appId exists - should return it', function() {
                var appId = '123-456';
                spyOn(classics, 'getApplicationId').and.returnValue(appId);
                var callback = jasmine.createSpy('onComplete');

                classics.provision(ps, 'blog', '', callback);
                expect(callback).toHaveBeenCalledWith({applicationId : appId});
            });

            it('site saved', function() {
                var callback = jasmine.createSpy('onComplete');
                spyOn(provisionService, 'provisionAppAfterSave');

                classics.provision(ps, 'blog', '', callback);
                expect(provisionService.provisionAppAfterSave).toHaveBeenCalled();
            });

        });

        describe('provision from template', function () {
            var ps;

            beforeEach(function() {
                ps = createPrivateServicesWithDescriptor('blog');
                spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(siteMetadata.generalInfo, 'isFirstSave').and.returnValue(false);
            });

            it('appId exists - should return it', function() {
                var appId = '123-456';
                spyOn(classics, 'getApplicationId').and.returnValue(appId);
                var callback = jasmine.createSpy('onComplete');

                classics.provision(ps, 'blog', '', callback);
                expect(callback).toHaveBeenCalledWith({applicationId : appId});
            });

            it('site saved', function() {
                var callback = jasmine.createSpy('onComplete');
                spyOn(provisionService, 'provisionAppFromSourceTemplate');

                classics.provisionFromTemplate(ps, 'blog', '', callback);
                expect(provisionService.provisionAppFromSourceTemplate).toHaveBeenCalled();
            });

        });
    });


    describe('getBlogCategories', function () {

        it('should return flatten categories', function () {
            havingCategoriesExpectReturnValue([{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: []
            }], [{
                name: 'categoryName'
            }]);

            havingCategoriesExpectReturnValue([{
                id: 'otherCategoryId',
                name: 'otherCategoryName',
                subcategories: []
            }], [{
                name: 'otherCategoryName'
            }]);

            havingCategoriesExpectReturnValue([{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: []
            }, {
                id: 'otherCategoryId',
                name: 'otherCategoryName',
                subcategories: []
            }], [{
                name: 'categoryName'
            }, {
                name: 'otherCategoryName'
            }]);

            havingCategoriesExpectReturnValue([], []);

            havingCategoriesExpectReturnValue([{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: [{
                    id: 'subcategoryId',
                    name: 'subcategoryName',
                    subcategories: []
                }]
            }], [{
                name: 'categoryName'
            }, {
                isSubcategory: true,
                name: 'subcategoryName'
            }]);

            havingCategoriesExpectReturnValue([{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: [{
                    id: 'otherSubcategoryId',
                    name: 'otherSubcategoryName',
                    subcategories: []
                }]
            }], [{
                name: 'categoryName'
            }, {
                isSubcategory: true,
                name: 'otherSubcategoryName'
            }]);

            havingCategoriesExpectReturnValue([{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: [{
                    id: 'subcategoryId',
                    name: 'subcategoryName',
                    subcategories: []
                }, {
                    id: 'otherSubcategoryId',
                    name: 'otherSubcategoryName',
                    subcategories: []
                }]
            }], [{
                name: 'categoryName'
            }, {
                isSubcategory: true,
                name: 'subcategoryName'
            }, {
                isSubcategory: true,
                name: 'otherSubcategoryName'
            }]);
        });


        it('should return an empty array if categories are null', function () {
            havingCategoriesExpectReturnValue(null, []);
        });


        it('should prepend given category name to returned flattened categories if the category does not exist', function () {
            givenCategoryNameAndHavingCategoriesExpectReturnValue('unexistentCategoryName', [{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: []
            }], [{
                name: 'unexistentCategoryName'
            }, {
                name: 'categoryName'
            }]);

            givenCategoryNameAndHavingCategoriesExpectReturnValue('otherUnexistentCategoryName', [{
                id: 'categoryId',
                name: 'categoryName',
                subcategories: []
            }], [{
                name: 'otherUnexistentCategoryName'
            }, {
                name: 'categoryName'
            }]);
        });


        it('should not prepend given category name to returned flattened categories if the category exists', function () {
            givenCategoryNameAndHavingCategoriesExpectReturnValue('existingCategoryName', [{
                id: 'existingCategoryId',
                name: 'existingCategoryName',
                subcategories: []
            }], [{
                name: 'existingCategoryName'
            }]);

            givenCategoryNameAndHavingCategoriesExpectReturnValue('otherExistingCategoryName', [{
                id: 'otherExistingCategoryId',
                name: 'otherExistingCategoryName',
                subcategories: []
            }], [{
                name: 'otherExistingCategoryName'
            }]);

            givenCategoryNameAndHavingCategoriesExpectReturnValue('otherExistingCategoryName', [{
                id: 'existingCategoryId',
                name: 'existingCategoryName',
                subcategories: []
            }, {
                id: 'otherExistingCategoryId',
                name: 'otherExistingCategoryName',
                subcategories: []
            }], [{
                name: 'existingCategoryName'
            }, {
                name: 'otherExistingCategoryName'
            }]);

            givenCategoryNameAndHavingCategoriesExpectReturnValue('existingCategoryName', [{
                id: 'existingCategoryId',
                name: 'existingCategoryName',
                subcategories: []
            }, {
                id: 'otherExistingCategoryId',
                name: 'otherExistingCategoryName',
                subcategories: []
            }], [{
                name: 'existingCategoryName'
            }, {
                name: 'otherExistingCategoryName'
            }]);
        });


        function givenCategoryNameAndHavingCategoriesExpectReturnValue(categoryName, categories, expectedReturnValue) {
            var ps = mockPrivateServicesHelper.mockPrivateServices({
                wixapps: {
                    blog: {
                        categories: {
                            categories: categories
                        }
                    }
                }
            });

            var actualReturnValue = classics.getBlogCategories(ps, categoryName);
            expect(actualReturnValue).toEqual(expectedReturnValue);
        }


        function havingCategoriesExpectReturnValue(categories, expectedReturnValue) {
            givenCategoryNameAndHavingCategoriesExpectReturnValue(undefined, categories, expectedReturnValue);
        }

    });
});
