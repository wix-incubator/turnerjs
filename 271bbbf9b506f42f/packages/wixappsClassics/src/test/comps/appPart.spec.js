define(['definition!wixappsClassics/comps/appPart',
        'lodash',
        'react',
        'utils',
        'testUtils',
        'core',
        'wixappsCore',
        'wixappsClassics/util/appPartCommonDataManager',
        'wixappsClassics/util/wixappsUrlUtils',
        'wixappsClassics/util/descriptorUtils',
        'experiment'],
    function (appPartDef,
              _,
              React,
              utils,
              testUtils,
              core,
              wixappsCore,
              appPartCommonDataManager,
              wixappsUrlUtils,
              descriptorUtils,
              experiment) {

        'use strict';
        
        describe('AppPart', function () {

            var AppPart;
            beforeEach(function (done) {
                requirejs.undef('wixappsClassics/util/viewCacheUtils');
                require(['wixappsClassics/util/viewCacheUtils'], function (viewCacheUtils) {
                    AppPart = appPartDef(_, utils, core, wixappsCore, appPartCommonDataManager, wixappsUrlUtils, viewCacheUtils, descriptorUtils, experiment);
                    done();
                });
            });

            describe('getViewDef', function () {

                describe('when called', function () {

                    describe('if view format is ""', function () {

                        beforeEach(function () {
                            spyOn(utils.appPartMediaInnerViewNameUtils, 'isMediaInnerViewName');
                            spyOn(wixappsCore.viewsCustomizer, 'customizeView').and.callThrough();
                        });


                        describe('and called with format "Mobile"', function () {

                            it('should call utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName', function () {
                                invoke({format: 'Mobile'});
                                expect(utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName).toHaveBeenCalled();
                            });


                            describe('utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName call argument (viewName)', function () {

                                var actualViewName;


                                var expectedViewName;


                                beforeEach(function () {
                                    expectedViewName = {};
                                    invoke({format: 'Mobile', view: expectedViewName});
                                    actualViewName = utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName.calls.mostRecent().args[0];
                                });


                                it('should be first argument (viewName) from getViewDef call', function () {
                                    expect(actualViewName).toBe(expectedViewName);
                                });

                            });


                            it('should call utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName before wixappsCore.viewsCustomizer.customizeView', function () {
                                wixappsCore.viewsCustomizer.customizeView.and.callFake(function () {
                                    expect(utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName).toHaveBeenCalled();
                                });
                                invoke({format: 'Mobile'});
                            });


                            describe('if utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName returns true', function () {

                                var viewDef;


                                beforeEach(function () {
                                    utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName.and.returnValue(true);
                                    viewDef = invoke({format: 'Mobile'});
                                });


                                it('should should set view definition format to "Mobile"', function () {
                                    expect(viewDef.format).toBe('Mobile');
                                });

                            });


                            describe('if utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName returns false', function () {

                                var viewDef;


                                beforeEach(function () {
                                    utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName.and.returnValue(false);
                                    viewDef = invoke({format: 'Mobile'});
                                });


                                it('should set view definition format to ""', function () {
                                    expect(viewDef.format).toBe('');
                                });

                            });

                        });


                        describe('and called with format ""', function () {

                            beforeEach(function () {
                                invoke({format: ''});
                            });


                            it('should not call utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName', function () {
                                expect(utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName).not.toHaveBeenCalled();
                            });

                        });

                    });


                    function stubContext(options) {
                        return {
                            getAppCustomizations: function () {
                                return [];
                            },
                            getAppDescriptor: function () {
                                var view = {
                                    forType: options.type,
                                    format: options.format,
                                    name: options.view
                                };
                                return {
                                    types: [{_iid: options.type}],
                                    views: [view]
                                };
                            },
                            getUserCustomizations: function () {
                                return [];
                            },
                            props: {}
                        };
                    }


                    function invoke(options) {
                        if (!options.view) {
                            options.view = 'some view name';
                        }

                        if (!options.format) {
                            options.format = '';
                        }

                        if (!options.viewFormat) {
                            options.viewFormat = '';
                        }

                        var context = stubContext({format: options.viewFormat, view: options.view});
                        return AppPart.getViewDef.call(context, options.view, options.type, options.format);
                    }

                });

            });

            describe('getViewName', function () {

                beforeAll(function () {
                    wixappsCore.proxyFactory.register('MockProxy', {
                        render: function () { //eslint-disable-line react/display-name
                            return React.createElement('div', {});
                        }
                    });
                });

                afterAll(function () {
                    wixappsCore.proxyFactory.invalidate('MockProxy');
                });

                it('should return the view name from compData', function () {
                    var viewName = 'MyListView';
                    var props = testUtils.mockFactory.mockProps()
                        .setCompData(testUtils.mockFactory.dataMocks.appPartData({viewName: viewName}));
                    props.structure.componentType = 'wixapps.integration.components.AppPart';

                    var appPart = testUtils.getComponentFromDefinition(AppPart, props);

                    expect(appPart.getViewName()).toEqual(viewName);
                });

                it('should add \'View\' to the view name when there is registered proxy with that name', function () {
                    var viewName = 'MockProxy';
                    var props = testUtils.mockFactory.mockProps()
                        .setCompData(testUtils.mockFactory.dataMocks.appPartData({viewName: viewName}));
                    props.structure.componentType = 'wixapps.integration.components.AppPart';

                    var appPart = testUtils.getComponentFromDefinition(AppPart, props);

                    expect(appPart.getViewName()).toEqual(viewName + 'View');
                });
            });

            describe('isHeightResizable', function () {
                function FakeNotResizableLogicClass() {
                    this.isHeightResizable = function () {
                        return false;
                    };
                }

                function FakeResizableLogicClass() {
                    this.isHeightResizable = function () {
                        return true;
                    };
                }

                beforeAll(function () {
                    wixappsCore.proxyFactory.register('MockProxy', {
                        render: function () { //eslint-disable-line react/display-name
                            return React.createElement('div', {});
                        }
                    });

                    this.createAppPart = function () {
                        var viewName = 'MyListView';
                        var props = testUtils.mockFactory.mockProps()
                            .setCompData(testUtils.mockFactory.dataMocks.appPartData({viewName: viewName}));
                        props.structure.componentType = 'wixapps.integration.components.AppPart';

                        this.appPart = testUtils.getComponentFromDefinition(AppPart, props);
                        this.appPart.getPartDefinition = function () {
                            return {fakePartApi: 'fakePartApi'};
                        };
                    };

                    this.mochLogic = function (FakeLogicClass) {
                        wixappsCore.logicFactory.getLogicClass = function () {
                            return FakeLogicClass;
                        };

                        this.createAppPart();
                    };
                });

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('sv_blogRelatedPosts');
                });

                afterAll(function () {
                    wixappsCore.proxyFactory.invalidate('MockProxy');
                });

                describe('logic is defined', function () {

                    it('return false if logic isHeightResizable returns false', function () {
                        this.mochLogic(FakeNotResizableLogicClass);
                        expect(this.appPart.isHeightResizable()).toEqual(false);
                    });

                    it('return true if logic isHeightResizable returns true', function () {
                        this.mochLogic(FakeResizableLogicClass);
                        expect(this.appPart.isHeightResizable()).toEqual(true);
                    });
                });

                describe('logic is not defined', function () {
                    it('return heightResizable flag from descriptor.parts', function () {
                        this.mochLogic(null);

                        spyOn(descriptorUtils, 'doesAllowHeightResize').and.returnValue('fakeFlag');

                        expect(this.appPart.isHeightResizable()).toEqual('fakeFlag');
                    });
                });
            });
        });
    });
