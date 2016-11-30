define.experiment.newClass('wysiwyg.editor.utils.AngularManagerUtilities.NGCore', function(classDefinition) {

    var def = classDefinition ;

    def.methods({
        getAngularService: function(serviceName) {
            if (!this._ngView) {
                this._ngView = W.Editor.getEditorUI().$view;
            }

            return angular.element(this._ngView).injector().get(serviceName);
        }
    });
});