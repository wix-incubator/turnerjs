define.experiment.Class("wysiwyg.viewer.managers.WViewManager.CustomSiteMenu", function (classDefinition, experimentStrategy) {

    var def = classDefinition,
        strategy = experimentStrategy;

    def.utilize(strategy.merge([
        'wysiwyg.common.utils.LinkRenderer'
    ]));

    def.methods({
        getLinkRenderer: function(){
            if(!this._linkRenderer){
                this._linkRenderer = new this.imports.LinkRenderer(this, this.resources.W.Data);
            }
            return this._linkRenderer;
        },
        getMainMenu: function(custom){
            return this.resources.W.Data.getDataByQuery(custom ? '#CUSTOM_MAIN_MENU' : '#MAIN_MENU');
        }
    });
});
