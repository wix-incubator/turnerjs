define.Class('wysiwyg.editor.managers.preview.ComponentDataProvider', function(classDefinition) {
    var def = classDefinition;

    def.resources(['W.Resources', 'W.Preview']);

    def.methods({

        initialize: function(componentName) {
            this.componentName = componentName;
        },

        getComponentFriendlyName: function() {
            var label = this.componentName.split('.').getLast();
            var translatedLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'FPP_' + label, label);
            return translatedLabel;
        },

        getComponentEditorMetaData: function(callback) {
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            return previewManagers.Components.getComponent(this.componentName, callback);
        }
    });
});
