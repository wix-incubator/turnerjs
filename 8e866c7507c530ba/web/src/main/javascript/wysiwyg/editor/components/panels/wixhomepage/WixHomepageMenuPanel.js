define.component('wysiwyg.editor.components.panels.wixhomepage.WixHomepageMenuPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.binds(['_createFields']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['WixHomepageMenu']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            this.addInputGroupField(function (panel) {
                this.addComboBox("Menu Data").bindToField('menuDataSource');

            });
            this.injects().Data.getDataByQuery("#STYLES", this._createStylePanel);
        }
    });


});
