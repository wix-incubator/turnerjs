define.component('wysiwyg.editor.components.panels.MobileViewSelectorPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.skinParts({
        panelLabel  : { type: 'htmlElement', autoBindDictionary: 'MOBILE_VIEW_SELECTOR' },
        help        : { type: 'htmlElement' },
        close       : { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'done', command: 'this._closeCommand' },
        content     : { type: 'htmlElement' }
    });

    def.resources(["W.Commands", "W.Data"]);

    def.dataTypes('MultipleStructureOffering');

    def.binds(['_toggleSelectMobileView', '_setDefaultMobileView', '_addButtonSelector', '_setViewButtonByName', '_updateSelectors']);

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._selectedViewButton = null;
            this._optimizedViewButton = null;
            this._regularViewButton = null;
            this._mobileOnOffCheckBox = null;
        },

        _onAllSkinPartsReady: function() {
            this.parent();
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._updateSelectors);
        },

        _createFields: function() {
            this._addPanelDescription();
            this._addCheckBoxSelector();
            this._addToggleButtonsSelector();
            this._addPanelNote();
        },

        _addToggleButtonsSelector: function() {
            this.addInputGroupField(function(panel){
                this.addBreakLine(5);
                this.addInputGroupField(function(panel){
                    this.setNumberOfItemsPerLine(2, '20px');
                    panel._addButtonSelector(this, 'mobile/preview_desktop1.png', {width:183, height:259}, 'regularViewButton', 'MOBILE_VIEW_SELECTOR_REGULAR_DESKTOP_VIEW_TITLE');
                    panel._addButtonSelector(this, 'mobile/preview_optimized1.png', {width:183, height:259}, 'optimizedViewButton', 'MOBILE_VIEW_SELECTOR_OPTIMIZED_VIEW_TITLE');
                }, 'skinless');
            }, 'skinless');
        },

        _addButtonSelector:function(container, iconURL, iconSize, buttonName, title){
            var that = this;
            title = W.Resources.get('EDITOR_LANGUAGE', title);
            container.addMobileOrDesktopViewSelectorButton(iconURL, iconSize, title)
                .runWhenReady(function(buttonComp) {
                    that._setViewButtonByName(buttonName, buttonComp);
                    that._setDefaultMobileView();
                    buttonComp.addEvent(Constants.CoreEvents.CLICK, function(){
                        var isOptimizedSelected = (buttonComp === that._optimizedViewButton) ? true : false;
                        that.getDataItem()._data["origin"] = "icon-click" ;
                        that._data.set('hasMobileStructure', isOptimizedSelected);
                    });
                });
        },

        _addCheckBoxSelector:function(){
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(2, "5px");
                panel._mobileOnOffCheckBox = this.addCheckBoxImageField(null, null, "icons/toggle_on_off_sprite.png", {w: 48, h: 23}, "noHover")
                    .setValue(panel._isOptimizedSelected());
                panel._mobileOnOffCheckBox.addEvent('inputChanged', function (e) {
                    panel.getDataItem()._data["origin"] = "icon-click" ;
                    panel._data.set('hasMobileStructure', e.value);
                });





                this.addLabel(this._translate('MOBILE_VIEW_SELECTOR_PANEL_DISPLAY_OPTIMIZED_VIEW_TITLE'), {'height': '20px', 'font-size': '14px', 'color': '#686868'}, null, null, null, null);
            }, 'skinless');
        },

        _setViewButtonByName:function(buttonName, buttonComp){
            if(buttonName == 'optimizedViewButton'){
                this._optimizedViewButton = buttonComp;
            }
            else {
                this._regularViewButton = buttonComp;
            }
        },

        _setDefaultMobileView:function(){
            if(this._optimizedViewButton && this._regularViewButton){
                this._updateSelectors();
            }
        },

        _updateSelectors: function() {
            var hasMobileStructure = this._isOptimizedSelected();
            var button = hasMobileStructure ? this._optimizedViewButton : this._regularViewButton;
            this._isFromIcon = false ;
            this._toggleSelectMobileView(button);
            if(this._mobileOnOffCheckBox) {
                this._mobileOnOffCheckBox.setValue(hasMobileStructure);
            }
        },

        _toggleSelectMobileView:function(mobileViewGroup){
            if(this._selectedViewButton === mobileViewGroup){
                return;
            }
            this._selectedViewButton = mobileViewGroup;
            if(mobileViewGroup === this._optimizedViewButton){
                this._optimizedViewButton.setSelection(true);
                this._regularViewButton.setSelection(false);
            }
            else {
                this._optimizedViewButton.setSelection(false);
                this._regularViewButton.setSelection(true);
            }
        },

        _addPanelDescription:function(){
            this.addBreakLine(8);
            this.addLabel(this._translate('MOBILE_VIEW_SELECTOR_PANEL_DESCRIPTION'));
        },

        _addPanelNote:function(){
            this.addBreakLine(8);
            this.addLabel(this._translate('MOBILE_VIEW_SELECTOR_PANEL_NOTE'));
        },

        _getEventOrigin: function () {
            return this.getDataItem()._data["origin"] || "switch";
        },

        _resetEventOrigin: function () {
            this.getDataItem()._data["origin"] = null;
        },

        _isOptimizedSelected: function () {
            var data = this.getDataItem().getData() ;
            return data.hasMobileStructure ;
        },

        _showHelp: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_MOBILE_OPTIMIZED_VIEW');
        }
    });
});
