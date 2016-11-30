define([
    'previewExtensionsCore',

    /** proxies preview extensions */
    'componentsPreviewLayer/previewExtensions/wixappsProxies/mediaLabelProxyPreviewExtension',
    'componentsPreviewLayer/previewExtensions/wixappsProxies/paginatedListProxyPreviewExtension',

	/** load proxies original definition */
	'wixappsCore'
], function (previewExtensionsCore) {
    'use strict';

    previewExtensionsCore.registrar.extendProxyClasses();
});
