/**
 * @Class wysiwyg.editor.components.panels.PaginatedGridGalleryPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.PaginatedGridGalleryPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel', 'core.editor.components.traits.GalleryDataPanel']);

    def.binds(["_onPanelChange", "_onCompPropChange" ]);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ImageList']);

    /**
     * @lends wysiwyg.editor.components.panels.PaginatedGridGalleryPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function() {
            var schema = this._previewComponent.getComponentProperties()._schema,
                transDuration = schema.transDuration,
                autoplayInterval = schema.autoplayInterval;

            this._addFieldOrganizeImages();
            this._addFieldChangeGallery('../editor/toolbar/icons/add_gallery_04.png', 28, 28);
            this._addFieldsColumnsAndMargins(
                {title: 'MATRIX_GALLERY_COLUMNS', min: 1, max: 10, step: 1, bind: 'numCols'},
                {title: 'MATRIX_GALLERY_ROWS', min: 1, max: 10, step: 1, bind: 'maxRows'},
                {title: 'GALLERY_MARGIN', min: 0, max: 250, step: 1, bind: 'margin'}
            );
            this._addFieldTransitionAnsDuration(transDuration);
            this._addFieldAutoPlay(autoplayInterval.minimum, autoplayInterval.maximum, 0.1, true, {title: 'SLIDESHOW_GALLERY_SHOW_AUTOPLAY', property: 'showAutoplay'});

            this.createGeneralGalleryPropertiesGroup(true);

            this.addStyleSelector();
            this.addAnimationButton();
        },

        _onPanelChange : function (value) {
            setTimeout(this._previewComponent.next, 250);
            return value;
        },

        _onCompPropChange : function (value) {
            return value;
        },
        _addFieldTransitionAnsDuration: function(transDuration){
            this.addInputGroupField(function(panel){
                this.addComboBox(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_TRANSITIONS'))
                    .bindHooks(panel._onPanelChange, panel._onCompPropChange)
                    .bindToProperty("transition");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDESHOW_GALLERY_DURATION'),
                    transDuration.minimum,
                    transDuration.maximum,
                    0.1, false, true)
                    .bindHooks(panel._onPanelChange, panel._onCompPropChange)
                    .bindToProperty("transDuration");
            }).hideOnMobile();
        }
    });
});