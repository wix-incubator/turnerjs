define.Class('wysiwyg.editor.components.richtext.WRTEToolbarTrait', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.fields({
        _isFixedToolbar: true
    });

    def.methods({

        initialize: function(compId, viewNode, extraArgs){
            this.parent(compId, viewNode, extraArgs);
            this._isFixedToolbar = extraArgs.isFixedToolbar != false;
        },

        _onAllSkinPartsReady: function() {
            this._skinParts.toolBar.collapse();
            this._skinParts.componentToolBar.collapse();
        },

        _showToolbar: function(){
            this.setToolbarPosition();
            this._skinParts.toolBar.uncollapse();
//            this._skinParts.toolBar.startEditing();
        },

        _hideToolbar: function(){
            this._skinParts.toolBar.collapse();
        },

        _showComponentToolbar: function(componentData){
            this._copyPostion(this._skinParts.toolBar, this._skinParts.componentToolBar);
            this._skinParts.componentToolBar.show(componentData);
        },

        _hideComponentsToolbar: function(){
            this._skinParts.componentToolBar.hide();
            this._showToolbar();
        },

        _copyPostion: function (compFrom, compTo) {
            compTo.$view.setStyles({
                'top': compFrom.$view.getStyle('top'),
                'left': compFrom.$view.getStyle('left')
            });
        },

        _setStylesToToolBar: function(fullMapId) {
            this._skinParts.toolBar.preStartEditing(fullMapId);
        },

        /**
         * to close the drop downs in the toolbar when clicking the editable area
         * @private
         */
        _propagateCkMouseDownToEditor: function(){
            var self = this;
            this._ckEditor.document.$.addEventListener(Constants.CoreEvents.MOUSE_DOWN, function(e) {
                var mousedownEvent = document.createEvent ("MouseEvent");
                mousedownEvent.initMouseEvent (Constants.CoreEvents.MOUSE_DOWN, true, true, window, 0,
                    e.screenX, e.screenY, e.clientX, e.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,0, null);
                self.getViewNode().dispatchEvent(mousedownEvent, {event: mousedownEvent});
            });
        },

        setToolbarPosition: function(){
            if(this._isFixedToolbar){
                var comp = this.getViewNode().getParent();
                var previewPosition = this.resources.W.Preview.getPreviewPosition();
                var compPosition = comp.getPosition();
                compPosition.x = compPosition.x - window.pageXOffset;
                compPosition.y = compPosition.y - window.pageYOffset;
                //this is temp
                var toolBarNode = this._skinParts.toolBar.getViewNode();
                var toolBarSize = this._skinParts.toolBar.getSize();
                var compSize = comp.getSize();
                var top = compPosition.y - toolBarSize.y - 10;
                var left = compPosition.x - 5;
                var screenWidth = $(document).getSize().x;

                var topInCaseOfOutOfTopBound = (compSize.y < 500 ? compPosition.y + compSize.y : previewPosition.y) + 10;
                top = top < previewPosition.y ? topInCaseOfOutOfTopBound : top;
                var isOutOfRightBound = left + toolBarSize.x > screenWidth;
                left = isOutOfRightBound ? screenWidth - toolBarSize.x - 5 : left;
                var isOutOfLeftBound= left < 0;
                left = isOutOfLeftBound ? 5 : left;
                toolBarNode.setStyles({
                    'top': top,
                    'left': left
                });
            }
        },

        _setToolBarArguments: function(defintion) {
            if (this._extraArgs) {
                defintion.argObject = this._extraArgs;
            }
            return defintion;
        }
    });

});
