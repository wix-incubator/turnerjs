define.component('wysiwyg.editor.components.panels.LinkBarPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.traits(['core.editor.components.traits.DataPanel']);

    def.propertiesSchemaType('LinkBarProperties');

    def.dataTypes(['ImageList']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {

            var thisPanel = this;

            this.addInputGroupField(function () {
                var galleryType = this._previewComponent.getComponentProperty('gallery') || 'clipart';
                this.addListEditorButton(this.injects().Resources.get('EDITOR_LANGUAGE', 'SOCIAL_BAR_MNG_ICONS'), thisPanel._data, galleryType, 'free');
            });

            this.addInputGroupField(function () {
                this.addSliderField(this.injects().Resources.get('EDITOR_LANGUAGE', 'SOCIAL_BAR_ICON_SIZE'), 16, 128, 1, false /* show numbers */, false /*update on end */).bindToProperty('iconSize');
                this.addSliderField(this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_SPACING'), 1, 50, 1, false, false).bindToProperty('spacing');

                this.addComboBoxField(this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_LAYOUT'), [
                    {label: this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_HORIZONTAL'), value: 'HORIZ'},
                    {label: this.injects().Resources.get('EDITOR_LANGUAGE', 'GENERAL_VERTICAL'), value: 'VERT'}
                ], 'HORIZ', 2).bindToProperty('orientation');
            });

            this.addAnimationButton();
        }
    });
});