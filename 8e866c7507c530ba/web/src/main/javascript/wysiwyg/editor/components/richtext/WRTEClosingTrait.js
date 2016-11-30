define.Class('wysiwyg.editor.components.richtext.WRTEClosingTrait', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.fields({
        _isAutoClosing: true,
        _closingTriggersIgnoreList: []
    });

    def.binds(['_closeTextComponent', '_addElementToMouseEventIgnoreList', '_closeTextIfNeeded']);

    def.methods({
        initialize: function(compId, viewNode, extraArgs){
            this.parent(compId, viewNode, extraArgs);
            this._isAutoClosing = extraArgs.isAutoClosing !== false;
            this._setMouseDownBehavior(viewNode);

            this.resources.W.Commands.registerCommand("WEditorCommands.StopEditingText", true);
            this.resources.W.Commands.registerCommand("WEditorCommands.Save", true);

            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.StopEditingText', this, this._closeTextComponent);
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.Save", this, this._closeTextComponent);
        },

        _setAutoClose: function(){
            if(this._isAutoClosing){
                document.body.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._closeTextIfNeeded);

                this._closingTriggersIgnoreList.forEach(function(element) {
                    element.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._addElementToMouseEventIgnoreList);
                }, this);
            }
        },

        /**
         * adds the elements to the closing triggers ignore list.
         * if isAutoClosing set to true and the click was on one of the elements passed the editor won't close.
         * @param elements
         */
        setClosingTriggersIgnoreList: function(elements) {
            if (typeOf(elements) !== 'array') {
                elements = [elements];
            }
            this._closingTriggersIgnoreList = this._closingTriggersIgnoreList.concat(elements);
        },

        _removeListenersFromClosingTriggersIgnoreList: function() {
            this._closingTriggersIgnoreList.forEach(function(element) {
                element.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._addElementToMouseEventIgnoreList);
            }, this);
        },

        _addElementToMouseEventIgnoreList: function(event) {
            event.event.ignoreList = event.event.ignoreList ? event.event.ignoreList.concat([event.target]) : [event.target];
        },



        _closeTextIfNeeded: function(event){
            if(this._locked || this.isMouseDownEventOnTextEditor(event)){
                return;
            }
            this.resources.W.Commands.executeCommand('WEditorCommands.StopEditingText');
            LOG.reportEvent(wixEvents.TXT_EDITOR_CLOSE_PANEL, {c1: "outside"});
        },


        _closeTextComponent: function() {
            if(this._locked){
                return;
            }
            document.body.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._closeTextIfNeeded);
            this._removeListenersFromClosingTriggersIgnoreList();
            this.endEditing();
        },

        _setMouseDownBehavior: function(viewNode){
            var self = this;
            viewNode.addEvent(Constants.CoreEvents.MOUSE_DOWN, function(event){
                event.event.textEditorId = self.getComponentId();
            });
            //TODO: remove this hack.. when we're good with apps
            viewNode.addEvent(Constants.CoreEvents.CLICK, function(event){
                event.event.textEditorId = self.getComponentId();
            });
        },

        isMouseDownEventOnTextEditor: function (event){
            return (event.event.textEditorId && event.event.textEditorId === this.getComponentId()) ||
                (event.event.ignoreList && event.event.ignoreList.contains(event.target));
        }
    });
});