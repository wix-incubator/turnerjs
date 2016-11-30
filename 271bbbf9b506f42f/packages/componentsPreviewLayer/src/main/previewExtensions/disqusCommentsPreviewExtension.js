define(['previewExtensionsCore', 'utils'], function (previewExtensionsCore, utils) {
    'use strict';

    var hashUtils = utils.hashUtils;

    var extension = {
        getDisqusId: function() {
            return hashUtils.SHA256.hex_sha256('editor');
        },

        transformRefData: function transformRefData(refData) {
            refData.disqusCommentsPreviewOverlay = refData.disqusCommentsPreviewOverlay || {};
            refData.disqusCommentsPreviewOverlay.style = refData.disqusCommentsPreviewOverlay.style || {};
            refData.disqusCommentsPreviewOverlay.style.display = '';

        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.common.components.disquscomments.viewer.DisqusComments', extension);
});
