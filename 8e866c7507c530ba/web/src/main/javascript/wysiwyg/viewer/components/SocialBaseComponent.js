
/**
 * @class wysiwyg.viewer.components.SocialBaseComponent
 */
define.component('wysiwyg.viewer.components.SocialBaseComponent', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.IFrameComponent');

    def.resources(['W.Config', 'topology']);

    def.binds(['_createClickOverlay', '_getUrl']);

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode);
            this._resizableSides = [];
            if (args && args.propObj) {
                for ( var propName in args.propObj) {
                    var propValue = args.propObj[propName];
                    this.setComponentProperty(propName, propValue);
                }
            }
            this._iframeCallback = 0;
        },

        _onResize: function() {
            if(this._initialized){
                this._renderIframe();
            }
        },

        render: function() {
            this._createClickOverlay(); // will create only once, don't worry.
            this._renderComponent();
            this._initialized = true;
        },

        _renderComponent: function() {
            this._renderIframe(false);
            if (this._getSizeAccordingToProperties) {
                var componentSize =  this._getSizeAccordingToProperties();
                this._changeSize( componentSize );
            }

        },

        _getSizeAccordingToProperties: function() {
            return {w:225, h:55};
        },

        _getUrl: function() {
            var baseURL = this.resources.topology.wysiwyg + "/html/external/";
            var urlParams = this._getUrlParams();
            return baseURL + this._getPageName() + "?" + Object.toQueryString( urlParams );
        },

        /**
         * return page name, e.g. 'fblike.html'
         */
        _getPageName: function() {
            // Should be overriden
        },

        /**
         * return: an key-value of url parameters
         */
        _getUrlParams: function() {
            // Should be overriden
            return {};
        }

    });
});