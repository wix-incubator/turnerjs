define.Class('wysiwyg.common.components.traits.SelectableOption', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    def.statics({
        ITEM_SELECTED_EVENT:'itemSelected'
    });

    def.fields({
        _isSelected:false
    });

    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.getViewNode().addEvent('click', function () {
                this.fireEvent(this.ITEM_SELECTED_EVENT, this);
            }.bind(this));
        },
        setSelected:function (isSelected) {
            this._isSelected = isSelected;
        }
    });

});
