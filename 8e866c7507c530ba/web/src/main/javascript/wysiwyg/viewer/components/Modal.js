define.component('wysiwyg.viewer.components.Modal', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_onCloseClick', '_onBlockingLayerClick', '_onViewportResize']);

    def.resources(['W.Commands']);

    def.skinParts({
        'blockingLayer' : {type: 'htmlElement'},
        'close'         : {type: 'htmlElement'},
        'innerComponent': {hookMethod: '_innerComponentDefinition'}
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this.disableBlockLayer = args.disableBlockLayer;
            this._origin = args.innerComponentArgs.argObject.origin;
            this._viewportSize = window.getSize();
            this._innerComponentArgs = args.innerComponentArgs;
            this._innerComponentsize = null;
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this.dispose);
        },

        render: function(){
            this.setSize();

            // calculate margins for centred x or y
            var marginTop = 0,  marginLeft = 0;

            if (this._skinParts.innerComponent.getTop() == '50%') {
                marginTop = this._skinParts.innerComponent.getHeight() / 2;
            }
            if (this._skinParts.innerComponent.getLeft() == '50%') {
                marginLeft = this._skinParts.innerComponent.getWidth() / 2;
            }

            // set inner component and close button positions
            this._setInnerCompPosition(marginTop, marginLeft);
            this._setClosePosition(marginTop, marginLeft);
        },

        _onAllSkinPartsReady: function(parts){
            this.parent();

            window.addEvent(Constants.CoreEvents.RESIZE, this._onViewportResize);
            parts.close.addEvent(Constants.CoreEvents.CLICK, this._onCloseClick);

            if (this.disableBlockLayer) {
                parts.blockingLayer.hide();
            } else {
                parts.blockingLayer.addEvent(Constants.CoreEvents.CLICK, this._onBlockingLayerClick);
            }
        },

        _innerComponentDefinition: function(definition){
            definition.type = this._innerComponentArgs.type;
            definition.skin = this._innerComponentArgs.skin;
            definition.dataItem = this._innerComponentArgs.dataItem || this._data;
            definition.argObject = this._innerComponentArgs.argObject;
            definition.argObject.containingComponent = this;
            return definition;
        },

        _onViewportResize: function(event){
            this._viewportSize = window.getSize();
            this._renderIfReady();
        },

        _onCloseClick: function(){
            this.dispose();
        },

        _onBlockingLayerClick: function(){
            this.dispose();
        },

        _setClosePosition: function(marginTop, marginLeft) {
            var close = this._skinParts.close;
            var closeOffset = close.getSize().x/2;
            var width = this._skinParts.innerComponent.getWidth();
            var height = this._skinParts.innerComponent.getHeight();
            var x = this._skinParts.innerComponent.getX();

            var isLeftPositioned = this._skinParts.innerComponent.getLeft() !== 'auto';
            var isTopPositioned = this._skinParts.innerComponent.getTop() !== 'auto';

            // calculate position, account for centred and origin
            var left    = isLeftPositioned ? (marginLeft ? '50%' : (x + width - closeOffset)) : 'auto';
            var right   = !isLeftPositioned ?  0 : 'auto';
            var top     = isTopPositioned ? (marginTop ? '50%' : 0) : 'auto';
            var bottom  = !isTopPositioned ? (height - closeOffset) : 'auto';

            close.setStyles({
                'left'      : left,
                'right'     : right,
                'top'       : top,
                'bottom'    : bottom,
                'margin-left': marginLeft ? marginLeft - closeOffset : 0,
                'margin-top' : marginTop ? -(marginTop) - closeOffset : 0
            });
        },

        _centerModal: function(){
            var close = this._skinParts.close;
            var closeSize = close.getSize();
            //Center the modal
            var marginLeft = this._skinParts.innerComponent.getWidth() / 2;
            var marginTop = this._skinParts.innerComponent.getHeight() / 2;
            this._skinParts.innerComponent.getViewNode().setStyles({
                'margin-left': -(marginLeft),
                'margin-top' : -(marginTop)
            });
            //Adjust close position
            close.setStyles({
                'left'       : '50%',
                'top'        : '50%',
                'margin-left': marginLeft - closeSize.x/2,
                'margin-top' : -(marginTop) - closeSize.y/2
            });
        },

        setSize: function(){
            var calculatedWidth, calculatedHeight, size, maxSize;

            this._innerComponentsize = this._innerComponentsize || {width: this._skinParts.innerComponent.getWidth(), height: this._skinParts.innerComponent.getHeight()};

            size = this._innerComponentsize;
            maxSize = this._viewportSize;

            calculatedWidth = Math.min(size.width, maxSize.x);
            calculatedHeight = Math.min(size.height, maxSize.y);

            if (this._skinParts.innerComponent.getWidth() != calculatedWidth || this._skinParts.innerComponent.getHeight() != calculatedHeight) {
                this._skinParts.innerComponent.setWidth(calculatedWidth);
                this._skinParts.innerComponent.setHeight(calculatedHeight, false, true);
            }

            this._setClosePosition();
        },

        dispose: function(){
            window.removeEvent(Constants.CoreEvents.RESIZE, this._onViewportResize);
            if (this._skinParts.innerComponent){
                this._skinParts.innerComponent.dispose();
            }
            this.collapse();
            this.parent();
        },

        _setInnerCompPosition: function(marginTop, marginLeft) {
            this._skinParts.innerComponent.getViewNode().setStyles({
                'margin-left': -(marginLeft),
                'margin-top' : -(marginTop)
            });
        }
    });
});
