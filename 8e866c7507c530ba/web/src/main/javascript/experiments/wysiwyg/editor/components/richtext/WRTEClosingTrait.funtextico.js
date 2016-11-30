define.experiment.Class('wysiwyg.editor.components.richtext.WRTEClosingTrait.funtextico', function (classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({
        _closeTextIfNeeded: function(event){
            if(this._locked || this.isMouseDownEventOnTextEditor(event) || (this._shouldCloseOnlyInComponentsPanel && !this.isMouseDownOnComponentsPanel(event))){
                //should not close
                return;
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.StopEditingText');
            LOG.reportEvent(wixEvents.TXT_EDITOR_CLOSE_PANEL, {c1: "outside"});
        },
        isWixAppsMode: function() {
            //in wix apps we do not have edited component
            return !this._editedComponent;
        },
        isMouseDownOnComponentsPanel: function(event) {
            var element = event.target;
            while (element.tagName != "BODY") {
                if (element.getAttribute('comp') === "wysiwyg.editor.components.panels.ComponentPanel") {
                    return true;
                }

                element = element.parentElement;
            }
            return false;
        }
    });
});