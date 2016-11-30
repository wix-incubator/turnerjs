define.experiment.component('wysiwyg.editor.components.inputs.Label.CustomSiteMenu', function (componentDefinition, experimentStrategy) {

    var def = componentDefinition,
        strategy = experimentStrategy;

    def.states(strategy.customizeField(function(fields){
        fields.boldLabel = ['bold'];

        return fields;
    }));

    def.methods({

        setParameters: strategy.after(function(args, forceRender){
            this.setBoldLabel(args.boldLabel);
        }),

        setBoldLabel: function(boldLabel){
            if(boldLabel){
                this.setState('bold', 'boldLabel');
            }
        }
    });
});