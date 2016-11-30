define.component("wysiwyg.viewer.components.MobileMediaZoom", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.Viewer', 'W.Config', 'W.Utils', 'W.Commands']);

    def.states(
        {
            'showButtons':['doShowButtons','dontShowButtons'],
            'orientation':['portrait','landscape'],
            'viewerType': ['desktop', 'mobile', 'tablet']
        }
    );


    def.binds(["_onOrientationChange", "_preventEvent", "_changeButtonsVisibility", "_closeZoom", "gotoNext", "gotoPrev","_preventTouchStart", '_getDisplayerCallback']);
    def.inherits('wysiwyg.viewer.components.MediaZoom');
    def.skinParts({
        'blockingLayer':{'type':'htmlElement'},
        'dialogBox':{'type':'htmlElement'},
        'xButton':{'type':'htmlElement'},// 'command':'WViewerCommands.MediaZoom.Close'},
        'virtualContainer':{ type:'htmlElement' },
        'itemsContainer':{ type:'htmlElement'},
        'counter':{ type:'htmlElement' },
        'buttonPrev':{ type:'htmlElement', 'command':'WViewerCommands.MediaZoom.Prev'},
        'buttonNext':{ type:'htmlElement', 'command':'WViewerCommands.MediaZoom.Next'}
    });

    def.fields({
        transitionTime:'short',
        _inTransition:false,
        //TODO: remove when you find a better way to deal with hash change fired twice
        _lastCurrentItem:null
    });

    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this._isMobilePreviewMode = W.Config.env.$isEditorViewerFrame;
            this._fontSizeCorrectionWhenOpenZoomInPortrait = 1.1;
            this.isVolatile = true;
            this.parent(compId, viewNode, argsObject);
            var cmds = this.injects().Commands;
            cmds.registerCommandAndListener('WViewerCommands.MediaZoomDisplayer.PanelTextVisibilityChanged', this, this._changeButtonsVisibility, null, true);
            this.addEvent('currentItemChanged', this._handleCurrentItemChange);
            this.collapse();

            this._mobileConfig = this.injects().Config.mobileConfig;
            this._setInitZoom();

            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState('mobile', 'viewerType');
            } else if(this.resources.W.Config.mobileConfig.isTablet()){
                this.setState('tablet', 'viewerType');
            }else{
                this.setState('desktop', 'viewerType');
            }

            cmds.registerCommand("WViewerCommands.MobileMediaZoom.Closed", true);
        },

        _setInitZoom: function(){
            if(this._isMobilePreviewMode){
                return 1;
            }
            this._initZoom = this._mobileConfig.getInitZoom();
            return this._initZoom;
        },

        fixZoom:function(){
            if(this._isMobilePreviewMode || this.getState('viewerType') === "mobile"){
                return 1;
            }
            if(!this._initZoom || this._initZoom < 0 || this._initZoom > 5){
                this._setInitZoom();
            }
            var zoom = this._initZoom / this._mobileConfig.getZoom();

            this._skinParts.xButton.style.zoom = zoom;
            this._skinParts.buttonPrev.style.zoom = zoom;
            this._skinParts.buttonNext.style.zoom = zoom;
        },

        _setOrientation:function(){
            setTimeout(this.fixZoom.bind(this), 300);
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            if(this._mobileConfig.isMobileOrTablet()) {
                Hammer(this._view).on("swipeleft", this.gotoNext);
                Hammer(this._view).on("swiperight", this.gotoPrev);
            }
            setTimeout(this.fixZoom.bind(this), 300);

            var clickEvents = ["click", "mousedown", "touchstart"];
            var moveEvents = ["mousemove", "touchmove"];

            this._registerEvents(this._skinParts.xButton, clickEvents, function(e){
                setTimeout(function() {
                    this._closeZoom(e);
                }.bind(this), 500);
                return this._preventEvent(e);
            }.bind(this));
            this._registerEvents(this._skinParts.buttonPrev, clickEvents, function(e){
                this.gotoPrev(e);
                return this._preventEvent(e);
            }.bind(this));
            this._registerEvents(this._skinParts.buttonNext, clickEvents, function(e){
                this.gotoNext(e);
                return this._preventEvent(e);
            }.bind(this));

            this._registerEvents(this._skinParts.xButton, moveEvents, this._preventEvent);
            this._registerEvents(this._skinParts.buttonPrev, moveEvents, this._preventEvent);
            this._registerEvents(this._skinParts.buttonNext, moveEvents, this._preventEvent);
        },

        _registerEvents: function(element, events, handlerCB) {
            _.forEach(events, function(eventType) {
                element.addEvent(eventType, handlerCB);
            });
        },

        _onOrientationChange: function () {
            if (this._currentDisplayer) {
                this._currentDisplayer.hideContent();
            }
            this.showZoomImage(!this._extraParams.disableRerender);
            this._setOrientation();

            if(this._extraParams.disableRerender) {
                var that = this;
                _.delay(function () {
                    var windowWidth = that.resources.W.Utils.getWindowSize().width;
                    that._currentDisplayer.showContent();
                    that._currentDisplayer.setWidth(windowWidth);
                }, 300);
            }
        },

        _changeButtonsVisibility: function(show) {
            if(show){
                this.setState('doShowButtons', 'showButtons');
                //this._currentDisplayer.showText();
            }else{
                this.setState('dontShowButtons', 'showButtons');
                //this._currentDisplayer.hideText();

            }
        },

        _closeZoom:function () {
            this.collapse();
            this.injects().Viewer.exitFullScreenMode();
            this.setDataItem(null);
            this.resetIterator();
            this._skinParts.virtualContainer.empty();
            this._skinParts.itemsContainer.empty();
            this._opened = false;
            this.unlock();
            //tmp
            this._lastCurrentItem = null;

            this._enableScroll();
            window.removeEvent("orientationchange", this._onOrientationChange);
            this._enableZoomAndMagnifier();
            this._refreshQuickActions();

            var cmds = this.injects().Commands;
            cmds.executeCommand("WViewerCommands.MobileMediaZoom.Closed");
        },



        showZoomImage:function (forceRender) {
            if(this._mobileConfig.isMobileOrTablet()) {
                window.addEvent("orientationchange", this._onOrientationChange);
            }
            this._disableScroll();
                if (forceRender || (this._currentItem && this._currentItem != this._lastCurrentItem)) {
                    var windowSize = this.injects().Utils.getWindowSize();
                    var DisplayerMargin = this.getSkin().getParams().first(function (param) {
                        return param.id === '$marginIncludingArrow';
                    });
                    this._imageMaxWidth = windowSize.width - (DisplayerMargin.defaultValue * 2);
                    this._imageMaxHeight = windowSize.height - 60;
                    this._lastCurrentItem = this._currentItem;
                    this._renderCurrentDisplayer(this._transitionToCurrentDisplayer);
                    this._skinParts.counter.set("text", String(this._currentItemIndex + 1) + "/" + String(this._numItems));
                    this.injects().Viewer.enterFullScreenMode();
                    this.uncollapse();
                }
                },

        _renderCurrentDisplayer: function (callback) {
            var container = this._skinParts.virtualContainer;

            for (var i = 0; i < container.childNodes.length; i++) {
                container.childNodes[i].destroy();
            }

            var params = {
                'container' : this._skinParts.virtualContainer,
                'x'         : this._imageMaxWidth,
                'y'         : this._imageMaxHeight
            };

            _.delay(this._getDisplayerDivFunction, 500, this._currentItem, params, this._getDisplayerCallback);

        },

        _getDisplayerCallback: function (htmlElement) {
            if (!htmlElement.getParent('[skinpart="virtualContainer"]')) {
                htmlElement.insertInto(this._skinParts.virtualContainer);
            }
            this._changeImageNoTransition(htmlElement);
            if (document.body.getAttribute('preview') !== 'edit') {
                if (this._enableZoomScroll) {
                    document.body.addClass("wixappsFullScreenMode");

                    window.setTimeout(function () {
                        var windowWidth = this.resources.W.Utils.getWindowSize().width;
                        htmlElement.getLogic().setWidth(windowWidth);
                    }.bind(this), 10);


                    this._view.setStyles({position: 'absolute', top: 0});
                    this._skinParts.blockingLayer.setStyles({position: 'static', 'overflow-x': 'hidden'});

                    // in old browsers (native on s2,s3), the bar is hiding the zoom, so we're closing it
                    if (window.WQuickActions && this._mobileConfig.isAndroidOldBrowser()) {
                        window.WQuickActions.hideBar();
                    }
                }
                window.scrollTo(0, 0);

                var params = {
                    height: this._skinParts.blockingLayer.getHeight(),
                    top: 0
                };
                this.resources.W.Commands.executeCommand('WPreviewCommands.resetCustomScrollbar', params);
            }

            this._currentDisplayer = htmlElement.getLogic();
        },

        _changeImageNoTransition:function (currentDisplayer) {
            var container = this._skinParts.itemsContainer;
            var that = this;

            for (var i = 0; i < container.childNodes.length; i++) {
                container.childNodes[i].destroy();
            }
            container.empty();
            var size = currentDisplayer.getStyles('width', 'height');
            var topGap = that._getTopGap(size.height.replace('px', ''));
            container.adopt(currentDisplayer);
            that._skinParts.virtualContainer.empty();
            that._skinParts.dialogBox.setStyles({
//                'width':size.width,
                'min-height':size.height,
                'margin-top':topGap + 'px'
            });
            that.unlock();
        },

        setGallery: function (itemsList, currentItemIndex, getDisplayerDivFunction, getHashPartsFunction, extraParams) {
            if(extraParams){
                if(this._mobileConfig.isMobile() && extraParams.enableSwipe === false){
                    Hammer(this._view).off("swipeleft", this.gotoNext); //TODO add those events back!!! site may have ecommerce and regular gallery as well!!
                    Hammer(this._view).off("swiperight", this.gotoPrev);
                }
                this._enableZoomScroll = extraParams.enableScroll;
            }
            this._pos = {left: window.pageXOffset, top: window.pageYOffset};

            this.parent(itemsList, currentItemIndex, getDisplayerDivFunction, getHashPartsFunction, extraParams);
            this._disableZoomAndMagnifier();
            setTimeout(this.fixZoom.bind(this), 300);
        },

        _disableZoomAndMagnifier: function () {
            if (this._isMobilePreviewMode) {
                return;
            }
            if (this.getState('viewerType') === "mobile") {
                W.Viewer.removeViewerRotationListener();


                if (this._mobileConfig.isAndroidOldBrowser()){
                    var inWixApps = this._enableZoomScroll;
                    if(!inWixApps){
                        this._androidDoubleClickFix();
                    }
                    _.delay(this._androidZoomScaleFix, 100);
                    this.addAndroidScaleFix();
                } else {
                    W.Viewer.setViewportTag(Constants.ViewerTypesParams.DOC_WIDTH.MOBILE, this._initZoom);
                }

            }else{
                var currentZoom = this._mobileConfig.getZoom();
                this.resources.W.Viewer.setViewportAttribute('minimum-scale', currentZoom);
                this.resources.W.Viewer.setViewportAttribute('maximum-scale', currentZoom);
            }
        },

        _enableZoomAndMagnifier: function () {
            if (this._isMobilePreviewMode) {
                return;
            }
            if (this.getState('viewerType') === "mobile") {
                if(this._mobileConfig.isAndroidOldBrowser()){
                    this.removeAndroidScaleFix();
                }
                W.Viewer.addViewerRotationListener();
                W.Viewer.resetViewportTag();
            }else{
                this.resources.W.Viewer.setViewportAttribute('minimum-scale', 0.25);
                this.resources.W.Viewer.setViewportAttribute('maximum-scale', 1.2);
            }
        },

        addAndroidScaleFix:function(){
            window.addEventListener("orientationchange", this._androidZoomScaleFix, false);
        },

        removeAndroidScaleFix:function(){
            window.removeEventListener("orientationchange", this._androidZoomScaleFix);
        },

        _androidZoomScaleFix:function(){
            W.Viewer.setViewportTag(Constants.ViewerTypesParams.DOC_WIDTH.MOBILE, 1);
            W.Viewer.setViewportTag('device-width', 1);
        },

        _androidDoubleClickFix: function(){
            var layer = this._view;
            layer.addEventListener('touchstart', this._preventEvent);
        },

        _refreshQuickActions: function() {
            if (window.WQuickActions) {
                window.WQuickActions.startZooming();
            }
        },

        _disableScroll:function(){
            if(!this._enableZoomScroll){
                document.addEvent('touchmove', this._preventEvent);
            }
        },

        _preventTouchStart: function(e){
            console.log(e.type);
            //this._changeButtonsVisibility(e);
            this._preventEvent(e);
        },

        _preventEvent: function(e){
            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        _enableScroll: function () {
            this._pos = this._pos || {top: 0, left: 0};

            if (this._enableZoomScroll) {
                document.body.removeClass("wixappsFullScreenMode");

                this._view.setStyles({position: 'fixed', top: 'auto'});
                this._skinParts.blockingLayer.setStyles({position: 'fixed', 'overflow-x': 'auto'});
                this._enableZoomScroll = false;
            } else {
                document.removeEvent('touchmove', this._preventEvent);
                document.removeEvent('touchstart', this._preventTouchStart);
            }

            window.scrollTo(this._pos.left, this._pos.top);

            if (W.Config.env.$isEditorViewerFrame) {
                this.resources.W.Commands.executeCommand('WPreviewCommands.resetCustomScrollbar', {top: this._pos.top});
            }
        }
    });
});
