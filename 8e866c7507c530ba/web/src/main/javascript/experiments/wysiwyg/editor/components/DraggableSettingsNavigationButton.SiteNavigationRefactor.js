/**@class wysiwyg.editor.components.DraggableSettingsNavigationButton */
define.experiment.newComponent('wysiwyg.editor.components.DraggableSettingsNavigationButton.SiteNavigationRefactor', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.BaseNavigationButton');

    def.skinParts({
        label:{type:'htmlElement'},
        menu:{type:'htmlElement'},
        icon:{type:'htmlElement'},
        drag:{type:'htmlElement'}
    });

    def.resources(['W.Editor', 'W.Commands', 'W.Preview', 'W.Config']);

    def.statics({
        _settingsTooltipId: null
    });

    def.binds(['_onSettingsClicked']);

    /**
     * @lends wysiwyg.editor.components.DraggableSettingsNavigationButton
     */
    def.methods({
        render:function () {
            this.parent();
        },

        /** Drag handling **/

        registerDragHandler:function (handler) {
            this._skinParts.drag.addEvent(Constants.CoreEvents.MOUSE_DOWN, handler);
            var dragPart = this._skinParts.drag;
            var skin = this._skinParts.drag.getParent();
            dragPart.setStyle("background-position", "0 -100px");
            skin.addEvent(Constants.CoreEvents.MOUSE_OVER, function(e){
                dragPart.setStyle("background-position", "0 -160px");
            }.bind(this));
            skin.addEvent(Constants.CoreEvents.MOUSE_OUT, function(e){
                dragPart.setStyle("background-position", "0 -100px");
            }.bind(this));
        },

        /**
         * @override
         * @private
         */
        _onAllSkinPartsReady: function() {
            this.parent();

            // Handle click on settings cogwheel
            this._skinParts.menu.addEvent(Constants.CoreEvents.CLICK, this._onSettingsClicked);

            // Set tooltip for cogwheel
            if (this._settingsTooltipId) {
                this._addToolTipToSkinPart(this._skinParts.menu, this._settingsTooltipId);
            }
        },


        /** Settings handling **/

        /**
         * @abstract
         */
        _onSettingsClicked: function() {

        },

        _addToolTipToSkinPart:function (skinPart, tipId) {
            skinPart.addEvent('mouseenter', function () {
                W.Commands.executeCommand('Tooltip.ShowTip', {id:tipId}, skinPart);
            }.bind(this));
            skinPart.addEvent('mouseleave', function () {
                W.Commands.executeCommand('Tooltip.CloseTip');
            }.bind(this));
        }
    });

});
