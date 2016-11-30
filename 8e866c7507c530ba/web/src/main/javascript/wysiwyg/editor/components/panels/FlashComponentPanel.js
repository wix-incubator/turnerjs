/**
 * @Class wysiwyg.editor.components.panels.FlashComponentPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.FlashComponentPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.resources(['W.Commands', 'W.Config']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', '_onDataChange', '_updateComponentEditBox']);

    def.dataTypes(['LinkableFlashComponent']);

    /**
     * @lends wysiwyg.editor.components.panels.FlashComponentPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function() {
            this.setNumberOfItemsPerLine(1);

            this.addFlashField(null, 150, 150, this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_CHANGE')).bindToDataItem(this._data); //bindToFields(["uri", "height", "width"]);

            var displayMode = this.addComboBox(this.injects().Resources.get('EDITOR_LANGUAGE', 'FLASH_DISPLAY_MODE'), "Flash_Component_Settings_Display_Mode_ttid").bindToProperty("displayMode");

            this._previewComponent.addEvent(Constants.PropertyEvents.PROPERTY_CHANGED, this._onDataChange);

            displayMode.runWhenReady(function(displayMode) {
                this._updateComponentEditBox(displayMode.getValue());
            }.bind(this));


            var that = this;
            this.addInputGroupField(function(){
                var dataMgr = that._data.getDataManager();

                var imgDataRef = this._data.get("placeHolderImage");
                dataMgr.getDataByQuery(imgDataRef, function ( dataObject ) {
                    this.addImageField(this.injects().Resources.get('EDITOR_LANGUAGE', 'FLASH_REPLACEMENT_IMAGE'),
                        null,
                        null,
                        this.injects().Resources.get('EDITOR_LANGUAGE', 'PHOTO_REPLACE_IMAGE'),
                        null,
                        null,
                        null,
                        "Flash_Component_Settings_Fallback_Image_ttid").bindToDataItem(dataObject);

                }.bind(this));
            });


            var lbl = this.injects().Resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO');
            var plcHldr = 'http://www.wix.com';
            var link = this.addLinkField(lbl, plcHldr).bindToDataItem(this.getDataItem());

            this.addAnimationButton();
        },

        _onDataChange: function(displayModeValue) {
            this._updateComponentEditBox(displayModeValue);
        },

        _updateComponentEditBox: function(displayModeValue) {
            if ( displayModeValue !== 'original') {
                this._previewComponent._resizableSides = [Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.LEFT,
                    Constants.BaseComponent.ResizeSides.BOTTOM, Constants.BaseComponent.ResizeSides.RIGHT];
            } else {
                this._previewComponent._resizableSides = [];
            }
            if(this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE){
                this._previewComponent._resizableSides = [];
            }
            this.resources.W.Commands.executeCommand(Constants.EditorUI.RESIZE_HANDLES_CHANGED);
        }
    });
});