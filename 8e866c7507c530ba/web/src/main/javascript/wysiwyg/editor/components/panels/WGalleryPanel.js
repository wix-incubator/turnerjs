/**
 * created by Omri
 * Date: 1/5/12
 * Time: 8:48 PM
 */
define.component('wysiwyg.editor.components.panels.WGalleryPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['ImageList']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            this.addListEditorButton('Manage Photos', this._data);
        }
    });
});
