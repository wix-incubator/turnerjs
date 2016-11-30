define.experiment.Class('wysiwyg.viewer.managers.pages.PageHandler.AnimationPageTransitions', function(classDefinition, experimentStrategy){
    "use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.Commands']));

    def.methods({

        _collapsePage: function(pageNode){
            this.resources.W.Commands.executeCommand('W.ViewerCommands.PageHandlerAttachPage', this, {pageNode: pageNode});
            if(!this._waitingForRender) {
                pageNode.collapse();
            }
        }
    });
});
