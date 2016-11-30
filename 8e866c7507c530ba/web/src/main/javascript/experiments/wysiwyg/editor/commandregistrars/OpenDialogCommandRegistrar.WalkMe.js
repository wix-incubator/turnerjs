//define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.WalkMe.New', function (classDefinition, experimentStrategy) {
//    /**@type bootstrap.managers.classmanager.ClassDefinition */
//    var def = classDefinition;
//
//    def.methods({
//        _showHelpDialog:function (param, cmd) {
//            var helpId;
//            var closeCallback;
//            if (instanceOf(param, String)) {
//                helpId = param;
//            } else {
//                helpId = param.helpId;
//                closeCallback = param.closeCallback;
//            }
//            var helpServer = this.injects().Config.getHelpServerUrl();
//            var helpids = W.Data.getDataByQuery('#HELP_IDS');
//            helpId = helpids.get('items')[helpId];
//            var helpCenter = helpServer + helpId;
//            W.EditorDialogs.openHelpDialog(helpCenter, null, closeCallback);
//        }
//    });
//});
//
