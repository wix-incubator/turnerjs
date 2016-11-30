/**
 * @class wysiwyg.viewer.components.ScreenWidthArea
 */
define.component('wysiwyg.viewer.components.ScreenWidthArea', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        inlineContent: { type: 'htmlElement'},
        background: {type: 'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            }
        }
    });

    def.methods({

        getInlineContentContainer: function () {
            if (this._skinParts.inlineContent) {
                return this._skinParts.inlineContent;
            }
            return this._view;
        },

        getLayoutMode: function () {
            return 'BACKGROUND_STRIP';
        }

    });
});