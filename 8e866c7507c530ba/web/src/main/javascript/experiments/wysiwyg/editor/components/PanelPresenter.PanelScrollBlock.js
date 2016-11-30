define.experiment.component("wysiwyg.editor.components.PanelPresenter.PanelScrollBlock", function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.resources(strategy.merge(['W.ScrollHandler']));

    def.methods({

        initialize: strategy.after(function(compId, viewNode, args) {
            this._className = this.className.split('.').pop();
        }),

        _onRender: strategy.after(function(renderEvent) {
            //this._skinParts.subPanel.$view.addEvent('mouseenter', this._blockScroll);
            //this._skinParts.subPanel.$view.addEvent('mouseleave', this._unBlockScroll);

            var sidePanelLogic = this._skinParts.sidePanel;

            sidePanelLogic.$view.addEvent('mouseenter', function() {
                this.resources.W.ScrollHandler.scrollBlock(this._className);
            }.bind(this));

            sidePanelLogic.$view.addEvent('mouseleave', function() {
                this.resources.W.ScrollHandler.scrollUnBlock(this._className);
            }.bind(this));

            sidePanelLogic._skinParts.content.addEvent('click', function() {
                this.resources.W.ScrollHandler.scrollUnBlock(this._className);
            }.bind(this));
        })

    });
});