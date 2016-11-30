define.experiment.component('wysiwyg.editor.components.inputs.Input.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.states(strategy.customizeField(function(fields){
        fields.boldLabel = ['bold'];

        return fields;
    }));

    def.methods({

        initialize: strategy.after(function (compId, viewNode, args) {
            this.setBoldLabel(args.boldLabel);
        }),

        setBoldLabel: function(boldLabel){
            if(boldLabel){
                this.setState('bold', 'boldLabel');
            }
        }
    });
});

