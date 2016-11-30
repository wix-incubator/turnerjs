define(['previewExtensionsCore', 'componentsPreviewLayer/previewExtensions/helpers/previewModifications'],
    function (previewExtensionsCore, previewModifications) {
        'use strict';

        var compType = 'wysiwyg.viewer.components.wixhomepage.HomePageLogin';
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
                if (this.props.siteData.renderFlags.isExternalNavigationAllowed) {
                    return;
                }

                previewModifications.createBlockLayer(refData, compType);
                refData[''].onClick = showComponentNonInteractiveTooltip;
            }
        };

        if (typeof window !== 'undefined' && window.queryUtil && window.queryUtil.isParameterTrue('iswixsite')){
            previewExtensionsRegistrar.registerCompExtension(compType, extension);
            previewExtensionsHooks.registerSupportedHooks(compType, supportedHooks);
        }
    });