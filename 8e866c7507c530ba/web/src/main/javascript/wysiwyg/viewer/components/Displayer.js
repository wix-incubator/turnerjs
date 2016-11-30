/** @class wysiwyg.viewer.components.Displayer*/
define.component('wysiwyg.viewer.components.Displayer', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("mobile.core.components.base.BaseComponent");

    def.skinParts({
        'image':{ type:'core.components.Image', dataRefField:"*", optional:false },
        'imageWrapper':{ type:'htmlElement', optional:false },
        'title':{ type:'htmlElement', optional:false },
        'description':{ type:'htmlElement', optional:false },

        // If defined, click on the 'zoom' part opens Zoom/Lightbox/Expand
        // If undefined, the displayer listens to the 'imageWrapper'
        'zoom':{ type:'htmlElement', optional:true  },

        // Click on the 'link' part navigates to the link associated with the picture
        'link':{ type:'htmlElement', optional:false },

        // The displayer switches to 'rollover state' when the user rolls over this part.
        // If undefined, the whole displayer listens to the rollover
        'rolloverHitArea':{ type:'htmlElement', optional:true }

    });

    def.binds(['_onMouseOver', '_onMouseOut', '_onZoomClick', '_onImageStateChange']);

    def.utilize(['wysiwyg.common.utils.LinkRenderer']) ;

    def.traits(['wysiwyg.common.components.traits.SelectableOption']);

    def.states({
        'general':['loading', 'normal', 'rollover'],
        'transitionPhase':['noTransition', 'transIn', 'transOut'],
        'linkableComponent':["link", "noLink" ],
        'selectState': ['selected','unselected'],
        'displayDevice' : ['mobileView'],
        'textAlignmentState': ['alignLeft', 'alignCenter', 'alignRight'],
        'scaling':['clipImage', 'flexibleHeight', 'flexibleWidth', 'flexibleWidthFixed']
    });

    def.dataTypes(['Image']);

    def.resources(['W.Config', 'W.Data']);

    def.fields({
        _renderTriggers:[ Constants.DisplayEvents.SKIN_CHANGE ],
        _parentList:null,
        _owner:null,
        _expandEnabled:true,
        _debugMode:false,
        _lastSetSizeParams:null,
        _heightDiff: -1
    });

    /**
     * @lends wysiwyg.viewer.components.Displayer
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            this._NO_LINK_PROPAGATION = true;
            viewNode.setStyle("visibility", "hidden");
            this.parent(compId, viewNode, args);
            if (this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState("mobileView", "displayDevice");
            }

            this._linkRenderer = new this.imports.LinkRenderer();
        },

        render:function () {
            this._refreshImage();
            this.parent();

            this._renderLink();
        },

        setOwner:function (owner) {
            this.removeOldOwner();
            if(owner) {
                this._owner = owner;
                this._ownerProps = this._owner.getComponentProperties();
                this._parentList = this._owner.getDataItem();
                this._ownerProps.on(Constants.DataEvents.DATA_CHANGED, this, this._onOwnerPropsChanged);
                this._onOwnerPropsChanged();
            }

            if (this._debugMode) {
                var itemID = this._data.get("id");
                var currentIndex = this._parentList.getData()["items"].indexOf("#" + itemID);
                var element = new Element("div");
                this._debugMode = false;
                element.set("text", String(currentIndex));
                element.setStyles({
                    position:"relative",
                    top:"-20px"
                });
                this.getViewNode().adopt(element);
            }
        },

        removeOldOwner: function() {
            if (this._ownerProps) {
                this._ownerProps.offByListener(this);
            }
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _onOwnerPropsChanged: function(original) {
            // bug fix for automation (for Yishai Burt)
            if (this._isDisposed || (this._owner && this._owner._isDisposed)) {
                return;
            }

            if (this._owner.getComponentProperties().hasField('galleryImageOnClickAction')) {
                this._galleryImageOnClickAction = this._owner.getComponentProperty("galleryImageOnClickAction");
            }

            //backward compatibility:
            else {
                this._galleryImageOnClickAction = (this._owner.getComponentProperty("expandEnabled") === true) ? "zoomMode" : "disabled";
            }

            this._updateLinkText();

            if (!this._isImageClickable() && this.getState().indexOf("rollover") != -1) {
                this.setState("rollover", "general");
            }
            this._updateParts();
            this._setTextAlignment();
        },

        _updateLinkText: function () {
            var link = this._skinParts.link,
                child = link.getChildren();

            if (!child.length) {
                this._skinParts.link.set("text", this._owner.getComponentProperty("goToLinkText"));
            }
        },

        _setTextAlignment:function(){
            var data = this._owner.getComponentProperties(),
                textAlignment = data.get("alignText");

            if(textAlignment){
                switch(textAlignment){
                    case "left":
                        this.setState('alignLeft', 'textAlignmentState');
                        break;
                    case "center":
                        this.setState('alignCenter', 'textAlignmentState');
                        break;
                    case "right":
                        this.setState('alignRight', 'textAlignmentState');
                        break;
                    default:
                        this.setState('alignLeft', 'textAlignmentState');
                }
            }
        },

        setParentList:function (value) {
            this._parentList = value;
        },

        _setupParts:function () {
            var rollOverHitArea = this._skinParts["rollOverHitArea"] || this._view;
            var zoomHitArea = this._skinParts["zoom"] || this._skinParts.imageWrapper;
            this._skinParts.image.addEvent('stateChange', this._onImageStateChange);
            zoomHitArea.addEvent(Constants.CoreEvents.CLICK, this._onZoomClick);
            rollOverHitArea.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            rollOverHitArea.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);

            var textStyles = {
                'overflow':"hidden",
                'text-overflow':"ellipsis"
            };
            this._skinParts.title.setStyles(textStyles);
            this._skinParts.description.setStyles(textStyles);
        },

        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _updateParts:function () {
            if (this._skinParts) {
                if(this._skinParts.image.getDataItem && this._data && this._data !== this._skinParts.image.getDataItem()) {
                    this._skinParts.image.setDataItem(this._data);
                }

                this._skinParts.title.set("text", this._data.get("title"));
                this._skinParts.description.set("text", this._data.get("description"));

                var zoomHitArea = this._skinParts["zoom"] || this._skinParts.imageWrapper;
                zoomHitArea.setStyle("cursor", this._isImageClickable() ? "pointer" : "default");

                var isMobileMode = this.getState("displayDevice") === "mobileView";

                if (this._galleryImageOnClickAction === "goToLink" || !this._isImageLinked() || isMobileMode) {
                    this._skinParts.link.setStyle("display", "none");
                }
                else {
                    this._skinParts.link.setStyle("display", "block");
                }
            }
        },

        _onImageStateChange:function (event) {
            switch (event.newState) {
                case 'loading':
                    this.setState('loading', "general");
                    break;
                case 'loaded':
                    this.setState('normal', "general");
                    break;
            }
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _onMouseOver:function () {
            if (this._isImageClickable() && this.getState().indexOf("normal") != -1) {
                this.setState("rollover", "general");
            }
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _onMouseOut:function () {
            if (this._isImageClickable() && this.getState().indexOf("rollover") != -1) {
                this.setState("normal", "general");
            }
        },

        zoom: function () {
            var itemID = this._data.get("id");
            var currentIndex = this._parentList.getData()["items"].indexOf("#" + itemID);
            this.injects().Commands.executeCommand('WViewerCommands.OpenZoom', {'itemsList': this._parentList, 'currentIndex': currentIndex,
                //should find some other solution for this!!
                'getDisplayerDivFunction': this.injects().Viewer.getDefaultGetZoomDisplayerFunction('Image'),
                'getHashPartsFunction': this.injects().Viewer.getDefaultGetHashPartsFunction('Image')
            });
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


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _onZoomClick:function (event) {
            if (event.rightClick !== false) {
                return;
            }

            if (this._galleryImageOnClickAction == 'zoomMode') {
                this.zoom();
            }

            else if (this._galleryImageOnClickAction == 'goToLink') {
                this.goToLink();
            }
        },

        /**
         * mode:
         *  'clipImage' - sets width and height to displayer, image adjusts itself by width and clips vertically
         *  'flexibleHeight' - sets width to the displayer, the displayer adjusts its height to image
         *  'flexibleWidth' - sets height to the displayer, the displayer adjusts it width to image
         */

        setSize:function (width, height, mode) {
            var newWidth, newHeight;
            var widthDiff, heightDiff;
            var paddingHoriz = 0;

            this.setState(mode || 'clipImage', 'scaling');
            // As _refreshImage() is expensive, we want to prevent unnecessary executions.
            if (this._lastSetSizeParams &&
                this._lastSetSizeParams[0] === width && this._lastSetSizeParams[1] === height && this._lastSetSizeParams[2] === mode) {
                return;
            }

            if (this._componentReady && this._skinParts) {
                this._skinParts.image.checkVisibility();
                widthDiff = this.getWidthDiff() || 0;
                heightDiff = this.getHeightDiff() || 0;

                mode = mode || 'clipImage';
                switch (mode) {
                    case 'clipImage':
                        this._clipImage(width, height, widthDiff, heightDiff);
                        break;

                    case 'flexibleHeight':
                        this._setFlexibleHeight(width, height, widthDiff, heightDiff);
                        break;

                    case 'flexibleWidth':
                        this._setFlexibleWidth(width, height, widthDiff, heightDiff, true);
                        break;

                    case 'flexibleWidthFixed':
                        this._setFlexibleWidth(width, height, widthDiff, heightDiff, false);
                        break;
                }
                this._refreshImage();
                this._lastSetSizeParams = [ arguments[0], arguments[1], arguments[2] ];
            } else {
                this.addEvent(Constants.ComponentEvents.READY, function(){
                    this.setSize(width, height, mode);
                }.bind(this));
            }
        },

        invalidateSize:function () {
            this._lastSetSizeParams = null;
        },

        getWidthDiff:function () {
            if(this.getState("displayDevice") === "mobileView"){
                if(_.isNumber(this._skin.m_widthDiff)){
                    return this._skin.m_widthDiff;
                }
            }
            return this._skin.widthDiff || 0;
        },

        getHeightDiff: function () {
            var skin = this.getSkin(),
                diff = 0,
                imgHeightDiff = skin && skin.getParamValue('imgHeightDiff'),
                topPadding = skin && skin.getParamValue('topPadding');

            if (this._skin && (imgHeightDiff || topPadding)) {
                if (imgHeightDiff) {
                    diff = imgHeightDiff._amount;
                }
                if (topPadding) {
                    diff += topPadding._amount;
                }
            } else
            if (this.getState("displayDevice") === "mobileView") {
                if (_.isNumber(this._skin.m_heightDiff)) {
                    diff = this._skin.m_heightDiff;
                } else {
                    return this._skin.heightDiff || 0;
                }
            } else {
                diff = this._skin.heightDiff || 0;
            }

            this._heightDiff = diff;
            return diff;
        },

        getOldHeightDiff: function(){
            return this._heightDiff;
        },

        _refreshImage:function () {
            if (this._componentReady) {
                this._skinParts.image._invalidate("size");
                this._skinParts.image._renderIfReady();
            }
        },

        _clipImage:function (width, height, widthDiff, heightDiff) {
            widthDiff = this.getWidthDiff() || 0;
            heightDiff = this.getHeightDiff() || 0;

            var newWidth = width - widthDiff;
            var newHeight = height - heightDiff;
            this._setWrapperSize(newWidth, newHeight);
            this._setDisplayerSize(width, height);
        },

        _setFlexibleHeight:function (width, height, widthDiff, heightDiff) {
            widthDiff = this.getWidthDiff() || 0;
            heightDiff = this.getHeightDiff() || 0;

            var newWidth = width - widthDiff;
            var newHeight = Math.floor(newWidth / this._getAspectRatio());
            this._setWrapperSize(newWidth, newHeight - heightDiff);
            this._setDisplayerSize(width, newHeight);
        },

        _setFlexibleWidth:function (width, height, widthDiff, heightDiff, resizeDisplayer) {
            widthDiff = this.getWidthDiff() || 0;
            heightDiff = this.getHeightDiff() || 0;
            var coef;
            var paddingHoriz = 0;
            var paddingVert = 0;
            var newHeight = height - heightDiff;
            var newWidth = newHeight * this._getAspectRatio();

            if (!resizeDisplayer && newWidth > (width - widthDiff)) {
                coef = (width - widthDiff) / newWidth;
                newWidth = (width - widthDiff);
                newHeight = coef * newHeight;
            }
            if (!resizeDisplayer) {
                paddingHoriz = Math.floor((width - newWidth - widthDiff) / 2.0);
                paddingVert = Math.floor(height - newHeight - heightDiff) / 2.0;
            }

            this._view.setStyle("width", String(newWidth + widthDiff) + "px");
            this._setWrapperSize(newWidth, newHeight, paddingHoriz, paddingVert);

            if (resizeDisplayer) {
                this._setDisplayerSize(newWidth, height);
            } else {
                this._setDisplayerSize(width, height);
            }
        },

        _getAspectRatio:function () {
            var imageData = this._skinParts.image.getDataItem();
            var imgRatio = parseInt(imageData.get('width')) / parseInt(this._data.get('height'));
            return imgRatio;
        },

        _setWrapperSize:function (newWidth, newHeight, paddingHoriz, paddingVert) {
            paddingHoriz = paddingHoriz || 0;
            paddingVert = paddingVert || 0;
            /* internet explorer will break if a negative number will be passed as height/width */
            var height = (newHeight < 0) ? 0 : newHeight;
            var width = (newWidth < 0) ? 0 : newWidth;
            this._skinParts.imageWrapper.setStyles({
                width:String(width) + "px",
                height:String(height) + "px",
                "margin-left":String(paddingHoriz) + "px",
                "margin-right":String(paddingHoriz) + "px",
                "margin-top":String(paddingVert) + "px",
                "margin-bottom":String(paddingVert) + "px"
            });
        },

        _setDisplayerSize:function (newWidth, newHeight) {
            this._view.setStyles({
                width:String(newWidth) + "px",
                height:String(newHeight) + "px"
            });
            this.setWidth(newWidth);
            this.setHeight(newHeight);
            this.fireEvent("autoSized");
        },

        /**
         * @override
         */
        _onDataChange:function (dataItem) {
            this.parent();
            this._updateParts();

            if(this._isRendered) {
                this._renderLink() ;
            }
        },

        _onAllSkinPartsReady:function () {
            this.parent();
            this._view.setStyle("visibility", "visible");
            this._updateParts();
            this._setupParts();
        },

        _renderLink: function() {
            var dataItemWithSchema = this.getDataItem();
            var linkId = dataItemWithSchema._data.link ;
            if(!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this) ;
                return ;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId) ;
            if(linkDataItem) {
                this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this) ;
            }
        },

        /**
         * @override
         */
        _onResize:function () {
            this.parent();
            this._refreshImage();
        },

        getImageRef:function () {
            var value = "";

            if (this._skinParts) {
                value = String(this._skinParts.image.getDataItem().get("id"));
            }

            return value;
        },

        isImageLoading:function () {
            var result = false;
            if (this._componentReady) {
                result = this._skinParts.image.getState().indexOf("loading") != -1;
            }
            return result;
        },

        dispose:function () {
            this.removeOldOwner();
            this.parent();
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _isImageLinked:function () {
            var link = this.getDataItem().get('link');
            return !!link;
        },


        //Experiment GEM.New was promoted to feature on Tue Oct 09 18:23:35 IST 2012

        _isImageClickable:function () {
            if (this._galleryImageOnClickAction === 'goToLink') {
                return this._isImageLinked();
            }
            else {
                return (this._galleryImageOnClickAction !== 'disabled');
            }
        },

        setSelected: function(isSelected){
            this.setState(isSelected ? 'selected' : 'unselected', 'selectState');
        }
    });

});
