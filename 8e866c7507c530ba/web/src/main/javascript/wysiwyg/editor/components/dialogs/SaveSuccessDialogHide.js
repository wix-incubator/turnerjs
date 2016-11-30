define.component('wysiwyg.editor.components.dialogs.SaveSuccessDialogHide', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onCheckBoxInputchanged']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._callBackToDialogManager = null;
        },

        _createFields: function () {

            this.addBreakLine('10px');
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addSubLabel(panel._translate('SUCCESS_SAVE_DESCRIPTION')).runWhenReady(function (labelLogic) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '0px', 'margin-top': '0px'});
                });

                this.addBreakLine('15px');
                this.addCheckBoxField(panel._translate('DO_NOT_SHOW_THIS_MESSAGE_AGAIN'))
                    .addEvent('inputChanged', panel._onCheckBoxInputchanged)
                    .runWhenReady(function (labelLogic) {
                        labelLogic._skinParts.label.setStyles({'margin-bottom': '0px', 'margin-top': '0px'});
                    });

            }, 'skinless', null, null, null, 'left');
        },

        _onCheckBoxInputchanged: function (e) {
            if (this._callBackToDialogManager) {
                this._callBackToDialogManager(!e.value);
            }
        },

        setDialogHideCallback: function (callBack) {
            this._callBackToDialogManager = callBack;
        }
    });


});










