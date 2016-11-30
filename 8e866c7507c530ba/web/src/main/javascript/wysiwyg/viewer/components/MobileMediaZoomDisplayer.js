define.component("wysiwyg.viewer.components.MobileMediaZoomDisplayer", function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.MediaZoomDisplayer");

    def.binds(['_onImageWrapperClick']);

    def.resources(['W.Commands', 'W.Config', 'W.Viewer']);

    def.statics({
        FONT_MULTIPLIER:{
            DESKTOP_SITE:8,
            MOBILE_SITE:2.5,
            TABLET_SITE:4
        }
    });

    def.skinParts(
        {
            'notAllDescriptionPresentedIndicator':{ type:'htmlElement', optional:false },
            'title':        { type:'htmlElement', optional:false },
            'description':  { type:'htmlElement', optional:false },
            'link':         { type:'htmlElement', optional:true  },
            'imageWrapper': { type: 'htmlElement'},
            'image':        { type:'core.components.Image', dataRefField:"*", optional:false, 'hookMethod': '_addImageArgs' }
        }
    );

    def.states(
        {
            'link': ['showLink', 'hideLink'],
            'descriptionPresentationMode':['showLimitedDescription','showAllDescription'],
            'showPanelText':['doShowPanelText','dontShowPanelText'],
            'orientation':['portrait','landscape'],
            'displayDevice':['desktop','mobile', 'tablet']
        }
    );

    def.methods({
        initialize: function(compId, viewNode, argsObject) {
            this._fontSizeCorrectionWhenOpenZoomInPortrait = 1.1;
            this.parent(compId, viewNode, argsObject);
            var deviceSize = this._getDeviceSize();
            this._maxWidth = deviceSize.width;
            this._maxHeight = deviceSize.height;
            this._mobileConfig = this.resources.W.Config.mobileConfig;
            if(this.resources.W.Config.env.getCurrentFrameDevice() === Constants.ViewerTypesParams.TYPES.MOBILE){
                this.setState('mobile', 'displayDevice');
            }else if(this.resources.W.Config.mobileConfig.isTablet()){
                this.setState('tablet', 'displayDevice');
            }else{
                this.setState('desktop', 'displayDevice');
            }

            this._isMobilePreviewMode = W.Config.env.$isEditorViewerFrame;

        },

        _onAllSkinPartsReady:function() {
            this.parent();
            this.setState('showLimitedDescription', 'descriptionPresentationMode');
            this._changeFontSizes();
            this._initZoom = this._isMobilePreviewMode ? 1 : this._mobileConfig.getInitZoom();
            this.setState('doShowPanelText', 'showPanelText');
            this._setZoomModeFontSize();
            if(this._mobileConfig.isMobile()) {
                this._addMobileEvents();
            }else{
                this._addDesktopEventsForPreview();
            }
        },

        _addMobileEvents:function(){
            this._skinParts.title.addEvent('touchstart', this._onDescriptionClick.bind(this));
            this._skinParts.description.addEvent('touchstart', this._onDescriptionClick.bind(this));
            this._skinParts.link.addEvent('touchstart', function(e){
                e.target.fireEvent('click');
                e.stopPropagation();
            });
            Hammer(this._skinParts.imageWrapper).on('tap', this._onImageWrapperClick);
        },

        _addImageArgs: function (definition) {
            definition = this.parent(definition);
            definition.argObject = definition.argObject || {};
            definition.argObject['fetchImageForMobile'] = (this.getState('displayDevice') === 'mobile') ? true : false;
            return definition;
        },

        _addDesktopEventsForPreview:function(){
            this._skinParts.title.addEvent('click', this._onDescriptionClick.bind(this));
            this._skinParts.description.addEvent('click', this._onDescriptionClick.bind(this));
            this._skinParts.imageWrapper.addEvent('click', this._onImageWrapperClick);
        },

        _setZoomModeFontSize: function () {
            var ratio = this._isMobilePreviewMode ? 1 : this._initZoom / this._mobileConfig.getZoom();
            var fontMultiplier;
            switch (this.getState('displayDevice')) {
                case 'desktop' :
                    fontMultiplier = this.FONT_MULTIPLIER.DESKTOP_SITE;
                    break;
                case 'tablet':
                    fontMultiplier = this.FONT_MULTIPLIER.TABLET_SITE;
                    break;
                case 'mobile':
                    fontMultiplier = this.FONT_MULTIPLIER.MOBILE_SITE;
                    break;
                default:
                    fontMultiplier = this.FONT_MULTIPLIER.DESKTOP_SITE;
                    break;
            }

            var zoomModeFontSize = fontMultiplier * ratio;
            if (this._mobileConfig.isPortrait()) {
                zoomModeFontSize = zoomModeFontSize * this._fontSizeCorrectionWhenOpenZoomInPortrait;
            }

            this._view.setStyle('font-size', zoomModeFontSize + 'px');
        },

        render: function() {
            this.parent();

            // we would like to have the height of the description when limited to the height of 2 lines.
            // 1.14 is a common ratio between line-height='normal' and font-size.
            this._limitedDescriptionHeight = parseInt(this._skinParts.description.getStyle("font-size")) * 1.14 * 2 + 'px'; //2em
            this._fullDescriptionHeight = this._skinParts.description.getStyle('height');
            this._skinParts.description.setStyle('height', this._limitedDescriptionHeight);
            if (!this._canDescriptionExpand()) {
                this._skinParts.notAllDescriptionPresentedIndicator.setStyle('visibility', 'hidden');
            }
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoomDisplayer.PanelTextVisibilityChanged', true);
        },

        _onDescriptionClick: function(e) {
            if (!this._canDescriptionExpand()) {
                return;
            }
            var newState = this.getState('descriptionPresentationMode') == 'showLimitedDescription' ? 'showAllDescription' : 'showLimitedDescription';
            this.setState(newState, 'descriptionPresentationMode');

            var showTextPanel = newState == 'showLimitedDescription' ? true : false;
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoomDisplayer.PanelTextVisibilityChanged', showTextPanel);

            this._animateDescriptionHeightTransition(newState);
            this._animateImageWrapperOpacityTransition(newState);

            e.stopPropagation();
        },

        _onImageWrapperClick: function() {
            //Hammer sends "Tap" twice. Throttle it.
            if (this._changeButtonsVisibilityTimer){
                return true;
            }
            this._changeButtonsVisibilityTimer = setTimeout(
                function(){
                    this._changeButtonsVisibilityTimer = null;
                }.bind(this), 500
            );

            var newState = this.getState('showPanelText') == 'doShowPanelText' ? 'dontShowPanelText' : 'doShowPanelText';
            this.setState(newState, 'showPanelText');
            var showTextPanel = newState == 'doShowPanelText' ? true : false;
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoomDisplayer.PanelTextVisibilityChanged', showTextPanel);
        },

        _canDescriptionExpand: function() {
            return (parseInt(this._fullDescriptionHeight)>parseInt(this._limitedDescriptionHeight));
        },

        _animateDescriptionHeightTransition: function (newState) {
            var descriptionHeightFxTween = new Fx.Tween(this._skinParts.description, {'duration': 'short', 'link': 'chain', 'property': 'height'});
            var descriptionHeight = newState === 'showLimitedDescription' ? this._limitedDescriptionHeight : this._fullDescriptionHeight;

            descriptionHeightFxTween.addEvent('complete', function () {
                if (this.getState('descriptionPresentationMode') === 'showLimitedDescription') {
                    this._skinParts.notAllDescriptionPresentedIndicator.setStyle('visibility', 'visible');
                } else {
                    this._skinParts.notAllDescriptionPresentedIndicator.setStyle('visibility', 'hidden');
                }
            }.bind(this));

            descriptionHeightFxTween.start(descriptionHeight);
        },

        _animateImageWrapperOpacityTransition: function (newState) {
            var imageWrapperOpacityFxTween = new Fx.Tween(this._skinParts.imageWrapper, {'duration': 'short', 'link': 'chain', 'property': 'opacity'});
            var imageWrapperOpacity = newState === 'showLimitedDescription' ? "1" : "0.65";
            imageWrapperOpacityFxTween.start(imageWrapperOpacity);
        },

        _getDeviceSize: function() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            };
        },

        _setCorrectImageSize: function(imageSize){
            var imgWrapperHeight = imageSize.y;
            var imgWrapperWidth = this._getDisplayerWidth(imageSize.x);
//            this._skinParts.imageWrapper.setStyles({'width': imgWrapperWidth+ 'px', 'height': imgWrapperHeight + 'px', 'min-width':"600px"});
            this._skinParts.imageWrapper.setStyles({'width': '100%','height': imgWrapperHeight + 'px'});
            this._skinParts.title.setStyles({'word-wrap': 'break-word'});
            this._skinParts.description.setStyles({'word-wrap': 'break-word' });
        },

        hideContent: function () {
            this._skinParts.image.collapse();
            this._skinParts.panel.collapse();
        },

        showText: function () {
            this._skinParts.title.uncollapse();
            this._skinParts.description.uncollapse();
            this._skinParts.notAllDescriptionPresentedIndicator.uncollapse();
            this._skinParts.link.uncollapse();
        },

        hideText: function () {
            this._skinParts.title.collapse();
            this._skinParts.description.collapse();
            this._skinParts.notAllDescriptionPresentedIndicator.collapse();
            this._skinParts.link.collapse();
        },

        _changeFontSizes: function () {
            if (window.orientation == 90 || window.orientation == -90) {
                this.setState('landscape', 'orientation');
            } else {
                this.setState('portrait', 'orientation');
            }
        }
    });
});
