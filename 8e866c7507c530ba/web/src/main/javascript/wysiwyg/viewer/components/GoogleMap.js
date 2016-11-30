/**@class wysiwyg.viewer.components.GoogleMap */
define.component('wysiwyg.viewer.components.GoogleMap', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['topology']);

    def.skinParts({
        'mapContainer':{ type:'htmlElement' }
    });

    def.states(['normal', 'error']);

    def.dataTypes(['GeoMap']);

    def.propertiesSchemaType('GoogleMapProperties');

    def.fields({
        _renderTriggers:[
            Constants.DisplayEvents.MOVED_IN_DOM,
            Constants.DisplayEvents.ADDED_TO_DOM,
            Constants.DisplayEvents.DISPLAYED,
            Constants.DisplayEvents.DISPLAY_CHANGED],

        MIN_SIZE:130
    });

    /**
     * @lends wysiwyg.viewer.components.GoogleMap
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this.iframeCreated = false;
            W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);
            this.addEvent("resizeEnd", this._renderGoogleMapsIframe);
        },

        _onEditorModeChanged:function (newMode, oldMode) {
            if (oldMode === "PREVIEW" && newMode === "CURRENT_PAGE") { // switching back to editor
                this.render();
            }
        },

        render:function () {
            this._renderGoogleMapsIframe();
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _renderGoogleMapsIframe: function () {
            if (!this.isReady()) {
                return;
            }
            if (!this.iframeCreated || !this._skinParts.mapContainer.hasChildNodes()) {  // If no iframe, create it
                this._createIframe();
                this.iframeCreated = true;
            } else {
                // Else update url (if changed) and dimensions / other properties of the iframe
                this._updateIframe();
            }
        },

        _createIframe:function () {
            var iframe = new IFrame({
                src: this.resources.topology.wysiwyg + '/html/external/googleMap.html',
                width:'100%',
                height:'100%',
                webkitAllowFullScreen:'true',
                mozallowfullscreen:'true',
                allowfullscreen:'allowfullscreen',
                frameBorder:'0',
                events:{
                    load:function () {
                        this._updateIframe();
                    }.bind(this)
                }
            });

            this._iframe = iframe;
            this._skinParts.mapContainer.empty();
            this._skinParts.mapContainer.grab(iframe);
        },

        _updateIframe:function () {
            var googleMapInfoJson = {
                address:this._data.get("address"),
                addressInfo:this._data.get("addressInfo"),
                mapType:this.getComponentProperty("mapType"),
                mapDragging:this.getComponentProperty("mapDragging"),
                showZoom:this.getComponentProperty("showZoom"),
                showPosition:this.getComponentProperty("showPosition"),
                showStreetView:this.getComponentProperty("showStreetView"),
                showMapType:this.getComponentProperty("showMapType"),
                latVal:this._data.get("latitude"),
                longVal:this._data.get("longitude")
            };

            this._iframe.contentWindow.postMessage(JSON.stringify(googleMapInfoJson), "*");
        }
    });
});

