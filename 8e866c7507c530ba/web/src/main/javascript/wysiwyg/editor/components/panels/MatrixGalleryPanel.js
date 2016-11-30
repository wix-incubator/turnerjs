/**
 * @Class wysiwyg.editor.components.panels.MatrixGalleryPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.MatrixGalleryPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel', 'core.editor.components.traits.GalleryDataPanel']);

    def.binds(['_createStylePanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ImageList']);

    def.propertiesSchemaType('MatrixGalleryProperties');

    def.resources(['topology']);

    /**
     * @lends wysiwyg.editor.components.panels.MatrixGalleryPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function() {
            this._addFieldOrganizeImages();
            this._addFieldChangeGallery(this.resources.topology.skins + '/images/wysiwyg/core/themes/editor/toolbar/icons/add_gallery_01.png', 28, 28);
            this._addImageScalingGroup();
            this._addGeneralPropertiesAndStyle();
        },

        _addImageScalingGroup: function(){
            this.addInputGroupField(function(){
                this.setNumberOfItemsPerLine(1);
                this.addComboBox(W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_IMAGE_MODE'), "Gallery_Settings_Image_Scaling_Grid_Gallery_ttid").bindToProperty("imageMode");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'MATRIX_GALLERY_COLUMNS'), 1, 10, 1, false, false).bindToProperty("numCols");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'MATRIX_GALLERY_ROWS'), 1, 10, 1, false, false).bindToProperty("maxRows");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'MATRIX_GALLERY_SHOW_MORE'), 1, 10, 1, false, true, null, 'Grid_Gallery_Settings_Show_More_ttid').bindToProperty("incRows");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_MARGIN'), 0, 250, 1, false, false).bindToProperty("margin");
            });
            this.addInputGroupField(function(){
                var bg = 'radiobuttons/radio_button_states.png';
                var bgDimensions = {w: '35px', h: '33px'};
                var textAlignOptions = {
                    options: [
                        {value: 'left',   image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/left.png'},
                        {value: 'center', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/center.png'},
                        {value: 'right',  image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/right.png'}
                    ],
                    display: 'inline',
                    defaultValue: '',
                    group: ''
                };
                this.addRadioImagesField(W.Resources.get('EDITOR_LANGUAGE', 'BUTTON_TEXT_ALIGN'), textAlignOptions.options, textAlignOptions.defaultValue, textAlignOptions.group, textAlignOptions.display).bindToProperty('alignText');
            });
            this.addInputGroupField(function(){
                this.setNumberOfItemsPerLine(1);
                buttonLabel = this.addInputField(W.Resources.get('EDITOR_LANGUAGE', 'MATRIX_GALLERY_BUTTON_LABEL'), null, 0, 50, null, null, null).bindToProperty('showMoreLabel');
            });
        },

        _addGeneralPropertiesAndStyle: function(){
            this.createGeneralGalleryPropertiesGroup();

            this.addStyleSelector();
            this.addAnimationButton();
        }
    });
});