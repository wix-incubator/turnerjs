define([
    'lodash',
    'fake!previewExtensionsCore',
    'definition!componentsPreviewLayer/previewExtensions/tpaPopupExtension'
    ], function(_, previewExtensionsCore, tpaPopupExtensionDef){
    'use strict';
    describe('tpa popup preview extension', function(){
        var extension;
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        beforeEach(function () {
            spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function (compType, ext) {
                extension = ext;
            });

            tpaPopupExtensionDef(_, previewExtensionsCore);
        });

        it('Should register the extension in the extensions registrar', function () {
            expect(previewExtensionsRegistrar.registerCompExtension.calls.argsFor(0)[0]).toEqual('wysiwyg.viewer.components.tpapps.TPAPopup');
        });

        describe('refData Transformation function', function () {
            var refData,
                mockComp = {
                    props: {
                        compData: {}
                    },
                    state: {}
                };

            beforeEach(function(){
                refData = {
                    'iframe': {
                        src: '//static.parastorage.com/services/js-sdk/1.16.0/html/modal.html'
                    }
                };
            });

            it('should not change the iframe if view mode is defined', function(){
                mockComp.state.viewMode = 'preview';
                extension.transformRefData.call(mockComp, refData);
                expect(refData.iframe.src).toBe('//static.parastorage.com/services/js-sdk/1.16.0/html/modal.html');
            });
        });
    });
});
