/**
 * @class wysiwyg.viewer.components.SoundCloudWidget
 */
define.component('wysiwyg.viewer.components.SoundCloudWidget', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.IFrameComponent');

    def.resources(['W.Config', 'W.Utils', 'W.Viewer', 'W.Commands']);

    def.binds(['_stopPlayback', '_getSoundCloudUrl']);

    def.states(['hasContent', 'noContent']);

    def.dataTypes(['SoundCloudWidget']);

    def.traits(['wysiwyg.viewer.components.traits.IframeUtils']);

    def.fields({
        _renderTriggers:[ Constants.DisplayEvents.DISPLAY_CHANGED ]
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.SoundCloudWidget
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._urlExists = false;
            this._view.addEvent(Constants.DisplayEvents.COLLAPSED, this._stopPlayback);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);
            this.setMinW(250);
        },

        _stopPlayback:function () {
            this.setIFrameSrc(this._iframe, '');
        },

        _updateIFrameSize:function () {
            var iframe;
            iframe = this._iframe;
            if (iframe) {
                iframe.set({
                    width:this._view.getWidth() - 1,
                    height:this._view.getHeight() - 1
                });
            }
        },

        _getUrl:function () {
            return this._getSoundCloudUrl();
        },

        _getSoundCloudUrl:function () {
            var url = this._data.get("url");
            this._urlExists = false;
            if (url != undefined && url != "") {
                // if URL includes 2 characters of '?'
                // for example: "https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F68403644?"
                if(url.split("?").length == 3){
                    url = url.substring(0, url.lastIndexOf("?"));
                }
                url = this.resources.W.Utils.setUrlParam(url, "show_artwork", this._isDataTrue("showArtWork"));
                var autoPlay = this._isDataTrue("autoPlay");
                // Playing in the editor is annoying - always disable autoplay when editing.
                if (this.resources.W.Config.env.isViewingSecondaryDevice() ||
                    this.resources.W.Config.env.isInDeactivatedViewer() ||
                    !this.getIsDisplayed()) {
                    // ADDED IN EXPERIMENT: if viewer mode is set to mobile, disable autoplay
                    autoPlay = false;
                }
                url = this.resources.W.Utils.setUrlParam(url, "auto_play", autoPlay);
                url = this._normalizeSoundcloudUrl(url);
                this._urlExists = true;
            }

            return url || "";
        },

        _normalizeSoundcloudUrl: function(url){
            url = this._decodeUrl(url);
            url = this._encodeSemicolon(url);
            return url;
        },

        _decodeUrl: function(str){
            str = str.replace(/%2B/g, '+');
            str = str.replace(/%3F/g, '?');
            str = str.replace(/%3D/g, '=');
            str = str.replace(/%25/g, '%');
            str = str.replace(/%26/g, '&');

//        str = str.replace(/+/g, '%20');
            str = str.replace(/%2A/g, '*');
            str = str.replace(/%2F/g, '/');
            str = str.replace(/%40/g, '@');
            str = str.replace(/%3A/g, ':');

            return str;
        },
        _encodeSemicolon: function (str) {
            return str.replace(/;/g, '%3b');
        },


        _isDataTrue:function (propName) {
            // Checks for true in either boolan or text values. This is done because
            // when setting the data from the panel, i get actual boolean values.
            // When setting the panel via the server, i get string values.
            var res = false;
            if (this._data.get(propName) === true || this._data.get(propName) === "true") {
                res = true;
            }
            return res;
        },

        _setIframeParams:function () {
            this._iframe['class'] = "html5player";
            this._iframe.setStyles({position:"absolute"});
            if (this._urlExists === false) {
                this.setState('noContent');
            } else {
                this.setState('hasContent');
            }
            this._updateIFrameSize();
        },

        _onEditorModeChanged:function (newMode, oldMode) {
            if (newMode == "PREVIEW" || oldMode == "PREVIEW") {
                this._updateIframe(true);
            }
        },

        _getIframeContainer: function(){
            return this._skinParts.iFrameHolder;
        },

        setHeight:function (value, forceUpdate, triggersOnResize) {
            value = Math.max(value, 50);
            this._view.setStyle("height", parseInt(value) + "px");
            this.parent(value, forceUpdate, triggersOnResize);
        },


        setWidth:function (value, forceUpdate, triggersOnResize) {
            value = Math.max(value, 200);
            this._view.setStyle("width", parseInt(value) + "px");
            this.parent(value, forceUpdate, triggersOnResize);
        }
    });

});
