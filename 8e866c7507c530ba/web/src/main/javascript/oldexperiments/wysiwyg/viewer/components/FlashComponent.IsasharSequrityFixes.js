define.experiment.component('wysiwyg.viewer.components.FlashComponent.IsasharSequrityFixes', function (compDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;


    def.methods({
        _getFlashScriptAccess:function(){
            return "never";
        }
    });

});