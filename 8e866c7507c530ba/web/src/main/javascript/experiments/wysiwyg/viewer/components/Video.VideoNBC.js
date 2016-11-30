/**
 * @class wysiwyg.viewer.components.Video
 */
define.experiment.component('wysiwyg.viewer.components.Video.VideoNBC', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');



    def.methods({

        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._iframe = null;
            this.on("resizeEnd",this, this._onResizeEnd);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);

        },
        _onRender:function (renderEvent) {
                var invalidations = renderEvent.data.invalidations;
                this._renderIframe();
               this.setMinW(this._getWMinSize());
               this.setMinH(this._getHMinSize());
                if (invalidations.isInvalidated([ this.INVALIDATIONS.FIRST_RENDER ])) {
                  this._view.on(Constants.DisplayEvents.COLLAPSED,this, this._stopVideo);
                }
        },
        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.FIRST_RENDER,
                this.INVALIDATIONS.SIZE
            ];
            return invalidations.isInvalidated(renderTriggers);
        },
        _onResize:function () {
        },
        /**
         * @override
         * @param value
         */
        setHeight:function (value, forceUpdate, triggersOnResize) {
            this.parent(value, forceUpdate, triggersOnResize);
        },

        /**
         * @override
         * @param value
         */
        setWidth:function (value, forceUpdate, triggersOnResize) {
            this.parent(value, forceUpdate, triggersOnResize);
        },

        _onEditorModeChanged:function (newMode, oldMode) {
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                return;
            }
            if ( newMode === "CURRENT_PAGE") {
                this._stopVideo();
                this._renderIframe();
            }
            var previewMode = "PREVIEW";
            if (oldMode === previewMode || newMode === previewMode) {
                this._renderIframe();
            }
        }
    });

});