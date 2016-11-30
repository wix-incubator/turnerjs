define(['lodash',
        'definition!componentsPreviewLayer/previewExtensions/wixappsLogics/singlePostPageLogicPreviewExtension',
        'previewExtensionsCore',
        'utils'],
    function (_, singlePostPageLogicPreviewExtensionDefinition, previewExtensionsCore, utils) {
        'use strict';
        var blogAppPartNames = utils.blogAppPartNames;
        describe('Single Post Page Logic Preview Extension', function () {
            var registeredPartId,
                previewExtensionsRegistrar = previewExtensionsCore.registrar;

            beforeEach(function () {
                spyOn(previewExtensionsRegistrar, 'registerLogicExtension').and.callFake(function (partId) {
                    registeredPartId = partId;
                });

                singlePostPageLogicPreviewExtensionDefinition(_, previewExtensionsCore, utils);
            });

            it('Should register the extension in the extensions registrar', function () {
                expect(previewExtensionsRegistrar.registerLogicExtension).toHaveBeenCalled();
                expect(registeredPartId).toEqual(blogAppPartNames.SINGLE_POST);
            });
        });
    });
