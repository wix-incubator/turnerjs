define.component('wysiwyg.editor.components.inputs.LanguageSelection', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.CheckBox');

    def.states({
        'label': ['hasLabel', 'noLabel'],
        selectable : ['selectable','notSelectable']
    });

    def.skinParts({
        label:  {type: 'htmlElement'},
        checkBox: {type: 'htmlElement'},
        icon: {type: 'htmlElement'},
        tooltipArea: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};

            this._iconObj = args.iconObj;
            this._lang = args.lang || en;
        },

        render: function() {
            this.parent();
            this.setIcon(this._iconObj);
        },

        _getIconUrl: function (iconPath) {
            // Cover full URLs, URLs with no protocol & image data schemes
            if (iconPath.test(/^(http|\/\/|data\:image)/)) {
                return iconPath;
            }

            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconPath;
        },

        setIcon: function(iconObj){
            this._skinParts.icon.setStyles({
                'background-image': 'url('+ this._getIconUrl(iconObj.path) +')',
                'background-position': iconObj.position,
                'width': iconObj.width,
                'height': iconObj.height
            });
        },
        getLang: function(){
            return this._lang;
        }
    });
});

