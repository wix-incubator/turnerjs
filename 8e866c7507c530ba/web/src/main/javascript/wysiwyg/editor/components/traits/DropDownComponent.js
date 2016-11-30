/**
 * @class wysiwyg.editor.components.traits.DropDownComponent
 */
define.Class('wysiwyg.editor.components.traits.DropDownComponent', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /* Components that use this trait:
     * Should implement getOptions, getSelectedOption and setActiveState methods.
     * */

    def.binds(['_onFocus', '_onKeyPress', '_callOnBlurIfNeeded', '_preventBlur', '_onBlur']);

    def.resources(["W.Commands"]);

    def.methods({
        _addKeyPressListener:function() {
            document.body.addEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyPress);
        },

        _removeKeyPressListener:function() {
            document.body.removeEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyPress);
        },

        _setFocus: function () {
            this.setActiveState(true);
            var viewNode = this.getViewNode();
            if (viewNode) {
                viewNode.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._preventBlur);
            }
            document.body.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._callOnBlurIfNeeded);
            //we add the click as well, because component edit box stops propogation for some reason...
            this._addKeyPressListener();
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.DialogWindowMouseDown", this, this._callOnBlurIfNeeded);
        },

        /**
         * Prevents the event from bubbling up the DOM tree
         * This is the default behavior of the menu
         * Should be overridden if event bubbling is needed
         *
         * @returns {boolean}
         */
        stopPropagationOnDropdown: function() {
            return true;
        },

        /**
         * Returns an array of the view node options
         * Must be overridden
         */
        getOptions: function () {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, 'getOptions');
        },

        /**
         * Returns the selected option view node
         * Must be overridden
         */
        getSelectedOption: function () {
            LOG.reportError(wixErrors.MISSING_METHOD, this.className, 'getSelectedOption');
        },

        /**
         * Sets current state to be active/not active, according to isActive boolean parameter
         * Must be overridden
         */
        setActiveState: function (isActive) {
            //override
        },

        /**
         * on select click
         * @param event
         */
        _onFocus: function (event) {
            if(!this.isEnabled()){
                return;
            }
            if (this.getState('mouse') === 'selected') {
                this._onBlur(event);
                return;
            }

            if (this._onFocusBIEvent) { //merge from text effects
                LOG.reportEvent(this._onFocusBIEvent);
            }
            this._setFocus();
        },

        _preventBlur: function (event) {
            event.event.focusedDropDown = this.getComponentId();
        },

        _callOnBlurIfNeeded: function (event) {
            if (!event.event.focusedDropDown || event.event.focusedDropDown !== this.getComponentId()) {
                this._onBlur();
            }
        },

        /**
         * hide the select list
         * @param event
         */
        _onBlur: function (event) {
            this.setActiveState(false);
            this.getViewNode().removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._preventBlur);
            document.body.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._callOnBlurIfNeeded);
            this._removeKeyPressListener();
            this.resources.W.Commands.unregisterCommand("WEditorCommands.DialogWindowMouseDown");
        },

        /**
         * handle keyboard navigation
         * @param event
         */
        _onKeyPress: function (event) {
            if(!this.isEnabled()){
                return;
            }

            if (this.stopPropagationOnDropdown()) {
                event.stopPropagation();
            }

            var selectedOption = this.getSelectedOption();

            switch (event.key) {
                case 'up':
                    var prevOption = this.getPreviousOption(selectedOption);
                    if (!prevOption) {
                        prevOption = this.getOptions()[0];
                    }
                    this.setSelected(prevOption);
                    event.preventDefault();
                    break;
                case 'down':
                    var nextOption = this.getNextOption(selectedOption);
                    if (!nextOption) {
                        nextOption = this.getOptions()[0];
                    }
                    this.setSelected(nextOption);
                    event.preventDefault();
                    break;
                case 'enter':
                case 'space':
                    event.target = selectedOption;
                    this._onOptionClick(event);
                    break;
                case 'esc':
                case 'tab':
                    this._onBlur(event);
                    break;
            }
        },

        getPreviousOption: function (selected) {
            if (!selected){
                return null;
            }

            var options = this.getOptions();
            var currentOptionIndex = options.indexOf(selected);
            return currentOptionIndex == 0 ? options[options.length - 1] : options[currentOptionIndex - 1];
        },

        getNextOption: function (selected) {
            if (!selected){
                return null;
            }

            var options = this.getOptions();
            var currentOptionIndex = options.indexOf(selected);
            return currentOptionIndex == (options.length - 1) ? options[0] : options[currentOptionIndex + 1];
        }

    });

});