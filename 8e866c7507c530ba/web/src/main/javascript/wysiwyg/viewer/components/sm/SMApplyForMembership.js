/** @type wysiwyg.viewer.components.sm.SMApplyForMembership */
define.component('wysiwyg.viewer.components.sm.SMApplyForMembership', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.sm.SMRegister');

    def.resources(['W.SiteMembers']);

    def.skinParts({
        'email': { type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindEmailField"},
        'password': { type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindPasswordField"},
        're_password': { type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindRePasswordField"}
    });

    def.methods({
        onSubmit: function () {
            var email = this._emailField._data.get("text");
            var password = this._passwordField._data.get("text");
            var rePassword = this._rePasswordField._data.get("text");

            if (this._validateFields(email, password, rePassword)) {
                this.resources.W.SiteMembers.applyForMembership(email, password, this._onFormSuccess, this._onFormError);
            }
        },

        _onFormSuccess: function (data) {
            // report to user
            var email = this._emailField._data.get("text");
            var confirmLbl = this._keys["SMApply_Success2"];
            confirmLbl = this._formatString(confirmLbl, [email]) ;
            var confirmationText = this._keys["SMApply_Success1"] + confirmLbl;
            this._container.showConfirmation({message: confirmationText});
        },
        _formatString: function(stringToFormat, argumentsArray) {
            var i = 0;
            argumentsArray.map(function(item){
                var hook = "{" + i + "}" ;
                stringToFormat = stringToFormat.replace(hook, item) ;
                i++ ;
            }) ;
            return stringToFormat ;
        }
    });
});