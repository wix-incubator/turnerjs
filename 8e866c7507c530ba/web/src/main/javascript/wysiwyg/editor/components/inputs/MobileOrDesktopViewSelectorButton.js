define.component('wysiwyg.editor.components.inputs.MobileOrDesktopViewSelectorButton', function(componentDefinition){
    /**@type core.managers.component.ClassDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.binds(['_fireContentClickEvent']);

    def.states({
        label    : ['hasLabel', 'noLabel'],
        selection: ['selected', 'idle']
    });

    def.skinParts({
        label  : {type: 'htmlElement'},
        icon   : {type: 'htmlElement'},
        content: {type: 'htmlElement'}
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._iconURL = args.iconURL || '';
            this._iconSize = args.iconSize || {width: 0, height: 0};
            //Note: Label is set by BaseInput
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            var iconFullPath = this._getIconUrl(this._iconURL);

            this._skinParts.icon.setStyles({
                'background': 'url(' + iconFullPath + ') no-repeat 50% 50%',
                'width'     : parseInt(this._iconSize.width, 10) + 'px',
                'height'    : parseInt(this._iconSize.height, 10) + 'px'
            });
            this.setWidth(this._iconSize.width + 70);
            this.setHeight(this._iconSize.height + 70);

            this._skinParts.content.addEvent(Constants.CoreEvents.CLICK, this._fireContentClickEvent);

        },

        _fireContentClickEvent: function(e){
            this.fireEvent(Constants.CoreEvents.CLICK, e);
        },

        _getIconUrl: function(iconPath){
            // Cover full URLs, URLs with no protocol & image data schemes
            if (iconPath.test(/^(http|\/\/|data\:image)/)) {
                return iconPath;
            }

            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconPath;
        },

        setSelection: function(selection){
            var selectState = (selection) ? 'selected' : 'idle';
            this.setState(selectState, 'selection');
        },

        _listenToInput: function() {},
        _stopListeningToInput: function(){}
    });
});