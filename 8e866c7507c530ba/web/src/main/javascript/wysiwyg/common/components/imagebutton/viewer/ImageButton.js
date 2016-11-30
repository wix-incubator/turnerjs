define.component('wysiwyg.common.components.imagebutton.viewer.ImageButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Data']);

    def.propertiesSchemaType('ImageButtonProperties');

    def.dataTypes(['ImageButton']);

    def.binds([
        'press', 'unpress',
        'touch', 'untouch', 'delayUntouch',
        'hover', 'unhover'
    ]);

    def.states({
        opacity: ['no_opacity', 'supports_opacity'],
        press: ['not_pressed', 'pressed'],
        hover: ['not_hovered', 'hovered'],
        transition: ['transition_none', 'transition_fade']
    });

    def.utilize([
        'core.components.image.ImageSettings',
        'wysiwyg.common.utils.LinkRenderer'
    ]);

    def.skinParts({
        'link': { type: 'htmlElement' },
        'defaultImage': {
            type: 'core.components.image.ImageNew',
            dataRefField: 'defaultImage',
            argObject: { requestExactSize: false }
        },
        'hoverImage': {
            type: 'core.components.image.ImageNew',
            dataRefField: 'hoverImage',
            argObject: { requestExactSize: false }
        },
        'activeImage': {
            type: 'core.components.image.ImageNew',
            dataRefField: 'activeImage',
            argObject: { requestExactSize: false }
        }
    });

    def.statics({
        GLOBAL_LISTENERS: {}
    });

    def.fields({
        _linkRenderer: null,
        _imageSettings: null
    });

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._linkRenderer = new this.imports.LinkRenderer();
            this._rotatable = true;
            this.initImageSettings();
            this.attachListeners();
        },
        initImageSettings: function () {
            var ImageSettings = this.imports.ImageSettings,
                CROP_CONTAINS = ImageSettings.CropModes.CONTAINS;

            this._imageSettings = new ImageSettings(CROP_CONTAINS, 16, 16);
        },
        attachListeners: function () {
            var view = this.$view;

            if (this.isTouchSupported()) {
                if (!this.isStockAndroidBrowser()) {
                    view.addNativeListener('touchstart',  this.touch);
                    view.addNativeListener('touchend',    this.untouch);
                    view.addNativeListener('touchcancel', this.untouch);
                    view.addNativeListener('click',       this.untouch);
                    view.addNativeListener('touchmove',   this.delayUntouch);
                }
            } else {
                view.addNativeListener('mousedown', this.press);
                view.addNativeListener('mouseup', this.unpress);
            }

            this._attachGlobalListeners();

            view.addNativeListener('dragstart', this.preventDefaultAction);
        },
        isTouchSupported: function () {
            return Modernizr.touch;
        },
        isStockAndroidBrowser: function () {
            var STOCK_ANDROID_4_REGEX = /^mozilla.*linux.*android 4.*build.*applewebkit.*khtml.*like.*gecko.*safari/,
                ua = navigator.userAgent.toLowerCase();

            if (ua.indexOf("opr") >= 0 || ua.indexOf("chrome") >= 0) {
                return false;
            }

            return STOCK_ANDROID_4_REGEX.test(ua);
        },
        touch: function (e) {
            if (this.getState('press') === 'pressed') {
                return;
            }

            this.prepareTransition({
                previous: "default",
                next: "active",
                other: "hover",
                callback: function () {
                    this.setState('pressed', 'press');
                }
            });
        },
        untouch: function () {
            if (this.getState('press') === 'not_pressed') {
                return;
            }

            this.prepareTransition({
                previous: "active",
                next: "default",
                other: "hover",
                callback: function () {
                    this.setState('not_pressed', 'press');
                    this.setState('not_hovered', 'hover');
                }
            });
        },
        delayUntouch: function () {
            setTimeout(this.untouch, 500);
        },
        press: function () {
            if (this.getState('press') === 'pressed') {
                return;
            }

            this.prepareTransition({
                previous: "hover",
                next: "active",
                other: "default",
                callback: function () {
                    this.setState('pressed', 'press');
                }
            });
        },
        unpress: function () {
            if (this.getState('press') === 'not_pressed') {
                return;
            }

            this.prepareTransition({
                previous: "active",
                next: "hover",
                other: "default",
                callback: function () {
                    this.setState('not_pressed', 'press');
                }
            });
        },
        hover: function () {
            if (this.getState('hover') === 'hovered') {
                return;
            }

            this.prepareTransition({
                previous: "default",
                next: "hover",
                other: "active",
                callback: function () {
                    this.setState('hovered', 'hover');
                }
            });
        },
        unhover: function () {
            if (this.getState('press') === 'pressed') {
                return this.untouch();
            }

            if (this.getState('hover') === 'not_hovered') {
                return;
            }

            this.prepareTransition({
                previous: "hover",
                next: "default",
                other: "active",
                callback: function () {
                    this.setState('not_hovered', 'hover');
                }
            });
        },
        preventDefaultAction: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            return false;
        },
        _attachGlobalListeners: function () {
            var that = this,
                listeners = this.GLOBAL_LISTENERS;

            if (!listeners.blur) {
                listeners.blur = function (e) {
                    that._onGlobalBlur(e);
                };

                window.addNativeListener('blur', listeners.blur);
            }

            if (!listeners.mouseover) {
                listeners.mouseover = function (e) {
                    that._onGlobalMouseOver(e);
                };

                if (!this.isTouchSupported()) {
                    document.addNativeListener('mouseover', listeners.mouseover);
                }
            }
        },
        _onGlobalBlur: function () {
            this._toggleHoveredButton('');
        },
        _onGlobalMouseOver: function (e) {
            function isImageButton(el) {
                var comp = el.get('comp') || '';
                return (/ImageButton$/).test(comp);
            }

            var el = e.target || e.srcElement,
                imageButton;

            if (isImageButton(el)) {
                imageButton = el;
            } else {
                imageButton = el.getParent('[comp$=ImageButton]');
            }

            if (imageButton && imageButton.id) {
                this._toggleHoveredButton(imageButton.id);
            } else {
                this._toggleHoveredButton();
            }
        },
        _toggleHoveredButton: function (id) {
            var hoveredButtons = document.querySelectorAll("[comp$=ImageButton]"),
                button;

            for (var i = 0; i < hoveredButtons.length; i++) {
                button = hoveredButtons[i];

                if (button.id === id) {
                    button.$logic.hover();
                } else if (!button.$logic.isInTransition) {
                    button.$logic.unhover();
                }
            }
        },
        prepareTransition: function (args) {
            if (!this.isTransitionApplied()) {
                return args.callback.call(this);
            }

            this.isInTransition = true;

            this._setTransitionClass(this._skinParts[args.previous + "Image"], "prev");
            this._setTransitionClass(this._skinParts[args.next     + "Image"], "next");
            this._setTransitionClass(this._skinParts[args.other    + "Image"], "other");

            var that = this;

            W.Utils.callOnNextRender(function () {
                args.callback.call(that);
                that.isInTransition = false;
            });
        },
        isTransitionApplied: function () {
            var hasTransition = this.getState('transition') !== 'transition_none';
            return Modernizr.csstransitions && hasTransition;
        },
        _setTransitionClass: function (compPart, className) {
            var view = $(compPart.$view);

            view.removeClass('prev').removeClass('next').removeClass('other');
            view.addClass(className);
        },
        _onRender: function (e) {
            var FIRST_RENDER = this.INVALIDATIONS.FIRST_RENDER,
                DATA_CHANGE = this.INVALIDATIONS.DATA_CHANGE,
                SIZE_REQUEST = [
                    this.INVALIDATIONS.WIDTH_REQUEST,
                    this.INVALIDATIONS.HEIGHT_REQUEST
                ];

            if (this.debugMode || e.data.invalidations.isInvalidated([FIRST_RENDER])) {
                this._onFirstRender();
                this._onDataChange();
                this._onSizeRequest();
            } else if (e.data.invalidations.isInvalidated([DATA_CHANGE])) {
                this._onDataChange();
            } else if (e.data.invalidations.isInvalidated(SIZE_REQUEST)) {
                this._onSizeRequest();
            }
        },
        _onFirstRender: function () {
            this.updateOpacityState();
            this.removeInlineStyles(); // NOTE: IE8 fix
        },
        _onDataChange: function () {
            this.renderLink();
            this.updateTransitionState();
        },
        _onSizeRequest: function () {
            this.setImageSettings();
        },
        updateOpacityState: function () {
            var opacityState = this.isOpacitySupported() ? 'supports_opacity' : 'no_opacity';
            
            this.setState(opacityState, 'opacity');
        },
        isOpacitySupported: function () {
            return Modernizr.opacity;
        },
        renderLink: function () {
            var data = this.getDataItem(),
                renderer = this._linkRenderer,
                anchor = this._skinParts.link,
                linkId = data.get('link'),
                linkData;

            anchor.set('title', data.get('alt'));

            if (!linkId) {
                renderer.removeRenderedLinkFrom(anchor);
                return;
            }

            linkData = this.resources.W.Data.getDataByQuery(linkId);
            if (linkData) {
                renderer.renderLink(anchor, linkData, this);
            }
        },
        updateTransitionState: function () {
            var props = this.getComponentProperties(),
                transition = props.get('transition');

            this.setState('transition_' + transition, 'transition');
        },
        setImageSettings: function () {
            var settings = this._imageSettings,
                width = this.getWidth(),
                height = this.getHeight();

            settings.setSize(width, height);

            this._skinParts.defaultImage.setSettings(settings);
            this._skinParts.hoverImage.setSettings(settings);
            this._skinParts.activeImage.setSettings(settings);

            this._skinParts.link.style.width = width + 'px';
            this._skinParts.link.style.height = height + 'px';
        },
        removeInlineStyles: function () {
            this._skinParts.defaultImage.$view.style.visibility = "";
            this._skinParts.hoverImage.$view.style.visibility = "";
            this._skinParts.activeImage.$view.style.visibility = "";
        }
    });
});
