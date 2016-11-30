/**
 * @Class wysiwyg.editor.components.panels.SliderGalleryPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.SliderGalleryPanel', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel', 'core.editor.components.traits.GalleryDataPanel']);

    def.resources(['topology']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ImageList']);

    /**
     * @lends wysiwyg.editor.components.panels.SliderGalleryPanel
     */
    def.methods({
        _createFields: function() {
            this._addFieldOrganizeImages();
            this._addFieldChangeGallery(this.resources.topology.skins + '/images/wysiwyg/core/themes/editor/toolbar/icons/add_gallery_03.png', 28, 28);
            this._addFieldsGalleryMode();
            this._addFieldsMarginsField();
            this.createGeneralGalleryPropertiesGroup();
            this.addStyleSelector();
            this.addAnimationButton();
        },
        _addFieldsGalleryMode: function(){
            this.addInputGroupField(function(){
                this.setNumberOfItemsPerLine(1);
                this.addComboBox(W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_IMAGE_MODE'), "Slider_Gallery_Settings_Image_Scaling_ttid").bindToProperty("imageMode");
//                var aspectRatio = this.addComboBox("Aspect ratio").bindToProperty("aspectRatioPreset");

                var bg = 'radiobuttons/aspRatio/radio_button_states.png';
                var bgDimensions = {w: '46px', h: '52px'};
                var menuAlignOptions = {
                    options: [
                        {value: '16:9',   image: bg, dimensions: bgDimensions, icon: 'radiobuttons/aspRatio/16-9.png'},
                        {value: '4:3', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/aspRatio/4-3.png'},
                        {value: '1:1',  image: bg, dimensions: bgDimensions, icon: 'radiobuttons/aspRatio/1-1.png'},
                        {value: '3:4',  image: bg, dimensions: bgDimensions, icon: 'radiobuttons/aspRatio/3-4.png'},
                        {value: '9:16',  image: bg, dimensions: bgDimensions, icon: 'radiobuttons/aspRatio/9-16.png'}
                    ],
                    display: 'inline',
                    defaultValue: '',
                    group: ''
                };
                var aspectRatio = this.addRadioImagesField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDER_GALLERY_ASPECT_RATIO'),
                    menuAlignOptions.options, menuAlignOptions.defaultValue, menuAlignOptions.group, menuAlignOptions.display)
                    .bindToProperty('aspectRatioPreset');

                this.addVisibilityCondition(aspectRatio, function () {
                    return this._previewComponent.getComponentProperty("imageMode") == "clipImage";
                }.bind(this));
            });
        },
        _addFieldsMarginsField: function(){
            this.addInputGroupField(function () {
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'GALLERY_MARGIN'), 0, 250, 1, false, false)
                    .bindToProperty("margin");
                this.addSliderField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDER_GALLERY_SPEED'),1,30,1,false,true)
                    .bindToProperty("maxSpeed");
                this.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'SLIDER_GALLERY_LOOP')).bindToProperty("loop");
            });
        }
    });
});