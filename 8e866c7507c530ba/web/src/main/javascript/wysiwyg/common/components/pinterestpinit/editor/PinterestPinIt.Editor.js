define.component('Editor.wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt', function(componentDefinition, strategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.helpIds({
        componentPanel: '/node/18019'
    });

    def.traits([
        'wysiwyg.viewer.components.traits.CustomPreviewBehavior'
    ]);

    def.panel({
        logic: 'wysiwyg.common.components.pinterestpinit.editor.PinterestPinItPanel',
        skin: 'wysiwyg.common.components.pinterestpinit.editor.skins.PinterestPinItPanelSkin'
    });

    def.styles(1);

    def.binds(['_mediaGalleryCallback']);

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            custom: [
                {
                    label: 'PinterestPinIt_selectImage',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        openCommand: 'FPP',
                        galleryConfigID: 'photos',
                        publicMediaFile: 'photos',
                        selectionType: 'single',
                        i18nPrefix: 'single_image',
                        mediaType: 'picture',
                        callback: "_mediaGalleryCallback"
                    }
                }
            ]
        }
    });

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args){
            this._resizableSides = [];
        }),

        _onRender: function(ev){
            var invalidations = ev.data.invalidations;

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])){
                this._firstRender(invalidations);
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])){
                this._onDataChange(invalidations);
            }

            this._createClickOverlayForPreviewMode('Social_Widgets_Only_On_Public');

            if (this._haveRequiredData()) {
                this._createClickOverlayForPreviewMode('Social_Widgets_Only_On_Public');
            } else {
                this._createClickOverlayForPreviewMode('PinterestPinIt_noImage');
            }
        },

        _onDataChange: function(invalidations){
            var changedData = this._getChangedData(invalidations);

            if (this._isChangedIn(changedData, 'size') || this._isChangedIn(changedData, 'counterPosition')){
                this._changeIframeDimensions();
            }

            this._changeIframe();
        },

        _getChangedData: function(invalidations){
            var changedData = invalidations.getInvalidationByType('dataChange'),
                data = {},
                changed;


            changedData.forEach(function(item){
                changed = item.value;

                if (changed){
                    for (var p in changed){
                        if (changed.hasOwnProperty(p)){
                            data[p] = changed[p];
                        }
                    }
                }
            });

            return data;
        },

        _isChangedIn: function(changedData, p){
            return changedData.hasOwnProperty(p);
        },

        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().set('uri', rawData.uri);
        }
    });
});