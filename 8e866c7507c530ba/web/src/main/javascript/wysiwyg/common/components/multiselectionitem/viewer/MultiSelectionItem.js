define.component('wysiwyg.common.components.multiselectionitem.viewer.MultiSelectionItem', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('MultiSelectionItemProperties');

    def.dataTypes(['SelectOption']);

    def.binds(['_onWixified']);

    def.skinParts({
        text: {type: 'htmlElement'},
        button: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.on(Constants.ComponentEvents.WIXIFIED, this, this._onWixified);
        },

        _onWixified: function () {
            this._skinParts.text.innerHTML = this.getDataItem().get('text');
            this._skinParts.button.on('click', this, this._onBtnClick);
        },

        _onBtnClick: function () {
            this.trigger('removeItem', {comp: this});
        },

        getValue: function () {
            return this.getDataItem().get('value');
        }
    });
});
