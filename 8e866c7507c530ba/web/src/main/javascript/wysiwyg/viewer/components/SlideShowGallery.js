/**
 * @class wysiwyg.viewer.components.SlideShowGallery
 */
define.component('wysiwyg.viewer.components.SlideShowGallery', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.BaseRepeater');

    def.utilize(['wysiwyg.viewer.utils.TransitionUtils']);

    def.traits(["core.components.traits.TouchRollOverSupport", "wysiwyg.viewer.components.traits.GalleryAutoplay"]);

    def.dataTypes(['ImageList']);

    def.resources(['W.Utils', 'W.Config', 'W.Theme', 'W.Commands']);

    def.states({
        'editMode':['showButtons'],
        'slideshow':['autoplayOn', 'autoplayOff'],
        'mobile':['notMobile', 'mobile'],
        'mobileShowTextPanel':['showTextPanel','notShow'],
        'displayDevice' : ['mobileView']
    });

    def.propertiesSchemaType('SlideShowGalleryProperties');

    def.skinParts({
        'imageItem':{ type:'wysiwyg.viewer.components.Displayer', repeater:true, container:'virtualContainer', moveOldItemsToContainer:false, dataRefField:'items', argObject:{unit:'px'} },
        'virtualContainer':{ type:'htmlElement', optional:true },
        'itemsContainer':{ type:'htmlElement'},
        'buttonPrev':{ type:'htmlElement' },
        'buttonNext':{ type:'htmlElement' },
        'counter':{ type:'htmlElement' },
        'autoplay':{ type:'htmlElement' }
    });

    def.binds(['gotoNext', 'gotoPrev','_onNext', '_onPrev']);

    def.fields({
        _currentItemIndex:0,
        _currentItemRef:"",
        _prevItemIndex:-1,
        _numItems:-1,
        _itemHolder:null,
        _currentDisplayer:null,

        _locked:false,

        _lastCommand:"",

        /** @type TransitionUtils */
        _transitionUtils:null,

        _displayedImages:[],
        _imageMode:"",
        _widthDiff:0,
        _heightDiff:0,
        _galleryItems:[],
        _expandEnabled:true
    });

    def.statics({
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
                        galleryConfigID: 'SlideShowGallery',
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
                    galleryConfigID: 'SlideShowGallery',
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

    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.injects().Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);

            this._Tween = this.resources.W.Utils.Tween;
            this._hideIndicatorElement = args && args.hideIndicatorElement || false;
            if(W.Config.mobileConfig.isMobileOrTablet()){
                this.setState("mobile", "mobile");
            }else{
                this.setState("notMobile", "mobile");
            }
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState("mobileView", "displayDevice");
            }
        },

        /**
         * @override
         */
        _onDataChange:function (dataItem, changedProperty) {
            this._numItems = this._data.get("items").length;
            this._imageMode = String(this.getComponentProperty("imageMode"));
            this._expandEnabled = (this.getComponentProperty("expandEnabled") === true);

            if (this._imageMode == 'flexibleHeight') {
                this._resizableSides = [Constants.BaseComponent.ResizeSides.LEFT, Constants.BaseComponent.ResizeSides.RIGHT];
            } else {
                this._resizableSides = [Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.LEFT,
                    Constants.BaseComponent.ResizeSides.BOTTOM, Constants.BaseComponent.ResizeSides.RIGHT];
            }

            this._checkSkinPartsVisibility();
            this.parent();
        },

        _checkSkinPartsVisibility:function () {
           if (this._skinParts) {
               var showNavigationProp = this.getComponentProperty("showNavigation");
               var showNavigation = showNavigationProp ? "visible" : "hidden";
                   this._skinParts.buttonPrev.setStyle("visibility", showNavigation);
                   this._skinParts.buttonNext.setStyle("visibility", showNavigation);
                   this._skinParts.counter.setStyle("visibility", this.getComponentProperty("showCounter") ? "visible" : "hidden");
           }
       },

        /**
         * Override to implement data pre-processing (shortening, filtering, etc.)
         * @param {Array.<String>} dataRefs
         */
        _processDataRefs:function (dataRefs) {
            var list = [];
            if (dataRefs.length > 0) {
                list = [dataRefs[this._currentItemIndex]];
                var cachedItemIndex;

                this._currentItemRef = dataRefs[this._currentItemIndex];

                if (dataRefs.length > 1) {
                    cachedItemIndex = this._normalizeIndex(this._currentItemIndex + 1);
                    list.push(dataRefs[cachedItemIndex]);

                    if (dataRefs.length > 2) {
                        cachedItemIndex = this._normalizeIndex(this._currentItemIndex - 1);
                        list.push(dataRefs[cachedItemIndex]);
                    }
                }
            } else {
                this._itemHolder.empty();
            }

            return list;
        },

        _onAllSkinPartsReady:function () {
            // backwards compatibility issue
            var newExpandModeSetting = this.getComponentProperty("galleryImageOnClickAction");
            var oldExpandModeSetting = this.getComponentProperty("expandEnabled");
            if (newExpandModeSetting === 'unset') {
                if (oldExpandModeSetting === false) {
                    this.setComponentProperty("galleryImageOnClickAction", "disabled", true);
                } else {
                    this.setComponentProperty("galleryImageOnClickAction", "zoomMode", true);
                }
            }
            this._view.setStyle("overflow", "hidden");
            this._itemHolder = new Element("div");
            //            this._itemHolder.setStyles({ position: "absolute", width:"100%", height:"100%", '-webkit-transform': 'translateZ(0)'});
            this._itemHolder.setStyles({ position:"absolute", width:"100%", height:"100%"});
            this._skinParts.itemsContainer.appendChild(this._itemHolder);
            this._skinParts.buttonPrev.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onPrev);
            this._skinParts.buttonNext.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onNext);

            if(this.getState("mobile") === "mobile"){
                Hammer(this._view).on("swiperight", this._onPrev);
                Hammer(this._view).on("swipeleft", this._onNext);
            }

            this._transitionUtils = new this.imports.TransitionUtils();
            if (!this._skinParts.virtualContainer) {
                this._skinParts.virtualContainer = new Element("div");
                this._view.grab(this._skinParts.virtualContainer, 'top');
                this._skinParts.virtualContainer.setStyles({
                    visibility:"hidden",
                    display:"block",
                    width:"1px",
                    height:"1px",
                    overflow:"hidden"
                });
            }
            this._widthDiff = this._skin.widthDiff || 0;
            this._heightDiff = this._skin.heightDiff || 0;

            var buttonStyle = {
                "cursor":"pointer"
            };
            var userSelectProp = this.injects().Utils.getCSSBrowserFeature('user-select');
            if (userSelectProp) {
                buttonStyle[userSelectProp] = "none";
            }
            this._skinParts.buttonPrev.setStyles(buttonStyle);
            this._skinParts.buttonNext.setStyles(buttonStyle);
            this._checkSkinPartsVisibility();

            this._onEditorModeChanged(this.resources.W.Config.env.$editorMode);
        },

        _mobileShowTextPanel: function () {
            this.setState('notShow', 'mobileShowTextPanel');
            if (this._mobileShowTextPanelTimeout) {
                clearTimeout(this._mobileShowTextPanelTimeout);
            }
            if (this.getState('mobile') === 'mobile') {
                this.setState('showTextPanel', 'mobileShowTextPanel');
                this._mobileShowTextPanelTimeout = setTimeout(function () {
                    this.setState('notShow', 'mobileShowTextPanel');
                }.bind(this), 2000);
            }
        },

        _onPrev:function () {
            this._mobileShowTextPanel();
            this.gotoPrev();
        },

        _onNext:function () {
            this._mobileShowTextPanel();
            this.gotoNext();
        },

        _onEditorModeChanged:function (newMode) {
            //TODO: This is a quick hack to fix mode for mobile preview.
            newMode = (document.body.getAttribute('preview') === 'view')? 'PREVIEW' : newMode;

            if (this.resources.W.Config.env.$isPublicViewerFrame || this._hideIndicatorElement) {
                return;
            }

            if (!this._editorIndicatorElement){
                this._createSlideShowIndicatorElement();
            }

            if (newMode === 'PREVIEW') {
                this._hideEditModeSlideShowIndicator();
            } else {
                this._showEditModeSlideShowIndicator();
            }
        },

        _createSlideShowIndicatorElement:function () {
            if (!this._editorIndicatorElement) {
                var icon = this.resources.W.Theme.getProperty("WEB_THEME_DIRECTORY") + 'ico_slide.png';

                this._editorIndicatorElement = new Element('div', {
                    styles:{
                        position:'absolute',
                        top:'50%',
                        left: '0',
                        width:'100%',
                        marginTop:'-18px',
                        textAlign:'center'
                    }
                });
                var innerElemnt = new Element('b', {
                    styles:{
                        display:'inline-block',
                        borderRadius:'3px',
                        background:'#222 url(' + icon + ') no-repeat 8px 50%',
                        opacity:'0.6',
                        color:'#ffffff',
                        padding:'0 14px 0 66px',
                        whiteSpace:'nowrap',
                        height:'38px',
                        lineHeight:'39px',
                        fontSize:'12px',
                        position:'static',
                        width: 'auto'
                    }
                });
                innerElemnt.set('text', 'Slide Show');
                innerElemnt.insertInto(this._editorIndicatorElement);
            }
            this._editorIndicatorElement.insertInto(this._view);

        },

        _hideEditModeSlideShowIndicator:function () {
            this.removeState('showButtons', 'editMode');
            this._editorIndicatorElement.collapse();
        },

        _showEditModeSlideShowIndicator:function () {
            this.setState('showButtons', 'editMode');
            this._editorIndicatorElement.uncollapse();
        },

        _onRepeaterItemReady:function (repeaterData, itemLogic, itemData, newItem) {
            itemLogic.getViewNode().setStyles({position:"relative"});
        },

        _onRepeaterReady:function (repeaterData) {
            if(this._galleryItems) {
                for(var i = 0; i < this._galleryItems.length; ++i){
                    this._galleryItems[i].dispose();
                }
            }
            this._galleryItems = repeaterData.readyItems;
        },

        _isAllowRender: function() {
            return !this._locked;
        },
        render:function () {
            if (this._isAllowRender()) {
                var displayer;
                for (var i = 0; i < this._galleryItems.length; i++) {
                    displayer = this._galleryItems[i].getLogic();
                    displayer.invalidateSize();
                    this._setupDisplayer(displayer);
                    if (this._currentItemRef == "#" + displayer.getDataItem().get("id")) {
                        this._insertNewDisplayer(displayer);
                    } else {
                        displayer.getViewNode().setStyles({
                            "visibility":"hidden",
                            "opacity":"1.0"
                        });
                    }
                }

                this._skinParts.counter.set("text", String(this._currentItemIndex + 1) + "/" + String(this._numItems));
                this._prevItemIndex = this._currentItemIndex;
            }
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        _setupDisplayer:function (displayer) {
            displayer.setOwner(this);
            displayer.setSize(this.getWidth() - this._widthDiff, this.getHeight() - this._heightDiff, this._imageMode);
        },

        //experimnent AutoPlayFix merge
        _insertNewDisplayer:function (displayer) {
            var container = this._itemHolder;
            var prevDisplayer = this._currentDisplayer;
            var displayerView = displayer.getViewNode();
            var duration = parseFloat(this.getComponentProperty("transDuration"));
            this._currentDisplayer = displayer;
//            container.setStyles({ '-webkit-transform': 'translateZ(0)'});
            if (prevDisplayer && prevDisplayer !== displayer) {
                container.adopt(prevDisplayer.getViewNode());
            }
            container.adopt(displayer.getViewNode());
            displayerView.setStyles({position:"absolute", top:"0px", left:"0px", visibility:"visible"});
            displayer.setSize(this.getWidth() - this._widthDiff, this.getHeight() - this._heightDiff, this._imageMode);

            if (this._imageMode == "flexibleHeight") {
                this._adjustFlexibleHeight(this._currentDisplayer, duration);
            }

            var imageRef = this._currentDisplayer.getImageRef();
            if (imageRef && this._displayedImages.indexOf(imageRef) == -1) {
                this._displayedImages.push(imageRef);
            }

            if (container.children.length > 1) {
                displayer.setState("transIn");
                if (prevDisplayer) {
                    prevDisplayer.setState("transOut");
                }

                this._locked = true;
                this._transitionUtils.getTransition(String(this.getComponentProperty("transition")))
                    (container.children[0],
                        container.children[1],
                        this._getTransitionDirection(),
                        duration,
                        function () {
                            if (container.children.length > 1) {
                                container.children[1].setStyle("position", "static");
                                container.removeChild(container.children[0]);
                            }
                            this._locked = false;
                            if (prevDisplayer) {
                                prevDisplayer.setState("normal");
                            }
                            this._onDisplayerTransitoinFinished(displayer);
                        }.bind(this));
            }
            else {
                this._onDisplayerTransitoinFinished(displayer);
            }

            // Forcing the inner image to be rendered after we know for sure that the displayer is in the DOM
            displayer.$view.triggerDisplayChanged();
        },

        _onDisplayerTransitoinFinished:function(displayer){
            displayer.setState("noTransition");
            this.fireEvent("transitionFinished");
        },

        //experimnent AutoPlayFix merge
        _restartAutoPlay:function(){
            if(this._autoplayOn && this._galleryItems.length>1) {
                this._startAutoplayTimer();
            }
        },

        _adjustFlexibleHeight:function (displayer, duration) {
            var newHeight = displayer.getHeight() + this._heightDiff;
            this._Tween.to(this._view, duration, { height:newHeight,
                onUpdate:function (value) {
                    this.setHeight(parseInt(value));
                    this.fireEvent("autoSized");
                }.bind(this) });
        },

        /**
         * @return {number} 0 = left->right / top->bottom ; right->left / bottom->top
         */
        _getTransitionDirection:function () {
            var isBidi = this.getComponentProperty("bidirectional") === true;
            var isReverse = this.getComponentProperty("reverse") === true;
            var dirDict = { "next":0, "prev":1 };
            var dir = 0;

            if (isBidi) {
                dir = dirDict[this._lastCommand] || 0;

                if (isReverse) {
                    dir = (dir == 1) ? 0 : 1;
                }
            }

            return dir;
        },


        /**
         * @override
         */
        _onResize:function () {
            var newHeight;

            this.parent();
            if (this._currentDisplayer) {
                this._currentDisplayer.setSize(this.getWidth() - this._widthDiff, this.getHeight() - this._heightDiff, this._imageMode);
                if (this._imageMode == "flexibleHeight") {
                    window.requestAnimFrame(function () {
                        newHeight = this._currentDisplayer.getHeight() + this._heightDiff;
                        this._view.setStyle("height", String(newHeight) + "px");
                        this.setHeight(newHeight);
                        this.fireEvent("autoSized");
                    }.bind(this));
                } else {
                    newHeight = this.getHeight();
                    // God knows why I have to do this...
                    this._view.setStyle("height", String(newHeight) + "px");
                    this.setHeight(newHeight);
                }

            }
        },

        gotoPrev:function () {
            if (!this._locked && this._galleryItems.length > 0) {
                this._lastCommand = "prev";
                this._currentItemIndex = this._getPrevItemIndex();
                this._allRepeatersReady = false;
                this._renderIfReady();
            }

            this.fireEvent("displayerChanged");
        },

        gotoNext:function () {
            if (!this._locked && this._galleryItems.length > 0) {
                this._lastCommand = "next";
                this._currentItemIndex = this._getNextItemIndex();
                this._allRepeatersReady = false;
                this._renderIfReady();
            }

            this.fireEvent("displayerChanged");
        },

        //experimnent AutoPlayFix merge
        onPageVisibilityChange:function (isVisible) {
            if (isVisible) {
                this._restartAutoPlay();
            }
            else {
                this._stopAutoPlay();
            }
        },

        _stopAutoPlay:function(){
            if (this._timeoutID != null) {
                clearTimeout(this._timeoutID);
                this._timeoutID = null;
            }
        },

        _getNextItemIndex:function () {
            return this._normalizeIndex(this._currentItemIndex + 1);
        },

        _getPrevItemIndex:function () {
            return this._normalizeIndex(this._currentItemIndex - 1);
        },

        _normalizeIndex:function (index) {
            return ((index % this._numItems) + this._numItems) % this._numItems;
        }
    });
});