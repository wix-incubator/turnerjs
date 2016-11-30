define.experiment.Class('wysiwyg.editor.managers.WDialogManager.WalkMe', function(classDefinition, experimentStrategy){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        openHelpDialog: function(url, params, closeCallback){
            params = params || {
                height     : 620,
                width      : 610,
                title      : W.Resources.get('EDITOR_LANGUAGE', "IFRAME_HELP_TITLE"),
                description: ''// W.Resources.get('EDITOR_LANGUAGE', "IFRAME_HELP_DESCRIPTION")
            };
            this._createAndOpenWDialog(
                '_helpDialog',
                'wysiwyg.editor.components.IframeDialog',
                'wysiwyg.editor.skins.IframeSkin',
                function(innerLogic){
                    innerLogic.setUrl(url);
                    if (closeCallback){
                        innerLogic.setCloseCallBack(closeCallback);
                    }
                },
                {
                    width      : params.width,
                    maxHeight  : params.height,
                    position   : Constants.DialogWindow.POSITIONS.CENTER,
                    allowScroll: true,
                    nonModal   : true,
                    allowDrag  : true,
                    title      : params.title,
                    description: params.description,
                    buttonSet  : this.DialogButtonSet.NONE
                }, null, true, params, false, false, true);
        }
    });
});
