define.component('wysiwyg.common.components.QuickTour', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.utilize(['core.managers.components.ComponentBuilder']);

    def.resources(['W.Utils','W.Resources']);

//    def.skinParts({
//        overlayWrapper: {type:'htmlElement'},
//        slidesWrapper: {type:'htmlElement'},
//        overlay: {type:'htmlElement'},
//        frame: {type:'htmlElement'},
//        closeBtn: {type:'htmlElement'}
//    });

    def.binds(['_handleWindowResize']);

    def.fields({
        CLOSE_BUTTON_LANGUAGE_KEY: "",
        QUICK_TOUR_ITEM_TYPE: "wysiwyg.editor.components.QuickTourItem",
        QUICK_TOUR_ITEM_SKIN: "wysiwyg.editor.components.QuickTourItemSkin"
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._initSlidesData();

            this._currentSlideIndex = -1;
            window.addEvent(Constants.CoreEvents.RESIZE, this._handleWindowResize);
        },

        /**
         * Must implement in child components
         * @private
         */
        _initSlidesData: function(){},

        _onRender: function (renderEvent) {
            var invalidation = renderEvent.data.invalidations;
            if (invalidation.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._onSetEditorMode, null);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._onSetViewerMode, null);
                this._previousBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";

                this._skinParts.closeBtn.on("click", this, this._onCloseBtnClick);
                this._skinParts.closeBtn.innerHTML = this._translate(this.CLOSE_BUTTON_LANGUAGE_KEY);
                this._setSlide(0);
            }
        },

        // =========================================================================
        // Handle component background changes

        _setFocusRectangle: function (x, y, w, h, marginSize) {
            var windowSize = this.resources.W.Utils.getWindowSize(true);

            if(marginSize) {
                marginSize = parseInt(marginSize,10);
                x -= marginSize;
                y -= marginSize;
                w += marginSize * 2;
                h += marginSize * 2;
            }

            this._skinParts.overlay.setStyle("border-left-width", Math.max(0,x));
            this._skinParts.overlay.setStyle("border-top-width", Math.max(0,y));
            this._skinParts.overlay.setStyle("border-right-width", Math.max(0,windowSize.width - x - w));
            this._skinParts.overlay.setStyle("border-bottom-width", Math.max(0,windowSize.height - y - h));

            this._skinParts.frame.setStyle("top", y + "px");
            this._skinParts.frame.setStyle("left", x + "px");
            this._skinParts.frame.setStyle("width", w +"px");
            this._skinParts.frame.setStyle("height", h +"px");
        },



        _clearCurrentSlide: function () {
            if(this._currentSlide) {
                this._currentSlide.dispose();
            }
            this._currentSlideIndex = -1;
        },



        // =========================================================================
        // Slides creation and control (QuickTour items)

        _setSlide: function(index){
            clearTimeout(this._handleWindowResizeTO);
            this._clearCurrentSlide();
            this._setFocusRectangle(0,0,0,0);
            if(index >= 0 && index < this.SLIDES_DATA.length) {
                this._currentSlide = this._createSlide(this.SLIDES_DATA[index], index);
                if(!this._currentSlide) {
                    // skip slide if not available
                    this._setSlide(index + 1);
                    return;
                }
                if (this.SLIDES_DATA[index].onSlideDisplay){
                    this.SLIDES_DATA[index].onSlideDisplay(this, this._currentSlide);
                }
                this._skinParts.slidesWrapper.appendChild(this._currentSlide);
                this._currentSlideIndex = index;
                if(index === this.SLIDES_DATA.length - 1) {
                    this._skinParts.closeBtn.collapse();
                } else {
                    this._skinParts.closeBtn.uncollapse();
                }
            } else {
                this._onCloseBtnClick();
            }
        },

        _createSlide: function(data, index){
            var targetElementData = this._getTargetElementData(index),
                quickTourItemView,
                quickTourItem;
            if(!targetElementData) {
                return null;
            }

            if(targetElementData.element) {
                this._setFocusRectangle(targetElementData.bounds.x, targetElementData.bounds.y, targetElementData.bounds.w, targetElementData.bounds.h, 10);
            } else {
                this._setFocusRectangle(0,0,0,0);
            }

            quickTourItemView = this._createQuickTourItem(data, targetElementData);
            quickTourItem = quickTourItemView && quickTourItemView.$logic;
            if (!quickTourItem){
                // TODO GuyR 2/17/14 5:21 PM -  failed to create quickTourItem - report error ?
                return;
            }
            quickTourItem.on("nextClick",this, function(){
                this._setSlide(this._currentSlideIndex+1);
            });

            quickTourItem.on("itemClick",this, function(eventInfo){
                var index = eventInfo.data.index;
                this._setSlide(index);
            });
            return quickTourItemView;
        },

        _createQuickTourItem: function(data, targetElementData){
            var viewNode = new Element("div"),
                compBuilder = new this.imports.ComponentBuilder(viewNode);
            compBuilder.
                withType(this.QUICK_TOUR_ITEM_TYPE).
                withSkin(this.QUICK_TOUR_ITEM_SKIN).
                withArgs({
                    slideIndex:_.findIndex(this.SLIDES_DATA, {'id': data.id}),
                    numOfSlides:this.SLIDES_DATA.length,
                    slideData:data,
                    targetElement:targetElementData.element,
                    targetBounds:targetElementData.bounds
                }).
                create();
            return viewNode;
        },


        _getTargetElementData: function (slideIndex) {
            var slideData = this.SLIDES_DATA[slideIndex],
                targetElement;

            if (!slideData){
                return;
            }
            targetElement = (slideData.getSlideElement && slideData.getSlideElement(this)) || {element:null, bounds:{x:0,y:0,w:0,h:0}};

            if(targetElement.element && targetElement.bounds){
                targetElement.bounds.x += targetElement.element.getPosition().x;
                targetElement.bounds.y += targetElement.element.getPosition().y;
                targetElement.bounds.w += targetElement.element.getWidth();
                targetElement.bounds.h += targetElement.element.getHeight();
                if(slideData.frameRelBounds) {
                    targetElement.bounds.x += slideData.frameRelBounds.x || 0;
                    targetElement.bounds.y += slideData.frameRelBounds.y || 0;
                    targetElement.bounds.w += slideData.frameRelBounds.w || 0;
                    targetElement.bounds.h += slideData.frameRelBounds.h || 0;
                }
            }

            return targetElement;
        },

        // =========================================================================
        // Handle close button

        /**
         * Must be implemeneted
         * Should fire the command that hides the quick tour
         * @private
         */
        _onCloseBtnClick: function () {
            // Trying to contain the show and hide calls in one place (openPanelRegistrar).
            // Dispose will clean this component but won't clear the reference from editorUI.
            // We can add the cleaning procedure from here but I prefer not to let a component touch it creator/container.
            // A real Class statics could solve that but hey... the framework is not supporting that.
            this.dispose();
        },

        // =========================================================================
        // Handle help info bubble

        getMainEditorBar: function() {
            return W.Editor.getEditorUI().getSkinPart("mainEditorBar");
        },

        // =========================================================================
        // Editor modes handler

        _onSetEditorMode: function(){
            this._onCloseBtnClick();
        },

        _onSetViewerMode: function(){
            this._onCloseBtnClick();
        },

        // =========================================================================
        // Window resize handler

        _handleWindowResize: function(){
            clearTimeout(this._handleWindowResizeTO);
            this.$view.setStyle("opacity", 0.01);
            this._handleWindowResizeTO = setTimeout(function(){
                this._setSlide(this._currentSlideIndex);
                this.$view.tween("opacity", 1);
            }.bind(this), 500);
        },

        // =========================================================================
        // Component disposal

        dispose: function () {
            // See comments in _onCloseBtnClick method for usage
            document.body.style.overflow = this._previousBodyOverflow;
            window.scrollTo(0, 0);
            window.removeEvent(Constants.CoreEvents.RESIZE, this._handleWindowResize);
            this.exterminate();
        },

        /**
         * Uses resource.get to translate language keys. Can be overridden to prevent translation in preview
         * @private
         */
        _translate: function(key){
            return this.resources.W.Resources.get("EDITOR_LANGUAGE", key);
        }
    });
});