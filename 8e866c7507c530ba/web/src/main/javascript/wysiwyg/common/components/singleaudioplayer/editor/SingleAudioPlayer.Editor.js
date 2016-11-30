define.component('Editor.wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.binds(strategy.merge([
        '_mediaGalleryCallback'
    ]));

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            custom: [
                {
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        galleryConfigID: 'audio',
                        i18nPrefix: 'music',
                        selectionType: 'single',
                        mediaType: 'music',
                        callback: '_mediaGalleryCallback'
                    },
                    commandParameterDataRef: 'SELF',
                    label: 'AUDIO_REPLACE_AUDIO'
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    commandSource: 'dblClick',
                    galleryConfigID: 'audio',
                    i18nPrefix: 'music',
                    selectionType: 'single',
                    mediaType: 'music',
                    callback: '_mediaGalleryCallback'
                },
                commandParameterDataRef: 'SELF'
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.panel({
        logic: 'wysiwyg.common.components.singleaudioplayer.editor.SingleAudioPlayerPanel',
        skin: 'wysiwyg.common.components.singleaudioplayer.editor.skins.SingleAudioPlayerPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/20997',
        advancedStyling: '',
        chooseStyle: ''
    });

    def.resources(strategy.merge(['W.Data']));

    def.methods({
        initialize: strategy.after(function (compId, viewNode, args) {
            this._resizableSides = [
                Constants.BaseComponent.ResizeSides.LEFT,
                Constants.BaseComponent.ResizeSides.RIGHT
            ];
        }),

        _onRender: strategy.before(function (renderEvent) {
            this._recoverAbsentStyle();
        }),

        _recoverAbsentStyle: function () {
            var self = this,
                skinName;

            if (this.getSkinMapper()) {
                return;
            }

            skinName = this.getSkin().className;

            // NOTE: Here we introduce a fictious style, because all corrupted
            //       components do not use SingleAudioPlayer_1 style in reality.
            //       So if SingleAudioPlayer_1 was customized before, and here we
            //       apply it to the player, component may change its appearance
            //       without user's consent. SingleAudioPlayer_Fix helps to avoid this.
            W.Theme.getStyle('SingleAudioPlayer_Fix', function (style) {
                self.setSkinMapper(style);
            }, skinName);
        },

        _isEditModeChangeToFromPreview: function (mode, oldMode) {
            return mode === 'PREVIEW' || (oldMode && oldMode.source === 'PREVIEW');
        },

        _mediaGalleryCallback: function (rawData) {
            var artist = this.getDataItem()._schema.artist['default'],
                track = this.getDataItem()._schema.track['default'];

            if (rawData) {
                this.getDataItem().setFields({
                    uri: rawData.uri,
                    originalFileName: rawData.title,
                    artist: artist,
                    track: track
                });
            }

            this._logChangeMediaSuccess();
        },
        _logChangeMediaSuccess: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        }
    });
});
