/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/22/12
 * Time: 12:29 PM
 */


define.utils('browser:this', function(){

    return ({
        show:function (element) {
            $(element).uncollapse();
        },
        hide:function (element) {
            $(element).collapse();
        },
        setChildIndex:function (container, oldIndex, newIndex) {
            var childList = container.getChildren();
            var movedChild = childList[oldIndex];
            var pushedOutChild = childList[newIndex];

            if (movedChild == pushedOutChild){
                movedChild.fireEvent(Constants.DisplayEvents.MOVED_IN_DOM, Constants.DisplayEvents.MOVED_IN_DOM);
            }

            if (movedChild && pushedOutChild) {

                movedChild.inject(pushedOutChild, (newIndex < oldIndex ? "before" : "after"));

                movedChild.fireEvent(Constants.DisplayEvents.MOVED_IN_DOM, Constants.DisplayEvents.MOVED_IN_DOM);
                pushedOutChild.fireEvent(Constants.DisplayEvents.MOVED_IN_DOM, Constants.DisplayEvents.MOVED_IN_DOM);
            }
        },
        waitForElement:function (selector, delayMs, timeOutMs, returnCallback) {
            var iterationCounter = 0;
            var maxIteration = timeOutMs / delayMs;
            var intervalId = setInterval(function () {
                iterationCounter++;
                if (iterationCounter > maxIteration) {
                    clearInterval(intervalId);
                    returnCallback(false);
                }
                var elementCount = $$(selector).length;
                if (elementCount > 0) {
                    clearInterval(intervalId);
                    returnCallback(true);
                }
            }, delayMs);
        },
        getComputedStyle:function (elementNode) {
            if (window.getComputedStyle){
                return window.getComputedStyle(elementNode, null);
            }
            else{
                return elementNode.currentStyle;
            }
        },
        _htmlTextReplacements:[
            ['<', '&lt;'],
            ['>', '&gt;']
        ],

        convertToHtmlText:function (str) {
            str = str.toString();
            for (var i = 0; i < this._htmlTextReplacements.length; ++i) {
                var text = this._htmlTextReplacements[i][0];
                var html = this._htmlTextReplacements[i][1];
                while (str.indexOf(text) != -1){
                    str = str.replace(text, html);
                }
            }
            return str;
        },

        getWindowSize:function (widthWithoutScroller) {
            var viewportwidth, viewportheight;
            if (typeof window.innerWidth != 'undefined' && !widthWithoutScroller) {
                // Standards (mozilla/netscape/opera/IE7)
                viewportwidth = window.innerWidth;
                viewportheight = window.innerHeight;
            } else if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.clientWidth !== 'undefined' && document.documentElement.clientWidth !== 0) {
                viewportwidth = document.documentElement.clientWidth;
                viewportheight = document.documentElement.clientHeight;
            } else {
                // older versions of IE
                var body = document.getElementsByTagName('body')[0];
                viewportwidth = body.clientWidth;
                viewportheight = body.clientHeight;
            }
            return {'width':viewportwidth, 'height':viewportheight};
        },

        getPositionRelativeToWindow:function (element) {
            if(typeOf(element) !== 'element'){
                return {x:0, y:0};
            }
            if (!$$(element).length){ return {x:0, y:0};}
            var el = $$(element)[0];
            var pos = el.getPosition();
            var scroll = window.getScroll();
            pos.x -= scroll.x;
            pos.y -= scroll.y;
            return pos;
        },
        getMidPos:function (w, h, e) {
            var windowSize = window.getSize();
            var ScreenWidth = windowSize.x;//document.body.clientWidth;
            var ScreenHeight = windowSize.y;//document.body.clientHeight;
            var mousePosX, mousePosY, screenPosAndBoxX, screenPosAndBoxY;
            // fixed by dfl to support native and mootools events
            if (e.page) {
                mousePosX = e.page.x;
                mousePosY = e.page.y;
                /*current mouse position + box width*/
                screenPosAndBoxX = e.client.x + w;
                /*current mouse position + box height*/
                screenPosAndBoxY = e.client.y + h;
            }
            else {
                mousePosX = e.pageX;
                mousePosY = e.pageY;
                screenPosAndBoxX = e.clientX + w;
                screenPosAndBoxY = e.clientY + h;
            }


            /* if current mouse position + box width are more then screen width we take the difference and push it left*/
            var finalX = (screenPosAndBoxX >= ScreenWidth) ? (mousePosX - (screenPosAndBoxX - ScreenWidth)) : mousePosX;

            var finalY = (screenPosAndBoxY >= ScreenHeight) ? (mousePosY - (screenPosAndBoxY - ScreenHeight)) : mousePosY;
            return {x:finalX, y:finalY};
        },
        getCSSBrowserFeature:function (feature) {
            var result = Modernizr.prefixed(feature.camelCase());
            return (!result) ? false : result.replace(/([A-Z])/g,
                function (str, m1) {
                    return '-' + m1.toLowerCase();
                }).replace(/^ms-/, '-ms-');
        },

        getIsSibling:function (node1, node2) {
            return node1 && node2 && node1.getParent() === node2.getParent();
        },
        // Unique callback for iframe
        iframeCallback : 0,
        prepareIFrameForWrite:function (iframe, callback) {
            /* create new iframe */
            try {
                var doc = iframe.contentWindow.document || iframe.contentWindow.document;
                callback(iframe, doc);
            }
           catch (e) {
                var tmpCallback = 'tmp' + (this.iframeCallback++);
                /* setting a callback for the iframe to call on load */
                W[tmpCallback] = function () {
                    /* getting iframe document object */
                    var doc = iframe.contentDocument || iframe.contentWindow.document;
                    /* calling the callback, predefined */
                    callback(iframe, doc);
                };
               /* iframe.src = W.Config.getServiceTopologyProperty('scriptsRoot') +
                    "/html/sameDomainIFrame.html?d=" + encodeURIComponent(document.domain) +
                    "&c=" + encodeURIComponent(tmpCallback);*/

               iframe.src='javascript:(function () {' +'document.open();document.domain=\''+encodeURIComponent(document.domain)+'\';document.close()' + '})();';
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                callback(iframe, doc);
           }
        },
        /**
         *  yet another ugly safari-hack
         *  safari on mac has render problems when flash 11 is installed
         *  @param {HTMLDivElement} element
         *  @param {int} timeout - ms
         */
        forceBrowserRepaint:function (element, timeout, browserList) {
            browserList = browserList || ['safari'];
            var forceRepaint = false;
            var i = 0;
            for (i;i < browserList.length; i++){
                if (Browser[browserList[i]]){
                    forceRepaint = true;
                    break;
                }
            }
            if (forceRepaint) {
                element = element || $$('body');
                timeout = timeout || 150;
                element.setStyle('opacity', 0.99);  //this forces the page to re-render
                setTimeout(
                    function () {
                        element.setStyle('opacity', 1);
                    }, timeout);
            }
        },

        /**
         * Prevent mousewheel propagation to body
         * From http://stackoverflow.com/a/8463854
         * @param e
         */
        stopMouseWheelPropagation:function (e) {
            e = e || {};

            var borders                 = this.getStyle("border-width").split(" ") ;
            var bordersVerticalWidth    = parseInt(borders[0]) + parseInt(borders[2]) ;

            var height = this.getSize().y;
            if ((this.scrollTop - (this.scrollHeight - height) === bordersVerticalWidth && e.wheel < 0) ||
                (this.scrollTop === 0 && e.wheel > 0)) {
                e.preventDefault();
            }
        },

        preventMouseDownOn: function(domElement) {
            domElement.addEvent("mousedown",    W.Utils._stopEventPropagation) ;
            domElement.addEvent("mouseup",      W.Utils._resumeMouseDownEventPropagation(domElement)) ;
        },

        _stopEventPropagation: function(e) {
            if(e) {
                // stops the propagation chain, but not the default behavior in the browser.
                // see https://developer.mozilla.org/en-US/docs/Web/API/event.stopPropagation
                e.stopPropagation() ;
            }
        },

        _resumeMouseDownEventPropagation: function(listener) {
            var that = this ;
            return function() {
                if(listener) {
                    listener.removeEvent("mousedown", that.stopMouseDownEventPropagation) ;
                }
            } ;
        },

        requestAnimFrame:function () {
            //function is only here for code completion, is create in init
        },

        /**
         * Returns true iff the given code is an enter key code
         * @param keyCode
         */
        isEnterKey:function (code) {
            if (code && code === 13){
                return true;
            } else {
                return false;
            }
        },

        /**
         * Returns true iff the given keycode is not in the range of various control keycodes
         * @param keyCode
         */
        isInputKey:function (code) {
            if (!code) {
                return false;
            }
            //TODO: REVISE THIS!
            // under keycode 48 (the zero key), the only valid input keys are enter, space, delete and backspace
            if (code < 48) {
                // enter, space, backspace or delete do count as input keys
                return (code == 13 || code == 32 || code == 8 || code == 46);
            }

            // filter out the fkeys, num lock, scroll lock
            if (code >= 112 && code <= 145) {
                return false;
            }

            // windows keys
            if (code > 90 && code <= 93) {
                return false;
            }

            return true;
        },

        /*
         Function: serverRequest

         Sends an AJAX request to the server

         Parameters:

         action - A string to be added at the end of the server url to point to a specific action
         data - An object to be sent to the server as JSON
         onSuccess - A callback function to be called on successful finalization of the request
         onFailure - A callback to be called in case of failure
         */
        serverRequest:function (action, method, data, onSuccess, onFailure) {
            //TODO:Add real server URL here, or preferably get it from some configuration file
            var serverBaseUrl = '';

            var request = new Request.JSON({
                url:serverBaseUrl + action,
                onSuccess:onSuccess,
                onFailure:onFailure
            });

            if (method == 'post') {
                request.post(data);
            }
            else {
                request.get(data);
            }
        },

        freezeScroll: function(millisecondsToFreeze){
            if(window.isScrollFrozen){
                return;
            }
            var initialScrollPosition = window.getScroll().y;
            var realScroll = document.onscroll;

            this.callLater(function() {
                document.onscroll = realScroll;
                window.isScrollFrozen = false;
            }, null, null, millisecondsToFreeze || 500);

            window.isScrollFrozen = true;
            document.onscroll = function (e) {
                var newScrollPosition = window.getScroll().y;
                if (initialScrollPosition != newScrollPosition) {
                    window.scrollTo(0, initialScrollPosition);
                }
                e.preventDefault();
                return false;
            };
        },

        /**
         * Returns the browser language code or if it's IE the windows language code
         */
        getBrowserLanguage: function(){
            return (window.navigator.userLanguage || window.navigator.language);
        },

        /**
         * Returns the user's country code according to IP.
         * List of country codes can be found in - http://en.wikipedia.org/wiki/ISO_3166-1_alpha-3
         * @returns countryCode
         */
        getCountryCode: function(){
            var countryCode = (window.editorModel && window.editorModel.geo) ||
                (window.rendererModel && window.rendererModel.geo);
            return countryCode;
        },

        getInternetExplorerVersion: function(){
            //taken from http://stackoverflow.com/questions/17907445/how-to-detect-ie11
            var rv = -1;
            var ua,re;
            if (navigator.appName === 'Microsoft Internet Explorer'){
                ua = navigator.userAgent;
                re  = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
                if (re.exec(ua) !== null){
                    rv = parseFloat(RegExp.$1);
                }
            } else if (navigator.appName === 'Netscape'){
                ua = navigator.userAgent;
                re  = new RegExp("Trident/.*rv:([0-9]{1,}[.0-9]{0,})");
                if (re.exec(ua) !== null){
                    rv = parseFloat(RegExp.$1);
                }
            }
            return rv;
        },

        isIE: function(){
            //checks for IE11, since mootools' Browser.ie is undefined for IE11
            return (Browser.ie || this.getInternetExplorerVersion() !== -1);
        },

        isEdge: function() {
            return navigator.userAgent.match('Edge');
        }
    });

});


