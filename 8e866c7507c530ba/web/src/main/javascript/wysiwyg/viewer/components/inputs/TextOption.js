define.component('wysiwyg.viewer.components.inputs.TextOption', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'size':{type:"htmlElement"},
        'tooltip':{type:'wysiwyg.common.components.InfoTip'}
    });

    def.traits(['wysiwyg.common.components.traits.SelectableOption']);

    def.states({
        'selectState':['selected', 'unselected'],
        'enabledState':['enabled', 'disabled']
    });

    def.dataTypes(["SelectOption"]);

    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);

            this.setSelected(false);
        },
        _onAllSkinPartsReady:function () {
            var size = this._skinParts.size;
            size.set('text', this.getDataItem().get('text'));
            this._initializeTooTip(this.getViewNode());
        },

        _initializeTooTip:function (option) {
            var tooltip = this._skinParts.tooltip;
            var toolTipText = this.getDataItem().get('description');
            if (toolTipText && toolTipText.trim().length > 0) {
                option.addEvent('mouseenter', function () {
                    tooltip._showToolTipCmd({id:1, content:toolTipText}, {source:option});
                });
                option.addEvent('mouseleave', function () {
                    tooltip._closeToolTipCmd();
                });
            }
        },

        _onDataChange:function (dataItem, field, value) {
            this.setEnabled(this.getDataItem().get('enabled'));
        },

        setSelected:function (isSelected) {
            this.setState(isSelected ? 'selected' : 'unselected', 'selectState');
        },

        setEnabled:function (isEnabled) {
            this.setState(isEnabled ? 'enabled' : 'disabled', 'enabledState');
        }
    });

});
