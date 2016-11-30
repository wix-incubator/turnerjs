define(['previewExtensionsCore'], function (previewExtensionsCore) {
    'use strict';

    var formExtension = {
        getDefaultProps: function() {
            return {
                ignoreActivityReport: true
            };
        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.viewer.components.ContactForm', formExtension);
    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.common.components.subscribeform.viewer.SubscribeForm', formExtension);
});
