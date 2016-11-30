define.experiment.Class('wysiwyg.editor.managers.WDialogManager.OpenHelpInNewTab', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        openHelpDialog: function(){
            var url = 'http://www.wix.com/support/html5/editor/';
            window.open(url);
        }
    });
});
