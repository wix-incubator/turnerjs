define.component('wysiwyg.common.components.singleaudioplayer.editor.SingleAudioPlayerPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.resources(['W.Resources']);

    def.binds(['_mediaGalleryCallback']);

    def.dataTypes(['SingleAudioPlayer']);

    def.skinParts({
        addTrackButton: {
            type: Constants.PanelFields.AudioField.compType,
            argObject: {
                labelText: 'TRACK_SOURCE',
                buttonText: 'AUDIO_REPLACE_AUDIO',
                buttonTextWhenNoSelectedItem: 'AUDIO_REPLACE_AUDIO',
                defaultEmptyItemText: 'AUDIO_NO_ITEM_TEXT',
                label: 'AUDIO_REPLACE_AUDIO',
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    commandSource: 'panel',
                    galleryConfigID: 'audio',
                    i18nPrefix: 'music',
                    selectionType: 'single',
                    mediaType: 'music'
                }
            },
            bindToData: '*',
            bindHooks: ['_inputToData', '_dataToInput'],
            hookMethod: '_bindGalleryCallback'
        },
        trackName: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'AUDIOPLAYER_TRACK',
                maxLength: '128',
                validatorArgs: {validators: ['htmlCharactersValidator']}
            },
            bindToData: 'track'
        },
        artistName: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'AUDIOPLAYER_ARTIST',
                maxLength: '128',
                validatorArgs: {validators: ['htmlCharactersValidator']}
            },
            bindToData: 'artist'
        },
        trackSettings: {
            type: Constants.PanelFields.SubLabel.compType,
            argObject: {labelText: 'AUDIOPLAYER_TRACK_SETTINGS'}
        },
        autoplay: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'AUDIOPLAYER_AUTOPLAY'},
            bindToProperty: 'autoplay',
            hideOnMobile: true
        },
        loop: {
            type: Constants.PanelFields.CheckBox.compType,
            argObject: {labelText: 'AUDIOPLAYER_LOOP'},
            bindToProperty: 'loop',
            hideOnMobile: true
        },
        volume: {
            type: Constants.PanelFields.Slider.compType,
            argObject: {labelText: 'AUDIOPLAYER_VOLUME'},
            bindToProperty: 'volume',
            hideOnMobile: true
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'FPP_ADD_ANIMATION_LABEL'}
        }
    });

    def.methods({
        _inputToData: function (rawData) {
            return rawData;
        },

        _dataToInput: function (rawData) {
            var fileName = rawData.originalFileName ? decodeURI(rawData.originalFileName.replace(/[+]/g, ' ')) : this.resources.W.Resources.get('EDITOR_LANGUAGE', 'AUDIO_NO_ITEM_TEXT', 'No mp3 file selected');
            return {
                originalFileName: fileName,
                uri: rawData.uri
            };
        },

        _bindGalleryCallback: function (definition) {
            definition.argObject.commandParameter.callback = this._mediaGalleryCallback;

            return definition;
        },

        _mediaGalleryCallback: function (rawData) {
            this._previewComponent._mediaGalleryCallback(rawData);
        }
    });
});
