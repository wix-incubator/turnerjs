define(['utils', 'previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/helpers/previewModifications', 'santaProps'],
    function (utils, previewExtensionsCore, previewModifications, santaProps) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.WFacebookLike';
        var previewExtensionsHooks = previewExtensionsCore.hooks;
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        var supportedHooks = [
            previewExtensionsHooks.HOOK_NAMES.ON_CLICK
        ];

        function showComponentNonInteractiveTooltip(evt) {
            var previewTooltipCallback = this.props.renderRealtimeConfig.previewTooltipCallback;
            previewTooltipCallback(evt.target.getBoundingClientRect(), "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
        }

        function setWixLikeUrl(refData) {
            var fbLikeUrl = utils.urlUtils.parseUrl(refData.iframe.src);
            delete fbLikeUrl.search;
            fbLikeUrl.query.href = 'http://www.wix.com/create/website';

            refData.iframe.src = utils.urlUtils.buildFullUrl(fbLikeUrl);
        }

        var extension = {
            propTypes: {
                renderRealtimeConfig: santaProps.Types.renderRealtimeConfig,
                isSocialInteractionAllowed: santaProps.Types.RenderFlags.isSocialInteractionAllowed
            },

            transformRefData: function transformRefData(refData) {
                if (this.props.isSocialInteractionAllowed) {
                    return;
                }

                previewModifications.createBlockLayer(refData, compType);
                setWixLikeUrl(refData);
                refData[''].onClick = showComponentNonInteractiveTooltip.bind(this);
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
        previewExtensionsHooks.registerSupportedHooks(compType, supportedHooks);

        return extension;
    });
