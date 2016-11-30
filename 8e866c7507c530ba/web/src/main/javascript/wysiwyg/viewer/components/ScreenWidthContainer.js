/**
 * @class wysiwyg.viewer.components.ScreenWidthContainer
 */
define.component('wysiwyg.viewer.components.ScreenWidthContainer', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("core.components.ContainerOBC");

    def.resources(['W.Viewer', 'W.Commands', 'W.Config']);

    def.binds(['_onScreenResize', '_stretchBackgroundAndCenterContent']);

    def.skinParts({
        inlineContent: { type: 'htmlElement'},
        screenWidthBackground: {type: 'htmlElement'},
        bg: {type: 'htmlElement'},
        centeredContent: {type: 'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : true
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args)
        {
            this._pendingSizeUpdates = {};
            this.parent(compId, viewNode, args);
            this._resizableSides = [Constants.BaseComponent.ResizeSides.TOP, Constants.BaseComponent.ResizeSides.BOTTOM];
            this._moveDirections = [ Constants.BaseComponent.MoveDirections.VERTICAL ];
            this._isMobileView = this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE;
        },

        _onScreenResize: function()  {
            if (this.getIsDisplayed()) {
                this._stretchBackgroundAndCenterContent();
            }
        },

        _onResize: function() {
            // do nothing..
        },

        _stretchBackgroundAndCenterContent: function() {
            var view = this._view;
            var screenSize =  $(document).getSize();
            var componentSize = view.getSize();
            var docWidth = this.resources.W.Viewer.getDocWidth();
            // The minus is on the outside of the round do it will round up
            var left = this._isMobileView? 0 : -Math.round((screenSize.x-docWidth)/2);
            var width = this._isMobileView? docWidth : screenSize.x;

            if (left > 0) {
                left = 0;
            }

            this._skinParts.screenWidthBackground.setStyles({
                "position":"absolute",
                "width": width + "px",
                "height": componentSize.y + "px",
                "left":left});
        },

        render: function()
        {
            //Listen to screen resize event
            this.resources.W.Viewer.addEvent(this.resources.W.Viewer.SCREEN_RESIZE_EVENT, this._onScreenResize);

            this._stretchBackgroundAndCenterContent();
            var docWidth = this.resources.W.Viewer.getDocWidth();
            this.setWidth(docWidth);
            this._onAutoSized();
        },

        /**
         * @override
         * We need to remove the SCREEN_RESIZE_EVENT listener from Viewer when deleting the element
         */
        dispose: function(){
            this.parent();
            this.resources.W.Viewer.removeEvent(this.resources.W.Viewer.SCREEN_RESIZE_EVENT, this._onScreenResize);
        },

        _onAllSkinPartsReady: function(){
            this._applyPendingSizeUpdates(true);
        },

        _applyPendingSizeUpdates: function (forceUpdate) {
            if (this._pendingSizeUpdates.width != null) {
                this.setWidth(this._pendingSizeUpdates.width);
                this._pendingSizeUpdates.width = null;
            } else if (forceUpdate) {
                this.setWidth(this.getWidth(), true);
            }

            if (this._pendingSizeUpdates.height != null) {
                this.setHeight(this._pendingSizeUpdates.height);
                this._pendingSizeUpdates.height = null;
            } else if (forceUpdate) {
                this.setHeight(this.getHeight(), true);
            }
        },

        setX: function()
        {
            //Do nothing, horizontal positioning is handled by _stretchBackgroundToScreenWidth
        },

        getX: function()
        {
            return 0;
        },

        setHeight: function(value, forceUpdate, triggersOnResize)
        {
            this.parent(value, forceUpdate, triggersOnResize);
            //Set height might be called before the component skin is initialized
            if(this._skinParts)
            {
                this._view.setStyle("min-height", value + "px");
                this._stretchBackgroundAndCenterContent();
                this.flushPhysicalHeightCache();
                this._onResize();
            }
            else
            {
                this._pendingSizeUpdates.height = value;
            }
        },

        setWidth: function(value, forceUpdate, triggersOnResize)
        {
//            value = this.resources.W.Viewer.getDocWidth();
            this.parent(value, forceUpdate, triggersOnResize);
            //Set width might be called before the component skin is initialized
            if(this._skinParts)
            {
                var docWidth = this.resources.W.Viewer.getDocWidth();
                var w = value + "px";
                var ml = ((docWidth-value)/2)  + "px";
                this._skinParts.centeredContent.setStyles({
                    "width": w,
                    "margin-left": ml
                });
            }
            else
            {
                this._pendingSizeUpdates.width = value;
            }
        },

        getSelectableX: function(){
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                return this.getX();
            }

            var screenWidth = $(document).getSize().x;
            return this.getX()-(screenWidth-this.getWidth())/2;
        },

        getSelectableWidth: function(){
            if (this.resources.W.Config.env.isViewingSecondaryDevice()) {
                return this.getWidth();
            }

            var screenWidth = $(document).getSize().x;
            return screenWidth;
        },
        /*
         *  ScreenWidthContainer can't be placed inside another container
         */
        isContainable: function( parentContainerLogic ) {
            // Strip could only be container in strip
            return instanceOf(parentContainerLogic, this.constructor);
        },

        isDuplicatable: function() {
            return true;
        },

        //the initial dimensions of this component are incorrect (width is fixed and equals to doc width)
        saveCurrentDimensions: function() {
            this._lastDimensions = {
                w: this.resources.W.Viewer.getDocWidth(),
                h: this.getHeight()
            };
        },

        /*
         Use centered centeredContent skinPart an the EditBox reference node
         */
        _getEditBoxReferenceNode: function()
        {
            //return this._skinParts.centeredContent;
            return this._skinParts.inlineContent;
        }
    });

});