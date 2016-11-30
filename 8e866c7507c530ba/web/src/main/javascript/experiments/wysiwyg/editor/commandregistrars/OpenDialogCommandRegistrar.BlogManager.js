define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.BlogManager', function(classDefinition, experimentStrategy){

    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.utilize(strategy.merge(['wysiwyg.editor.managers.BlogManagerFrameManager']));


    def.methods({
        registerCommands: strategy.after(function () {
            this.openBlogManager = this.resources.W.Commands.registerCommandAndListener("WEditorCommands.OpenBlogManagerFrame", this, this._openBlogManagerFrame);

        }),

        _openBlogManagerFrame: function (commandArgs) {
            var blogManagerFrameManager = new this.imports.BlogManagerFrameManager(commandArgs);
        }
    });
});