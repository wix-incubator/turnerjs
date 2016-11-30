define(['lodash', 'react', 'testUtils', 'previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/controllerPreviewExtension'],
    function (_, React, testUtils, previewExtensionsCore) {
        'use strict';

        describe('controllerPreviewExtension', function () {
            var previewExtensionsRegistrar = previewExtensionsCore.registrar;

            var extension;

            beforeAll(function (done) {
                var CONTROLLER_PREVIEW_EXTENSION_MODULE_ID =
                    'componentsPreviewLayer/previewExtensions/controllerPreviewExtension';

                require.undef(CONTROLLER_PREVIEW_EXTENSION_MODULE_ID);

                spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function (compType, ext) {
                    extension = ext;
                });

                require([CONTROLLER_PREVIEW_EXTENSION_MODULE_ID], done);

                previewExtensionsCore.registrar.extendCompClasses();
            });

            afterAll(function () {
                previewExtensionsRegistrar.resetAllExtensions();
            });

            it('Should register the extension in the extensions registrar', function () {
                expect(previewExtensionsRegistrar.registerCompExtension.calls.mostRecent().args).toEqual(['platform.components.AppController', jasmine.any(Object)]);
            });

            describe('refData Transformation function', function () {
                function getMockComponentDefinition() {
                    return {
                        render: function () {
                            return null;
                        }
                    };
                }
                beforeEach(function () {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();

                    this.mockedProps = testUtils.mockFactory.mockProps(siteAPI.getSiteData(), siteAPI);
                    this.mockedProps.structure.componentType = 'platform.components.AppController';
                });

                it('should do nothing when showControllers renderer flag is off', function () {
                    var compDefinition = getMockComponentDefinition();
                    var icon = 'icon';
                    this.mockedProps.applicativeUIData = {icon: icon};
                    this.mockedProps.showControllers = false;
                    var renderedComp = testUtils.getComponentFromDefinition(compDefinition, this.mockedProps);
                    var refData = {};
                    extension.transformRefData.call(renderedComp, refData);
                    expect(refData).toEqual({});
                });

                it('should show controller icon from the comp props', function () {
                    var compDefinition = getMockComponentDefinition();
                    var icon = 'icon';
                    this.mockedProps.applicativeUIData = {icon: icon};
                    this.mockedProps.showControllers = true;
                    var renderedComp = testUtils.getComponentFromDefinition(compDefinition, this.mockedProps);
                    var refData = {};
                    extension.transformRefData.call(renderedComp, refData);
                    expect(refData[""].children[0]).toEqual(React.DOM.img({
                        src: icon
                    }));
                });
            });
        });
    });
