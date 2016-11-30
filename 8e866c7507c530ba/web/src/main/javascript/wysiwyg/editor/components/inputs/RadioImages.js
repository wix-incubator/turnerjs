/**
 * @Class wysiwyg.editor.components.inputs.RadioImages
 * @extends wysiwyg.editor.components.inputs.RadioButtons
 */
define.component('wysiwyg.editor.components.inputs.RadioImages', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.RadioButtons");

    def.binds(['_onRadioReady']);

    def.skinParts({
        label: {type: 'htmlElement'},
        radioButtons: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel']});

    /**
     * @lends wysiwyg.editor.components.inputs.RadioImages
     */
    def.methods({
        /**
         * @override
         * Initialize Input, Set display to always be inline
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * presetList: an array of {
         *      value: value,
         *      label: label,
         *      image: image,
         *      dimensions: {w: w, h: h}
         * } pairs
         * labelText: the value of the label to show above/next to the field
         * listSize: the size of the options list to show on focus
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._display = 'inline';
        },

        /**
         * @override
         * Set the options of the select
         * @param list A dictionary of {value:title} pairs
         */
        setRadioButtons: function (list, initialValue) {
            this._numberOfButtons = 0; //For NewDeploy fix
            if (list && list.length) {
                this._initialValue = initialValue || this._initialValue;
                var radioContainer = this._skinParts.radioButtons;
                var radio;
                if (this._presetList != list) {
                    this._presetList = list;
                }
                radioContainer.empty();
                this._radioButtonsLogic = {};
                this._radioButtonsElements = {};

                list.forEach(function (item) {
                    item = (typeof item != 'undefined') ? item : {};
                    if (item == Constants.AutoPanel.BREAK) {
                        // Add a new line on LineBreak
                        radioContainer.grab(new Element('br'), 'bottom');
                    } else {
                        this._numberOfButtons += 1; //For NewDeploy fix
                        if (this._radioButtonsElements[item.value]) {
                            //TODO: report error
                        }
                        radio = this.injects().Components.createComponent(
                            'wysiwyg.editor.components.inputs.RadioImage',
                            'wysiwyg.editor.skins.inputs.RadioImageSkin',
                            undefined,
                            {
                                labelText: item.label,
                                toolTip: item.toolTip,
                                group: this._group,
                                value: item.value,
                                image: item.image,
                                icon: item.icon,
                                dimensions: item.dimensions,
                                bgposition: item.bgposition,
                                display: this._display
                            },
                            null,
                            function(logic){
                                var viewNode = logic.$view;
                                this._radioButtonsElements[item.value] = viewNode;
                                this._onRadioReady(logic);
                            }.bind(this)
                        );
                        radio.insertInto(radioContainer);
                    }
                }, this);
            }
            else {
                this._isButtonsLogicReady = true;
                this._renderIfReady();
            }
        },

        /* TODO: This is a temp solution to bypass the sync problems with NewDeploy */
        setValue: function (value, isPreset) {
            if(this._numberOfButtons != Object.getLength(this._radioButtonsLogic)){
                setTimeout(function(){
                    if(!this._isDisposed){
                        this.setValue(value, isPreset) ;
                    }
                }.bind(this), 500);

                return;
            }
            this.parent(value, isPreset);
        }
    });
});