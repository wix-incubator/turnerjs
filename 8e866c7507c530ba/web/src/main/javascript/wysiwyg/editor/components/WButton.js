define.component('wysiwyg.editor.components.WButton', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.Button');

    def.traits(['wysiwyg.common.components.traits.SelectableButton']);

    def.dataTypes(['', 'Button', 'ButtonWithIcon']);

    def.skinParts({
        icon: {'type': 'htmlElement', optional: 'true'},
        label: {'type': 'htmlElement'}
    });
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
        ]
    });
    def.fields({
        _triggers: ['click'],
        _spriteOffset: {x: '50%', y: '50%'},
        _minWidth: 0,
        _iconSize: null,
        _labelPrefix: ''
    });
    def.methods({
        initialize: function (compId, viewNode, args) {
            this._replaceLanguageKey(args);
            this.parent(compId, viewNode, args);
        },

        _onDataChange: function(dataObj, field, value) {
            if(dataObj){
                this._spriteOffset =  dataObj.get("spriteOffset") || this._spriteOffset;
                this._iconSize =  dataObj.get("iconSize") || this._iconSize;
            }

            this.parent(dataObj, field, value);
        },

        _replaceLanguageKey: function (args) {
            if (args && args.label && args.labelType === 'langKey' && this.injects().Resources) {
                args.label = this.injects().Resources.get('EDITOR_LANGUAGE', args.label, args.label);
            }
        },

        /**
         * @override
         */
        render: function () {
            this._setPreDefinedCommand();

            this._renderLabel();

            if (this._skinParts.icon) {
                this._renderIcon();
            }
        },

        modifyLabelPrefix: function(labelPrefix) {
            this._labelPrefix = labelPrefix;
            this._renderLabel();
        },

        _renderLabel: function(){
            this._skinParts.label.set('html', (this._labelPrefix || '') + (this._label || ''));
            this._skinParts.label.setStyle('min-width', parseInt(this._minWidth, 10) + 'px');
        },

        _renderIcon: function(){
            if (this._iconSrc) {
                var iconFullPath = this._getIconUrl(this._iconSrc);

                if (!isNaN(this._spriteOffset.x)) {
                    this._spriteOffset.x += 'px';
                }
                if (!isNaN(this._spriteOffset.y)) {
                    this._spriteOffset.y += 'px';
                }

                var bgString = [
                    'url(' + iconFullPath + ')',
                    'no-repeat',
                    this._spriteOffset.x,
                    this._spriteOffset.y
                ].join(' ');

                this._skinParts.icon.setStyle('background', bgString);
                this._skinParts.icon.uncollapse();
                this.setState('hasIcon');
            } else {
                this._skinParts.icon.setStyle('background', '');
                this._skinParts.icon.collapse();
                this.setState('noIcon');
            }

            if(this._iconSize){
                if (this._iconSize.width && !isNaN(this._iconSize.width)) {
                    this._iconSize.width += 'px';
                }
                if (this._iconSize.height && !isNaN(this._iconSize.height)) {
                    this._iconSize.height += 'px';
                }

                if(this._iconSize.width && this._iconSize.height){
                    this._skinParts.icon.setStyles({
                        width: this._iconSize.width,
                        height: this._iconSize.height,
                        marginTop: (Math.floor(parseInt(this._iconSize.height, 10) / 2) * (-1)) + 'px'
                    });
                    this._skinParts.label.setStyle('margin-left', this._iconSize.width);
                } else if(this._iconSize.width){
                    this._skinParts.icon.setStyles({
                        width: this._iconSize.width
                    });
                    this._skinParts.label.setStyle('margin-left', this._iconSize.width);
                } else {
                    this._skinParts.icon.setStyles({
                        height: this._iconSize.height,
                        marginTop: (Math.floor(parseInt(this._iconSize.height, 10) / 2) * (-1)) + 'px'
                    });
                }


            }
            if (this._iconSize && this._iconSize.width && this._iconSize.height) {
                if (!isNaN(this._iconSize.width)) {
                    this._iconSize.width += 'px';
                }
                if (!isNaN(this._iconSize.height)) {
                    this._iconSize.height += 'px';
                }
                this._skinParts.icon.setStyles({
                    width: this._iconSize.width,
                    height: this._iconSize.height,
                    marginTop: (Math.floor(parseInt(this._iconSize.height, 10) / 2) * (-1)) + 'px'
                });
                this._skinParts.label.setStyle('margin-left', this._iconSize.width);
            }
        },

        _getIconUrl: function (iconPath) {
            // Cover full URLs, URLs with no protocol & image data schemes
            if (iconPath.test(/^(http|\/\/|data\:image)/)) {
                return iconPath;
            }

            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconPath;
        },

        setIcon: function (src, size, spriteOffset) {
            this._iconSrc = src;
            this._iconSize = size;
            this._spriteOffset = spriteOffset || {x: '50%', y: '50%'};

            this._renderIfReady();
        },

        setMinWidth: function (width) {
            this._minWidth = width;
            this._renderIfReady();
        },

        setFocus: function () {
            this._view.focus();
        },

        setParameters: function (args) {
            args = args || {};
            this._spriteOffset = args.spriteOffset || this._spriteOffset;
            this._minWidth = args.minWidth || this._minWidth;
            this._iconSize = args.iconSize || this._iconSize;
            this._labelPrefix = args.labelPrefix || '';
            this.parent(args);
        },

        _onClick: function(e){
            if (this.isEnabled()){

                e = e || {};
                e.target = this.getViewNode();
                this.fireEvent(Constants.CoreEvents.CLICK, e);
                this.trigger(Constants.CoreEvents.CLICK, e);

                if (this._toggleMode){
                    var state = (!this.getState().contains('selected')) ? 'selected' : 'over';
                    this.setState(state);
                }
            }
        }
    });

});
