define.component('wysiwyg.editor.components.ColorSetSelector', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.SimpleBaseList');

    def.skinParts({
        itemsContainer: {type: 'htmlElement'}
    });

    def.methods({/**
     * This constructor tries to implement a singleton state by disposing of the previous instance of this class
     * @param compId
     * @param viewNode
     * @param args
     */
    initialize: function (compId, viewNode, args) {
        var cns = this.initialize;
        if (cns._instance) {
            cns._instance.dispose();
        }
        cns._instance = this;
        this.parent(compId, viewNode, args);
    },

        dispose: function () {
            var cns = this.initialize;
            if (cns._instance == this) {
                cns._instance = null;
            }
            this.parent();
        },


        /* @Override */
        getItemClassName: function () {
            return 'core.components.Button';
        },

        _renderItems: function (items) {
            this.parent(items, true);
        },

        _onItemReady: function (item, isNew, itemData) {
            item.setParameters({
                label: itemData.label,
                iconSrc: this.injects().Theme.getProperty("WEB_THEME_DIRECTORY") + 'icons/' + itemData.icon
            });
            item.setCommand(this._command, itemData.id);
        }});

});
