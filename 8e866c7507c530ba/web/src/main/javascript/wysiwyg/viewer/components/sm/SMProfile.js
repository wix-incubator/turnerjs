/** @type wysiwyg.viewer.components.sm.SMProfile */
define.component('wysiwyg.viewer.components.sm.SMProfile', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('wysiwyg.viewer.components.sm.SMForm') ;

    def.resources(['W.SiteMembers']) ;

    def.skinParts({
        'name': { type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindTextDataItem"}
    }) ;

    def.methods({
        _onAllSkinPartsReady: function(){
            this._emailField = this._skinParts.email;
            this._nameField = this._skinParts.name;
        },

        onSubmit: function () {
             var name = this._nameField._data.get("text");

             if (this._validateFields(name)) {
                this.resources.W.SiteMembers.updateMemberDetails({
                    'name': name
                }, this._onFormSuccess, this._onFormError);
             }
        },

        _validateFields: function( name) {
            return true;
        },

        onCancel: function() {
          this.fireEvent("cancel");
        },

        getDisplayName: function() {
            return this._keys["SMProfile_Update_Details"];
        },

        getButtonLabel: function() {
            return this._keys["SMProfile_Update"];
        },

        getSubHeaderElement: function() {
            var div = new Element('DIV');
//            div.set("html", "I already have a user <a>Login</a>");
            return { el: div};
        }
    });
});