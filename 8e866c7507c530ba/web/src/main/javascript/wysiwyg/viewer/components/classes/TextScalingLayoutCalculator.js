define.Class('wysiwyg.viewer.components.classes.TextScalingLayoutCalculator', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.utils.TextCalculator');

    def.methods({

        getNodeGlobalPosition: function(node) {
            return node.getPosition();
        },

        getSiteNode: function() {
            return W.Viewer.getSiteNode();
        },

        getPositionOffset: function(){
            return {x: 0, y: 0};
        }

    });
});
