define(['lodash', 'previewExtensionsCore'],
    function (_, previewExtensionsCore) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.WixAdsDesktop';

        var extension = {
            onPreviewAdClick: _.noop
        };

        previewExtensionsCore.registrar.registerCompExtension(compType, extension);
    });
