define(['lodash', 'santaProps', 'previewExtensionsCore'],
    function (_, santaProps, previewExtensionsCore) {
        'use strict';

        var compsType = ['wysiwyg.common.components.subscribeform.viewer.SubscribeForm'];
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;


        var extension = {
            propTypes: {
                isExternalNavigationAllowed: santaProps.Types.RenderFlags.isExternalNavigationAllowed,
                renderRealtimeConfig: santaProps.Types.renderRealtimeConfig
            },

            blockSubmit: function (domNode) {
                if (this.props.isExternalNavigationAllowed) {
                    return;
                }
                var previewTooltipCallback = this.props.renderRealtimeConfig.previewTooltipCallback;
                previewTooltipCallback(domNode.getBoundingClientRect(), "PREVIEW_TOOLTIP_SUBSCRIBE");
            },
            shouldBlockSubmit: function () {
                return !this.props.isExternalNavigationAllowed;
            }
        };
        _.forEach(compsType, function (compType) {
            previewExtensionsRegistrar.registerCompExtension(compType, extension);
        });
    });
