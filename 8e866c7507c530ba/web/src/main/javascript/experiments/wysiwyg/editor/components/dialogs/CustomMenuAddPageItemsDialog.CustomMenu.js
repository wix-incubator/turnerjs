define.experiment.newComponent('wysiwyg.editor.components.dialogs.CustomMenuAddPageItemsDialog.CustomMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.binds(['_onDialogClosing']);

    def.resources(['W.Commands']);

    def.skinParts({
        scrollableArea: {
            type: 'htmlElement'
        },
        siteMenu: {
            type: 'wysiwyg.editor.components.panels.navigation.SiteNavigationEditor'
        },
        addPage: {
            type: 'wysiwyg.editor.components.WButton',
            command: 'WEditorCommands.AddPageDialog',
            autoBindDictionary: 'CUSTOMMENU_AddPageItemsDialog_AddNewPages',
            argObject: {
                iconSrc:'icons/top-bar-icons.png',
                spriteOffset: {
                    x: '0',
                    y:'-122px'
                }
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._siteNavigationEditor = null;
            this._dialogWindow = args.dialogWindow;
            this._customMenuCheckedState = args.customMenuCheckedState
            this._startListeners();
        },

        _onAllSkinPartsReady: function(){
            this._skinParts.siteMenu.setScrollArea(this._skinParts.scrollableArea);
            this._skinParts.siteMenu.initMenu('#MAIN_MENU', Constants.NavigationButtons.CHECKBOX_NAVIGATION_BUTTON, this._customMenuCheckedState);
        },

        _onDialogClosing: function(){
            this._clearListeners();
        },

        _startListeners: function(){
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },

        _clearListeners: function(){
            if(this._skinParts.siteMenu){
                this._skinParts.siteMenu.unregisterCommands();
            }
            this._dialogWindow.removeEvent('onDialogClosing', this._onDialogClosing);
        }
    });
});