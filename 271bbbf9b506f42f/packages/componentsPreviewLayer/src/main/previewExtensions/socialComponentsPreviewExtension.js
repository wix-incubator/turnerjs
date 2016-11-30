define(['lodash', 'previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/helpers/previewModifications', 'santaProps'],
    function (_, previewExtensionsCore, previewModifications, santaProps) {
        'use strict';

        var compTypes = [
            'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode',
            //'wysiwyg.viewer.components.wixhomepage.HomePageLogin',
            'wysiwyg.viewer.components.WFacebookComment',
            'wysiwyg.viewer.components.ItunesButton',
            'wysiwyg.viewer.components.PayPalButton',
            'wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt',
            'wysiwyg.viewer.components.VKShareButton',
            'wysiwyg.viewer.components.WGooglePlusOne',
            'wysiwyg.viewer.components.WTwitterFollow',
            'wysiwyg.viewer.components.WTwitterTweet',
            'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton'
        ];
        var previewExtensionsHooks = previewExtensionsCore.hooks;
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        var supportedHooks = [
            previewExtensionsHooks.HOOK_NAMES.ON_CLICK
        ];

        function showComponentNonInteractiveTooltip(evt) {
            var previewTooltipCallback = this.props.renderRealtimeConfig.previewTooltipCallback;
            previewTooltipCallback(evt.target.getBoundingClientRect(), "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
        }

        function generateCompExtension(compType) {
            return {
                propTypes: {
                    renderRealtimeConfig: santaProps.Types.renderRealtimeConfig,
                    renderFlags: santaProps.Types.renderFlags
                },
                transformRefData: function (refData) {
                    if (!this.props.renderFlags.isSocialInteractionAllowed) {
                        previewModifications.createBlockLayer(refData, compType);
                        refData[''].onClick = showComponentNonInteractiveTooltip.bind(this);
                    }
                }
            };
        }

        _.forEach(compTypes, function (compType) {
            previewExtensionsRegistrar.registerCompExtension(compType, generateCompExtension(compType));
            previewExtensionsHooks.registerSupportedHooks(compType, supportedHooks);
        });

        return generateCompExtension;
    });
