define(['lodash', 'previewExtensionsCore'],
    function (_, previewExtensionsCore) {
        'use strict';

        var compsType = ['wysiwyg.viewer.components.dialogs.EnterPasswordDialog', 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog', 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog',
            'wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog', 'wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog', 'wysiwyg.viewer.components.dialogs.NotificationDialog'];
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;


        var extension = {
            blockSubmit: function (domNode) {
                if (this.props.siteData.renderFlags.isExternalNavigationAllowed) {
                    return;
                }
                var previewTooltipCallback = this.props.siteData.renderRealtimeConfig.previewTooltipCallback;
                previewTooltipCallback(domNode.getBoundingClientRect(), "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
            },
            /**
             * @returns {boolean}
             */
            isPasswordProtectedDialog: function () {
                return this.props.siteAPI.getSiteAspect('siteMembers').dialogToDisplay === 'enterPassword';
            },
            shouldBlockSubmit: function () {
                // The extension was added to prevent loading another editor in preview's iframe on successful webmaster
                // login (see SE-3992).
                //
                // That prevents navigating to a password-protected page, too (see SE-3256).
                //
                // Ignore the render flag isExternalNavigationAllowed for a password-protected dialog. Navigation to
                // a password-protected page isn't an external navigation, right?
                return !this.props.siteData.renderFlags.isExternalNavigationAllowed && !this.isPasswordProtectedDialog();
            },
            transformRefData: function transformRefData(refData) {
                if (this.props.siteData.renderFlags.isExternalNavigationAllowed) {
                    return;
                }

                refData[""] = refData[""] || {};
                refData[""].style = _.assign({}, refData[""].style, {
                    overflow: 'hidden'
                });

                refData.blockingLayer.style = _.assign({}, refData.blockingLayer.style, {
                    position: 'absolute'
                });
            }
        };
        _.forEach(compsType, function (compType) {
            previewExtensionsRegistrar.registerCompExtension(compType, extension);
        });
    });