define.component('wysiwyg.editor.components.panels.ButtonPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', '_createFields']);

    def.dataTypes(['LinkableButton']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

            this._simpleTextValidator = this._inputValidators.simpleTextValidator;
        },

        _createFields: function () {
            var thisPanel = this;
            var resources = this.injects().Resources;

            this.addInputGroupField(function () {
                this.addInputField(resources.get('EDITOR_LANGUAGE', 'BUTTON_LABEL_TEXT'), 'Enter Text', null, null, {validators: [thisPanel._simpleTextValidator]}, null, null).bindToField('label');
                this.addLinkField(this.injects().Resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO')).bindToDataItem(this.getDataItem());

            });


            this.addInputGroupField(function () {
                var sliderOptions = {min: 0, max: 100, step: 1};
                var bg = 'radiobuttons/radio_button_states.png';
                var bgDimensions = {w: '35px', h: '33px'};
                var textAlignOptions = [
                    {value: 'left', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/left.png'},
                    {value: 'center', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/center.png'},
                    {value: 'right', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/right.png'}
                ];
                this.addRadioImagesField(resources.get('EDITOR_LANGUAGE', 'BUTTON_TEXT_ALIGN'), textAlignOptions, null, null, 'inline').bindToProperty('align');
                this.addSliderField(resources.get('EDITOR_LANGUAGE', 'BUTTON_MARGIN'), sliderOptions.min, sliderOptions.max, sliderOptions.step).bindToProperty('margin');
            });

            this.addStyleSelector();
            this.addAnimationButton();
        }
    });
});
