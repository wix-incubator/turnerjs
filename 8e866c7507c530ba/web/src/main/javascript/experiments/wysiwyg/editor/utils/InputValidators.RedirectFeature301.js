define.experiment.Class('wysiwyg.editor.utils.InputValidators.RedirectFeature301',  function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.merge(['_301redirectValidator']));

    def.methods({

        _301redirectValidator : function (text) {
            var match = text.match("[^.,';()%@!?$&*+~a-zA-Z0-9\\[\\]_:/\"\n=-]");
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'ADVANCED_SEO_301_INVALID_CHARS_ERROR') + " (" + match.join() + ")";
            }
        },

        headerTagsValidator : function (text) {
            var match = text.match("[^<>a-zA-Z0-9_@.:+'/ \"\n=-]");
            if(match !== null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_INVALID_CHARS_ERROR') + " (" + match.join() + ")";
            }
            match = text.match(/^ *(<[a-zA-Z0-9_@.:+'/ \"\n=-]*>*[ \n]*)*$/);
            if (match === null) {
                return this.resources.W.Resources.get('EDITOR_LANGUAGE', 'HEADER_TAGS_SHOULD_START_WITH_TAG_BRACKET');
            }
        }
    });
});
