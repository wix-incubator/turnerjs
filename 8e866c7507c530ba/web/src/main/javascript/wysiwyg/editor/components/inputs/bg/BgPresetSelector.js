/**
 * @Class wysiwyg.editor.components.inputs.bg.BgPresetSelector
 * @extends mobile.core.components.base.BaseComponent
 */
define.component('wysiwyg.editor.components.inputs.bg.BgPresetSelector', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.skinParts({
        background: {type: 'htmlElement'},
        image: {type:'core.components.Image', argObject: {cropMode: 'fill'} },
        label: {type: 'htmlElement'}
    });

    def.dataTypes(['list', '']);

    /**
     * @lends wysiwyg.editor.components.inputs.bg.BgPresetSelector
     */
    def.methods({
        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;
            this._imageData = {
                type: 'Image',
                uri:args.thumbnail,
                width: 60,
                height: 50,
                title: '',
                borderSize: '',
                description: ''
            };
            this._bgColor = null;
            this._index = args.index;
        },

        getIndex: function() {
            return this._index+1;
        },

        _onAllSkinPartsReady : function() {
            this._skinParts.image.setDataItem(this.injects().Data.createDataItem(this._imageData));
        },

        _listenToInput:function(){
            this._view.addEvent('click', this._changeEventHandler);
        },

        _stopListeningToInput:function(){
            this._view.removeEvent('click', this._changeEventHandler);
        }
    });
});
