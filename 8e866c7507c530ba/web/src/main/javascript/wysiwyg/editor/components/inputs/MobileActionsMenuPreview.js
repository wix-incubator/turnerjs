define.component('wysiwyg.editor.components.inputs.MobileActionsMenuPreview', function (classDefinition) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        actionsMenuContainer: {type: 'htmlElement'}
    });

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._quickActionsData = args.quickActionsData || {};
            this._defaultZoom = args.defaultZoom || 1;
        },

        updateQuickActionsData: function(quickActionsData) {
            this._quickActionsData = quickActionsData;
            if(!window.WMobileActionsMenu) { return; }
            window.WMobileActionsMenu.updateQuickActionsData(quickActionsData);
            this._setToggleButtonOpacity();
        },

        _onAllSkinPartsReady: function (parts) {
            if(!window.WMobileActionsMenu) { return; }
            setTimeout(function(){
                // TODO: skin is not ready when it should be ready so... hacking the hell out of this initialization
                window.WMobileActionsMenu.initialize(parts.actionsMenuContainer, this._quickActionsData, {
                    enableOverlay: false,
                    enableLists: false,
                    enableClicks: false,
                    startOpened: true,
                    defaultZoom: this._defaultZoom
                });
                window.WMobileActionsMenu.updateDisplay();
                this._setToggleButtonOpacity();
            }.bind(this), 500);
        },

        _setToggleButtonOpacity: function () {
            if(!window.WMobileActionsMenu) { return; }
            var toggleBtn = window.WMobileActionsMenu.getActionItemByIndex(0);
            if(toggleBtn && window.WMobileActionsMenu.getNumOfActionItem()>1) {
                toggleBtn.firstChild.firstChild.style.opacity = 0.4;
                toggleBtn.firstChild.style.borderColor = "#777";
            }
        }
    });

});

