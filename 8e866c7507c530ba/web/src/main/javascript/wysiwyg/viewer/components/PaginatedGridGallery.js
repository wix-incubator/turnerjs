/**
 * @class wysiwyg.viewer.components.PaginatedGridGallery
 */
define.component('wysiwyg.viewer.components.PaginatedGridGallery', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.MatrixGallery');

    def.traits(["wysiwyg.viewer.components.traits.GalleryAutoplay"]);

    def.utilize([
        'wysiwyg.viewer.utils.MatrixTransitions',
        'wysiwyg.viewer.utils.GalleryUtils',
        'bootstrap.utils.LinkUtils',
        'wysiwyg.common.utils.LinkRenderer'
    ]);

    def.resources(['W.Utils', 'W.Commands', 'W.Viewer', 'W.Config', 'W.Data']);

    def.propertiesSchemaType('PaginatedGridGalleryProperties');

    def.binds(['next', 'prev', '_onTransitionComplete', '_onRollOut', '_onMouseMove', '_onClick', '_onPrevious', '_onNext']);

    def.skinParts({
        'itemsContainer':{ type:'htmlElement' },
        'buttonPrev':{ type:'htmlElement' },
        'buttonNext':{ type:'htmlElement' },
        'counter':{ type:'htmlElement', optional:true },
        'rolloverHolder':{ type:'htmlElement', optional:true },

        // Displayer parts:
        'title':{ type:'htmlElement', optional:false },
        'description':{ type:'htmlElement', optional:false },
        'zoom':{ type:'htmlElement', optional:true  },
        'link':{ type:'htmlElement', optional:false }
    });

    def.states({
        "rendering":["pending", "ready"],
        "itemSelection":["rollover", "idle"],
        "linkableComponent":["link", "noLink"],
        'slideshow':['autoplayOn', 'autoplayOff'],
        "mobile":["notMobile", "mobile"],
        'displayDevice' : ['mobileView']
    });

    def.fields({
        _rolloverSequencer:null,
        _fixedRowNumber:false,
        _pageItemsCount:0,
        _currentItemIndex:0,
        _displayerDict:{},
        _transitionPending:false,
        _transitionUtils:null,
        _linkUtils:null,
        _NO_LINK_PROPAGATION:true,
        _hasRollOver:true
    });

    def.methods({

        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._transitionUtils = new this.imports.MatrixTransitions();
            this._linkUtils = new this.imports.LinkUtils();
            this._view.addEvent(Constants.CoreEvents.MOUSE_MOVE, this._onMouseMove);
            this._view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onRollOut);

            if ('fixedRowNumber' in args) {
                this._fixedRowNumber = (args.fixedRowNumber === true);
            }

            if (args.sequencingHook === undefined) {
                this._sequencer.resolveItem = function () {
                    return {
                        comp:'wysiwyg.viewer.components.ImageLite',
                        skin:'mobile.core.skins.InlineSkin'
                    };
                };
            }

            if (args.rolloverHook) {
                this._rolloverSequencer = new this.imports.ComponentSequencer();
                this._rolloverSequencer.resolveItem = args.rolloverHook;
                this._rolloverSequencer.addEvent('componentSetup', this._onRollOverViewCreated);
            }

            if(W.Config.mobileConfig.isMobileOrTablet()){
                    this.setState("mobile", "mobile");
            }else{
                this.setState("notMobile", "mobile");
            }

            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState("mobileView", "displayDevice");
            }

            this._linkRenderer = new this.imports.LinkRenderer();
        },

        _onRollOverViewCreated:function (payload) {
            this._setupItem(payload.compView);
        },

        getSequencer:function () {
            return this._sequencer;
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
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
                this._updateGalleryImageOnClickAction();
            }
            this.parent();
            this._skinParts.itemsContainer.setStyles({ "position":"relative"});
            this._skinParts.itemsContainer.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            if (this._skinParts.rolloverHolder) {
                this._skinParts.rolloverHolder.addEvent(Constants.CoreEvents.CLICK, this._onClick);
                this._skinParts.rolloverHolder.setStyles({
                    "overflow":"hidden"
                });
            }

            var userSelectProp = this.injects().Utils.getCSSBrowserFeature('user-select');

            var buttonStyle = {
                "cursor":"pointer"
            };
            if (userSelectProp) {
                buttonStyle[userSelectProp] = "none";
            }
            this._skinParts.buttonPrev.setStyles(buttonStyle);
            this._skinParts.buttonNext.setStyles(buttonStyle);

            this._addEventListeners();
            this._skinParts.itemsContainer.setStyle("overflow", "hidden");
            this._transitionUtils.setupTransitionMap(this._calcItemPosition.bind(this), this._skinParts.itemsContainer);
            this._checkSkinPartsVisibility();
        },

        _addEventListeners:function(){
            this._skinParts.buttonPrev.addEvent(Constants.CoreEvents.CLICK, this._onPrevious);
            this._skinParts.buttonNext.addEvent(Constants.CoreEvents.CLICK,this._onNext);
            if(this.getState("mobile") === "mobile"){
                Hammer(this._view).on("swiperight", this._onPrevious);
                Hammer(this._view).on("swipeleft", this._onNext);
            }
        },

        _onPrevious:function(event){
            event.stopPropagation();
            this.prev();
        },

        _onNext:function(event){
            event.stopPropagation();
            this.next();
        },

        _onResize:function () {
            this.parent();
            if (this._skinParts) {
                this._resetRollOver();
            }
        },

        _onDataChange:function (dataItem, changedProperty) {
            this._updateGalleryImageOnClickAction();
            this._currentItemIndex = 0;
            this._pageItemsCount = parseInt(this.getComponentProperty("numCols") * this._getRowNumber());
            if (this._componentReady && dataItem === this._data) {
                this._skinParts.itemsContainer.empty();
            }
            this._checkSkinPartsVisibility();
            this.parent(dataItem, changedProperty);
        },


        render:function () {
            // In certain situations, the size has not been properly calculated is not yet ready on the first render. #quickfix
            if(this._isRendered === false) {
                this._calculateItemSize();
            }

            var dataRefs = this._data.get("items");
            this._displayerDict = {};

            if (this._skinParts.counter) {
                this._skinParts.counter.set("text", this._getCounterText(this._currentItemIndex, dataRefs.length));
            }

            this._pageItemsCount = parseInt(this.getComponentProperty("numCols") * this._getRowNumber());
            this._displayedItems = this._getPageItems(dataRefs, this._currentItemIndex);
            var seqList = this._displayedItems;

            if (dataRefs.length > this._pageItemsCount) {
                this._nextPageItems = this._getPageItems(dataRefs, this._getNextPageItemIndex());
                this._prevPageItems = this._getPageItems(dataRefs, this._getPrevPageItemIndex());
                seqList = seqList.concat(this._nextPageItems).concat(this._prevPageItems);

                this._skinParts.buttonNext.setStyles({"display":"block"});
                this._skinParts.buttonPrev.setStyles({"display":"block"});
            } else {
                this._skinParts.buttonNext.setStyles({"display":"none"});
                this._skinParts.buttonPrev.setStyles({"display":"none"});
            }

            this._sequencer.createComponents(this._skinParts.itemsContainer, seqList);
        },

        /**
         * Implements new method ('fixedRowNumber') of determining number of rows
         * @override
         * @private
         */
        _getRowNumber:function () {
            if (this._fixedRowNumber === true) {
                return parseInt(this.getComponentProperty("maxRows"));
            } else {
                return this.parent();
            }
        },

        /**
         *  Rendering aux. methods
         */

        _getPageItems:function (itemList, firstItemIndex) {
            var pageItems = [];
            var finalItemIndex = Math.min(this._numItems - 1, firstItemIndex + this._pageItemsCount - 1);
            for (var i = firstItemIndex; i <= finalItemIndex; i++) {
                pageItems.push(itemList[i]);
            }

            return pageItems;
        },


        //Experiment Fix3713.New was promoted to feature on Tue Oct 09 17:17:10 IST 2012
        _getCounterText:function (currentItem, totalItemCount) {
            var currentPage = Math.floor(currentItem / this._pageItemsCount);
            var totalPageCount = this._getTotalPageCount();
            if (!totalPageCount) {  // we don't want to display 'n/0'
                totalPageCount = 1; // so it will be 'n/1'
            }
            return String(currentPage + 1) + "/" + String(totalPageCount);
        },

        /**
         * @override
         * @param refList
         */
        _translateRefList:function (refList) {
            var galleryItem;
            var result = [];
            var dataItem;
            var ref;
            var children = this._skinParts.itemsContainer.children;
            var refType = typeOf(refList[0]);
            refList = refList.slice(0);

            for (var i = 0; i < children.length; i++) {
                galleryItem = children[i];
                dataItem = galleryItem.getLogic().getDataItem();
                ref = (refType === "string") ? "#" + dataItem.get('id') : dataItem;
                if (refList.contains(ref)) {
                    result.push(galleryItem);
                    refList.splice(refList.indexOf(ref), 1);
                }
            }
            return result;
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        _checkSkinPartsVisibility:function () {
            if (this._skinParts) {
                this._resetRollOver();
                this._skinParts.buttonPrev.setStyle("visibility", this.getComponentProperty("showNavigation") ? "visible" : "hidden");
                this._skinParts.buttonNext.setStyle("visibility", this.getComponentProperty("showNavigation") ? "visible" : "hidden");
                this._skinParts.counter.setStyle("visibility", this.getComponentProperty("showCounter") ? "visible" : "hidden");

                if (this._skinParts.rolloverHolder) {
                    this._skinParts.rolloverHolder.setStyle("cursor", this._isImageClickable() ? "pointer" : "default");
                }

                this._skinParts.link.set("text", this.getComponentProperty("goToLinkText"));

            }
        },

        /**
         * Overrides irrelevant MatrixGallery state settings
         */
        _updateState:function () {
        },

        /**
         * Handlers of sequencing events
         */

        /**
         * Deals with creation of single displayer
         * @param itemLogic
         * @param method
         * @param index
         */
        _onDisplayerCreation:function (itemLogic, method, index) {
            var view = itemLogic.getViewNode();
            this._setupItem(view);
            var ref;

            if (itemLogic.getRef) {
                ref = itemLogic.getRef();
            } else {
                ref = "#" + itemLogic.getDataItem().get('id');
            }

            view.addClass('galleryDisplayer');
            this._displayerDict[ref] = itemLogic;
            if (index >= this._displayedItems.length) {
                view.setStyles({"top":-this._itemHeight * 1.5, "position":"absolute"});
            }
        },

        /**
         * Called after all displayers have been sequenced
         * @param payload
         */
        _onSequencerFinished:function (payload) {
            payload.elements = payload.elements.slice(0, this._displayedItems.length);
            this.parent(payload);
            this._transitionPending = false;
            this.fireEvent("transitionFinished");
        },


        /**
         *  Transition mechanism
         */


        gotoNext:function () {
            this.next();
        },


        next:function () {
            if (!this._transitionPending && this._numItems > this._pageItemsCount && this._nextPageItems) {
                this._currentItemIndex = this._getNextPageItemIndex();
                this._goto(this._nextPageItems, 0);
            }
        },

        prev:function () {
            if (!this._transitionPending && this._numItems > this._pageItemsCount && this._prevPageItems) {
                this._currentItemIndex = this._getPrevPageItemIndex();
                this._goto(this._prevPageItems, 1);
            }
        },

        _getNextPageItemIndex:function () {
            var index = this._currentItemIndex + this._pageItemsCount;
            if (index >= this._numItems) {
                index = 0;
            }
            return index;
        },

        _getPrevPageItemIndex:function () {
            var index = this._currentItemIndex - this._pageItemsCount;
            if (index < 0) {
                index = (this._getTotalPageCount() - 1) * this._pageItemsCount;
            }
            return index;
        },

        _goto:function (incomingItemsRef, direction) {
            this._transitionPending = true;
            this._resetRollOver();
            var currentItems = this._translateRefList(this._displayedItems);
            var incomingItems = this._translateRefList(incomingItemsRef);
            var transFunc = this._transitionUtils.getTransition(this.getComponentProperty('transition'));

            this._setupAllItems(incomingItems);
            transFunc(currentItems, incomingItems, this._numCols, this._numRows,
                direction,
                parseFloat(this.getComponentProperty("transDuration")),
                function () {
                    this._onTransitionComplete(incomingItems);
                }.bind(this));
        },

        _onTransitionComplete: function () {
            if (this._isDisposed) {
                return;
            }
            this.render();
        },

        _onMouseMove:function (event) {
            if (this._transitionPending === true) {
                return;
            }
            var displayerView = this._findDisplayerFromPosition(event.page);
            if (displayerView && this._skinParts.rolloverHolder && this._hasRollOver) {

                if (this._highlightedDisplayer !== displayerView) {
                    this._highlightedDisplayer = displayerView;
                    var rect = displayerView.getCoordinates(this._skinParts.rolloverHolder.getParent());
                    this._skinParts.rolloverHolder.setStyles({
                        visibility:"visible",
                        position:"absolute",
                        padding:0,
                        left:rect.left,
                        top:rect.top,
                        width:rect.width,
                        height:rect.height
                    });
                    this.setState("idle");
                    window.requestAnimFrame(function () {
                        if (this._highlightedDisplayer) {
                            this._updateDisplayerInfo(displayerView.getLogic().getDataItem());
                            var linkData = this._getHighlightedDisplayerData();

                            if (linkData.getType && linkData.getType() === "Image") {
                                var linkableElement = this.getSkinPart("link");
//                                this._linkUtils.linkifyElement(this, linkableElement, linkData, true);
                                this._renderLink(linkableElement, linkData);
                            }

                            this._skinParts.rolloverHolder.setStyle("cursor", this._isImageClickable() ? "pointer" : "default");
                            if (this._galleryImageOnClickAction == 'goToLink') {
                                this._skinParts.link.setStyle('display', 'none');
                            }
                            else {
                                this._skinParts.link.setStyle('display', (this._isImageLinked()) ? 'block' : 'none');
                            }


                            this.setState("rollover");
                        }
                    }.bind(this));
                }
            } else {
                this._resetRollOver();
            }
        },

        _onRollOut:function (event) {
            if (event.relatedTarget && (!event.relatedTarget.getParents().contains(this._view))) {
                this._resetRollOver();
            }
        },

        _findDisplayerFromPosition:function (pos) {
            var displayer;
            var compPosition = this._skinParts.itemsContainer.getPosition();
            var relativePos = {
                x:pos.x - compPosition.x,
                y:pos.y - compPosition.y
            };
            var col = Math.floor(relativePos.x / (this._itemWidth + this._gap));
            var row = Math.floor(relativePos.y / (this._itemHeight + this._gap));
            if (col >= 0 && row >= 0) {
                var displayerIndex = (row * this._numCols) + col;
                if (displayerIndex < this._galleryItems.length) {
                    displayer = this._galleryItems[displayerIndex];
                }
            }

            return displayer;
        },

        _findDisplayer:function (childElement) {
            while (childElement) {
                if (childElement === this._skinParts.itemsContainer) {
                    return null;
                }
                if (this._galleryItems.contains(childElement)) {
                    return childElement;
                }
                childElement = childElement.getParent();
            }
            return null;
        },

        _updateDisplayerInfo:function (dataItem) {
            if (this._skinParts.rolloverHolder && this._rolloverSequencer) {
                this._rolloverSequencer.createComponents(this._skinParts.rolloverHolder, [dataItem]);
            } else {
                if (dataItem && dataItem.getData && "title" in dataItem.getData() && "description" in dataItem.getData()) {
                    this._skinParts.title.set("text", dataItem.get("title"));
                    this._skinParts.description.set("text", dataItem.get("description"));
                }
            }
        },

        _hideRollOverHolder:function () {
            this.setState("idle");
            this._skinParts.rolloverHolder.setStyles({
                visibility:"hidden"
            });
        },

        _resetRollOver:function () {
            this._hideRollOverHolder();
            this._highlightedDisplayer = null;
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        /**
         * Expand mode click handler
         */
        _onClick:function (event) {

            if (event.rightClick !== false) {
                return;
            }

            var dataItem;
            if (this._galleryImageOnClickAction == 'zoomMode') {
                var displayerView = this._highlightedDisplayer || this._findDisplayer(event.target);
                if (displayerView) {
                    dataItem = displayerView.getLogic().getDataItem();
                    var itemID = dataItem.get("id");
                    var parentList = this._data.get("items");
                    var currentIndex = parentList.indexOf("#" + itemID);
                    this.resources.W.Commands.executeCommand('WViewerCommands.OpenZoom', {'itemsList':this._data, 'currentIndex':currentIndex,
                        'getDisplayerDivFunction':this.resources.W.Viewer.getDefaultGetZoomDisplayerFunction('Image'),
                        'getHashPartsFunction':this.resources.W.Viewer.getDefaultGetHashPartsFunction('Image')
                    });
                }
            }

            else if (this._galleryImageOnClickAction == 'goToLink' && this._isImageLinked()) {
                this.goToLink();
            }
        },
        goToLink: function () {
            if (this._skinParts.link.click) {
                this._skinParts.link.click();
            } else {
                // For some reason Safari does not implement native Element.click() function
                // One might say this code should be in Element.js. bit it's here. Deal with it.
                var dispatch = document.createEvent("HTMLEvents");
                dispatch.initEvent("click", true, true);
                this._skinParts.link.dispatchEvent(dispatch);
            }
        },

        //Experiment Fix3713.New was promoted to feature on Tue Oct 09 17:17:10 IST 2012
        _getTotalPageCount:function () {
            var totalPageCount = Math.floor(this._numItems / this._pageItemsCount);
            if ((this._numItems % this._pageItemsCount) > 0) {
                totalPageCount++;
            }
            return totalPageCount;
        },

        _renderLink: function(node, dataItem) {
            var linkId = (dataItem && dataItem.get) ? dataItem.get('link') : null;
            if(!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(node, this) ;
                return ;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId) ;
            if(linkDataItem) {
                this._linkRenderer.renderLink(node, linkDataItem, this) ;
            }
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        _isImageLinked:function () {
            var itemData = this._getHighlightedDisplayerData();
            var link = null;

            if (itemData && itemData.get) {
                link = itemData.get('link');
            }

            return !!link;
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        _getHighlightedDisplayerData:function () {
            if (this._highlightedDisplayer && this._highlightedDisplayer.getLogic) {
                return this._highlightedDisplayer.getLogic().getDataItem();
            }
            return null;
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        _isImageClickable:function () {
            if (this._galleryImageOnClickAction === 'goToLink') {
                return this._isImageLinked();
            } else {
                return (this._galleryImageOnClickAction !== 'disabled');
            }
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:36 IST 2012
        _updateGalleryImageOnClickAction:function () {
            if (this.getComponentProperties().hasField('galleryImageOnClickAction')) {
                this._galleryImageOnClickAction = this.getComponentProperty("galleryImageOnClickAction");
            }
            else {
                this._galleryImageOnClickAction = this.getComponentProperty("expandEnabled") ? "zoomMode" : "disabled";
            }
        }

    });
});