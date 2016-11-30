define.component('wysiwyg.editor.components.MobileQuickTour', function(componentDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.inherits('core.components.base.BaseComp');
    def.utilize(['core.managers.components.ComponentBuilder']);

    def.resources(['W.Commands', 'W.Resources', 'W.Preview', 'W.Utils', 'W.EditorDialogs']);

    def.skinParts({
        overlayWrapper: {type:'htmlElement'},
        slidesWrapper: {type:'htmlElement'},
        overlay: {type:'htmlElement'},
        frame: {type:'htmlElement'},
        borderOuter: {type:'htmlElement'},
        borderInner: {type:'htmlElement'},
        closeBtn: {type:'htmlElement'}
    });

    def.binds(['_onCloseBtnClick', '_handleWindowResize', '_onSetEditorMode', '_onSetViewerMode']);

    def.statics({
        SLIDES_DATA: [
            {id:"WELCOME",
                relPos:{x:220, y:120}
            },
            {id:"SITE_MENU",
                relPos:{x:150, y:150},
                frameRelBounds:{x:-4,y:-4,w:8,h:8},
                frameCornersRadius:10,
                arrowData:{relStart:{x:80, y:0}, relEnd:{x:70, y:20}, curve:-.5}
            },
            {id:"HIDDEN_ELEMENTS",
                relPos:{x:180, y:110},
                frameRelBounds:{x:0,y:0,w:0,h:-1},
                frameCornersRadius:0,
                arrowData:{relStart:{x:-5, y:50}, relEnd:{x:12, y:60}, curve:1}
            },
            {id:"PREVIEW",
                relPos:{x:-150, y:300},
                frameCornersRadius:0,
                arrowData:{relStart:{x:30, y:-10}, relEnd:{x:-10, y:5}, curve:-.8}
            },
//            {id:"ACTIVATE",
//                relPos:{x:-150, y:300},
//                arrowData:{relStart:{x:152, y:25}, relEnd:{x:200, y:80}, curve:.8}
//            },
            {id:"HELP"
                // Special case
            }
        ]
    });

    def.methods({


        initialize: function(compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);

            this._currentSlideIndex = -1;
            window.addEvent(Constants.CoreEvents.RESIZE, this._handleWindowResize);

            this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
            this.resources.W.EditorDialogs.closeAllDialogs();
        },

        // =========================================================================
        // Render component

        _onRender: function (renderEvent) {
            var invalidation = renderEvent.data.invalidations;
            if (invalidation.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._onSetEditorMode, null);
                this.resources.W.Commands.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._onSetViewerMode, null);

                this._previousBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";

                this._skinParts.closeBtn.addEvent("click", this._onCloseBtnClick);
                this._skinParts.closeBtn.innerHTML = this.resources.W.Resources.get("EDITOR_LANGUAGE", "MOBILE_QUICK_TOUR_CLOSE_BUTTON");

                this.setSlide(0);
            }
        },

        // =========================================================================
        // Handle component background changes

        _setFocusRectangle: function (x, y, w, h, marginSize, cornersRadius) {
            var windowSize = this.resources.W.Utils.getWindowSize();

            if(marginSize) {
                marginSize = parseInt(marginSize);
                x -= marginSize;
                y -= marginSize;
                w += marginSize * 2;
                h += marginSize * 2;
            }

            this._skinParts.overlay.setStyle("border-left-width", Math.max(0,x));
            this._skinParts.overlay.setStyle("border-top-width", Math.max(0,y));
            this._skinParts.overlay.setStyle("border-right-width", Math.max(0,windowSize.width - x - w));
            this._skinParts.overlay.setStyle("border-bottom-width", Math.max(0,windowSize.height - y - h));

            this._skinParts.frame.setStyle("top", (y)+"px");
            this._skinParts.frame.setStyle("left", (x)+"px");
            this._skinParts.frame.setStyle("width", (w)+"px");
            this._skinParts.frame.setStyle("height", (h)+"px");

            this._skinParts.borderInner.setStyle("borderRadius", cornersRadius + "px");
        },

        // =========================================================================
        // Slides creation and control (MobileQuickTour items)

        setSlide: function(slideIndex){
            clearTimeout(this._handleWindowResizeTO);
            this._clearCurrentSlide();

            if(slideIndex >= 0 && slideIndex < this.SLIDES_DATA.length) {

                this._getTargetElementData(slideIndex)
                    .then(this._setTargetElementBounds.bind(this))
                    .then(this._createSlide.bind(this))
                    .then(this._switchToSlide.bind(this));

                if(slideIndex===this.SLIDES_DATA.length-1) {
                    this._skinParts.closeBtn.collapse();
                    this._showMobileQuickTourHelpletIfNeeded();
                } else {
                    this._skinParts.closeBtn.uncollapse();
                    this._hideMobileQuickTourHelplet();
                }
            } else {
                this._closeTutorial();
            }
        },

        _switchToSlide: function(createdSlideData){
            this._currentSlide = createdSlideData.view;
            if(!this._currentSlide) {
                // skip slide if not available or something is wrong
                this.setSlide(createdSlideData.index+1);
                return;
            }
            this._skinParts.slidesWrapper.appendChild(this._currentSlide);
            this._currentSlideIndex = createdSlideData.index;
        },

        _clearCurrentSlide: function () {
            if(this._currentSlide) {
                this._currentSlide.dispose();
            }
            this._currentSlideIndex = -1;
            this._currentSlide = null;
            this._setFocusRectangle(0,0,0,0);
        },

        _createSlide: function(targetElement){

            var deferred = Q.defer();

            var slideData = this.SLIDES_DATA[targetElement.slideIndex];

            if(!targetElement) {
                return null;
            }

            if(targetElement.element) {
                this._setFocusRectangle(targetElement.bounds.x, targetElement.bounds.y, targetElement.bounds.w, targetElement.bounds.h, 10, slideData.frameCornersRadius || 0);
            } else {
                this._setFocusRectangle(0,0,0,0);
            }

            var def = {
                type:"wysiwyg.editor.components.MobileQuickTourItem",
                skin:"wysiwyg.editor.skins.MobileQuickTourItemSkin"
            };
            var viewNode = new Element("div");
            var compBuilder = new this.imports.ComponentBuilder(viewNode);
            compBuilder.
                withType(def.type).
                withSkin(def.skin).
                withArgs({
                    slideIndex:_.findIndex(this.SLIDES_DATA, {'id': slideData.id}),
                    numOfSlides:this.SLIDES_DATA.length,
                    slideData:slideData,
                    targetElement:targetElement.element,
                    targetBounds:targetElement.bounds
                }).
                create();

            viewNode.$logic.addEvent("nextClick", function(){
                if(this._currentSlideIndex < this.SLIDES_DATA.length-1) {
                    LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_NEXT_STEP_CLICKED, {"i1":this._currentSlideIndex});
                } else {
                    LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_FINISH_CLICKED);
                }
                this.setSlide(this._currentSlideIndex+1);
            }.bind(this));

            viewNode.$logic.addEvent("itemClick", function(index){
                LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_SPECIFIC_STEP_CLICKED, {"i1":this._currentSlideIndex, "i2":index});
                this.setSlide(index);
            }.bind(this));

            deferred.resolve({index:targetElement.slideIndex, view:viewNode});
            return deferred.promise;
        },

        _getTargetElementData: function(slideIndex) {

            var deferred = Q.defer();

            var slideData = this.SLIDES_DATA[slideIndex];
            var slideId = slideData.id;

            var mainEditorBarContent, mobileActivationAlert, buttons;
            var targetElement = {slideIndex:slideIndex, element:null, bounds:{x:0,y:0,w:0,h:0}};

            var previewRoot = this.resources.W.Preview.getPreviewManagers().Viewer.getSiteNode();
            var previewFramePosition = this.resources.W.Preview.getIFrame().getPosition();

            // TODO: Stop, think about it! Using a switch for that!? That's the best and clearest approach u can come up with???
            // TODO: Think again
            // TODO SCH 1/7/14 3:56 PM - After 2 hours of thinking I decided to stop thinking. I don't want classes or functions.
            switch(slideId){
                case "SITE_MENU":
                    targetElement.element = previewRoot.getElementById("mobile_TINY_MENU");
                    targetElement.bounds.x += previewFramePosition.x;
                    targetElement.bounds.y += previewFramePosition.y;
                    deferred.resolve(targetElement);
                    break;

                case "HIDDEN_ELEMENTS":
                    this._getHiddenElementsTargetHelper(targetElement, deferred);
                    break;

                case "PREVIEW":
                    mainEditorBarContent = W.Editor.getEditorUI().getSkinPart("mainEditorBar").getSkinPart("content").childNodes[0];
                    buttons = mainEditorBarContent.childNodes[mainEditorBarContent.childNodes.length-1].childNodes[0].childNodes[0].childNodes;
                    targetElement.element = buttons[0];
                    deferred.resolve(targetElement);
                    break;

                case "ACTIVATE":
                    mobileActivationAlert = W.Editor.getEditorUI().getSkinPart("mobileActivationAlertContainer").childNodes[0];
                    targetElement.element = mobileActivationAlert;
                    deferred.resolve(targetElement);
                    break;

                case "HELP":
                    var windowSize = this.resources.W.Utils.getWindowSize();
                    slideData.fixedPos = {
                        x:(windowSize.width*.5) + 200,
                        y:(windowSize.height*.25)
                    };
                    mainEditorBarContent = W.Editor.getEditorUI().getSkinPart("mainEditorBar").getSkinPart("content").childNodes[0];
                    buttons = mainEditorBarContent.childNodes[mainEditorBarContent.childNodes.length-1].childNodes[0].childNodes[0].childNodes;
                    targetElement.element = buttons[buttons.length-1];
                    deferred.resolve(targetElement);
                    break;

                default:
                    deferred.resolve(targetElement);
                    break;
            }
            return deferred.promise;
        },

        _getHiddenElementsTargetHelper: function(targetElement, deferred){
            try {
                var panelsPresenter = W.Editor.getEditorUI().getPanelsLayer();
                panelsPresenter._showMobileAddPanel();
                setTimeout(function(){
                    var sidePanel = panelsPresenter._skinParts.sidePanel;
                    var mobileAddPanel = sidePanel._skinParts.content.children[0].$logic;
                    var selectionList = mobileAddPanel._skinParts.selectionList;
                    targetElement.element = selectionList.items[selectionList.items.length-1];
                    deferred.resolve(targetElement);
                }, 500);
            } catch(e){
                deferred.resolve(targetElement);
            }
        },

        _setTargetElementBounds: function(targetElement) {
            var deferred = Q.defer();

            var slideData = this.SLIDES_DATA[targetElement.slideIndex];
            if(targetElement.element){
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

            deferred.resolve(targetElement);
            return deferred.promise;
        },

        // =========================================================================
        // Handle close button

        _onCloseBtnClick: function () {
            LOG.reportEvent(wixEvents.QUICK_TOUR_MOBILE_TUTORIAL_SKIP_CLICKED, {"i1":this._currentSlideIndex});
            this._closeTutorial();
        },

        _closeTutorial: function () {
            // Trying to contain the show and hide calls in one place (openPanelRegistrar).
            // Dispose will clean this component but won't clear the reference from editorUI.
            // We can add the cleaning procedure from here but I prefer not to let a component touch it creator/container.
            // A real Class statics could solve that but hey... the framework is not supporting that.
            this.resources.W.Commands.executeCommand("WEditorCommands.HideMobileQuickTour");
        },

        // =========================================================================
        // Handle help info bubble

        _showMobileQuickTourHelpletIfNeeded: function(){
            this._hideMobileQuickTourHelplet(); // hide if exists

            this.getMainEditorBar().createHelpInfoBubble("", this.resources.W.Resources.get("EDITOR_LANGUAGE", "MOBILE_QUICK_TOUR_WATCH_AGAIN_BODY", ""));

            clearTimeout(this._hideMobileQuickTourHelpletTO);
            this._hideMobileQuickTourHelpletTO = setTimeout(function(){
                this._hideMobileQuickTourHelplet();
            }.bind(this), 60*1000);
        },

        _hideMobileQuickTourHelplet: function(){
            clearTimeout(this._hideMobileQuickTourHelpletTO);
            if(this.getMainEditorBar().getHelpInfoBubble()) {
                this.getMainEditorBar().disposeHelpInfoBubble();
            }
        },

        getMainEditorBar: function() {
            return W.Editor.getEditorUI().getSkinPart("mainEditorBar");
        },

        // =========================================================================
        // Editor modes handler

        _onSetEditorMode: function(){
            this._closeTutorial();
        },

        _onSetViewerMode: function(){
            this._closeTutorial();
        },

        // =========================================================================
        // Window resize handler

        _handleWindowResize: function(){
            clearTimeout(this._handleWindowResizeTO);
            this.$view.setStyle("opacity", 0.01);
            this._handleWindowResizeTO = setTimeout(function(){
                this.setSlide(this._currentSlideIndex);
                this.$view.tween("opacity", 1);
            }.bind(this), 500);
        },

        // =========================================================================
        // Component disposal

        dispose: function () {
            // See comments in _closeTutorial method for usage
            if(this._currentSlideIndex !== this.SLIDES_DATA.length-1) {
                this._showMobileQuickTourHelpletIfNeeded();
            }
            document.body.style.overflow = this._previousBodyOverflow;
            window.scrollTo(0, 0);
            window.removeEvent(Constants.CoreEvents.RESIZE, this._handleWindowResize);
            this.exterminate();
        }

    });
});

