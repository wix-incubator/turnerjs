/**@class wysiwyg.viewer.components.traits.GalleryAutoplay */
define.Class('wysiwyg.viewer.components.traits.GalleryAutoplay', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_onComponentReady', '_onMouseDown', '_autoplayCallback', '_onTransitionFinished',
        '_onModeChange', '_onMediaZoomClosed', '_onMediaZoomOpened', '_getDirection', '_onComponentDisposed']);

    def.fields({
        _autoplayOn : false,
        _timeoutID : null,
        _suppressAutoplay : false
    });
    
    def.resources(['W.Viewer','W.Commands', 'W.Config']);

    def.methods({
//Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:10 IDT 2012
        initialize: function () {
            this.addEvent(Constants.ComponentEvents.RENDER, this._onComponentRender);
            this.addEvent(Constants.ComponentEvents.READY, this._onComponentReady);


            if (W.Config.env.isInDeactivatedViewer()) {
                this._suppressAutoplay = true;
            }

            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onModeChange);
            this.resources.W.Commands.registerCommandListenerByName("WViewerCommands.MediaZoom.Close", this, this._onMediaZoomClosed);
            this.resources.W.Commands.registerCommandListenerByName("WViewerCommands.OpenZoom", this, this._onMediaZoomOpened);

            this.addEvent(Constants.ComponentEvents.DISPOSED, this._onComponentDisposed);

        },

        _onComponentReady : function () {
            this._autoplayOn = this.getComponentProperty("autoplay") === true;
            this._updateAutoplayState();
        },

        _onComponentRender : function () {
            this._properties.on(Constants.DataEvents.DATA_CHANGED, this, this._onPropertyChanged);
            this.addEvent('transitionFinished', this._onTransitionFinished);
            if (this._skinParts.autoplay) {
                this._skinParts.autoplay.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
                this._skinParts.autoplay.setStyle("cursor", "pointer");
                this._checkAutoPlaySkinPartsVisibility();
            }
        },

        _onModeChange : function (mode) {
            this._autoplayOn = this.getComponentProperty("autoplay") === true;
            this._suppressAutoplay = !(mode == "PREVIEW");
            this._updateAutoplayState();
        },

        _onMediaZoomOpened : function () {
            this._lastAutoplayState = this._autoplayOn;
            this._suppressAutoplay = true;
            this._updateAutoplayState();
        },

        _onMediaZoomClosed : function () {
            this._suppressAutoplay = false;
            this._autoplayOn = this._lastAutoplayState === true;
            this._updateAutoplayState();
        },

        _validateHostComponent : function () {
            var schema = this.getComponentProperties().getSchema();
            if(!this._skinPartsSchema.hasOwnProperty("autoplay")){
                this._validationErr("Must require 'autoplay' skinPart.");
            }
            if(!schema.hasOwnProperty("autoplay")) {
                this._validationErr("Must contain 'autoplay' among the component properties.");
            }
            if(!schema.hasOwnProperty("autoplayInterval")) {
                this._validationErr("Must contain 'autoplayInterval' among the component properties.");
            }
            if(typeOf(this["gotoNext"]) != "function") {
                this._validationErr("Host component must implement gotoNext() method.");
            }
        },

        _validationErr : function (msg) {
            throw new Error("GalleryAutoplay trait's host component validation failed. " +msg);
        },

        _onMouseDown : function(event) {
            this._toggleAutoplay();
        },

        _toggleAutoplay : function() {
            this._autoplayOn = !this._autoplayOn;
            this._updateAutoplayState();
        },

        _updateAutoplayState : function () {
            if(this._suppressAutoplay) {
                this._autoplayOn = false;
            }
            this.setState(this._autoplayOn ? "autoplayOn" : "autoplayOff", "slideshow");
            this._startAutoplayTimer();
        },

        _getAutoplayInterval : function () {
            var interval = parseFloat(this.getComponentProperty("autoplayInterval"));
            var transDuration = parseFloat(this.getComponentProperty("transDuration"));
            var result = Math.floor(interval * 1000.0);
            return result;
        },

        _startAutoplayTimer : function () {
            if(this._timeoutID != null) {
                clearTimeout(this._timeoutID);
                this._timeoutID = null;
            }

            if(this._autoplayOn) {
                this._timeoutID = setTimeout(this._autoplayCallback, this._getAutoplayInterval());
            }
        },

        _autoplayCallback : function () {
            if (this._getDirection() == "LTR") {
                this.gotoPrev();
            } else {
                this.gotoNext();
            }
        },

        _onPropertyChanged : function () {
            this._autoplayOn = this.getComponentProperty("autoplay") === true;
            this._updateAutoplayState();
            this._checkAutoPlaySkinPartsVisibility();
        },

        _checkAutoPlaySkinPartsVisibility : function () {
            if (this._skinParts && this._skinParts.autoplay) {
                this._skinParts.autoplay.setStyle("visibility", this.getComponentProperty("showAutoplay") ? "visible" : "hidden");
            }
        },

        _onTransitionFinished : function () {
            this._startAutoplayTimer();
        },

        _getDirection: function() {
            return this.getComponentProperties().getData().autoPlayDirection;
        },

        _onComponentDisposed: function () {
            clearTimeout(this._timeoutID);
            this._timeoutID = null;
            this._properties.offByListener(this);
        }

    });
});