/**
 * @Class wysiwyg.editor.components.panels.HorizontalMenuPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.HorizontalMenuPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel']);

    def.dataTypes(['Menu','Document']);

    /**
     * @lends wysiwyg.editor.components.panels.HorizontalMenuPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);

            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
        },

        _createFields: function(){
            var sliderOptions = {min: 0, max: 100, step: 1};
            var inputOptions = {placeholder: 'Label Text', showInput: true};
            var resources = this.injects().Resources;
            var thisPanel = this;
            this.addInputGroupField(function(){
                this.setNumberOfItemsPerLine(1);

                var bg = 'radiobuttons/radio_button_states.png';
                var bgDimensions = {w: '35px', h: '33px'};
                var menuAlignOptions = {
                    options: [
                        {value: 'left',   image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/left.png'},
                        {value: 'center', image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/center.png'},
                        {value: 'right',  image: bg, dimensions: bgDimensions, icon: 'radiobuttons/alignment/right.png'}
                    ],
                    display: 'inline',
                    defaultValue: '',
                    group: ''
                };
                var buttonsAlignProxy = this.addRadioImagesField(resources.get('EDITOR_LANGUAGE', 'MENU_BUTTONS_ALIGNMENT'), menuAlignOptions.options, menuAlignOptions.defaultValue, menuAlignOptions.group, menuAlignOptions.display).bindToProperty('alignButtons');

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
                this.addRadioImagesField(resources.get('EDITOR_LANGUAGE', 'MENU_BUTTON_TEXT_ALIGNMENT'), textAlignOptions.options, textAlignOptions.defaultValue, textAlignOptions.group, textAlignOptions.display).bindToProperty('alignText');
                this.addCheckBoxField(resources.get('EDITOR_LANGUAGE', 'MENU_BUTTONS_CONSTANT_WIDTH')).bindToProperty('sameWidthButtons');
                this.addCheckBoxField(resources.get('EDITOR_LANGUAGE', 'MENU_BUTTONS_FILL_MENU_WIDTH')).bindToProperty('stretchButtonsToMenuWidth');
            });

//                this.addVisibilityConditions([
//                    {ref: buttonsAlignProxy, predicate: function() {
//                        return (thisPanel._getStretchButtonsMode()===false)
//                    }}]);

            this.addInputGroupField(function(){
                this.addInputField( resources.get('EDITOR_LANGUAGE', 'MENU_MORE_BUTTON_LABEL'),
                    inputOptions.placeholder,
                    null,
                    "100",
                    {validators: [thisPanel._htmlCharactersValidator]},
                    null,
                    "Menu_Settings_More_menu_button_ttid").bindToProperty('moreButtonLabel');
            });

            this.addStyleSelector();
            this.addAnimationButton();

        },

        _getStretchButtonsMode: function() {
            return  this.getComponentProperty('stretchButtonsToMenuWidth');
        }
    });
});