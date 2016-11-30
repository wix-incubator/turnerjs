define.experiment.Class('wysiwyg.viewer.managers.WViewManager.RichTextMigrationStudio', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.utilize(strategy.merge(['wysiwyg.common.utils.TextMigrationHandler']));

    def.methods({

        _wasMasterMigrated: false,
        migrateAllRenderedTextComps: function(){
            this._textMigrationHandler = this._textMigrationHandler ||  new this.imports.TextMigrationHandler();
            var comps = [];
            if(!this._wasMasterMigrated){
                var structure = this.getSiteNode();
                comps = structure.getElements("[comp]").map(function(viewNode){
                    return viewNode.$logic;
                });
                this._wasMasterMigrated = true;
            } else{
                var currentPageNode = this.getCurrentPageNode();
                var currentPage = currentPageNode && currentPageNode.$logic;
                if (currentPage) {
                    comps = currentPage.getPageComponents();
                }
            }
            return this._migrateTextComponents(comps);
        },

        _migrateTextComponents: function(comps){
            var textComps =  comps.filter(function(component) {
                return component.getOriginalClassName() === 'wysiwyg.viewer.components.WRichText' &&
                    component.getDataItem().getType() !== 'StyledText';
            });
            this._textMigrationHandler = this._textMigrationHandler ||  new this.imports.TextMigrationHandler();
            textComps.forEach(function(textComp){
                var migratedText = this._textMigrationHandler.migrateComponent(textComp);
                textComp.getDataItem().set('text', migratedText);
            }, this);
            return textComps.length;
            console.log(textComps.length + " migrated");
        }

    });
});
