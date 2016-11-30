define.component('wysiwyg.editor.components.panels.SocialMediaPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.resources(['W.Utils', 'W.Commands']);

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.binds(['_validateWebUrl']);

    def.dataTypes('SocialLinks');

    def.skinParts({
        panelLabel: { type: 'htmlElement', autoBindDictionary: 'SOCIAL_MEDIA' },
        help: { type: 'htmlElement' },
        close: { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'BACK_TO_MOBILE_ACTION_BAR', command: 'this._closeCommand' },
        content: { type: 'htmlElement' }
    });

    def.methods({

        _createFields: function () {
            var panel = this;
            this.addBreakLine('15px');
            this.addSubLabel(this._translate('SOCIAL_MEDIA_PANEL_DESCRIPTION'), null);

            this.addBreakLine('15px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_FACEBOOK',
                this._translate('SOCIAL_MEDIA_PANEL_FACEBOOK_PLACEHOLDER'),
                'facebook',
                0, '-2px',  '2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_TWITTER',
                this._translate('SOCIAL_MEDIA_PANEL_TWITTER_PLACEHOLDER'),
                'twitter',
                0, '-20px', '2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_PINTEREST',
                this._translate('SOCIAL_MEDIA_PANEL_PINTEREST_PLACEHOLDER'),
                'pinterest',
                0, '-40px', '2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_GOOGLE_PLUS',
                this._translate('SOCIAL_MEDIA_PANEL_GOOGLE_PLUS_PLACEHOLDER'),
                'google_plus',
                0, '-60px', '2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_TUMBLR',
                this._translate('SOCIAL_MEDIA_PANEL_TUMBLR_PLACEHOLDER'),
                'tumblr',
                0, '-80px', '1px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_BLOGGER',
                this._translate('SOCIAL_MEDIA_PANEL_BLOGGER_PLACEHOLDER'),
                'blogger',
                0, '-100px','1px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_LINKEDIN',
                this._translate('SOCIAL_MEDIA_PANEL_LINKEDIN_PLACEHOLDER'),
                'linkedin',
                0, '-120px','-1px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_YOUTUBE',
                this._translate('SOCIAL_MEDIA_PANEL_YOUTUBE_PLACEHOLDER'),
                'youtube',
                0, '-140px','2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_VIMEO',
                this._translate('SOCIAL_MEDIA_PANEL_VIMEO_PLACEHOLDER'),
                'vimeo',
                0, '-160px','2px');

            this._addSocialPanel('SOCIAL_MEDIA_PANEL_FLICKR',
                this._translate('SOCIAL_MEDIA_PANEL_FLICKR_PLACEHOLDER'),
                'flickr',
                0, '-180px','1px');

            this.addBreakLine('20px');
            this.addInlineTextLinkField(null, this._translate('SOCIAL_PROFILE_MOBILE_EXPLANATION'), this._translate('SOCIAL_PROFILE_RETURN_TO_MOBILE_VIEW'))
                .addEvent(Constants.CoreEvents.CLICK, function() {
                    W.Commands.executeCommand("WEditorCommands.ShowMobileQuickActionsView");
                });


        },

        _addSocialPanel: function (languageKey, placeHolder, dataKey, spriteX, spriteY, imageMarginTop) {
            var panel = this;
            panel.addInputGroupField(function () {
                var iconsSpriteUrl = 'icons/social_sprite.png';
                this.setNumberOfItemsPerLine(0);

                this.addLabel(null, {width: '30px', height: '20px', 'margin-top': imageMarginTop}, 'small', iconsSpriteUrl, {x: spriteX, y: spriteY}, {width: "20px", height: "20px"});

                this.addLabel(panel._translate(languageKey), {'margin-top':'3px', width: '67px'});

                this.addInputField(null, placeHolder, null, null, {validators: [panel._validateWebUrl]})
                    .addEvent('blur', panel._onInputBlur)
                    .bindToField(dataKey).runWhenReady(function (logic) {
                        logic.setWidth(250);
                    });
            }, 'skinless');
            panel.addBreakLine('7px');

        },

        _onInputBlur: function(event) {
            if (event.wasDataChanged) {
                LOG.reportEvent(wixEvents.EDITOR_SOCIAL_LINKS_MODIFIED, {g1: this._dataFieldName, c1: event.newValue, c2:event.oldValue});
            }
        },

        _validateWebUrl: function (value) {
            return (value && !this.resources.W.Utils.isValidUrl(value)) ? this._translate('SOCIAL_MEDIA_PANEL_INVALID_URL') : null;
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_SOCIAL_MEDIA_PROFILE');
        }

    });

});
