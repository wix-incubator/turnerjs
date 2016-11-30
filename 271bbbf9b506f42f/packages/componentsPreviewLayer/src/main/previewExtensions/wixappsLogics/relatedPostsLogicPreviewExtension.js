define([
    'lodash',
    'previewExtensionsCore',
    'utils',
    'experiment'
], function (
    _,
    previewExtensionsCore,
    utils,
    experiment
) {

    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;

    if (experiment.isOpen('sv_blogRelatedPosts')) {
        previewExtensionsCore.registrar.registerLogicExtension(blogAppPartNames.RELATED_POSTS, {
            getViewVars: function () {
                return {
                    isEditMode: true
                };
            },
            isHeightResizable: function () {
                return true;
            }
        });
    }
});
