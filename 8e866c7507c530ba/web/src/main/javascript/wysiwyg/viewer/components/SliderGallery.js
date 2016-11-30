/**
 * @class wysiwyg.viewer.components.SliderGallery
 */
define.component('wysiwyg.viewer.components.SliderGallery', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.BaseRepeater');

    def.resources(['W.Commands', 'W.Utils', 'W.Config']);

    def.propertiesSchemaType('SliderGalleryProperties');

    def.dataTypes(['ImageList']);

    def.skinParts( {
        'imageItem': { type:'wysiwyg.viewer.components.Displayer', repeater:true, container:'itemsContainer', dataRefField:'items' },
        'itemsContainer':   { type:'htmlElement'},
        'swipeLeftHitArea': { type:'htmlElement' },
        'swipeRightHitArea': { type:'htmlElement' }
    });

    def.states({
        'mobile':['notMobile', 'mobile'],
        'displayDevice' : ['mobileView']
    });

    def.binds(["gotoNext", "gotoPrev", "_updateMovementNoLoop", "_updateMovementInLoop","_stopMovement"]);

    def.statics({
        LEFT: "LEFT",
        RIGHT: "RIGHT",
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : true
            },
            custom:[
                {
                    label   : 'GALLERY_ORGANIZE_PHOTOS',
                    command : 'WEditorCommands.OpenOrganizeImagesDialog',
                    commandParameter : {
                        galleryConfigID: 'SliderGallery',
                        publicMediaFile: 'photos',
                        i18nPrefix: 'multiple_images',
                        mediaType: 'picture',
                        selectionType: 'multiple',
                        source: 'fpp'
                    },
                    commandParameterDataRef: 'SELF'
                },
                {
                    label:'CHANGE_GALLERY_TYPE',
                    command:'WEditorCommands.OpenChangeGalleryDialog',
                    commandParameter:{}
                }
            ],
            dblClick:{
                command : 'WEditorCommands.OpenOrganizeImagesDialog',
                commandParameter : {
                    galleryConfigID: 'SliderGallery',
                    publicMediaFile: 'photos',
                    i18nPrefix: 'multiple_images',
                    mediaType: 'picture',
                    selectionType: 'multiple',
                    source: 'dblclick'
                },
                commandParameterDataRef: 'SELF'
            },
            mobile: {
                previewImageDataRefField: '*'
            }
        }
    });

    def.fields({
        _itemHolder : null,
        _itemWidth : 0,
        _itemHeight : 0,
        _gap : 20,

        _movementSpeed : 0.0,
        _shiftOffset : 0.0,
        _shiftOffsetMax : 0.0,
        _shiftOffsetMin : 0.0,
        _maxSpeed : 0.05,
        _aspectRatio : 0,
        _inMotion : false,
        _keepMovementActive: false,

        _debugMode : false,

        _imageMode : "",
        _lastUpdate : NaN,
        _updateMovementFunc : null,
        _loop : false,

        _itemsHolderSize : 0.0,
        _contentOverflow : false,
        _segment : 0,
        _isZoomed: false
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.addEvent("resizeEnd", this._onResizeEnd);

            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onChangeMode, null);

            if(W.Config.mobileConfig.isMobileOrTablet()){
                    this.setState("mobile", "mobile");
            }else{
                this.setState("notMobile", "mobile");
            }
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState("mobileView", "displayDevice");
            }
        },

        _onChangeMode: function(mode) {
            if (mode !== 'PREVIEW') {
                this._stopMovement();
            }
        },

        _onResizeEnd: function() {
            this._recalcItemSize();
            this._allRepeatersReady = false;
            this._renderIfReady();
        },

        _recalcItemSize : function () {
            if (this._skinParts) {
                this._itemHeight = Math.floor(this._skinParts.itemsContainer.getHeight());
                this._itemWidth = Math.floor(this._itemHeight * this._aspectRatio);
            }
        },

        _processDataRefs : function (dataRefs) {
            if (this._loop === true) {
                return dataRefs.concat(dataRefs);
            } else {
                return dataRefs;
            }
        },

        /**
         * @override
         */
        _onDataChange: function(dataItem) {

            this._enableMovement(false);
            this._aspectRatio = this._parseAspectRatioPreset(this.getComponentProperty("aspectRatioPreset"));

            if (this._aspectRatio) {
                this.setComponentProperty("aspectRatio", this._aspectRatio, true);
            } else {
                this._aspectRatio = parseFloat(this.getComponentProperty("aspectRatio"));
            }

            this._loop = this.getComponentProperty("loop") === true;
            this._maxSpeed = parseInt(this.getComponentProperty("maxSpeed"));
            this._imageMode = String(this.getComponentProperty("imageMode"));
            this._gap = parseInt(this.getComponentProperty("margin"));

            this.parent();
        },

        _parseAspectRatioPreset : function (str) {
            var coefList = str.split(":");
            var value = 0.0;
            if (coefList.length == 2) {
                value = parseFloat(coefList[0]) / parseFloat(coefList[1]);
            }
            return value;
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012

        _onAllSkinPartsReady: function() {
            // backwards compatibility issue
            var newExpandModeSetting = this.getComponentProperty("galleryImageOnClickAction");
            var oldExpandModeSetting = this.getComponentProperty("expandEnabled");
            if (newExpandModeSetting === 'unset'){
                if (oldExpandModeSetting === false) {
                    this.setComponentProperty("galleryImageOnClickAction", "disabled", true);
                } else {
                    this.setComponentProperty("galleryImageOnClickAction", "zoomMode", true);
                }
            }
            this._itemHolder = this._skinParts.itemsContainer;
            this._itemHolder.setStyles({
                position: "absolute",
                left: "0px",
                right: "0px",
                top: "0px",
                bottom: "0px",
                "white-space" : "nowrap",
                '-webkit-transform': 'translateZ(0)'
            });
            this._skinParts.itemsContainer.setStyles({
                'overflow': (this._debugMode) ? "visible" : "hidden",
                border: (this._debugMode) ? "1px solid black" : "0"
            });

            this.resources.W.Commands.registerCommandListenerByName("WViewerCommands.SetMediaZoomImage", this, this._onMediaZoomClicked, null);
            this.resources.W.Commands.registerCommandListenerByName("WViewerCommands.MediaZoom.Close", this, this._onMediaZoomClosed, null);

            this._skinParts.swipeLeftHitArea.addEvent(Constants.CoreEvents.MOUSE_MOVE, this.gotoPrev);
            this._skinParts.swipeRightHitArea.addEvent(Constants.CoreEvents.MOUSE_MOVE, this.gotoNext);
            this._skinParts.swipeLeftHitArea.addEvent(Constants.CoreEvents.MOUSE_OUT, this._stopMovement);
            this._skinParts.swipeRightHitArea.addEvent(Constants.CoreEvents.MOUSE_OUT, this._stopMovement);

            if(this.getState("mobile") === "mobile"){
                Hammer(this._view).on("swiperight", this.gotoPrev);
                Hammer(this._view).on("swipeleft", this.gotoNext);
            }
        },

        _onMediaZoomClicked: function() {
            this._isZoomed = true;
            this._stopMovement();
        },

        _onMediaZoomClosed: function() {
            this._isZoomed = false;
        },

        render : function () {
            var i;
            this._recalcItemSize();
            this._updateMovementFunc = (this._loop === true) ? this._updateMovementInLoop : this._updateMovementNoLoop;
            if (this._loop === false) {
                this._segment = 0;
            }
            this._itemsHolderSize = 0;
            for (i = 0; i < this._itemHolder.children.length; i++) {
                this._setupDisplayer(this._itemHolder.children[i].getLogic(), i);
                this._itemsHolderSize += this._itemHolder.children[i].getLogic().getWidth() + this._gap;
            }

            this._checkItemsVisibility();
            this._applyShiftOffset();
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        // Deals with extreme situations, when there is
        // * loop=true -> each item is displayed twice
        // * not enough items -> the items would be visible twice
        _checkItemsVisibility: function () {
            var n = this._itemHolder.children.length / 2.0;
            var holderSize = (this._loop === true ? this._itemsHolderSize / 2.0 : this._itemsHolderSize);

            this._contentOverflow = (holderSize > this._skinParts.itemsContainer.getWidth());

            if (this._loop === true && this._contentOverflow === false) {
                this._segment = 0;
            }

            for (var i = 0; i < this._itemHolder.children.length; i++) {
                if (this._loop === true && this._contentOverflow === false && i >= n) {
                    this._itemHolder.children[i].setStyle("opacity", "0.0");
                } else {
                    this._itemHolder.children[i].setStyle("opacity", "1.0");
                }
            }
        },

        _setupDisplayer : function (displayer, index) {
            displayer.invalidateSize();
            displayer.setSize(this._itemWidth, this._itemHeight, this._imageMode);
            displayer.setOwner(this);
            displayer.getViewNode().setStyles({
                position: "static",
                display : "inline-block",
                "vertical-align" : "top",
                "margin-right": String(this._gap) + "px",
                "margin-left": "0px",
                "opacity" : "1.0"
            });
        },
        _moveTo: function(direction){
            this._keepMovementActive = true;
            var speed = this._maxSpeed;
            if (direction === this.LEFT){
                speed *= -1;
            }
            if (this._contentOverflow){
                this._setMovementSpeed(speed);
                this._enableMovement(true);
            }
        },

        gotoNext : function () {
            if (this._isZoomed) {
                return;
            }
            this._moveTo(this.RIGHT);
            //fix for slider stopping after a few frames
            if(this.getState("mobile") === "mobile"){
                clearTimeout(this._nextStopTimeout);
                this._nextStopTimeout = setTimeout(function(){
                    this._stopMovement();
                }.bind(this), 2000);
            }

        },

        gotoPrev: function () {
            if (this._isZoomed) {
                return;
            }
            this._moveTo(this.LEFT);
            //fix for slider stopping after a few frames
            if (this.getState("mobile") === "mobile") {
                clearTimeout(this._prevStopTimeout);
                this._prevStopTimeout = setTimeout(function () {
                    this._stopMovement();
                }.bind(this), 2000);
            }
        },

        _enableMovement : function (value) {
            if (value === true) {
                if( this._inMotion === false ){
                    window.requestAnimFrame(this._updateMovementFunc);
                }
                if (!this._inMotion) {
                    this._shiftOffsetMin = this._skinParts.itemsContainer.getWidth() + this._gap - this._itemsHolderSize;

                    if (this._offsetIsOnGapOnly()) {
                        this._shiftOffsetMin = 0.0;
                    }

                    this._inMotion = true;
                }
            } else {
                this._inMotion = false;
                this._movementSpeed = 0.0;
            }
        },

        _stopMovement : function () {
            var Tween = this.resources.W.Utils.Tween;

            this._keepMovementActive = false;
            Tween.to(this, 1.0, {   _movementSpeed:0.0, onComplete: function () {
                if(!this._keepMovementActive){
                    this._enableMovement(false);
                }
            }.bind(this)
            });
        },

        _setMovementSpeed : function (speed) {
            var Tween = this.resources.W.Utils.Tween;
            Tween.to(this, 1.0, { _movementSpeed:speed });
        },

        _calcMovementCoeficient : function () {
            var coef = 1.0;
            var t = new Date().getTime();

            if (!isNaN(this._lastUpdate)) {
                coef = ((t - this._lastUpdate) / 16);
            }

            this._lastUpdate = t;
            return coef;
        },

        _updateMovementNoLoop : function () {
            var coef = this._calcMovementCoeficient();
            if (this._inMotion) {
                this._shiftOffset += -this._movementSpeed * coef;

                if (this._shiftOffset > this._shiftOffsetMax) {
                    this._shiftOffset = this._shiftOffsetMax;
                    this._enableMovement(false);
                }

                if (this._shiftOffset < this._shiftOffsetMin) {
                    this._shiftOffset = this._shiftOffsetMin;
                    this._enableMovement(false);
                }

                this._applyShiftOffset();
            }

            if (this._inMotion) {
                window.requestAnimFrame(this._updateMovementFunc);
            }
        },

        _updateMovementInLoop : function () {
            var coef = this._calcMovementCoeficient();

            if (this._inMotion) {
                this._shiftOffset += -this._movementSpeed * coef;

                if (this._movementSpeed < 0) {
                    this._segment = 0;
                    if (this._shiftOffset > (this._shiftOffsetMax)) {
                        this._shiftOffset -= this._itemsHolderSize / 2.0;
                    }
                }
                if (this._movementSpeed > 0) {
                    this._segment = 1;
                    if (this._shiftOffset < 0.0) {
                        this._shiftOffset += this._itemsHolderSize / 2.0;
                    }
                }

                this._applyShiftOffset();
            }

            if (this._inMotion) {
                window.requestAnimFrame(this._updateMovementFunc);
            }
        },

        _applyShiftOffset : function () {
            var margin = this._shiftOffset - (this._segment * this._itemsHolderSize / 2.0);

            if(this._itemHolder.children.length>0) {
                this._itemHolder.children[0].setStyle("margin-left", String(Math.floor(margin)) + "px");
            }
        },

        _offsetIsOnGapOnly: function () {
            return Math.abs( this._shiftOffsetMin ) < this._gap && this._shiftOffsetMin > 0;
        }

    });

});