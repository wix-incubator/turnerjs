define([
        'lodash',
        'previewExtensionsCore'
    ],
function (_, previewExtensionsCore) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.tpapps.TPAModal';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        transformRefData: function transformRefData(refData) {
            if (this.state.$displayDevice === 'mobile') {
                var refDataChanges = {
                    frameWrap: {
                        style: {
                            overflowY: 'none',
                            width: 319,
                            height: 512
                        }
                    },
                    dialog: {
                        style: {
                            position: 'relative'
                        }
                    }
                };
                _.merge(refData, refDataChanges);
            }
        }
    };

    previewExtensionsRegistrar.registerCompExtension(compType, extension);
});
