define.component('wysiwyg.editor.components.inputs.MobilePreviewInput', function (classDefinition) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');
    def.resources(['W.Theme']);

    def.skinParts({
        label: {type: 'htmlElement'},
        mobileBody : {type: 'htmlElement'},
        quickActionButtons : {type: 'htmlElement'}
    });

    def.methods({

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function(){
            this.parent();

            var curValue = this.getValue();
            if (curValue) {
                var colorValue = curValue.colorScheme=='light' ? 32 : 0;
                var navigationMenuValue = curValue.navigationMenuEnabled? 16 : 0;
                var phoneValue = curValue.phoneEnabled? 8 : 0;
                var emailValue = curValue.emailEnabled? 4 : 0;
                var addressValue = curValue.addressEnabled? 2 : 0;
                var socialMediaValue = curValue.socialLinksEnabled? 1 : 0;


                var quickActionSerialValue = (colorValue + navigationMenuValue + phoneValue + emailValue + addressValue + socialMediaValue) * -50 ;
                this._skinParts.quickActionButtons.setStyle('background-position', '0px ' + quickActionSerialValue + 'px');
            }

        },

        /**
         * Set the value of the input field, MANDATORY
         * @param value The text to set
         */
        setValue: function(value){
            this._value = value;
            this.render();
        },

        /**
         * Returns the value of the input field
         */
        getValue: function(){
            return this._value;
        },

        /**
         * Assign change events
         */
        _listenToInput: function(){
        },

        /**
         * Remove change events
         */
        _stopListeningToInput: function(){
        }

    });

});

