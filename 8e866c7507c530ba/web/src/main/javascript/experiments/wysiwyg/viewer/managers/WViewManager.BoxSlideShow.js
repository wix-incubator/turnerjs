define.experiment.Class('wysiwyg.viewer.managers.WViewManager.BoxSlideShow', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    /** @lends wysiwyg.viewer.managers.WViewManager */
    def.methods({
        canHaveFatherHeight : function (comp){
            return (comp._childCanHaveFatherSize === true);
        }
    });

});
