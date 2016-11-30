define.experiment.component('wysiwyg.editor.components.panels.WPhotoMenuPanel.SocialActivity', function(def, strategy) {

    def.methods({
        _createFields: strategy.after(function(){
            this.addInputGroupField(this._addSocialActivityButtonGroup);
        }),
        _addSocialActivityButtonGroup: function(panel){
            this._addField({
                type: 'wysiwyg.editor.components.inputs.SocialActivityButtonGroup',
                skin: 'wysiwyg.editor.skins.inputs.SocialActivityButtonGroupSkin',
                data: null
            });
        }
    })

});