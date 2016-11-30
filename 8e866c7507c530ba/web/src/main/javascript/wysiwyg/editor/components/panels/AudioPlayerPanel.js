define.component('wysiwyg.editor.components.panels.AudioPlayerPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.traits(['core.editor.components.traits.DataPanel']);

    def.dataTypes(['AudioPlayer']);

    def.binds(['_mediaGalleryCallback']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this,
                cmd = 'WEditorCommands.OpenMediaFrame',
                cmdParam = {
                    galleryConfigID: 'audio',
                    i18nPrefix: 'music',
                    selectionType: 'single',
                    mediaType: 'music',
                    callback: panel._previewComponent._mediaGalleryCallback.bind(panel),
                    commandSource: 'panel'
                };

            this.addInputGroupField(function() {
                this.addButtonField(null, this._translate('AUDIO_REPLACE_AUDIO'), null, null, 'blueWithArrow', null, null, cmd, cmdParam).bindToDataItem(this._data);
            });
            this.addLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'AUDIO_OPTIONS_TEXT'));
            this.addInputGroupField(function() {
                this.addCheckBoxField(this._translate("AUDIOPLAYER_AUTOPLAY")).bindToField("autoPlay");
                this.addCheckBoxField(this._translate("AUDIOPLAYER_LOOP")).bindToField("loop");
                this.addBreakLine('10px', '1px solid #bbb', '10px');
                this.addSliderField(this._translate("AUDIOPLAYER_VOLUME"), 0, 100, 1, false, false).bindToField("volume");
            });

            this.addStyleSelector();
            this.addAnimationButton();
        },

        _mediaGalleryCallback: function(rawData) {
            this._previewComponent._mediaGalleryCallback(rawData);
        }
    });
});
