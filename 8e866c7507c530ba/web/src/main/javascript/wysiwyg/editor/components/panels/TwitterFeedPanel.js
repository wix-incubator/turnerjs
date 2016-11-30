define.component('wysiwyg.editor.components.panels.TwitterFeedPanel', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.resources(['W.Data', 'W.Utils']);
    def.binds(['_userValidationMessage', '_onStylesReady', '_onURLClick']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['TwitterFollow']);
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function() {
            this.addInlineTextLinkField(this._translate('TWITTER_FEED_API_ERROR_TEXT'), null, this._translate('TWITTER_FEED_API_ERROR_LINK_TITLE'))
                .addEvent(Constants.CoreEvents.CLICK, this._onURLClick)
                .runWhenReady(function(labelLogic) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '0px', 'margin-top': '0px'});
                });

            this.addAnimationButton();
        },

        _onURLClick: function() {
            window.open(this._translate('TWITTER_FEED_API_ERROR_LINK_TO_SUPPORT'));
        },

        _onStylesReady: function(styles) {
            var TwitterUsernamePlaceholder = this._translate('TWITTER_USER_TO_FOLLOW_PLACEHOLDER');
            var panelValidators = [this._userValidationMessage];

            this.addInputGroupField(function() {
                this.addSubmitInputField(
                    this._translate("TWITTER_USER"),
                    TwitterUsernamePlaceholder,
                    null,
                    null,
                    this._translate("GENERAL_UPDATE"),
                    null,
                    {validators: panelValidators},
                    null,
                    "Twitter_Settings_Username_ttid"
                ).bindToField('accountToFollow');
                this.addSliderField(this._translate("TWITTER_FEED_NUMBER_OF_TWEETS"), 1, 30, 1, false /* show numbers */, true /*update on end */).bindToProperty("numOfTweets");
            });

            this.addStyleSelector(null, null, true);

        },

        _userValidationMessage: function(userName) {
            if (!this.resources.W.Utils.isValidTwitterUser(userName)) {
                return this._translate('TWITTER_USER_VAL_ERR');
            }

        }
    });
});
