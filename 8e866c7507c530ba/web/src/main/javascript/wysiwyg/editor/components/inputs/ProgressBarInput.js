define.component('wysiwyg.editor.components.inputs.ProgressBarInput', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.skinParts({
        label: {type: 'htmlElement'},
        progress: {type: 'htmlElement'}
    });

    def.states(
        {'label': ['hasLabel', 'noLabel']}
    );

    def.methods({

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._color = args.color || '#000';
            this._bgImage = args.bgImage || null;
            this._height = args.height || 2;
            this._percentWidth = this._normalizeProgress(args.initialPercent);

        },

        render: function () {
            this.parent();
            this.setParameters(this._color, this._bgImage, this._height, this._percentWidth);

        },

        setParameters:function(color, bgImage, height, percentWidth){
            var image;
            this._skinParts.progress.setStyles({
                'height': height,
                'width': this._normalizeProgress(percentWidth) + '%',
                'background-color': color
            });

            if (this._bgImage){
                image = this._getIconUrl(this._bgImage);
                this._skinParts.progress.setStyle('background', this._color + ' ' + 'url(' + image + ') repeat  0 0');
            }
        },

        /**
         * @override
         * Set the value of the input field
         * @param text The text to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue: function (progress) {
            this._percentWidth = this._normalizeProgress(progress);
            this._renderIfReady();
        },

        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        getValue: function () {
            return this._percentWidth;
        },

        _normalizeProgress: function(progress){
            return parseInt(progress, 10) % 101 || 0;
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
         * Assign change events
         */
        _listenToInput: function () {
            //Do nothing
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function () {
            //Do nothing
        }
    });
});

