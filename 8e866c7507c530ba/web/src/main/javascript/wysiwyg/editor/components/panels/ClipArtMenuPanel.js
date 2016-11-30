/**
 * @Class wysiwyg.editor.components.panels.ClipArtMenuPanel
 * @extends wysiwyg.editor.components.panels.WPhotoMenuPanel
 */
define.component('wysiwyg.editor.components.panels.ClipArtMenuPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.WPhotoMenuPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    /**
     * @lends wysiwyg.editor.components.panels.ClipArtMenuPanel
     */
    def.methods({
        initialize: function (compId, viewNode, args) {
            args.galleryConfigName = "clipart";
            this.parent(compId, viewNode, args);
        },

        _createFields: function () {
            var panel = this,
                res = this.injects().Resources;

            this.addInputGroupField(function () {
                var changeImageCaption = this._translate('CLIP_ART_REPLACE_IMAGE');
                this.addImageField(null, null, null, changeImageCaption, panel._galleryConfigName, false, null, null, null, 'clipart', 'clipart', panel._mediaGalleryCallback, null, 'panel', null, 'free').bindToDataItem(this._data);
            });

            var aspectRatioGroup = this.addInputGroupField(function () {
                var caption = this._translate('CLIP_ART_MAINTAIN_ASPECT_RATIO');
                this.addCheckBoxField(caption).
                     bindToProperty('displayMode').
                     bindHooks(
                         panel._aspectRatioToDisplayMode,
                         panel._displayModeToAspectRatio
                     );
            });

            this.addInputGroupField(function () {
                var caption = this._translate('LINK_LINK_TO'),
                    placeholder = this._translate('LINK_ADD_LABEL');

                this.addLinkField(caption, placeholder).bindToDataItem(this.getDataItem());
            });

            this.addAnimationButton();
        },
        _mediaGalleryCallback: function (rawData) {
            this._previewComponent._mediaGalleryCallback(rawData);
        },
        _displayModeToAspectRatio: function (displayMode) {
            return displayMode === 'full';
        },
        _aspectRatioToDisplayMode: function (checked) {
            return checked ? 'full' : 'stretch';
        }
    });
});
