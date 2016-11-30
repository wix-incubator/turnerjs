/**
 * @Class wysiwyg.editor.components.panels.FacebookLikePanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.FacebookLikePanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    /**
     * @lends wysiwyg.editor.components.panels.FacebookLikePanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            var panel = this;
            this.addInputGroupField(function(){

                this.addComboBox(this._translate("FB_LIKE_BUTTON_STYLE")).bindToProperty('layout');
                this.addComboBox(this._translate("FB_LIKE_ACTION")).bindToProperty('action');
                this.addComboBox(this._translate("GENERAL_COLOR_SCHEME")).bindToProperty('colorScheme');
                // this.addCheckBoxField(this._translate("FB_LIKE_SHOW_SEND_BUTTON"), "Facebook_Like_Settings_Send_Button_ttid").bindToProperty('send');

                var showFacesChk = this.addCheckBoxField(this._translate('FB_LIKE_SHOW_PROFILE_PICS')).bindToProperty('show_faces');
                this.addVisibilityCondition(showFacesChk, function() {
                    return ( panel._previewComponent.getComponentProperty('layout') == "standard");
                });
            });

            this.addAnimationButton();
        }
    });
});