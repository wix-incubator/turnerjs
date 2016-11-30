define(['lodash', 'react', 'definition!componentsPreviewLayer/previewExtensions/slideShowGalleryPreviewExtension',
        'fake!previewExtensionsCore'],
    function (_, React, slideShowGalleryPreviewExtensionDefinition, previewExtensionsCore) {
        'use strict';
        describe('slideShowGalleryPreviewExtension - ', function () {
            var extension,
                registeredCompType,
                mockObj = {
                    props: {}
                };
            var previewExtensionsRegistrar = previewExtensionsCore.registrar;

            beforeEach(function () {

                mockObj.props = {
                    siteData: {
                        renderFlags: {}
                    }
                };

                spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function (compType, ext) {
                    registeredCompType = compType;
                    extension = ext;
                });

                slideShowGalleryPreviewExtensionDefinition(React, _, previewExtensionsCore);
            });

            it('Should register the extension in the preview extensions registrar', function () {
                expect(previewExtensionsRegistrar.registerCompExtension).toHaveBeenCalled();
                expect(registeredCompType).toEqual('wysiwyg.viewer.components.SlideShowGallery');
            });

            describe('refData Transformation function', function () {
                it('should leave refData unchanged in preview mode', function () {
                    var refData = {
                        key: 'val'
                    };
                    mockObj.props.siteData.renderFlags.isSlideShowGalleryClickAllowed = true;
                    var origRefData = _.clone(refData);

                    extension.transformRefData.call(mockObj, refData);

                    expect(refData).toEqual(origRefData);
                });

                it('should add an overlay with Slide Show label in editing mode');
            });

            describe('getButtonsState', function () {
                it('should return empty $editmode state in preview mode', function () {
                    mockObj.props.siteData.renderFlags.isSlideShowGalleryClickAllowed = true;

                    var buttonsState = extension.getButtonsState.call(mockObj);

                    expect(buttonsState).toEqual({$editMode: ""});
                });

                it('should return a "showButtons" $editmode state in edit mode', function () {
                    mockObj.props.siteData.renderFlags.isSlideShowGalleryClickAllowed = false;

                    var buttonsState = extension.getButtonsState.call(mockObj);

                    expect(buttonsState).toEqual({$editMode: "showButtons"});
                });
            });
        });
    });
