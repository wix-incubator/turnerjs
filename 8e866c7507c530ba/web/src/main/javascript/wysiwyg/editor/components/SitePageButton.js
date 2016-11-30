define.component('wysiwyg.editor.components.SitePageButton', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.editor.components.SitePageControllerBtn');

    def.skinParts({
        label: {type: 'htmlElement', autoBindData: 'title'},
        menu: {type: 'htmlElement'},
        drag: {type: 'htmlElement'}
    });

    def.methods({
        _pageSettingsCallback: function (callback) {
            this._skinParts.menu.addEvent(Constants.CoreEvents.CLICK, callback);
        },

        _registerDragHandler: function (handler) {
            this._skinParts.drag.addEvent(Constants.CoreEvents.MOUSE_DOWN, handler);
        },

        _onAllSkinPartsReady: function () {
            this._addToolTipToSkinPart(this._skinParts.menu, 'Pages_Symbol_ttid');
        }
    });

});
