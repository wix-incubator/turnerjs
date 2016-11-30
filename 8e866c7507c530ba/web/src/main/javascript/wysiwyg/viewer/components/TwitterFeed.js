/**
 * @class wysiwyg.viewer.components.TwitterFeed
 */
define.component('wysiwyg.viewer.components.TwitterFeed', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Skins', 'W.Config', 'topology']);

    def.propertiesSchemaType('TwitterFeedProperties');

    def.dataTypes(['TwitterFollow']);

    def.binds(['_applyThemeColors', '_onResizeEnd']);

    def.skinParts({
        label: {type: 'htmlElement'},
        link: {type: 'htmlElement'}
    });

    def.fields({
        MIN_SIZE: 220
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            custom:[
                {
                    label:'FPP_DESIGN_LABEL',
                    command:'WEditorCommands.AdvancedDesign'
                }
            ]
        }
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._iframeLoaded = false;
            this.addEvent("resizeEnd", this._onResizeEnd );
            this._minimumTimeBetweenRenders = 2000;
        },

        render: function() {
            this._renderFeed();
        },

        _onStyleReady: function(){
            this.parent();
            this._style.addEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._applyThemeColors);
        },

        _applyThemeColors: function(changeEvent){
            var effectedProps = ['bg', 'txt1', 'bg2', 'txt2', 'linkColor'];
            for(var propertyId in changeEvent.properties) {
                if (effectedProps.indexOf(propertyId) > -1) {
                    this._renderFeed();
                    return;
                }
            }
        },

        _renderFeedAndDontReload: function() {
            this._renderFeed( true );
        },

        _renderFeed: function( preventReload /* =false */ ) {
            if (!this.isReady()) {
                return;
            }

            this._iframeLoaded = true;
            var userName = this._data.get("accountToFollow") || "wix";
            this._skinParts.label.set('html', userName);
            this._skinParts.link.set('href', "https://twitter.com/intent/user?screen_name=" + userName);

            /*if (!this.iframeCreated){  // If no iframe, create it
                this._createIframe();
                this.iframeCreated = true;
            }else{
                // Else update url (if changed) and dimensions / other properties of the iframe
                this._postMessageToIframe( preventReload );
            }*/
        },

        _createIframe: function( preventReload ){
            var iframe = new IFrame({
                src: this.resources.topology.wysiwyg + "/html/external/twfeed.html",
                width:'100%',
                height:'100%',
                webkitAllowFullScreen:'true',
                mozallowfullscreen:'true',
                allowfullscreen:'allowfullscreen',
                frameBorder:'0',
                scrolling:"no",
                events: {
                    load: function() {
                        this._iframeLoaded = true;
                        this._postMessageToIframe( preventReload );
                    }.bind(this)
                }
            });

            this._iframe = iframe;
            this._view.empty();
            this._view.grab(iframe);
        },

        _postMessageToIframe: function( preventReload ){

            var skinMgr = this.resources.W.Skins;
            var skinClassName = this._skin.className;

            var TwitterFeedJson = {
                userName: this._data.get("accountToFollow") || "wix",
                height: this._view.getHeight() - 90,
                width: this._view.getWidth(),
                numOfTweets: this.getComponentProperty("numOfTweets") || 1,
                shellBGColor : skinMgr.getSkinParamValue(skinClassName, 'bg', this._style).getHex(false),
                shellColor : skinMgr.getSkinParamValue(skinClassName, 'txt1', this._style).getHex(false),
                tweetBGColor : skinMgr.getSkinParamValue(skinClassName, 'bg2', this._style).getHex(false),
                tweetColor : skinMgr.getSkinParamValue(skinClassName, 'txt2', this._style).getHex(false),
                tweetLinkColor : skinMgr.getSkinParamValue(skinClassName, 'linkColor', this._style).getHex(false),
                start: !preventReload
            };


            this._iframe.contentWindow.postMessage(JSON.stringify( TwitterFeedJson )  , "*");

        },

        /**
         * @override
         * @param value
         */
        setHeight: function(value) {
            value = Math.max(220, value);
            this._view.setStyle("height", parseInt( value) + "px");
            this.parent(value, true, true);  // don't invoke "onResize"
        },

        /**
         * @override
         * @param value
         */
        setWidth: function(value) {
            value = Math.max(220, value);
            this._view.setStyle("width", parseInt(value) + "px");
            this.parent(value, true, true);  // don't invoke "onResize"
        },

        /**
         * @override
         */
        _onResize: function() {
            this.parent();
            this._renderFeedAndDontReload();
        },

        _onResizeEnd: function() {
            this._renderFeed();
        }

    });
});