/**
 * @Class wysiwyg.editor.components.panels.SlideShowGalleryPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.SlideShowGalleryPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel', 'core.editor.components.traits.GalleryDataPanel']);

    def.binds(["_onPanelChange", "_onCompPropChange", "_onImageModeChange"]);

    def.resources(['topology']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ImageList']);

    /**
     * @lends wysiwyg.editor.components.panels.SlideShowGalleryPanel
     */
    def.methods({
        _createFields: function() {
            var schema = this._previewComponent.getComponentProperties()._schema;

            this._addFieldsOrganizeAndScale();
            this._addFieldChangeGallery(this.resources.topology.skins + '/images/wysiwyg/core/themes/editor/toolbar/icons/add_gallery_02.png', 40, 28);
            this._addFieldTransition(schema["transDuration"]);
            this._addFieldIntervals(schema["autoplayInterval"]);
            this.createGeneralGalleryPropertiesGroup(true);

            this.injects().Data.getDataByQuery("#STYLES", this._createStylePanel);
        },

        _onPanelChange : function (value) {
            setTimeout(this._previewComponent.gotoNext, 250);
            return value;
        },

        _onImageModeChange : function (value) {
            setTimeout(function () {
                this.injects().Editor.setSelectedComp(this._previewComponent, false);
            }.bind(this), 250);
            return value;
        },

        _onCompPropChange : function (value) {
            return value;
        },

        _addFieldsOrganizeAndScale: function(){
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(1);

                this.addButtonField(
                    null,
                    W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_ORGANIZE_PHOTOS'),
                    null,
                    null,
                    'blueWithArrow',
                    null,
                    null,
                    'WEditorCommands.OpenOrganizeImagesDialog',
                    {}
                );

                this.addComboBox(W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_IMAGE_MODE'), "Slideshow_Gallery_Settings_Image_Scaling_ttid")
                    .bindHooks(panel._onImageModeChange, panel._onCompPropChange)
                    .bindToProperty("imageMode");
            });
        },

        _addFieldTransition: function(transDuration){
            this.addInputGroupField(function (panel) {
                this.addComboBox(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_TRANSITIONS'))
                    .bindHooks(panel._onPanelChange, panel._onCompPropChange)
                    .bindToProperty("transition");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_DURATION'),
                    transDuration["minimum"],
                    transDuration["maximum"],
                    0.1, false, true)
                    .bindHooks(panel._onPanelChange, panel._onCompPropChange)
                    .bindToProperty("transDuration");
                this.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_REVERSE'))
                    .bindHooks(panel._onPanelChange, panel._onCompPropChange)
                    .bindToProperty("reverse");
            }).hideOnMobile();
        },

        _addFieldIntervals: function(autoplayInterval){
            this.addInputGroupField(function (panel) {
                this.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_AUTOPLAY')).bindToProperty("autoplay");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_INTERVAL'),
                    autoplayInterval["minimum"],
                    autoplayInterval["maximum"],
                    0.1, false, true)
                    .bindToProperty("autoplayInterval");
                this.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_SHOW_AUTOPLAY')).bindToProperty("showAutoplay");
            });

        }
    });
});