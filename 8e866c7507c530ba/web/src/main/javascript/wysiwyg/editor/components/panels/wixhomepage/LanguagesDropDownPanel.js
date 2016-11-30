define.component('wysiwyg.editor.components.panels.wixhomepage.LanguagesDropDownPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.resources(['W.Data']);
    def.binds(['_createFields']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            this.resources.W.Data.getDataByQuery("#STYLES", this._createStylePanel);
        }
    });
});
