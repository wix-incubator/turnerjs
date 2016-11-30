define(['lodash', 'santaProps', 'previewExtensionsCore'],
    function (_, santaProps, previewExtensionsCore) {
        'use strict';

        var compType = 'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton';
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;

        var extension = {
            propTypes: {
                isBackToTopButtonAllowed: santaProps.Types.RenderFlags.isBackToTopButtonAllowed
            },
            transformRefData: function transformRefData(refData) {
                if (this.props.isBackToTopButtonAllowed) {
                    return;
                }

                var refDataChanges = {
                    "": {
                        style: {
                            display: 'none'
                        }
                    }
                };

                _.merge(refData, refDataChanges);
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);

        return extension;
    });
