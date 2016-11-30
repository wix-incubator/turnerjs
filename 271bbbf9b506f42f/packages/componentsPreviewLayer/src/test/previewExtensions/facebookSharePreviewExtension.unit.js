define(['lodash', 'definition!componentsPreviewLayer/previewExtensions/facebookSharePreviewExtension',
        'fake!previewExtensionsCore',
        'fake!componentsPreviewLayer/previewExtensions/helpers/previewModifications'],
    function (_, facebookSharePreviewExtensionDefinition, previewExtensionsCore, previewModifications) {
        'use strict';
        describe('facebookSharePreviewExtension - ', function () {
            var registeredCompType,
                extension,
                previewExtensionsRegistrar = previewExtensionsCore.registrar,
                previewExtensionsHooks = previewExtensionsCore.hooks;

            beforeEach(function () {
                spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function(compType, ext) {
                    registeredCompType = compType;
                    extension = ext;
                });
                spyOn(previewExtensionsHooks, 'registerSupportedHooks');

                facebookSharePreviewExtensionDefinition(previewExtensionsCore, previewModifications);
            });

            it('Should register the extension in the extensions registrar', function () {
                expect(previewExtensionsRegistrar.registerCompExtension).toHaveBeenCalled();
                expect(registeredCompType).toEqual('wysiwyg.viewer.components.FacebookShare');
            });

            it('Should register its available hooks in previewExtensionsHooks', function () {
                expect(previewExtensionsHooks.registerSupportedHooks).toHaveBeenCalledWith('wysiwyg.viewer.components.FacebookShare', [previewExtensionsHooks.HOOK_NAMES.ON_CLICK]);
            });

            describe('refData Transformation function', function () {
                var mockComp;

                beforeEach(function () {
                    mockComp = {
                        props: {
                            siteData: {
                                renderFlags: {isSocialInteractionAllowed: true}
                            }
                        }
                    };
                });

                it('Should leave refData unchanged if isSocialInteractionAllowed=true', function() {
                    spyOn(previewModifications, 'createBlockLayer');
                    var refData = {
                        key: 'val'
                    };
                    var origRefData = _.clone(refData);

                    extension.transformRefData.call(mockComp, refData);

                    expect(refData).toEqual(origRefData);
                });

                it('should create a blocking div with onClick hook', function() {
                    mockComp.props.siteData.renderFlags.isSocialInteractionAllowed = false;
                    spyOn(previewModifications, 'createBlockLayer');
                    var refData = {
                        key: 'val'
                    };

                    extension.transformRefData.call(mockComp, refData);

                    expect(previewModifications.createBlockLayer).toHaveBeenCalledWith(refData, 'wysiwyg.viewer.components.FacebookShare');
                });

                it('should set the parent container\'s width to auto', function() {
                    mockComp.props.siteData.renderFlags.isSocialInteractionAllowed = false;
                    var refData = {
                        key: 'val'
                    };

                    extension.transformRefData.call(mockComp, refData);

                    expect(refData[""].style.width).toEqual('auto');
                });
            });
        });
    });
