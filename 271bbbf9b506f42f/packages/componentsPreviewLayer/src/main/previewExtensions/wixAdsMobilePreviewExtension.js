define(['lodash', 'previewExtensionsCore'],
    function (_, previewExtensionsCore) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.WixAdsMobile';

        var extension = {
            onClickOverridenHandler: function () {
                // Do not handle click in preview mode;
            }
        };

        previewExtensionsCore.registrar.registerCompExtension(compType, extension);
    });
