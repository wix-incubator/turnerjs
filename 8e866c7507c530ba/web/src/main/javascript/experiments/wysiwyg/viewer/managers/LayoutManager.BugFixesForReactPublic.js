define.experiment.Class('wysiwyg.viewer.managers.LayoutManager.BugFixesForReactPublic', function(definitions, strategy){

    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = definitions;

    def.resources(strategy.merge(['BugFixesForReactCommonCode']));

    def.methods({
        _enforceAnchorsRecurse:function(comp) {
            return this.resources.BugFixesForReactCommonCode.enforceAnchorsRecurse(comp, this);
        }
    });

});