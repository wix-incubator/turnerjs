define.component('wysiwyg.editor.components.AppMarketTab', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.resources(['W.Commands', 'W.TPAEditorManager', 'W.Preview']);

    def.skinParts({
        bubble: {type: 'htmlElement'}
    });

    // Include also states from WButton since there is no extension of states //TODO Check if can be extended
    def.states({
        'DEFAULT': ['up', 'over', 'selected', 'pressed'],
        'icon': ['hasIcon', 'noIcon'],
        'labelVisibility': ["showLabel", "hideLabel"],
        'FirstTimeUser': [
            'showPreview',
            'hidePreview'
        ],
        'FirstInteraction': [
            'hovered'
        ],
        'AppMarketTab': ['hasBubble']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.UpdateAppMarketBubble', this, this._setBubbleCount);
        },

        /*
         * Sets the bubble's value with the given number.
         */
        _setBubbleCount: function (number) {
            if (number > 0) {
                this._skinParts.bubble.innerHTML = number;
                this.setState('hasBubble', 'AppMarketTab');
            } else {
                this.removeState('hasBubble', 'AppMarketTab');
            }
        },

        render: function () {
            var preview = this.resources.W.Preview.getPreviewManagers();
            if (preview) {
                this.resources.W.TPAEditorManager.updateAppMarketBubbleCount();
            }

            this.parent();
        }
    });
});

