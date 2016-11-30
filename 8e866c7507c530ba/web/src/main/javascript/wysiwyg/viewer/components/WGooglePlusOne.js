/**
 * @class wysiwyg.viewer.components.WGooglePlusOne
 */
define.component('wysiwyg.viewer.components.WGooglePlusOne', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Utils', 'W.Viewer', 'W.Config']);

    def.binds(['_renderComponentOnViewer', '_renderComponentOnEditor', '_rebuildComponent', '_getSizeAccordingToState', '_setComponentSize']);

    def.propertiesSchemaType('WGooglePlusOneProperties');

    def.states({
        'LAYOUT': ['small_bubble','small_none', "small_inline", "medium_bubble", "medium_none", "medium_inline", "standard_bubble", "standard_none", "standard_inline", "tall_bubble", "tall_none", "tall_inline"],
        'VIEWER': ['scriptLoading', 'scriptLoaded', 'loading', 'idle']
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : false
            }
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Utils.hash.addEvent('change', function() {
                // When hash changes we need to update the href property
                this.callRenderLater( 500 );
            }.bind(this));
            this._resizableSides = [];
            this._props = args;
        },

        render: function() {
            this._createClickOverlay(); // will create only once, don't worry.
            this._size = this.getComponentProperty('size');
            this._annotation = this.getComponentProperty('annotation');
            this._renderComponent();
        },

        isDomDisplayReadyOnReady: function(){
            return false;
        },

        _renderComponent : function ()  {
            this.setState(this._size + "_" + this._annotation, "LAYOUT");

            if ( this.resources.W.Config.env.$isPublicViewerFrame || !Browser.ie ){
                this._renderComponentOnViewer();
            }
            else{
                this._renderComponentOnEditor();
            }
        },

        _renderComponentOnEditor: function() {
            this._setComponentSize();
        },

        //TODO: create a trait out of this (used also by comments)
        _renderComponentOnViewer: function () {
            this._view.setStyles({
                background: 'none' // ???
            });

            var currPhase = this.getState("viewer");
            if (!currPhase || currPhase == "") { // first time
                this.setState("scriptLoading","viewer");

                this._loadScript(function() {
                    this.setState("scriptLoaded","VIEWER");
                }.bind(this));

                this.callRenderLater();
                return false;
            }
            if (currPhase == 'loading' || currPhase ==  "scriptLoading" ) {
                this.callRenderLater();
                return false;
            }

            /* if (currPhase == 'scriptLoaded' || currPhase =='idle') */
            this.setState("loading","VIEWER");

            this._rebuildComponent(function() {
                this.setState("idle","VIEWER");
            }.bind(this));
        },

        _rebuildComponent: function ( onBuildFinishedCB ) {
            this._skinParts.googlePlus.empty();

            var googlePlusOneElementProperties = {
                'class': 'googlePlusOne',
                'href': location.href
            };

            if (this._props) {
                googlePlusOneElementProperties = {
                    'size': this._props.size || this._size,
                    'annotation': this._props.annotation || this._annotation,
                    'width': this._props.width || this._view.getWidth()
                };
            } else {
                googlePlusOneElementProperties = {
                    'size': this._size,
                    'annotation': this._annotation,
                    'width': this._view.getWidth()
                };
            }

            this._googlePlusOneElement = new Element('g\\:plusone', googlePlusOneElementProperties);
            this._skinParts.googlePlus.adopt( this._googlePlusOneElement );

            if (window['gapi'] && gapi.plusone && gapi.plusone.go) {
                gapi.plusone.go( this._skinParts.googlePlus );
            }

            this.callLater( this._setComponentSize , null, 100);

            onBuildFinishedCB();

            this._view.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
        },

        _setComponentSize: function() {
            var buttonSize = this._props && this._props.width ? this._props.width : this._getSizeAccordingToState();
            this.setHeight(buttonSize.h);
            this.setWidth(buttonSize.w);
            this._wCheckForSizeChangeAndFireAutoSized(5);
        },

        /*
         built in script from Google, enables google's script
         see: https://developers.google.com/+/plugins/+1button/
         */
        _loadScript: function(onScriptReady) {
            if (!define.getDefinition('resource', 'PlusOneApi')) {
                define.resource('PlusOneApi').withUrls('https://apis.google.com/js/plusone.js');
            }

            resource.getResourceValue('PlusOneApi', onScriptReady);
        },

        _getSizeAccordingToState: function() {
            switch ( this.getState("LAYOUT")) {
                case "small_bubble": return { w: 70, h: 15 };
                case "small_none": return { w: 24, h: 15 };
                case "small_inline": return { w: 250, h: 15 };
                case "medium_bubble": return { w: 90, h: 20 };
                case "medium_none": return { w: 32, h: 20 };
                case "medium_inline": return { w: 250, h: 20 };
                case "standard_bubble": return { w: 106, h: 24 };
                case "standard_none": return { w: 38, h: 24 };
                case "standard_inline": return { w: 250, h: 24 };
                case "tall_bubble": return { w: 50, h: 60 };
                case "tall_none": return { w: 50, h: 20 };
                case "tall_inline": return { w: 250, h: 20 };
            }
        }
    });
});