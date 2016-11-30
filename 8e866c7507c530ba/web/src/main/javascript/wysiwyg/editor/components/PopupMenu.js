define.component('wysiwyg.editor.components.PopupMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.SimpleBaseList');
    def.binds(['_onBodyCloseEvent']);
    def.skinParts({
        itemsContainer: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._closeEvents = [Constants.CoreEvents.BLUR, Constants.CoreEvents.MOUSE_DOWN];
        },

        /* @Override */
        getItemClassName: function () {
            return 'core.components.Button';
        },

        close: function () {
            this._attachBodyEvents(false);
            this.dispose();
        },

        open: function () {
            this._attachBodyEvents(true);
        },

        _renderItems: function (items) {
            this.parent(items, true);
        },

        _onItemReady: function (item, isNew, itemData) {
            var cmd = itemData && itemData['command'];
            if (cmd) {
                item.setCommand(cmd);
            }
            item.setLabel(itemData['label']);
        },

        _onBodyCloseEvent: function () {
            this.close();
        },

        _attachBodyEvents: function (attach) {
            var body = window; //$$('body');
            var handler = this._onBodyCloseEvent;
            this._closeEvents.forEach(function (evt) {
                if (attach) {
                    body.addEvent(evt, handler);
                }
                else {
                    body.removeEvent(evt, handler);
                }
            });
        }
    });
});
