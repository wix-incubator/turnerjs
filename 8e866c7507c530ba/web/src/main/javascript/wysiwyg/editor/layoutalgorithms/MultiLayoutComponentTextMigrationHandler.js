define.Class('wysiwyg.editor.layoutalgorithms.MultiLayoutComponentTextMigrationHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function (managers, modules) {
            this._viewerManagers = managers;
            this._utils = modules.$utils;
        },

        fixTextCompDataQueries:function(webStructure, mobileStructure){
            var mobChildren = mobileStructure.components || mobileStructure.children;
            if (mobChildren) {
                for(var i=0; i<mobChildren.length; i++){
                    var mobChild = mobChildren[i];
                    if(mobChild.componentType === "wysiwyg.viewer.components.WRichText"){
                        var webComponent = this._utils.getComponentByIdFromStructure(mobChild.id, webStructure);
                        mobChild.dataQuery = webComponent.dataQuery;
                    }
                    this.fixTextCompDataQueries(webStructure, mobChild);
                }
            }
        }

    });
});
