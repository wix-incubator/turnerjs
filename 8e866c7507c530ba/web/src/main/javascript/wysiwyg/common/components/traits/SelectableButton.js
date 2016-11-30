define.Class('wysiwyg.common.components.traits.SelectableButton', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.traits.SelectableOption');

    def.methods({

        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.addEvent('click', function () {
                this.fireEvent(this.ITEM_SELECTED_EVENT, this);
            }.bind(this));
        },

        setSelected:function (isSelected) {
            this._isSelected = isSelected;
            if (isSelected) {
                this.setState('selected');
            } else {
                this.setState('up');
            }
        }
    });

});