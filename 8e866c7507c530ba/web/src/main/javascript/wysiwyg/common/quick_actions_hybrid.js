/**
*
* hybrid
*
**/

// ===================================================

function SimpleCurveTool(from, to, c1, c2) {
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.init(from, to, c1, c2);
}

SimpleCurveTool.prototype.init = function(from, to, c1, c2) {
    c1 = c1 || from;
    c2 = c2 || to;
    this.path.setAttribute("d", "M" + from.x+","+from.y + "C" + c1.x+","+c1.y + " " + c2.x+","+c2.y + " " + to.x+","+to.y);
    this.len = this.path.getTotalLength();
};

SimpleCurveTool.prototype.pointByPercent = function (percent, calcRotation) {
    var angle = 0;
    if(calcRotation) {
        var p1 = this.pointAt(percent - 0.01);
        var p2 = this.pointAt(percent + 0.01);
        angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    }
    return {point:this.pointAt(percent), angle:angle};
};

SimpleCurveTool.prototype.pointAt = function (percent) {
    return this.path.getPointAtLength(this.len * percent);
};

// ===================================================

function SimpleTweener() {
    this._intervalIds = [];
}

SimpleTweener.prototype.easing = {
    linear: function(t, b, c, d){
        return c * t / d + b;
    },
    easeOutQuad: function(t, b, c, d){
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutCubic: function(t, b, c, d){
        if ((t /= d / 2) < 1) { return c / 2 * t * t * t + b; }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    }
    // TODO: add more easing functions if needed (use robert penner's formulas)
};

SimpleTweener.prototype.killAllTweens = function() {
    for(var i=0; i<this._intervalIds.length; i++) {
        clearInterval(this._intervalIds[i]);
    }
    this._intervalIds = [];
};

SimpleTweener.prototype.tween = function(startValue, endValue, duration, delay, easingFunc, progressFunc, completeFunc) {

    duration = duration || 0.01;

    if(!easingFunc) {
        easingFunc = this.easing.linear;
    }

    if(delay) {
        setTimeout(function(){
            this.tween(startValue, endValue, duration, 0, easingFunc, progressFunc, completeFunc);
        }.bind(this), delay*1000);
        if(progressFunc!==null) {
            progressFunc(easingFunc(0, startValue, endValue, duration));
        }
        return;
    }

    var diff = Math.abs(startValue - endValue);
    var startTime = new Date();
    var intervalId = setInterval(function () {
        var now = new Date();
        var elapsed = (now - startTime) / 1000;
        if (elapsed > duration) {
            elapsed = duration;
            clearInterval(intervalId);
        }
        var currentValue = +easingFunc(elapsed, 0, diff, duration).toFixed(2);
        currentValue = startValue + ((startValue<endValue) ? currentValue : -currentValue);

        if(progressFunc!==null) {
            progressFunc(currentValue);
        }
        if(elapsed===duration && completeFunc!==null) {
            completeFunc(currentValue);
        }
    }, parseInt((1 / 40) * 1000, 10));
    this._intervalIds.push(intervalId);
};

// ===============================================================

var WMobileActionsMenu = {
    _mobileActionsMenuElement: null,
    _mobileActionsMenuOverlayElement: null,
    _mobileActionsMenuListsElement: null,
    _mobileActionsMenuListsPagesElement: null,
    _mobileActionsMenuListsSocialElement: null,
    _mobileActionsMenuNavigationContainerElement: null,
    _mobileActionsMenuNavigationElement: null,
    _actionsMenuToggleButton: null,
    _actionsMenuItems: [],
    _simpleCurve: null,
    _isInited: false,
    _tweener: new SimpleTweener(),

    _options: {
        enableOverlay: true,
        enableAnimation: true,
        enableLists: true,
        enableClicks: true,
        startOpened: false,
        defaultZoom: 1
    },

    _viewData: {
        isListOpen: false,
        isMenuOpen: false,
        itemRadius: 85,
        maxItems: 6,
        endPointsArr: [],
        curviness: 0.6,
        animation: {
            isAnimating: false,
            open:{time: 0.3, delay: 0.1},
            close:{time: 0.3, delay: 0.1}
        }
    },

    _actions: {
        "toggle":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 31 31" style="enable-background:new 0 0 31 31;" xml:space="preserve"> <path style="fill-rule:evenodd;clip-rule:evenodd;" d="M12,0h7v31h-7V0z"/> <path style="fill-rule:evenodd;clip-rule:evenodd;" d="M0,12h31v7H0V12z"/> </svg>',
            action: function() {
                this.toggleActionsMenu();
            }
        },
        "pages":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 43.333 34.917" style="enable-background:new 0 0 43.333 34.917;" xml:space="preserve"> <path style="fill-rule:evenodd;clip-rule:evenodd;" d="M0.75,0.417h42v6h-42V0.417z"/> <path style="fill-rule:evenodd;clip-rule:evenodd;" d="M0.75,14.417h42v6h-42V14.417z"/> <path style="fill-rule:evenodd;clip-rule:evenodd;" d="M0.75,28.417h42v6h-42V28.417z"/> </svg>',
            action: function() {
                this._showPagesMenu();
            }
        },
        "call":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 39.941 40.016" style="enable-background:new 0 0 39.941 40.016;" xml:space="preserve"><path style="fill-rule:evenodd;clip-rule:evenodd;" d="M1.983,5.638c-1.67,2.001-5.81,11.223,7.027,24.43c13.508,13.933,23.474,9.75,25.309,7.858l-9.078-9.059c-1.525,1.528-3.214,0.455-6.409-2.038c-2.106-1.656-4.503-3.911-6.519-6.53c-1.397-1.838-2.631-3.784-1.034-5.384L1.983,5.638z M16.344,9.877c0.707-0.71,0.745-1.71,0.199-2.237c-7.28-7.276-7.28-7.276-7.28-7.276C8.719-0.201,7.721-0.092,7.049,0.581L3.962,3.673l9.278,9.295L16.344,9.877z M39.365,32.905c0.707-0.709,0.745-1.691,0.218-2.237c-7.079-7.058-7.079-7.076-7.079-7.076c-0.564-0.546-1.544-0.437-2.216,0.218l-3.105,3.111l9.097,9.077C36.28,35.998,39.383,32.924,39.365,32.905z"/></svg>',
            action: function() {
                var tel = "tel:" + rendererModel.siteMetaData.contactInfo.phone;
                location.href = tel;
            }
        },
        "email":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 39.025 24" style="enable-background:new 0 0 39.025 24;" xml:space="preserve"><path style="fill-rule:evenodd;clip-rule:evenodd;" d="M19.512,15.2L36.649,0.064C36.537,0.048,36.424,0,36.312,0h-33.6c-0.08,0-0.128,0.032-0.208,0.048L19.512,15.2z M39.025,2.4c0-0.287-0.376-0.544-0.473-0.8L26.456,12.272L38.392,22.72c0.192-0.336,0.633-0.705,0.633-1.12V2.4z M0.505,1.472C0.376,1.76,0,2.064,0,2.4v19.2c0,0.352,0.392,0.672,0.537,0.976L12.584,12.24L0.505,1.472z M24.633,13.872l-5.12,4.528l-5.12-4.544L2.584,23.968C2.633,23.984,2.665,24,2.712,24h33.488L24.633,13.872z"/></svg>',
            action: function() {
                var email = "mailto:" + rendererModel.siteMetaData.contactInfo.email;
                location.href = email;
            }
        },
        "address":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 30.427 44.717" style="enable-background:new 0 0 30.427 44.717;" xml:space="preserve"> <path style="" d="M15.212,0C6.812,0,0,6.811,0,15.213c0,8.401,15.212,29.504,15.212,29.504 s15.214-21.103,15.214-29.504C30.427,6.811,23.615,0,15.212,0z M15.214,22.34c-4.438,0-8.036-3.597-8.036-8.036 c0-4.438,3.597-8.035,8.036-8.035c4.437,0,8.034,3.597,8.034,8.035C23.248,18.743,19.651,22.34,15.214,22.34z"/> </svg>',
            action: function() {
                var address = rendererModel.siteMetaData.contactInfo.address;
                var win = window.open("http://maps.apple.com/?q=" + address, "_blank");
                win.focus();
            }
        },
        "social":{
            iconSVG: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 46.667 46" style="enable-background:new 0 0 46.667 46;" xml:space="preserve"> <g> <path style="" d="M11.709,11.987c0,0,0-0.072,0-0.285l0,0c0,0.021,0,0.08,0,0.138 C11.709,11.914,11.709,11.987,11.709,11.987 M14,3.106c-6.088,0-8.729,3.754-8.729,7.841c0,2.706,0,5.202,0,5.202H0.798v6.09H5.27 v16.915h6.439V22.239h6.321l0.288-6.09h-6.609c0-3.502,0-4.356,0-4.447c0-1.679,0.352-2.691,2.547-2.691 c2.028,0,3.887,0.018,3.887,0.018l0.144-5.687C18.287,3.342,16.465,3.106,14,3.106"/> <path style="" d="M37.135,22.547c-3.186,0-5.769,2.583-5.769,5.769c0,0.452,0.051,0.892,0.149,1.315 c-4.795-0.241-9.045-2.537-11.891-6.028c-0.497,0.852-0.781,1.843-0.781,2.9c0,2.001,1.019,3.767,2.567,4.802 c-0.946-0.03-1.835-0.289-2.613-0.722l0,0.073c0,2.795,1.988,5.127,4.628,5.657c-0.484,0.132-0.994,0.202-1.52,0.202 c-0.372,0-0.733-0.036-1.085-0.103c0.734,2.292,2.865,3.96,5.389,4.006c-1.974,1.547-4.462,2.47-7.165,2.47 c-0.466,0-0.925-0.027-1.376-0.081c2.553,1.637,5.585,2.592,8.843,2.592c10.611,0,16.414-8.791,16.414-16.414 c0-0.25-0.006-0.499-0.017-0.746c1.127-0.813,2.105-1.829,2.879-2.986c-1.035,0.459-2.146,0.769-3.313,0.909 c1.191-0.714,2.106-1.845,2.537-3.192c-1.115,0.661-2.349,1.141-3.664,1.4C40.293,23.247,38.794,22.547,37.135,22.547"/> <path style="" d="M41.241,7.097h-6.362V0.735h-4.372v6.362h-6.362v4.371h6.362v6.362h4.372v-6.362h6.362V7.097z"/> </g> </svg>',
            action: function() {
                this._showSocialMenu();
            }
        }
    },

    initialize: function(rootContainer, quickActionsData, options) {
        if(this._isInited) {
            return;
        }
        this._isInited = true;

        this._handleOptions(options);

        this._rootContainer = rootContainer || document;
        this._mobileUtils = window.MobileUtils || null;

        if(window.rendererModel && window.rendererModel.siteMetaData && window.rendererModel.siteMetaData.quickActions && window.rendererModel.siteMetaData.quickActions.configuration) {
            this._quickActionsData = window.rendererModel.siteMetaData.quickActions.configuration;
        } else {
            this._quickActionsData = quickActionsData || null;
        }

        if(this._mobileUtils && this._mobileUtils.isMSMobileDevice()) {
            this.destroy();
            return;
        }

        window.addEventListener('orientationchange', this._handleOrientationChange.bind(this));

        this._createContainers();
        this._initActionsMenu();
        this._initListsContainer();
        this.updateDisplay(300);

        if(this._options.startOpened) {
            this.openActionsMenu();
        }

        // TODO: HACK
        window.WQuickActions = window.WMobileActionsMenu;
    },

    _handleOptions: function(options) {
        if(options){
            for(var option in this._options){
                if(options.hasOwnProperty(option)) {
                    this._options[option] = options[option];
                }
            }
        }
    },

    isInited: function() {
        return this._isInited;
    },

    updateQuickActionsData: function(quickActionsData) {
        if(!this._isInited) {
            return;
        }
        this._quickActionsData = quickActionsData || null;
        this._initActionsMenu();
        this.updateDisplay(0);
        if(this._options.startOpened) {
            setTimeout(function(){
                this.openActionsMenu();
            }.bind(this), 100);

        }
    },

    _initActionsMenu: function() {
        this._clearActionsMenu();
        this._createActionsMenuFromSiteMetaData();
    },

    _clearActionsMenu: function() {
        // TODO: bad for GC!!!
        if(this._mobileActionsMenuNavigationElement) {
            while(this._mobileActionsMenuNavigationElement.children.length>0) {
                var element = this._mobileActionsMenuNavigationElement.children[0];
                this._mobileActionsMenuNavigationElement.removeChild(element);
            }
        }
    },

    _handleOrientationChange: function() {
        if(this._viewData.isListOpen) {
            this.hideLists();
        }
        this.updateDisplay(500);
    },

    updateDisplay: function(delay) {
        delay = delay || 0;
        clearTimeout(this._updateDisplayTO);
        if(delay > 0) {
            this._updateDisplayTO = setTimeout(function(){
                this._delayedUpdateDisplay();
            }.bind(this), delay);
        } else {
            this._delayedUpdateDisplay();
        }
    },

    _delayedUpdateDisplay: function() {

        if(!this._isInited) {
            return;
        }

        var rootContainerSize = this._getRootContainerSize();
        var h = rootContainerSize.height;
        var isPortrait = rootContainerSize.width < rootContainerSize.height;

        var addressBarH = 10 * (this._mobileUtils ? (1/this._mobileUtils.getZoom()) : this._options.defaultZoom);
        if(this._mobileActionsMenuListsElement) {
            this._mobileActionsMenuListsElement.style.height = (h-addressBarH) + "px";
        }
        this._mobileActionsMenuNavigationContainerElement.style.height = (h-addressBarH) + "px";


        var viewportSize = this._getNavigationContainerSize();
        var viewportWidth = viewportSize.width;
        var viewportHeight = viewportSize.height;

        var startPoint = {
            x:viewportWidth * (isPortrait ? 0.12 : 0.08),
            y:viewportHeight * (isPortrait ? 0.92 : 0.88)
        };
        var endPoint = {
            x:viewportWidth * (isPortrait ? 0.5 : 0.75),
            y:viewportHeight * (isPortrait ? 0.3 : 0.5)
        };

        var c1 = JSON.parse(JSON.stringify(startPoint));
        c1.y -= (startPoint.y - endPoint.y) * this._viewData.curviness;
        var c2 = JSON.parse(JSON.stringify(endPoint));
        c2.x -= (endPoint.x - startPoint.x) * this._viewData.curviness;

        if(!this._simpleCurve) {
            this._simpleCurve = new SimpleCurveTool(startPoint, endPoint, c1, c2);
        } else {
            this._simpleCurve.init(startPoint, endPoint, c1, c2);
        }

        this.forceCloseActionsMenu();
        this.updateZoom();

    },



    _getRequiredZoomAmount: function () {
        if(this._mobileUtils) {
            return this._mobileUtils.getZoom();//this._mobileUtils.getInitZoom() / this._mobileUtils.getZoom();//MobileUtils.getZoom() * MobileUtils._getDevicePixelRatio();//this._options.defaultZoom; //viewportSize.width/1200;//this._mobileUtils.getZoom();//this._mobileUtils.getInitZoom() / this._mobileUtils.getZoom();
        }
        return this._options.defaultZoom;
    },

    updateZoom: function () {
        var requiredZoom = this._getRequiredZoomAmount();
        if(this._currentZoomAmount !== requiredZoom) {
            this._currentZoomAmount = requiredZoom;
        }
        this._setZoom(this._currentZoomAmount);
    },

    _setZoom: function (zoom) {
        var len = this._mobileActionsMenuNavigationElement.children.length;
        for(var i=0; i<len; i++) {
            this._mobileActionsMenuNavigationElement.children[i].firstChild.style.zoom = 1/zoom;
        }
        this._setListsZoom(zoom);
    },

    _setListsZoom: function(zoom) {

        if(!this._mobileActionsMenuListsElement || !this._simpleCurve) {
            return;
        }

        var bottomLeftPoint = this._simpleCurve.pointAt(0);

        var margin = (bottomLeftPoint.x * zoom) + "px";

        this._mobileActionsMenuListsPagesElement.style.top = margin;
        this._mobileActionsMenuListsPagesElement.style.bottom = margin;
        this._mobileActionsMenuListsPagesElement.style.left = margin;
        this._mobileActionsMenuListsPagesElement.style.right = margin;
        this._mobileActionsMenuListsPagesElement.style.zoom = 1/zoom;

        this._mobileActionsMenuListsSocialElement.style.top = margin;
        this._mobileActionsMenuListsSocialElement.style.bottom = margin;
        this._mobileActionsMenuListsSocialElement.style.left = margin;
        this._mobileActionsMenuListsSocialElement.style.right = margin;
        this._mobileActionsMenuListsSocialElement.style.zoom = 1/zoom;
    },

    destroy: function() {
        // TODO: hide or remove relevant divs
        window.WMobileActionsMenu = undefined;
    },

    _createContainers: function(){
        this._mobileActionsMenuElement = this._getOrCreateContainer("mobileActionsMenu", this._rootContainer);

        if(this._rootContainer!==document) {
            this._mobileActionsMenuElement.style.position = "absolute";
        }

        if(this._options.enableOverlay) {
            this._mobileActionsMenuOverlayElement = this._getOrCreateContainer("mobileActionsMenuOverlay", this._mobileActionsMenuElement);
        }


        this._mobileActionsMenuNavigationContainerElement = this._getOrCreateContainer("mobileActionsMenuNavigationContainer", this._mobileActionsMenuElement);
        this._mobileActionsMenuNavigationElement = this._getOrCreateContainer("mobileActionsMenuNavigation", this._mobileActionsMenuNavigationContainerElement);

        if(this._options.enableLists) {
            this._mobileActionsMenuListsElement = this._getOrCreateContainer("mobileActionsMenuLists", this._mobileActionsMenuElement);
            this._mobileActionsMenuListsPagesElement = this._getOrCreateContainer("mobileActionsMenuListsPages", this._mobileActionsMenuListsElement);
            this._mobileActionsMenuListsSocialElement = this._getOrCreateContainer("mobileActionsMenuListsSocial", this._mobileActionsMenuListsElement);
        }

    },

    _createActionsMenuFromSiteMetaData: function() {
        if(!this._quickActionsData) {
            return;
        }

//        if(this._options.enableOverlay) {
//            Hammer(this._mobileActionsMenuOverlayElement).on("tap", function(event) {
//                event.preventDefault();
//                event.stopPropagation();
//                event.gesture.preventDefault();
//                event.gesture.stopPropagation();
//            }.bind(this));
//        }

        if(this._quickActionsData.navigationMenuEnabled) {
//            this._createActionItem("pages", false, null, true);
            this._createActionItem("pages");
        }

        if(this._quickActionsData.phoneEnabled) {
            this._createActionItem("call");
        }

        if(this._quickActionsData.emailEnabled) {
            this._createActionItem("email");
        }

        if(this._quickActionsData.addressEnabled) {
            this._createActionItem("address");
        }

        if(this._quickActionsData.socialLinksEnabled) {
//            this._createActionItem("social", false, null, true);
            this._createActionItem("social");
        }

        if(this._mobileActionsMenuNavigationElement.children.length>1) {
            this._actionsMenuToggleButton = this._createActionItem("toggle", true);
            this._actionsMenuToggleButton.style.zIndex = 98;
        }
    },

    _createActionItem: function(id, first, optionalContainer, disabled) {
        var container = optionalContainer || this._mobileActionsMenuNavigationElement;
        var actionItemData = this._actions[id];
        if(actionItemData) {
            var newMenuItemElem = document.createElement("div");
            newMenuItemElem.setAttribute("class", "actionItem");
            newMenuItemElem.setAttribute("id", id);
            newMenuItemElem.innerHTML = "<div class='circle'><div class='svgIconContainer'>"+(actionItemData.iconSVG||"")+"</div></div>";
            if(actionItemData.action && this._options.enableClicks) {
                window.Hammer(newMenuItemElem).on("tap", function(event) {
                    if(this._viewData.isListOpen) {
                        this.hideLists();
                    } else {
                        actionItemData.action.apply(this);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    event.gesture.preventDefault();
                    event.gesture.stopPropagation();
                }.bind(this));
            }

            if(disabled) {
                this.addClass(newMenuItemElem, "disabled");
            }

            if(first && container.children.length>0) {
                container.insertBefore(newMenuItemElem, container.firstChild);
            } else {
                container.appendChild(newMenuItemElem);
            }
            return newMenuItemElem;
        }
    },

    _getOrCreateContainer: function(id, parentNode) {
        var container;
        if(parentNode && parentNode.getElementById) {
            container = parentNode.getElementById(id);
        } else {
            container = document.getElementById(id);
        }

        if(parentNode===document) {
            parentNode = document.body;
        }

        if(container) {
            return container;
        }

        var elem = document.createElement("div");
        elem.setAttribute("id", id);

        if(parentNode.appendChild) {
            parentNode.appendChild(elem);
        }
        return elem;
    },

    hideLists: function() {
        this._mobileActionsMenuListsPagesElement.style.display = "none";
        this._mobileActionsMenuListsSocialElement.style.display = "none";
        this._viewData.isListOpen = false;
        this._animateToggleButton(true);
        this._animateOverlay(true);
    },

    _showPagesMenu: function() {
        if(this._viewData.isMenuOpen) {
            this.forceCloseActionsMenu(true, true);
        }
        this._mobileActionsMenuListsPagesElement.style.display = "block";
        this._viewData.isListOpen = true;
    },

    _showSocialMenu: function() {
        if(this._viewData.isMenuOpen) {
            this.forceCloseActionsMenu(true, true);
        }
        this._mobileActionsMenuListsSocialElement.style.display = "block";
        this._viewData.isListOpen = true;
    },

    _tweenMenuItem: function(elem, percentOnCurve, time, delay, shouldClose, lastItem) {
        elem.style.display = "block";

        this._tweener.tween(shouldClose?percentOnCurve:0, shouldClose?0:percentOnCurve, time, delay, this._tweener.easing.easeInOutCubic, function(value){
            this._setElementPositionOnCurve(elem, value);
        }.bind(this), function(value){
            if(shouldClose) {
                elem.style.display = "none";
            }
            if (lastItem) {
                this._viewData.animation.isAnimating = false;
            }
        }.bind(this));
    },

    _animateActionsMenu: function(shouldClose, skipToggleButton, skipOverlay) {
        if (this._viewData.animation.isAnimating) {
            return;
        }
        this._viewData.isMenuOpen = !shouldClose;

        var len = this._mobileActionsMenuNavigationElement.children.length;

        var animValues = shouldClose ? this._viewData.animation.close : this._viewData.animation.open;

        this._tweener.killAllTweens();

        if(!skipToggleButton && len>1) {
            this._animateToggleButton(shouldClose);
        }

        if(!skipOverlay){
            this._animateOverlay(shouldClose);
        }

        for (var i=1; i<len; i+=1) {
            var delayVal = !shouldClose ? (len * animValues.delay) - (i * animValues.delay) : i * animValues.delay;
            this._tweenMenuItem(this._mobileActionsMenuNavigationElement.children[i], +(i/(this._viewData.maxItems-1)).toFixed(2), this._options.enableAnimation?animValues.time:0, this._options.enableAnimation?delayVal:0, shouldClose, i === len-1);
        }
    },

    _animateToggleButton: function(shouldClose) {
        if(!this._actionsMenuToggleButton) {
            return;
        }
        this._tweener.tween(shouldClose?45:0, shouldClose?0:45, this._options.enableAnimation?0.2:0, 0, null, function(value){
            this._setElementRotation(this._actionsMenuToggleButton.children[0], value);
        }.bind(this));
    },

    _animateOverlay: function(shouldClose) {
        if(this._options.enableOverlay && this._mobileActionsMenuOverlayElement) {
            if(!shouldClose) {
                this._mobileActionsMenuOverlayElement.style.display = "block";
                this._mobileActionsMenuOverlayElement.style.opacity = 0.05;
                this._tweener.tween(0.05, 0.7, this._options.enableAnimation?0.1:0, 0, null, function(value){
                    this._mobileActionsMenuOverlayElement.style.opacity = value;
                }.bind(this));
            } else {
                this._tweener.tween(0.7, 0.05, this._options.enableAnimation?0.1:0, 0, null, function(value){
                    this._mobileActionsMenuOverlayElement.style.opacity = value;
                }.bind(this), function(value){
                    this._mobileActionsMenuOverlayElement.style.display = "none";
                }.bind(this));
            }
        }
    },

    forceCloseActionsMenu: function(skipToggleButton, skipOverlay) {
        this._tweener.killAllTweens();

        if(this._options.enableOverlay && !skipOverlay) {
            this._mobileActionsMenuOverlayElement.style.display = "none";
            this._mobileActionsMenuOverlayElement.style.opacity = "0";
        }

        if(this._actionsMenuToggleButton && !skipToggleButton) {
            this._setElementRotation(this._actionsMenuToggleButton.children[0], 0);
        }

        var len = this._mobileActionsMenuNavigationElement.children.length;
        var item;
        for (var i=0; i<len; i+=1) {
            item = this._mobileActionsMenuNavigationElement.children[i];
            this._setElementPositionOnCurve(item, 0);
            if(i>0) {
                item.style.display = "none";
            }
        }


        this._viewData.isMenuOpen = false;
        this._viewData.animation.isAnimating = false;
    },

    openActionsMenu: function(skipToggleButton, skipOverlay) {
        if (this._viewData.isMenuOpen) {
            return;
        }
        this._animateActionsMenu(false, skipToggleButton, skipOverlay);
    },

    closeActionsMenu: function(skipToggleButton, skipOverlay) {
        if (!this._viewData.isMenuOpen) {
            return;
        }
        this._animateActionsMenu(true, skipToggleButton, skipOverlay);
    },

    toggleActionsMenu: function() {
        if(this._viewData.isListOpen) {
            this.hideLists();
            return;
        }
        if(this._viewData.isMenuOpen) {
            this.closeActionsMenu();
        } else {
            this.openActionsMenu();
        }
    },

    getNumOfActionItem: function() {
        if(this._mobileActionsMenuNavigationElement){
            return this._mobileActionsMenuNavigationElement.children.length;
        }
        return 0;
    },

    getActionItemByIndex: function(index) {
        if(this._mobileActionsMenuNavigationElement){
            return this._mobileActionsMenuNavigationElement.children[index];
        }
        return null;
    },

    _initListsContainer: function() {
    },

    _getRootContainerSize: function(){
        var size = {};
        if(this._rootContainer === document){
            size.width = window.innerWidth;//Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            size.height = window.innerHeight;//Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        } else {
            size.width = this._rootContainer.getWidth();
            size.height = this._rootContainer.getHeight();
        }
        return size;
    },

    _getNavigationContainerSize: function(){
        var size = {
            width:this._mobileActionsMenuNavigationContainerElement.offsetWidth,
            height:this._mobileActionsMenuNavigationContainerElement.offsetHeight
        };
        return size;
    },

    _setElementPositionOnCurve: function(elem, percent) {
        if(!this._simpleCurve) {
            return;
        }
        var point = this._simpleCurve.pointAt(percent);
        elem.style.webkitTransform = "translate("+point.x+"px, "+point.y+"px)";
        elem.style.MozTransform = "translate("+point.x+"px, "+point.y+"px)";
        elem.style.msTransform = "translate("+point.x+"px, "+point.y+"px)";
        elem.style.OTransform = "translate("+point.x+"px, "+point.y+"px)";
        elem.style.transform = "translate("+point.x+"px, "+point.y+"px)";
    },

    _setElementRotation: function(elem, angle) {
        elem.style.WebkitTransform = "rotate(" + angle + "deg)";
        elem.style.MozTransform = "rotate(" + angle + "deg)";
        elem.style.msTransform = "rotate(" + angle + "deg)";
        elem.style.OTransform = "rotate(" + angle + "deg)";
        elem.style.transform = "rotate(" + angle + "deg)";
    },

    delayedFixZoom: function() {
        // Backward compatibility to WQuickActions
        //this.updateZoom();
    },

    fixZoom: function() {
        // Backward compatibility to WQuickActions
        //this.updateZoom();
    },

    startZooming: function() {
        // Backward compatibility to WQuickActions
    },

    hasClass: function (el, name) {
        return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
    },

    addClass: function (el, name) {
        if (!this.hasClass(el, name)) {
            el.className += (el.className ? ' ' : '') + name;
            return true;
        }
    },

    removeClass: function (el, name) {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
            return true;
        }
    }
};