/**
 * base 64 decode/encode polyfill
 */
(function () {

    var
        object = typeof window != 'undefined' ? window : exports,
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        INVALID_CHARACTER_ERR = (function () {
            // fabricate a suitable error object
            try { document.createElement('$'); }
            catch (error) { return error; }}());

    // encoder
    // [https://gist.github.com/999166] by [https://github.com/nignag]
    object.btoa || (
        object.btoa = function (input) {
            for (
                // initialize result and counter
                var block, charCode, idx = 0, map = chars, output = '';
                // if the next input index does not exist:
                //   change the mapping table to "="
                //   check if d has no fractional digits
                input.charAt(idx | 0) || ((map = '=') && (idx % 1));
                // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
                output += map.charAt(63 & block >> 8 - idx % 1 * 8)
                ) {
                charCode = input.charCodeAt(idx += 3/4);
                if (charCode > 0xFF){ throw INVALID_CHARACTER_ERR;}
                block = block << 8 | charCode;
            }
            return output;
        });

    // decoder
    // [https://gist.github.com/1020396] by [https://github.com/atk]
    object.atob || (
        object.atob = function (input) {
            input = input.replace(/=+$/, '');
            if (input.length % 4 == 1) {throw INVALID_CHARACTER_ERR;}
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = input.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                    bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                ) {
                // try to find character in table (0-63, not found => -1)
                buffer = chars.indexOf(buffer);
            }
            return output;
        });

}());