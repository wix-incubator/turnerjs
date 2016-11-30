/**
 * @Class wysiwyg.editor.components.inputs.Label
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.Label', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.skinParts({
        label: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'icon': ['hasIcon'] });

    /**
     * @lends wysiwyg.editor.components.inputs.Label
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.setParameters(args, false);
        },

        setParameters: function(args, forceRender){
            args = args || {};
            this._styles        = args.styles || null;
            this._labelStyles   = args.labelStyles || null;
            this._spriteSrc     = args.spriteSrc || null;
            this._spriteOffset  = args.spriteOffset || {x:0, y:0};
            this._spriteSize    = args.spriteSize || {width:'16px', height:'16px'};
            if (forceRender) {
                this._renderIfReady();
            }
        },

        render: function(){
            this.parent();
            if (this._styles){
                this._skinParts.view.setStyles(this._styles);
            }
            if (this._labelStyles){
                this._skinParts.label.setStyles(this._labelStyles);
            }

            if (this._spriteSrc) {
                this.setState('hasIcon', 'icon');
                var iconFullPath = this._getIconUrl(this._spriteSrc);
                var x = parseInt(this._spriteOffset.x, 10) + 'px';
                var y = parseInt(this._spriteOffset.y, 10) + 'px';
                this._skinParts.icon.setStyles({
                    'background': 'url(' + iconFullPath + ') no-repeat ' + x + ' ' + y,
                    'width'     : this._spriteSize.width,
                    'height'    : this._spriteSize.height
                });
            }
        },

        _getIconUrl: function (iconPath) {
            // Cover full URLs, URLs with no protocol & image data schemes
            if (iconPath.test(/^(http|\/\/|data\:image)/)) {
                return iconPath;
            }

            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconPath;
        },

        /**
         * @override
         * Set the value of the label
         * @param text The text to set
         */
        setValue: function(text){
            this.setLabel(text);
        },

        /**
         * @override
         * Returns the value of the label
         */
        getValue: function(){
            return this._skinParts.label.get('html');
        },

        /**
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         */
        _changeEventHandler: function(e) {
            this.parent(e);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            //nothing to do
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            //nothing to do
        }
    });
});