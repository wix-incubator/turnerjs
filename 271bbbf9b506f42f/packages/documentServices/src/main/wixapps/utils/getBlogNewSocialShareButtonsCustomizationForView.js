define(function () {
    'use strict';

    return getBlogNewSocialShareButtonsCustomizationForView;

    function getBlogNewSocialShareButtonsCustomizationForView(name) {
        return {
            fieldId: 'vars',
            forType: 'Post',
            format: '*',
            key: 'shouldUseNewSocialShareButtons',
            type: 'AppPartCustomization',
            value: true,
            view: name
        };
    }
});
