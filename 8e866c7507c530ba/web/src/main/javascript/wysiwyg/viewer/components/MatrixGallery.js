define.component('wysiwyg.viewer.components.MatrixGallery', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition **/
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.viewer.utils.ComponentSequencer']);

    def.binds(['_increaseTotalMaxRows', '_sequencingHook', '_handleEditModeChange', '_handleViewerModeChange']);

    def.resources(['W.Config', 'W.Commands']) ;

    def.dataTypes(['ImageList']);

    def.skinParts({
        'imageItem': { type:'wysiwyg.viewer.components.Displayer', repeater:true, container:'itemsContainer', dataRefField:'items', argObject:{unit:'px'} },
        'itemsContainer': { type:'htmlElement' },
        'showMore':       { type:'htmlElement' }
    });

    def.states(['fullView','hiddenChildren']);

    def.propertiesSchemaType('MatrixGalleryProperties');

    def.fields({
        _itemsRef : [],
        _galleryItems : [],
        _totalMaxRows : 0,
        _numCols : 0,
        _numRows : 0,
        _gap : 0,
        _itemWidth : -1,
        _itemHeight : -1,
        _transitionProp : "",
        _numItems : 0,
        _imageMode : "",
        _transitionsOn : true,
        _Tween : null,
        _widthDiff : 0,
        _heightDiff : 0,
        _minDisplayerWidth : 5,
        _minDisplayerHeight : 5,
        _renderingPhase : "normal",
        _defaultButtonLabel: "Show More"
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
                        galleryConfigID: 'MatrixGallery',
                        publicMediaFile: 'photos',
                        selectionType: 'multiple',
                        mediaType: 'picture',
                        i18nPrefix: 'multiple_images',
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
                    galleryConfigID: 'MatrixGallery',
                    publicMediaFile: 'photos',
                    selectionType: 'multiple',
                    mediaType: 'picture',
                    i18nPrefix: 'multiple_images',
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
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._transitionProp = this.injects().Utils.getCSSBrowserFeature('transition');
            this._Tween = this.injects().Utils.Tween;
            this.setMaxW(10000);
            this.setMaxH(10000);

            this._sequencer = new this.imports.ComponentSequencer();
            if(args && args.sequencingHook) {
                this._sequencer.resolveItem = args.sequencingHook;
            } else {
                this._sequencer.resolveItem = this._sequencingHook;
            }

            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handleEditModeChange);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerModeChange);
        },

        _handleEditModeChange: function(mode, oldMode) {
            if ((oldMode && oldMode.source) === "PREVIEW") {
                this._setTotalMaxRows(this._getRowNumber());
            }

            if(this._isInEditingMode()) {
                this._onDataChange() ;
            }
        },

         _onRender: function(){
            this._setButtonLabelText();
        },
        _setButtonLabelText: function(){
            var data = this.getComponentProperties();

            if(this._skinParts.showMore !== undefined){
                if(data.get('showMoreLabel') === undefined){
                    this._skinParts.showMore.textContent = this._defaultButtonLabel;
                }
                else{
                    this._skinParts.showMore.textContent = data.get('showMoreLabel');
                }
            }

        },

        _sequencingHook : function () {
            return { comp:'wysiwyg.viewer.components.Displayer', skin: this._skin.compParts.imageItem.skin };
        },

        _handleEditModeChange: function(mode) {
            if(this._isInEditingMode()) {
                this._onDataChange() ;
            }
        },

        _handleViewerModeChange: function() {
            this._onDataChange() ;
        },

        _isInEditingMode: function() {
            return !this.resources.W.Config.env.isEditorInPreviewMode() ;
        },

        /**
         * @override
         */
        _onDataChange: function(dataItem, changedProperty) {
            var newWidth, newHeight, numCols;
            this._numItems = this._data.get("items").length;

            this._numCols = parseInt(this.getComponentProperty("numCols"));
            this._numRows = this._getRowNumber();
            this._gap = parseInt(this.getComponentProperty("margin"));
            this._imageMode = String(this.getComponentProperty("imageMode"));
            this._updateState();

            if (this._itemWidth === -1) {
                this._calculateItemSize();
            } else {
                if (this._numItems > 0) {
                    newWidth = Math.round((this._numCols * this._itemWidth) + ((this._numCols - 1) * this._gap));
                    newHeight = Math.round((this._numRows * this._itemHeight) + ((this._numRows - 1) * this._gap));
                    this._setContainerWidth(newWidth);
                    this._setContainerHeight(newHeight);
                    this._positionAllItems();
                    this.fireEvent("autoSized");
                }
            }

            this._updateSizeLimits();
            this.parent();
        },
        _skinParamsChange: function (param) {
            var displayer,
                galleryItems = this._galleryItems,
                oldHeightDiff;

            if ('size' !== _.values(param)[0]) {
                return;
            }

            displayer = galleryItems[0] ? galleryItems[0].getLogic() : "";
            if (displayer) {
                oldHeightDiff = displayer.getOldHeightDiff();
                this._itemHeight = this._itemHeight - (oldHeightDiff - displayer.getHeightDiff());
                this._onDataChange();
                this.render();
            }
        },
        _updateGridGalleryAccordingToData: function() {
            var newWidth, newHeight, numCols;
            this._numItems = this._data.get("items").length;

            this._numCols = parseInt(this.getComponentProperty("numCols"));
            this._numRows = this._getRowNumber();
            this._gap = parseInt(this.getComponentProperty("margin"));
            this._imageMode = String(this.getComponentProperty("imageMode"));
            this._updateState();

            if (this._itemWidth === -1) {
                this._calculateItemSize();
            } else {
                if (this._numItems > 0) {
                    newWidth = Math.round((this._numCols * this._itemWidth) + ((this._numCols - 1) * this._gap));
                    newHeight = Math.round((this._numRows * this._itemHeight) + ((this._numRows - 1) * this._gap));
                    this._setContainerWidth(newWidth);
                    this._setContainerHeight(newHeight);
                    this._positionAllItems();
                    this.fireEvent("autoSized");
                }
            }
            this._updateSizeLimits();
        },

        _getRowNumber : function () {
            var numCols = parseInt(this.getComponentProperty("numCols"));
            var maxRows = parseInt(this.getComponentProperty("maxRows"));
            if(this._numItems && this._numItems < (maxRows * numCols)) {
                return this._normalizeRows(maxRows);
            } else {
                return maxRows;
            }
        },

        _updateSizeLimits : function () {
            this.setMinW((this._numCols * (this._minDisplayerWidth + this._gap)) + this._widthDiff - this._gap);
            this.setMinH((this._numRows * (this._minDisplayerHeight + this._gap)) + this._heightDiff - this._gap);
        },

        _setContainerWidth : function (value) {
            var galleryWidth = value + this._widthDiff;
            this._skinParts.itemsContainer.setStyle("width", String(value) + "px");
            this._view.setStyle("width", String(galleryWidth) + "px");
            this.setWidth(galleryWidth, false, false);
        },

        _setContainerHeight : function (value) {
            var galleryHeight = value + this._heightDiff;
            this._skinParts.itemsContainer.setStyle("height", String(value) + "px");
            this.setHeight(galleryHeight, false, false);
            this._view.setStyle("height", String(galleryHeight) + "px");
        },

        _updateContainerSize : function () {
            var size = this._view.getSize();
            if(size.x == 0 || size.y == 0) {
                size.x = this.getWidth();
                size.y = this.getHeight();
            }
            var containerWidth = size.x - this._widthDiff;
            var containerHeight = size.y - this._heightDiff;
            this._skinParts.itemsContainer.setStyles({
                "width" : containerWidth + "px",
                "height" : containerHeight + "px"
            });
        },


        _calculateItemSize : function (size) {
            if (this._skinParts && this._data.get("items").length > 0) {
                size = size || this._view.getSize();
                if (size.x === 0 || size.y === 0) {
                    size.x = this.getWidth();
                    size.y = this.getHeight();
                }
                var containerWidth = size.x - this._widthDiff;
                var containerHeight = size.y - this._heightDiff;
                this._itemWidth = Math.max(Math.floor((containerWidth - ((this._numCols - 1) * this._gap)) / this._numCols), 0);
                this._itemHeight = Math.max(Math.floor((containerHeight - ((this._numRows - 1) * this._gap)) / this._numRows), 0);
            }
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
            this._sequencer.addEvent('componentSetup', function (event) {
                this._onDisplayerCreation(event.compView.getLogic(), event.method, event.index);
            }.bind(this));

            this._sequencer.addEvent('productionFinished', function (event) {
                this._onSequencerFinished(event);
            }.bind(this));

            this._skinParts.itemsContainer.setStyles({ "position" : "relative"});

            if (this._skinParts.showMore) {
                this._skinParts.showMore.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._increaseTotalMaxRows);
                this._skinParts.showMore.setStyles({'white-space': 'nowrap'});
            }
            this._widthDiff = this._skin.widthDiff || 0;
            this._heightDiff = this._skin.heightDiff || 0;
            this._bottomGap = this._skin.bottomGap || 0;
            this._calculateItemSize();
            this._updateSizeLimits();
            this._setCorrectedComponentSize();
            this._updateContainerSize();
        },

        isPartiallyFunctionalInStaticHtml: function(){
            return true;
        },

        render : function () {
            this._newItems = [];
            this._sequencer.createComponents(this._skinParts.itemsContainer, this._data.get("items").slice(0, this._numCols * this._numRows));
        },

        _onSequencerFinished: function(payload) {
            this._renderingPhase = "normal";
            this._galleryItems = payload.elements;
            this._totalMaxRows = this.getComponentProperty("maxRows");
            this._positionAllItems();
            this._setupAllItems();
        },

        _setupItem : function (displayerView) {
            // var displayerView = this._skinParts.itemsContainer.children[itemIndex];
            if (displayerView.getLogic) {
                var displayer = displayerView.getLogic();
                displayer.setOwner(this);
                displayer.invalidateSize();
                displayer.setSize(this._itemWidth, this._itemHeight - this._bottomGap, this._imageMode);

                if (this._transitionsOn && parseFloat(displayerView.getStyle("opacity")) < 1.0) {
                    if (this._transitionProp) {
                        displayerView.setStyle(this._transitionProp, "opacity 1s");
                        setTimeout(function () {
                            displayerView.setStyle("opacity", "1.0");
                        }, 150);
                    } else {
                        this._Tween.to(displayerView, 1.0, { opacity:1.0 });
                    }
                }
            }
        },

        _onDisplayerCreation: function(itemLogic, method, index) {
            if (method == "create" && this._renderingPhase == "showMore") {
                itemLogic.getViewNode().setStyle("opacity", "0.0");
            }
        },

        _normalizeRows : function (requestedRows) {
            var maxRows = Math.floor(this._numItems / this._numCols) + ((this._numItems % this._numCols > 0) ? 1 : 0);
            return Math.min(requestedRows, maxRows);
        },

        _updateState : function () {
            if (this._numItems <= (this._numRows * this._numCols)) {
                this.setState("fullView");
            } else {
                this.setState("hiddenChildren");
            }
        },

        _positionAllItems : function (items) {
            items = items || this._galleryItems;
            for (var i = 0; i < items.length; i++) {
                var pos = this._calcItemPosition(i);
                items[i].setStyles({ position:"absolute", left: pos.left + "px", top: pos.top + "px"});
            }
        },

        _calcItemPosition : function (itemIndex) {
            var col = itemIndex % this._numCols;
            var row = Math.floor((itemIndex - col) / this._numCols);
            return {
                left:(col * (this._itemWidth + this._gap)),
                top:(row * (this._itemHeight + this._gap)),
                width: this._itemWidth + this._gap,
                height: this._itemHeight + this._gap
            };
        },

        _setupAllItems : function (items) {
            items = items || this._galleryItems;
            for (var i = 0; i < items.length; i++) {
                this._setupItem(items[i]);
            }
        },

        /**
         * Corrects the dimensions of the component so that the container width can be divided by the number
         * of columns and the height by the number of rows (so that the exact size of the items is integer)
         */
        _setCorrectedComponentSize : function () {
            var correctedWidth = this.getWidth() - ((this.getWidth() - this._widthDiff - (this._gap * (this._numCols-1))) % this._numCols);
            var correctedHeight = this.getHeight() - ((this.getHeight() - this._heightDiff- (this._gap * (this._numRows-1))) % this._numRows);
            this._view.setStyles({
                width: correctedWidth,
                height: correctedHeight
            });
            this.setWidth(correctedWidth, false, false);
            this.setHeight(correctedHeight, false, false);
        },


        /**
         * @override
         */
        _onResize: function() {
            this.parent();
            if(this._skinParts) {
                this._calculateItemSize({
                    x: this.getWidth(),
                    y: this.getHeight()
                });
                this._setCorrectedComponentSize();
                this._updateContainerSize();

//                this._checkExtremeValues();
                this._positionAllItems();
                this._setupAllItems();
            }
        },

        _checkExtremeValues : function () {
            if (this._itemWidth < this._minDisplayerWidth) {
                var containerWidth = this.getWidth() - this._widthDiff;
                this._itemWidth = this._minDisplayerWidth;
                this._gap = Math.floor((containerWidth - (this._numCols * this._itemWidth)) / (this._numCols - 1));
                this.setComponentProperty("margin", this._gap);
            } else if (this._itemHeight < this._minDisplayerHeight) {
                var containerHeight = this.getHeight() - this._heightDiff;
                this._itemHeight = this._minDisplayerHeight;
                this._gap = Math.floor((containerHeight - (this._numRows * this._itemHeight)) / (this._numRows - 1));
                this.setComponentProperty("margin", this._gap);
            }
        },

        _increaseTotalMaxRows : function() {
            this._setTotalMaxRows(this._normalizeRows(this._numRows + parseInt(this.getComponentProperty("incRows"))));
        },

        _setTotalMaxRows : function (value) {
            this._numRows = value;
            var newHeight = Math.floor((this._numRows * this._itemHeight) + ((this._numRows - 1) * this._gap));
            this._updateState();
            this._setContainerHeight(newHeight);
            this._calculateItemSize();
            this.fireEvent("autoSized");
            this._renderingPhase = "showMore";
            this.render();
        },

        getSequencer : function () {
            return this._sequencer;
        }
    });
});
