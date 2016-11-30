define(['previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/helpers/previewModifications'],
    function (previewExtensionsCore, previewModifications) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.FacebookShare';
        var previewExtensionsHooks = previewExtensionsCore.hooks;
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        var supportedHooks = [
            previewExtensionsHooks.HOOK_NAMES.ON_CLICK
        ];

        function showComponentNonInteractiveTooltip(evt) {
            var previewTooltipCallback = this.props.siteData.renderRealtimeConfig.previewTooltipCallback;
            previewTooltipCallback(evt.target.getBoundingClientRect(), "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
        }

        var extension = {
            transformRefData: function transformRefData(refData) {
                if (this.props.siteData.renderFlags.isSocialInteractionAllowed) {
                    return;
                }

                previewModifications.createBlockLayer(refData, compType);

                // make sure the parent container's width is adjusted to its content
                refData[""] = refData[""] || {};
                refData[""].style = refData[""].style || {};
                refData[""].style.width = 'auto';
                refData[""].onClick = showComponentNonInteractiveTooltip.bind(this);
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
        previewExtensionsHooks.registerSupportedHooks(compType, supportedHooks);
    });