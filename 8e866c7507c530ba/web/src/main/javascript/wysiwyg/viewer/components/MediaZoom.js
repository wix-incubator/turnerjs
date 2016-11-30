define.component('wysiwyg.viewer.components.MediaZoom', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_handleCurrentItemChange', '_transitionToCurrentDisplayer', 'gotoNextIfOpen', 'gotoPrevIfOpen']);

    def.traits(['wysiwyg.viewer.components.traits.ListIterator']);

    def.resources(['W.Config', 'W.Utils', 'W.Viewer', 'W.InputBindings']);

    def.skinParts({
        'blockingLayer':{'type':'htmlElement', 'command':'WViewerCommands.MediaZoom.Close'},
        'dialogBox':{'type':'htmlElement'},
        'xButton':{'type':'htmlElement', 'command':'WViewerCommands.MediaZoom.Close'},
        'virtualContainer':{ type:'htmlElement' },
        'itemsContainer':{ type:'htmlElement'},
        'counter':{ type:'htmlElement' },
        'buttonPrev':{ type:'htmlElement', 'command':'WViewerCommands.MediaZoom.Prev'},
        'buttonNext':{ type:'htmlElement', 'command':'WViewerCommands.MediaZoom.Next'}
    });

    def.fields({
        transitionTime:'normal',
        _inTransition:false,
        //TODO: remove when you find a better way to deal with hash change fired twice
        _lastCurrentItem:null
    });

    def.methods(/** @lends wysiwyg.viewer.components.MediaZoom **/{
        /**
         *
         * @param compId
         * @param viewNode
         * @param argsObject
         * @constructs
         */
        initialize:function (compId, viewNode, argsObject) {
            this.isVolatile = true;
            this.parent(compId, viewNode, argsObject);
            var cmds = this.injects().Commands;
            cmds.registerCommandAndListener('WViewerCommands.MediaZoom.Close', this, this._closeZoom, null, true);
            cmds.registerCommandAndListener('WViewerCommands.MediaZoom.Next', this, this.gotoNextIfOpen, null, true);
            cmds.registerCommandAndListener('WViewerCommands.MediaZoom.Prev', this, this.gotoPrevIfOpen, null, true);
            cmds.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditorModeChanged, null, true);
            this.addEvent('currentItemChanged', this._handleCurrentItemChange);
            this.collapse();
        },
        /**
         *
         * @private
         */
        _onAllSkinPartsReady:function () {
            var stop = function (event) {
                event.stopPropagation();
            };
            this._skinParts.dialogBox.addEvent('click', stop);
            this._skinParts.buttonNext.addEvent('click', stop);
            this._skinParts.buttonPrev.addEvent('click', stop);
            this._skinParts.xButton.addEvent('click', stop);
        },

        gotoNextIfOpen: function() {
            if (this.isZoomOpened()) {
                this.gotoNext();
            }
        },

        gotoPrevIfOpen: function() {
            if (this.isZoomOpened()) {
                this.gotoPrev();
            }
        },

        /**
         *
         * @param itemsList
         * @param currentItemIndex
         * @param getDisplayerDivFunction
         * @param getHashPartsFunction
         * @param extraParams
         */
        setGallery:function (itemsList, currentItemIndex, getDisplayerDivFunction, getHashPartsFunction, extraParams) {
            if (!this._validateArgs(itemsList, currentItemIndex)) {
                return;
            }
            this._opened = true;
            this._getDisplayerDivFunction = getDisplayerDivFunction;
            this._getHashPartsFunction = getHashPartsFunction;
            this._extraParams = extraParams || {};  //currently used for hiding next/prev buttons
            this.setDataItem(itemsList);
            this.setListAndCurrentIndex(itemsList, currentItemIndex);
            this._setNextPrevVisibility();
            this._bindKeyboardShortcuts();
        },
        /**
         *
         * @param item
         * @param getDisplayerDivFunction
         * @param getHashPartsFunction
         * @param extraParams
         */
        setImage:function (item, getDisplayerDivFunction, getHashPartsFunction, extraParams) {
            var list = this.injects().Data.createDataItem({'type':'list', 'items':[item]});
            this.setGallery(list, 0, getDisplayerDivFunction, getHashPartsFunction, extraParams);
        },

        /**
         * Opens the zoom for the image
         */
        showZoomImage:function () {
            if (this._currentItem && this._currentItem != this._lastCurrentItem) {
                var windowSize = this._getWindowSize();
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

        /**
         *
         * @returns {*}
         * @private
         */
        _getWindowSize: function(){
            if(this.resources.W.Config.mobileConfig.isMobile()){
                var windowWidth = this.resources.W.Viewer.getDocWidth();
                var windowHeight = window.innerHeight || document.documentElement && document.documentElement.clientHeight; //supports IE
                return { width: windowWidth, height: windowHeight };
            }
            return this.resources.W.Utils.getWindowSize();
        },

        /**
         *
         * @private
         */
        _onEditorModeChanged:function () {
            this._closeZoom();
        },
        /**
         *
         * @private
         */
        _closeZoom:function () {
            this.collapse();
            this.injects().Viewer.exitFullScreenMode();
            this.setDataItem(null);
            this.resetIterator();
            this._skinParts.virtualContainer.empty();
            this._skinParts.itemsContainer.empty();
            this._skinParts.dialogBox.setStyles({'width':'100px'});
            this._opened = false;
            this.unlock();
            //tmp
            this._lastCurrentItem = null;
            this._unbindKeyboardShortcuts();
        },
        /**
         *
         * @private
         */
        _handleCurrentItemChange:function () {
            this.lock(); // trait method - disable item change until transition is done
            var changeHandler = function (itemHashParts) {
                var currentHashParts = this.injects().Utils.hash.getHashParts();
                if (currentHashParts.id === itemHashParts.id && currentHashParts.extData === itemHashParts.extData) {
                    this.showZoomImage();
                } else {
                    this.injects().Utils.hash.setHash(itemHashParts.id, itemHashParts.title, itemHashParts.extData, true);
                }
            }.bind(this);

            if (this._getHashPartsFunction) {
                this._getHashPartsFunction(this._currentItem, changeHandler);
            } else {
                this.showZoomImage();
            }
        },

        /**
         *
         * @param callback
         * @private
         */
        _renderCurrentDisplayer:function (callback) {
            var container = this._skinParts.virtualContainer;
            for (var i = 0; i < container.childNodes.length; i++) {
                container.childNodes[i].destroy();
            }
            var that = this;
            this._getDisplayerDivFunction(this._currentItem,
                {'container':that._skinParts.virtualContainer, 'x':this._imageMaxWidth, 'y':this._imageMaxHeight},
                function (htmlElement) {
                    if (!htmlElement.getParent('[skinpart="virtualContainer"]')) {
                        htmlElement.insertInto(that._skinParts.virtualContainer);
                    }
                    that._transitionToCurrentDisplayer(htmlElement);
                });
        },
        //the lock() unlock() mechanism should take care of that, but, the image.js does weired things like firing width 914 and then 913.9999 which we can prevent
        //but so that there won't be other things that might surprise us and fuck up the position of the expand mode..

        /**
         *
         * @param currentDisplayer
         * @private
         */
        _transitionToCurrentDisplayer:function (currentDisplayer) {
            if (this._inTransition) {
                return;
            }
            this._inTransition = true;
            currentDisplayer.setStyle('opacity', '0.0');
            var container = this._skinParts.itemsContainer;
            var that = this;

            var changeBoxSizeAndShow = function () {
                for (var i = 0; i < container.childNodes.length; i++) {
                    container.childNodes[i].destroy();
                }
                container.empty();
                var size = currentDisplayer.getSize();
                var topGap = that._getTopGap(size.y);
                container.adopt(currentDisplayer);
                that._skinParts.virtualContainer.empty();

                var fx_size = new Fx.Morph(that._skinParts.dialogBox, {'duration':that.transitionTime, 'link':'chain'});
                fx_size.addEvent('complete', function () {
                    var fx_show = new Fx.Tween(currentDisplayer, {'duration':that.transitionTime, 'link':'chain'});
                    fx_show.addEvent('complete', function () {
                        that.unlock();
                        that._inTransition = false;
                        //that.injects().Utils.forceBrowserRepaint();
                        fx_show.removeEvent('complete', arguments.callee);
                    });
                    fx_show.start('opacity', '1.0');
                    fx_size.removeEvent('complete', arguments.callee);
                });

                fx_size.start({
                    'width':size.x + 'px',
                    'min-height':size.y + 'px',
                    'margin-top':topGap + 'px'
                });
                if (fx_old) {
                    fx_old.removeEvent("complete", arguments.callee);
                }

            };
            if (container.hasChildNodes()) {
                var fx_old = new Fx.Tween(container.firstChild, {'duration':that.transitionTime, 'link':'chain', 'property':'opacity'});
                fx_old.addEvent('complete', changeBoxSizeAndShow);
                fx_old.start('0.0');
            }
            else {
                changeBoxSizeAndShow();
            }
        },

        /**
         * this method isn't used normally, it's here for debugging
         * you can replace the call to _transitionToCurrentDisplayer with this
         * @param currentDisplayer
         * @private
         */
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
                'width':size.width,
                'min-height':size.height,
                'margin-top':topGap + 'px'
            });
            that.unlock();
        },

        // dialog methods
        /**
         *
         * @param dialogHeight
         * @returns {number}
         * @private
         */
        _getTopGap:function (dialogHeight) {
            if(this._isEditingMobile()) {
                return 0 ;
            }
            // vertical center
            var windowSize = this.injects().Utils.getWindowSize();
            var gap = (windowSize.height - dialogHeight) / 2;
            return gap > 0 ? gap : 0;
        },

        _isEditingMobile: function () {
            return this.resources.W.Config.env.isInDeactivatedViewer() &&
                   this.resources.W.Config.env.isViewingSecondaryDevice() ;
        },

        /**
         *
         * @param imageList
         * @param imageIndex
         * @returns {boolean}
         * @private
         */
        _validateArgs:function (imageList, imageIndex) {
            if (!imageList || !typeof(imageIndex) == 'number') {
                return false;
            }
            var numImages = imageList.length;
            if (imageList.length < 1) {
                return false;
            }
            if (imageIndex < 0 || imageIndex >= numImages) {
                LOG.reportError(wixErrors.EDITOR_INDEX_OUT_OF_RANGE, "wysiwyg.viewer.components.MediaZoom", "setGallery", imageIndex);
                return false;
            }
            return true;
        },

        /**
         *
         * @private
         */
        _setNextPrevVisibility:function () {
            this._skinParts.buttonNext.uncollapse();
            this._skinParts.buttonPrev.uncollapse();
            if (this.getDataItem().get('items').length <= 1 || this._extraParams.hideNextPrevBtns) {
                this.hideNextPrevButtons();
            }
        },

        /**
         * hides the next/prev buttons in the zoom
         */
        hideNextPrevButtons: function(){
            this._skinParts.buttonNext.collapse();
            this._skinParts.buttonPrev.collapse();
        },

        /**
         *
         * @param item
         * @returns {string}
         * @private
         */
        _getItemId:function (item) {
            var id = typeof(item) == 'string' ? item : item.get('id');
            return id.indexOf('#') == 0 ? id.substr(1) : id;
        },
        _opened:false,
        /**
         *
         * @returns {boolean}
         */
        isZoomOpened:function () {
            return this._opened;
        },
        /**
         * binds the keyboard shortcuts when the zoom is open
         * @private
         */
        _bindKeyboardShortcuts: function(){
            var iB = this.resources.W.InputBindings;
            iB.addBinding("left", {commandName: 'WViewerCommands.MediaZoom.Prev', keypressType: 'keydown'});
            iB.addBinding("right", {commandName: 'WViewerCommands.MediaZoom.Next', keypressType: 'keydown'});
            iB.addBinding("esc", {commandName: 'WViewerCommands.MediaZoom.Close', keypressType: 'keydown'});
        },
        /**
         * removes the binding for the keyboard shortcuts when the zoom is closed
         * @private
         */
        _unbindKeyboardShortcuts: function(){
            var iB = this.resources.W.InputBindings;
            iB.removeBinding("left", 'keydown');
            iB.removeBinding("right", 'keydown');
            iB.removeBinding("esc", 'keydown');
        },
//Experiment Zoom.New was promoted to feature on Mon Aug 20 21:04:09 IDT 2012
        validateArgs:function (itemsList, itemIndex) {
            if (!itemsList || !typeof(itemIndex) == 'number') {
                return false;
            }
            var numImages = itemsList.length;
            if (itemsList.length < 1) {
                return false;
            }
            if (itemIndex < 0 || itemIndex >= numImages) {
                LOG.reportError(wixErrors.EDITOR_INDEX_OUT_OF_RANGE, "wysiwyg.viewer.components.MediaZoom", "setGallery", itemIndex);
                return false;
            }
            return true;
        }
    });
});