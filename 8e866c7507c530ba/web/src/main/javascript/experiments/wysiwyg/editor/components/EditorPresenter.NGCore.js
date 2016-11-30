define.experiment.component('wysiwyg.editor.components.EditorPresenter.NGCore', function(compDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.merge(['bootstrapAngularPanels', '_tryToBootstrap'])) ;

    def.methods({
        bootstrapAngularPanels: function() {
            var angularLayer = this.$view.getElement('div[name="angularLayer"]') ;

            var ngPanels = document.createElement('div');
            ngPanels.setAttribute('id','ngPanels');
            angularLayer.appendChild(ngPanels) ;

            var ngDialogs = document.createElement('div');
            ngDialogs.setAttribute('id','ngDialogs');
            ngDialogs.setAttribute('style', 'position:fixed; top:0; left:0;');
            angularLayer.appendChild(ngDialogs) ;

            this.resources.W.Editor.addEvent(Constants.EditorEvents.EDITOR_READY, this._tryToBootstrap);
        },

        _tryToBootstrap: function () {
            var ngPanels = this.$view.getElement('[id=ngPanels]');
            function bootstrap() {
                if(W.isExperimentOpen("NGDialogManagement")) {
                    this.resources.W.Editor.setDialogLayer(jQuery('#ngDialogs')[0]);
                }

                if(W.isExperimentOpen("NGPanels")) {
                    angular.module("propertyPanel").run(['propertyPanel', function (/** propertyPanel */ propertyPanel) {
                        console.log(propertyPanel);
                    }]);
                }

                var dependencies = ['Editor'];
                angular.bootstrap(this.$view, dependencies);
            }
            W.AngularManager.bootstrap(bootstrap.bind(this));
        }
    });
});