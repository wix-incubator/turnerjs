define([
    'previewExtensionsCore',

/** load original logics */
	'wixappsClassics',

/** logics preview extensions */
    'componentsPreviewLayer/previewExtensions/wixappsLogics/singlePostPageLogicPreviewExtension',
    'componentsPreviewLayer/previewExtensions/wixappsLogics/relatedPostsLogicPreviewExtension'

], function (previewExtensionsCore) {
    'use strict';

    previewExtensionsCore.registrar.extendLogicClasses();
});
