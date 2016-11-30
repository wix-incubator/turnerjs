define(['react', 'previewExtensionsCore'], function(React, previewExtensionsCore) {
    'use strict';

    var DEFAULT_HOOK_TYPE = 'onClick';
    var previewExtensionsHooks = previewExtensionsCore.hooks;

    return {
        /**
         * @param {Object} refData
         * @param {string} [compType]
         * @param {string} [hookType='onClick']
         */
        createBlockLayer: function createBlockLayer(refData, compType, hookType) {
            var blockLayerProps = {
                style: {
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                },
                className: 'blockLayer'
            };

            if (compType) {
                hookType = hookType || DEFAULT_HOOK_TYPE;

                blockLayerProps.onClick = function (e) {
                    var hookFn = previewExtensionsHooks.getHookFn(compType, hookType);
                    if (hookFn) {
                        hookFn(e);
                    }
                };
            }
            var blockLayer = React.DOM.div(blockLayerProps);

            refData[""] = refData[""] || {};
            refData[""].addChildren = refData[""].addChildren || [];
            refData[""].addChildren.push(blockLayer);
        }
    };
});