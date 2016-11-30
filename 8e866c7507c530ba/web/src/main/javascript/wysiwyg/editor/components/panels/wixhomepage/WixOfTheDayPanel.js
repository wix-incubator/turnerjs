define.component('wysiwyg.editor.components.panels.wixhomepage.WixOfTheDayPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.utilize([]);
    def.binds(['_createFields']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.dataTypes(['Image']);
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this;

            this.addInputGroupField(function () {
                this.addImageField(null, null, null, this.injects().Resources.get('EDITOR_LANGUAGE', 'PHOTO_REPLACE_IMAGE'), panel._galleryConfigName, false).bindToDataItem(this._data);
            });

            this.addInputGroupField(function () {
                this.addInputField(this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_DESCRIPTION'), null, null, 1000, null, null, null).bindToField('description');
                this.addInputField(this.injects().Resources.get('EDITOR_LANGUAGE', 'PHOTO_ALT_TEXT'), null, null, 256, null, null, null).bindToField('alt');

                var lbl = this.injects().Resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO');
                var plcHldr = 'http://www.wix.com';
                this.addLinkField(lbl, plcHldr).bindToDataItem(this.getDataItem());
            });

            this.injects().Data.getDataByQuery("#STYLES", this._createStylePanel);
        }
    });
});
