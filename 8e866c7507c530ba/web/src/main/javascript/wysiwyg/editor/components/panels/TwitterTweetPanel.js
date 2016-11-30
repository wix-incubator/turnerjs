define.component('wysiwyg.editor.components.panels.TwitterTweetPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.resources([]);
    def.binds(['_updateTwitterDetails', '_userValidationMessage']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['TwitterTweet']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var that = this;
            this.addInputGroupField(function () {
                var TwitterUsernamePlaceholder = this._translate('TWITTER_USER_TO_FOLLOW_PLACEHOLDER');
                this.addInputField(this._translate('TWITTER_USER'), TwitterUsernamePlaceholder, 0, 15, null, null, "Twitter_Link_Button_Twitter_Username_ttid")
                    .runWhenReady(function (logic) {
                        logic.setValue(that._data.get("accountToFollow"));
                        that._inUserName = logic;
                    });

                this.addInputField(this._translate('TWITTER_TWEET_TWEET_TEXT'), this._translate('TWITTER_TWEET_TWEET_DEF_TEXT'), 0, 140, null, null, "Twitter_Link_Button_Tweet_Text_ttid")
                    .runWhenReady(function (logic) {
                        logic.setValue(that._data.get("defaultText"));
                        that._inDefText = logic;
                    });

                this.addButtonField("", this._translate('GENERAL_UPDATE'), false)
                    .runWhenReady(function (logic) {
                        logic.addEvent("click", that._updateTwitterDetails);
                    });
            });

            this.addComboBoxField(this._translate('TWITTER_TWEET_BUTTON_STYLE'), this._getDataCountOptionList()).bindToProperty('dataCount');
        },

        _getDataCountOptionList: function() {
            var isMobile = W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
            var labelPrefix = 'Types.WTwitterTweetProperties.dataCount.';
            var rawOptionList = isMobile ? ['none', 'horizontal'] : ['none', 'horizontal', 'vertical'];
            var optionList = [];

            _.forEach(rawOptionList, function(optionName, index) {
                optionList[index] = {value: optionName, label: this._translate(labelPrefix + optionName)};
            }.bind(this));
            return optionList;
        },

        _updateTwitterDetails: function () {
            var userName = this._inUserName.getValue();
            var validationMsg = this._userValidationMessage(userName);
            if (validationMsg) {
                this._inUserName.showValidationMessage(validationMsg);
            } else {
                this._inUserName.resetInvalidState();
                this._data.set("accountToFollow", userName);
                this._data.set("defaultText", this._inDefText.getValue());
            }
        },

        _userValidationMessage: function (userName) {
            if (!userName || userName == "") {
                return; //allow blank user name
            }
            if (!this.injects().Utils.isValidTwitterUser(userName)) {
                return this._translate('TWITTER_USER_VAL_ERR');
            }
        }
    });
});

