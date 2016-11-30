define.experiment.Class('wysiwyg.editor.managers.WComponentSerializer.SocialActivity', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        serializeSocialActivity: function(serializedItem, componentNode) {
            var socialQuery;

            if(socialQuery = componentNode.getAttribute('socialQuery')) serializedItem['socialQuery'] = socialQuery;
        }
    });
});
