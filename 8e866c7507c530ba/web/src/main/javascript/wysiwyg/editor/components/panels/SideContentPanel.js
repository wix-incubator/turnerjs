define.component('wysiwyg.editor.components.panels.SideContentPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Resources', 'W.Utils']);

    def.skinParts({
        content       : { type: 'htmlElement' },
        scrollableArea: { type: 'htmlElement' }
    });

    def.statics({
        PANEL_TYPE: {
            MARKET    : 'marketPanel',
            NO_CONTENT: 'emptyPanel',
            DEFAULT   : 'noPanelState'
        }
    });

    def.binds(['_onResize']);

    def.fields({
        _panelName     : '',
        _containerPanel: null
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey = this._descriptionKey = 'EMPTY';
            W.Data.getDataByQuery('#HELP_IDS', function(helpIdsData){
                this._helpIdsData = helpIdsData;
            }.bind(this));

            this.addEvent('panelHides', this._onPanelHide);
            this.addEvent('subPanelOpened', this._onPanelShow);
        },

        _onPanelHide: function(){
            this._containerPanel && this._containerPanel.removeEvent('resize', this._onResize);
        },

        _onPanelShow: function(){
            this._containerPanel && this._containerPanel.addEvent('resize', this._onResize);
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            this._skinParts.scrollableArea.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this.resources.W.Utils.preventMouseDownOn(this._skinParts.scrollableArea) ;
        },

        hide: function(){
            this.fireEvent(Constants.EditorUI.PANEL_CLOSING, this);
        },

        // a reference to the parent panel;
        setContainerPanel: function(panel){
            this._containerPanel && this._containerPanel.removeEvent('resize', this._onResize);

            this._containerPanel = panel;
            this._containerPanel.addEvent('resize', this._onResize);
        },

        _onResize: function(event){
            this.fireEvent('resize', event);
        },

        getPanelType: function(){
            //Override this if a special state is needed, state must be declared in SidePanel.js
            return this.PANEL_TYPE.DEFAULT;
        },

        getMaxHeight: function(){
            return Constants.EditorUI.Max.SIDE_PANEL_HEIGHT;
        },

        // tunnel containing panel's height
        getPanelHeight: function(){
            return this._containerPanel.getPanelHeight();
        },

        getTitle: function(){
            this._category ? this._title = 'ADD_COMP_TITLE_' + this._category : this._title = this._titleKey;

            this._title = this.injects().Resources.get('EDITOR_LANGUAGE', this._title);

            return this._title;
        },

        getDescription: function(){
            this._description = this._category ? ('ADD_COMP_DESC_' + this._category) : this._descriptionKey;
            if (!this._description){
                return '';
            }
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', this._description);
        },

        getHelplet: function(){
            var compLabel = this.$className && this.$className.split('.').getLast();
            var categoryId = this._category ? '_' + this._category : '';
            var helpId = "SIDE_PANEL_" + compLabel + categoryId;
            var helpIdsItems = this._helpIdsData.get('items');
            if (!helpIdsItems[helpId]){
                helpId = undefined;
            }
            return helpId;
        },

        tryClose: function(closeCommand){
            this._containerPanel.removeEvent('resize', this._onResize);
            closeCommand.execute();
        },

        cancel: function(closeCommand){
            this._containerPanel.removeEvent('resize', this._onResize);
            console.log('resize off');

            closeCommand.execute();
        },

        resizeContentArea: function(limit){
            if (this._skinParts.scrollableArea){
                this._skinParts.scrollableArea.setStyle('max-height', limit + 'px');
            }
        },

        getName: function(){
            if (this._panelName){
                return this.injects().Resources.get('EDITOR_LANGUAGE', this._panelName);
            }
            return "";
        },

        getActionsHeight: function(){
            if (this._skinParts && this._skinParts.actions){
                this._actionsHeight = this._skinParts.actions.getSize().y;
                return this._actionsHeight;
            }
            return 0;
        },

        canCancel: function(){
            return false;
        },

        canGoBack: function(){
            return false;
        }
    });

});