var WQuickActions = {
    MOBILE_MAX_WIDTH: 600,
    element: document.getElementById('quick-actions'),
    dragElement: document.getElementById("quick-actions-drag-handle"),
    menusContainerElement: document.getElementById("quick-actions-menus-container"),

    initialize: function () {
        if(!MobileUtils) {
            return;
        }

        if ((MobileUtils.earlyIsExperimentOpen && MobileUtils.earlyIsExperimentOpen('mobileactionsmenu')) || window.rendererModel.siteMetaData.quickActions.configuration.mobileActionsMenuType==="VER2"){
            this.destroy();
            WMobileActionsMenu.initialize();
            return;
        }

        var contactInfo = window.rendererModel.siteMetaData.contactInfo || {};
        var email = contactInfo.email;
        var phone = contactInfo.phone;
        var address = contactInfo.address;

        if(MobileUtils.isMSMobileDevice()){
            this.element.style.display = 'none';
            this.element.style.visibility = 'hidden';
            window.WQuickActions = undefined;
            return;
        }

        this.links = document.getElementsByClassNameForMobile('quick-actions-button');
        var menu = document.getElementById('qa-menu');
        if (menu.childElementCount > 0) {

            this._isAvailable = true;

            this.setInitZoom();
            this.delayedFixZoom();

            var debounce = function (func, threshold, execAsap) {

                var timeout;

                return function debounced() {
                    var context = this, args = arguments;
                    function delayed() {
                        if (!execAsap) {
                            func.apply(context, args);
                        }
                        timeout = null;
                    }

                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    else if (execAsap) {
                        func.apply(context, args);
                    }

                    timeout = setTimeout(delayed, threshold || 100);
                };

            };

            window.addEventListener('touchmove', this.handleTouchMove.bindContextForMobile(this));
            window.addEventListener('orientationchange', this.delayedFixZoom.bindContextForMobile(this));
            window.addEventListener('touchstart', debounce(this.delayedFixZoom.bindContextForMobile(this)), 500);

            for (var i = 0; i < this.links.length; i++) {
                this.links[i].addEventListener('click', this.stopLinkIfDisabled.bindContextForMobile(this));
            }

            new Hammer(document.body)
                .on('doubletap', this.handleZoom.bindContextForMobile(this));

            new Hammer(this.element)
                .on('dragstart', this.moveActionsStart.bindContextForMobile(this))
                .on('drag', this.moveActions.bindContextForMobile(this))
                .on('dragend', this.moveActionsEnd.bindContextForMobile(this));

            this.dragElement.addEventListener('click', this.toggleActionsVisibility.bindContextForMobile(this));

            var actionsBar = document.getElementById('quick-actions-bar');
            this.height = (actionsBar) ? actionsBar.offsetHeight : 0;
            this.bottom = 0;
            this.newBottom = 0;
            this.distance = 0;
            this.dragStartY = 0;

            this._setHref("quick-actions-email", (email) ? "mailto:" + email : '');
            this._setHref("quick-actions-call", (phone) ? "tel:" + phone : '');
            this._setHref("quick-actions-location", (address) ? "http://maps.apple.com/?q=" + address : '');

            this.isLinksEnabled = true;

            this._initPagesMenu();
            this._initSocialMenu();
        } else {
            this.element.style.display = 'none';
        }
    },

    destroy: function(){
        this.element.parentNode.removeChild(this.element);
        this.menusContainerElement.parentNode.removeChild(this.menusContainerElement);
        // TODO: remove event listeners and verify GC
        window.WQuickActions = null;
    },

    _initMenu: function (menu, menuButton) {
        var closeButton = menu.querySelector(".quick-actions-drop-up-x"),
            transparentBackground = menu.querySelector(".quick-actions-drop-up-back");

        // show button for new menu
        this.removeClass(menuButton, 'qa-new-menus-hide');

        // workaround for disappearing parameter on iOS
        menu.style.position = 'fixed';
        menu.style.left = '0px';

        this._bindDropUpMenu(menuButton, menu);
        this._bindCloseMenu(closeButton, menu);
        this._bindCloseMenu(transparentBackground, menu);
    },

    _initPagesMenu: function () {
        var menu = document.getElementById("qa-drop-up-pages"),
            menuButton = document.getElementById("quick-actions-pages-button");

        if (!(menu && menuButton)) {
            return false;
        }

        this._initMenu(menu, menuButton);
    },

    _initSocialMenu: function () {
        var menu = document.getElementById("qa-drop-up-social"),
            menuButton = document.getElementById("quick-actions-social-button");

        if (!(menu && menuButton)) {
            return false;
        }

        this._initMenu(menu, menuButton);
        this._fixSocialLinkNames();

        var links = menu.getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            this._bindCloseMenu(link, menu);
        }

    },

    _bindCloseMenu: function (closeButton, menu) {
        var self = this;
        if (closeButton) {
            closeButton.addEventListener('click', function () {
                    self.removeClass(menu, 'quick-actions-drop-up-wrapper-open');
                }
            );
        }
    },

    _bindDropUpMenu: function (button, menu) {
        var self = this;
        button.addEventListener('click', function () {
                self.addClass(menu, 'quick-actions-drop-up-wrapper-open');

                // workaround for disappearing parameter on iOS
                menu.style.position = 'fixed';
                menu.style.left = '0px';
            }
        );
    },

    stopLinkIfDisabled: function (e) {
        if (!this.isLinksEnabled) {
            e.preventDefault();
            e.stopPropagation();
        }
    },

    handleZoom: function (e) {
        if (this.zooming) {
            this.wait4zoom();
        } else {
            this.startZooming();
        }
    },

    handleTouchMove: function (e) {
        if (this.isMultiTouch(e)) {
            this.handleZoom(e);
        } else {
            if (this.zooming) {
                this.endZooming();
            }
        }
    },

    delayedFixZoom: function (e) {
        setTimeout(this.fixZoom.bindContextForMobile(this), 300);
    },

    startZooming: function () {
        this.hideBar();
        this.zooming = true;
        this._zoomEndTimeout = setTimeout(this.endZooming.bindContextForMobile(this), 1000);
    },

    wait4zoom: function () {
        if (this._zoomEndTimeout) {
            clearTimeout(this._zoomEndTimeout);
            this._zoomEndTimeout = setTimeout(this.endZooming.bindContextForMobile(this), 500);
        }
    },

    endZooming: function () {
        this.fixZoom();
        this.showBar();
        if (this.zooming) {
            this._zoomEndTimeout = setTimeout(this.endZooming.bindContextForMobile(this), 1000);
        }
        this.zooming = false;

    },

    showBar: function () {
        if(this._isAvailable) {
            this.element.style.display = 'block';
            this.removeClass(this.element, 'no-pointer-events');
        }
    },

    hideBar: function () {
        this.element.style.display = 'none';
        this.addClass(this.element, 'no-pointer-events');
    },

    moveActionsStart: function (e) {
        this.disableLinks();
        this.dragStartY = e.gesture.center.pageY;
        this.bottom = this.hasClass(this.element, 'quick-actions-hidden') ? (0 - this.height) : 0;

        e.gesture.preventDefault();
        e.stopPropagation();
    },

    moveActions: function (e) {
        this.distance = e.gesture.center.pageY - this.dragStartY;
        this.newBottom = Math.min(Math.max(this.bottom - this.distance, 0 - this.height), 0);
        this.element.style.bottom = this.newBottom + 'px';

        e.gesture.preventDefault();
    },

    moveActionsEnd: function (e) {
        if (this.newBottom != this.bottom) {
            this.toggleClass(this.element, 'quick-actions-hidden');
        }
        this.element.style.bottom = "";
        setTimeout(this.enableLinks.bindContextForMobile(this), 500);

        e.gesture.preventDefault();
    },

    toggleActionsVisibility: function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.disableLinks();
        setTimeout(this.enableLinks.bindContextForMobile(this), 500);
        this.toggleClass(this.element, 'quick-actions-hidden');
        return false;
    },

    setInitZoom: function () {
        this.initZoom = MobileUtils.getInitZoom();
        return this.initZoom;
    },

    fixZoom: function () {
        if(!this.element) {
            return;
        }

        if (!this.initZoom || this.initZoom < 0 || this.initZoom > 5) {
            this.setInitZoom();
        }
        var zoom = this.initZoom / MobileUtils.getZoom();

        this.element.style.zoom = zoom;
        this.menusContainerElement.style.zoom = zoom;
    },

    getZoom: function () {
        var screenWidth = (Math.abs(window.orientation) === 90) ? Math.max(screen.height, screen.width) : Math.min(screen.height, screen.width);
        return (screenWidth / window.innerWidth);
    },

    isMultiTouch: function (e) {
        return e.touches.length > 1;
    },

    _setHref: function (elementId, newRef) {
        var refElement = document.getElementById(elementId);
        if (refElement) {
            refElement.href = newRef;
        }
    },

    enableLinks: function () {
        var bottom = window.getComputedStyle(this.element, null).getPropertyValue("bottom");
        var isHidden = parseInt(bottom, 10);
        if (!isHidden) {
            this.isLinksEnabled = true;
        }
    },

    disableLinks: function () {
        this.isLinksEnabled = false;
    },

    /**
     * Helper functions
     */

    hasClass: function (el, name) {
        return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
    },

    addClass: function (el, name) {
        if (!this.hasClass(el, name)) {
            el.className += (el.className ? ' ' : '') + name;
            return true;
        }
    },

    removeClass: function (el, name) {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
            return true;
        }
    },

    toggleClass: function (el, name) {
        var classRemoved = this.removeClass(el, name);
        if (!classRemoved) {
            this.addClass(el, name);
        }
    },

    _fixSocialLinkNames: function () {
        var socialNameMap = {
            'See me on...': 'See me on...',
            'facebook': 'Facebook',
            'twitter': 'Twitter',
            'pinterest': 'Pinterest',
            'google_plus': 'Google+',
            'tumblr': 'Tumblr',
            'blogger': 'Blogger',
            'linkedin': 'LinkedIn',
            'youtube': 'YouTube',
            'vimeo': 'Vimeo',
            'flickr': 'Flickr',
            '': ''
        };

        var socialLinks = document.getElementById("quick-actions-menus-social-links");
        if (socialLinks) {
            var options = socialLinks.getElementsByTagName("a");
            for (var i = 0; i < options.length; i++) {
                var option = options[i];
                var key = option.innerHTML;
                var value = socialNameMap[key];
                option.innerHTML = value;
            }
        }
    }
};