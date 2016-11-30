define(['previewExtensionsCore', 'santaProps'],
    function (previewExtensionsCore, santaProps) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.MatrixGallery';
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        var extension = {
            propTypes: {
                shoa: santaProps.Types.popup.close
            },
            resetGalleryState: function () {
                var initialState = this.getInitialState();
                this.registerReLayout();
                this.setState(initialState);
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    });
