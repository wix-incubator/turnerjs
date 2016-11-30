define.experiment.component('wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer.NGCore',
    function (compDefinition, experimentStrategy) {
        /** @type core.managers.component.ComponentDefinition */
        var def = compDefinition;
        var strategy = experimentStrategy;

        def.methods({
            //the controller needed for this view is defined in the angular part of the editor.
            //you can find it at:  html-client/web/src/main/javascript/angular/external/PagesBackGroundCustomizer.js
            _initAngularModule: function () {
                this._createPageItemModel();

                W.AngularLoader.compileElement(this.$view, {component: this});

                this.setState("VISIBLE", 'visibility');
            },

            _bootstrapAngular: strategy.remove()
        });


    });
