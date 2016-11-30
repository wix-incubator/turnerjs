define.component('wysiwyg.editor.components.panels.TwitterFollowPanel', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.resources(['W.Utils']);
    def.binds(['_userValidationMessage']);
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
            var TwitterUsernamePlaceholder = this._translate('TWITTER_USER_TO_FOLLOW_PLACEHOLDER');
            this.addSubmitInputField(this._translate('TWITTER_USER'), TwitterUsernamePlaceholder, 1, 15, this._translate('GENERAL_UPDATE'), null, {validators: [this._userValidationMessage]}, null, "Twitter_Settings_Username_ttid").bindToField('accountToFollow');
            this.addCheckBoxField(this._translate('TWITTER_FOLLOW_DISPLAY_TOTAL_FOLLOWERS')).bindToProperty('showCount');
            this.addCheckBoxField(this._translate('TWITTER_FOLLOW_DISPLAY_TWITTER_HANDLE')).bindToProperty('showScreenName');

            this.addAnimationButton();
        },

        _userValidationMessage: function(userName) {
            if (!this.resources.W.Utils.isValidTwitterUser(userName)) {
                return this._translate('TWITTER_USER_VAL_ERR');
            }

        }
    });
});
