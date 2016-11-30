define.component('wysiwyg.editor.components.dialogs.NotificationDialog', function(componentDefinition) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.skinParts({
        //content: {type: 'htmlElement'}
    });
    def.resources(['W.Commands', 'W.Resources']);

    def.binds(['_onDialogClosing', '_onCheckBoxInputChanged', '_showHelp']);
    def.traits(['core.editor.components.traits.DataPanel']);


    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogName = args.dialogName;
            this._setShowAgainStatusCallBack = args.setShowAgainStatusCallBack;
            this._dialogWindow = args.dialogWindow;
            this._notificationWidth = args.notificationWidth;
            this._icon = args.icon;
            this._helpletID = args.helpletID;
            this._description = args.description;
            this._okButtonCallback = args.okButtonCallback;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },
        _createFields: function(){
            var textWidth = this._isIconExist() ? (this._notificationWidth - this._icon.width - 50 + 'px') : null;
            textWidth = {width: textWidth};
            this.addBreakLine('10px');
            this.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(0);
                panel._createIcon(this);
                this.addInputGroupField(function(panel){
                    panel._createDescription(this);
                    panel._createCheckBox(this);
                }, 'skinless', null, null, textWidth, 'left');
            }, 'skinless', null, null, null, 'left');
        },

        _isIconExist:function(){
            if( this._icon &&
                typeOf(this._icon.url) === "string" &&
                typeOf(this._icon.x) === "number" &&
                typeOf(this._icon.y) === "number" &&
                typeOf(this._icon.width) === "number" &&
                typeOf(this._icon.height) === "number"){
                return true;
            }
            return false;
        },

        _createIcon:function(container){
            if(this._isIconExist()){
                var position = {x:this._icon.x + 'px', y:this._icon.y + 'px'};
                var size = {width:this._icon.width + 'px', height:this._icon.height + 'px'};
                container.addLabel(null, null, null, this._icon.url, position, size);
            }
        },

        _createDescription:function(container){
            if(this._description){
                container.addInlineTextLinkField(W.Resources.get('EDITOR_LANGUAGE', this._description));
                if(this._helpletID){
                    container.addInlineTextLinkField(null, null, W.Resources.get('EDITOR_LANGUAGE', "HELPLET_LEARN_MORE"))
                        .addEvent(Constants.CoreEvents.CLICK, this._showHelp);
                }
            }
        },

        _createCheckBox:function(container){
            if(this._setShowAgainStatusCallBack){
                container.addBreakLine('15px');
                container.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'DO_NOT_SHOW_THIS_MESSAGE_AGAIN'))
                    .addEvent('inputChanged', this._onCheckBoxInputChanged)
                    .runWhenReady( function( labelLogic ) {
                        labelLogic._skinParts.label.setStyles({'margin-bottom': '0px', 'margin-top': '0px'});
                    });
            }
        },

        _onCheckBoxInputChanged:function(e){
            if(typeOf(this._setShowAgainStatusCallBack)==="function" && this._dialogName){
                this._setShowAgainStatusCallBack(this._dialogName, !e.value);
            }
        },

        _showHelp :function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', this._helpletID);
        },

        _onDialogClosing : function( e ) {
            if(e.result !== "CANCEL" && this._okButtonCallback){
                this._okButtonCallback();
            }
        }
    });
});








