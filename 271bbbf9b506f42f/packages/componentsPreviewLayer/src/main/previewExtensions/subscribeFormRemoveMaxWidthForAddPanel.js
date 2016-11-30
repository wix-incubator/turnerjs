define(['lodash', 'santaProps', 'previewExtensionsCore'], function (_, santaProps, previewExtensionsCore) {
    'use strict';

    var extension = {
        propTypes: {
            shouldResetSubscribeFormMinMaxWidth: santaProps.Types.RenderFlags.shouldResetSubscribeFormMinMaxWidth
        },
        transformRefDataTemp: function(refData) {
            if (this.props.shouldResetSubscribeFormMinMaxWidth) {
                refData[''] = refData[''] || {};
                refData[''].style.minWidth = 'initial';
                refData[''].style.maxWidth = 'initial';
            }
        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.common.components.subscribeform.viewer.SubscribeForm', extension);
});
