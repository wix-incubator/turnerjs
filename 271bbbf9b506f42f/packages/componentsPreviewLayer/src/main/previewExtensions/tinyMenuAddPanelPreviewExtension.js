define(['lodash', 'santaProps', 'previewExtensionsCore'], function (_, santaProps, previewExtensionsCore) {
    'use strict';

    var extension = {
        propTypes: {
          shouldResetTinyMenuZIndex: santaProps.Types.RenderFlags.shouldResetTinyMenuZIndex
        },
        transformRefDataTemp: function transformRefData(refData) {
            if (this.props.shouldResetTinyMenuZIndex) {
                refData[''] = refData[''] || {};
                refData[''].style = _.assign({}, refData[''].style || {}, {
                    zIndex: 'auto'
                });
            }
        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.viewer.components.mobile.TinyMenu', extension);
});
