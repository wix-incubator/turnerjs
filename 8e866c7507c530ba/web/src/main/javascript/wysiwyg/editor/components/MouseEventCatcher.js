define.component('wysiwyg.editor.components.MouseEventCatcher', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Preview', 'W.Editor', 'W.Config', 'W.Utils']);

    def.binds(['_mouseDownHandler', '_onPreviewResized']);

    def.skinParts({
        catcher:{ 'type':'htmlElement'}
    });

    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Preview.addEvent('previewResized', this._onPreviewResized);
        },

        _onRender:function (renderEvent) {
            this.parent(renderEvent) ;
            this.initMouseEventsProxy();
        },

        _onPreviewResized:function (newSize) {
            var extra = 100;
            var heightIncludingExtra = newSize + extra;
            this._skinParts.catcher.setStyle('height', heightIncludingExtra);
        },

        initMouseEventsProxy:function () {
            this._skinParts.catcher.addEvent("mousedown", this._mouseDownHandler);
            this._skinParts.catcher.addEvent("contextmenu", this._handleRightClick);

        },

        _handleRightClick: function(event){
            if (!window.enableRightClickContextMenu){
                return false;
            }
        },

        _mouseDownHandler:function (event) {
            var component = this.resources.W.Preview.componentFromGlobalCoordinates(event.client.x, event.client.y, W.Preview.selectionFilter);
            this.resources.W.Editor.handleComponentClicked(component, event);
        }

    });
});