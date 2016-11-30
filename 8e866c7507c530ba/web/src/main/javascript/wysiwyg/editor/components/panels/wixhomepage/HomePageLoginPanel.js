define.component('wysiwyg.editor.components.panels.wixhomepage.HomePageLoginPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.resources(['W.Data']);
    def.binds(['_createFields']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.dataTypes(['HomePageLogin']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            this.addInputGroupField(function (panel) {
                this.addInputField(panel.injects().Resources.getCur('LINK_DLG_TYPE_POST_LOGIN_URL'), '', undefined, undefined, null).bindToField("postLoginUrl");
                this.addInputField(panel.injects().Resources.getCur('LINK_DLG_TYPE_POST_SIGNUP_URL'), '', undefined, undefined, null).bindToField("postSignUpUrl");
                this.addComboBox("Start With").bindToField('startWith');
            });
            this.resources.W.Data.getDataByQuery("#STYLES", this._createStylePanel);
        }
    });
});
