/**
 * @class wysiwyg.viewer.components.inputs.CheckBoxInput
 */
define.component('wysiwyg.viewer.components.inputs.CheckBoxInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);

    def.skinParts({
        'checkBox': {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        'label': {type: Constants.ComponentPartTypes.HTML_ELEMENT},
        'errorMessage': {type: Constants.ComponentPartTypes.HTML_ELEMENT, optional: "true"}
    });

    def.binds(['_setDataAndFireEvent', 'setSelected', 'setSelectedAndFireEvent']);

    def.states({
        'validation': [
            'valid',
            'invalid'
        ]
    });

    def.dataTypes(['CheckBox','Boolean']);

    /**
     * @lends wysiwyg.viewer.components.inputs.CheckBoxInput
     */
    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.addEvent(this.VALID_STATE_CHANGED_EVENT, function (isValid) {
                this.setState(isValid ? 'valid' : 'invalid', 'validation');
            }.bind(this));

            this._label = argsObject.label || "";
        },

        _setDataAndFireEvent: function () {
            var cb = this._skinParts.checkBox;
            this.getDataItem().set('value', cb.get('checked'));
            if (cb.get('checked')) {
                this.fireEvent('itemSelected', this);
            }
        },

        _onAllSkinPartsReady: function (parts) {
            var cb = parts.checkBox;
            cb.addEvent(Constants.CoreEvents.CHANGE, this._setDataAndFireEvent);

            // adding "id" and "for" attrs for checkbox and label"

            var parentId = parts.label.parentNode.id + "-check";
            parts.label.setAttribute("for", parentId);
            parts.checkBox.setAttribute("id", parentId);

            parts.label.set("text", this._label);
        },

        render: function () {
            if (this.getDataItem().get('value') === true) {
                this._skinParts.checkBox.setAttribute('checked', 'checked');
                this._skinParts.checkBox.checked = true;
            } else {
                this._skinParts.checkBox.removeAttribute('checked');
                this._skinParts.checkBox.checked = false;
            }
            if (this.getDataItem().get('indeterminate') === true) {
                this._skinParts.checkBox.indeterminate = true;
            } else {
                this._skinParts.checkBox.indeterminate = false;
            }
        },

        setError: function (message) {
            this.setValidationState(false);
            if (this._skinParts.errorMessage) {
                this._skinParts.errorMessage.set("text", message);
            }
        },

        setDisabled: function () {
            var cb = this._skinParts.checkBox;
            cb.set("disabled", "disabled");
        },

        //i know it's kinda stupid to check and uncheck the checkbox but it's for
        // the selectable list where only one item can be selected
        setSelected: function (isSelected) {
            var cb = this._skinParts.checkBox;
            cb.set('checked', isSelected);
        },

        setLabel: function(label) {
            this._label = label;
            this._skinParts.label.set('text', label);
        },

        setSelectedAndFireEvent: function(isSelected) {
            this.setSelected(isSelected);
            this._setDataAndFireEvent();
        }
    });

});