define.experiment.Class("wysiwyg.editor.managers.WPreviewManager.CustomSiteMenu", function (classDefinition, experimentStrategy) {

    var def = classDefinition,
        strategy = experimentStrategy;

    def.utilize(strategy.merge([
        'wysiwyg.common.utils.LinkRenderer'
    ]));

    def.methods({
        getLinkRenderer: function(){
            return this.getPreviewManagers().Viewer.getLinkRenderer();
        },
        getMainMenu: function(custom){
            return this.getPreviewManagers().Viewer.getMainMenu(custom);
        }
    });
});