define(['lodash', 'react', 'definition!componentsPreviewLayer/previewExtensions/tpaUnavailableMessageOverlayPreviewExtension',
        'fake!previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/translations/tpaExtensionTranslations'],
    function (_, React, tpaUnavailableMessageOverlayPreviewExtensionDef, previewExtensionsCore, tpaExtensionTranslations) {
        'use strict';
        describe('tpaUnavailableMessageOverlayPreviewExtension - ', function () {
            var extension;
            var previewExtensionsRenderPlugin = previewExtensionsCore.registrar;

            beforeEach(function () {
                spyOn(previewExtensionsRenderPlugin, 'registerCompExtension').and.callFake(function (compType, ext) {
                    extension = ext;
                });

                tpaUnavailableMessageOverlayPreviewExtensionDef(_, React, previewExtensionsCore, tpaExtensionTranslations);
            });

            it('Should register the extension in the extensions registrar', function () {
                expect(previewExtensionsRenderPlugin.registerCompExtension.calls.argsFor(0)[0]).toEqual('wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay');
            });

            describe('refData Transformation function', function () {
                var refData,
                    mockComp = {
                        props: {
                            compData: {
                                style: {
                                    width: 300
                                },
                                applicationsId: 15,
                                overlay: 'unresponsive'
                            },
                            siteData: {
                                renderFlags: {isBackToTopButtonAllowed: true},
                                santaBase: "someSource",
                                getClientSpecMapEntry: function() {
                                    return {
                                        appDefinitionName: "app1"
                                    };
                                },
                                rendererModel: {
                                    languageCode: 'en'
                                }
                            }
                        },
                        state: {

                        }
                    };

                beforeEach(function () {
                    refData = {
                        key: 'val'
                    };
                });

                it('should set the icon on top', function () {
                    mockComp.props.compData.style.width = 130;

                    extension.transformRefData.call(mockComp, refData);

                    expect(refData.textContainer.style.textAlign).toEqual('center');
                    expect(refData.content.style.width).toEqual(102);
                });

                it('should set the icon on left', function () {
                    mockComp.props.compData.style.width = 200;

                    extension.transformRefData.call(mockComp, refData);

                    expect(refData.textContainer.style.textAlign).toEqual('left');
                    expect(refData.content.style.width).toEqual(158);
                });

                it('should do nothing if the overly is different from overlay', function () {
                    var origRefData = _.clone(refData);
                    mockComp.props.compData.overlay = "facebookMessage";
                    extension.transformRefData.call(mockComp, refData);

                    expect(refData).toEqual(origRefData);
                });

            });
        });
    });
