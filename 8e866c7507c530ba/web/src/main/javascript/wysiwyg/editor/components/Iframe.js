/**@type core.components.BaseComponent */
define.component('wysiwyg.editor.components.Iframe', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        iframe: {type: 'htmlElement'}
    });

    def.states({
        hidden: ['hidden', 'visible']
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._height = args.height || "100%";
        },

        _onAllSkinPartsReady: function(){
            this._skinParts.iframe.setAttribute('height', this._height);
            this._skinParts.iframe.setStyle('height', this._height);
            this._skinParts.view.setStyle('height', this._height);
            this._skinParts.iframe.setAttribute('width', '100%');
        },

        setUrl: function(url){
            this.url = url;
            this._skinParts.iframe.setAttribute('src', url);
        },

        _changeSize: function(size, triggerOnResize){
            var elemWidth  = size.x || size.w || size.width;
            var elemHeight = size.y || size.h || size.height;

            if (elemWidth){
                this.setWidth(elemWidth, false, (!elemHeight && triggerOnResize));
                this._skinParts.iframe.setStyle("width", elemWidth + "px");
            }
            if (elemHeight){
                this.setHeight(elemHeight, false, triggerOnResize);
                this._skinParts.iframe.setStyle("height", elemHeight + "px");
            }

            this._wCheckForSizeChangeAndFireAutoSized(0);
        },

        getIFrame: function() {
            return this._skinParts.iframe;
        }
    });
});