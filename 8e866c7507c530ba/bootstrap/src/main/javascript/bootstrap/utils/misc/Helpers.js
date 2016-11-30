/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/24/12
 * Time: 11:49 AM
 */
define.utils('helpers:this', function(){

    /**
     * these variables are needed for getUniqueId (kept in a closure so they can't 'accidentally' be edited!)
     */
    var currentTimestampCounter = 0,
        previousTimestamp;

    return ({
        _isStackEnabled: null,

        log:function(){},

        getPrefixedUniqueId: function (prefix) {
            return prefix ? prefix + '_' + this.getUniqueId() : this.getUniqueId();
        },

        getUniqueId: function () {
            var base36timestamp = (new Date().getTime()).toString(36);
            if(base36timestamp === previousTimestamp){
                base36timestamp += "_" + (currentTimestampCounter++);
            } else {
                previousTimestamp = base36timestamp;
                currentTimestampCounter = 0;
            }
            return base36timestamp;
        },

        // taken from http://stackoverflow.com/a/2117523
        getGUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); // jshint ignore:line
                return v.toString(16);
            });
        },

        getAntiCacheSuffix:function () {
            var nocache = W.Utils.getQueryParam("nocache");
            var utils = W.Utils;
            var antiCache;
            if (window.location.protocol === "file:" || nocache == 'false') {
                antiCache = '';
            }
            else {
                if (!utils._antiCacheSuffix) {
                    utils._antiCacheSuffix = new Date().getTime().toString(36);
                }
                antiCache = "?noCache=" + utils._antiCacheSuffix;
            }
            return antiCache;
        },
        /**
         *
         * @param {String} url
         * @param {String} paramName
         * @param {Object} value
         */
        setUrlParam:function (url, paramName, value) {
            var urlParts = url.split("?");
            var paramList = [];
            var replaced = false;
            if (urlParts.length == 2) {
                paramList = urlParts[1].split("&");
                for (var i = 0; i < paramList.length; i++) {
                    if (paramList[i].indexOf(paramName + "=") === 0) {
                        paramList[i] = paramName + "=" + String(value);
                        replaced = true;
                        break;
                    }
                }
            }

            if (!replaced) {
                paramList.push(paramName + "=" + String(value));
            }

            urlParts[1] = paramList.join("&");
            url = urlParts.join("?");

            return url;
        },

        getQueryStringAsObject: function(url){
            var queryString = {};
            var urlStr = url ? url : window.location.href;

            urlStr.replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function($0, $1, $2, $3) { queryString[$1] = decodeURIComponent($3); }
            );

            return queryString;
        },

        getQueryStringParamsAsObject: function(url){
            var queryString = {};
            var urlStr = url ? url : window.location.search;

            urlStr.substr(urlStr.indexOf('?')).replace(
                new RegExp("([^?=&]+)(=([^&]*))?", "g"),
                function($0, $1, $2, $3) { queryString[$1] = $3; }
            );

            return queryString;
        },


        /**
         *  gets a param from the current url
         * @param name
         */
        getQueryParam:function (name, url) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var urlToLookIn = url || window.location.href;
            var results = regex.exec(urlToLookIn);
            if (results === null){
                return "";
            }
            else{
                return results[1];
            }
        },

        /**
         *
         * @param {Array|Object} objects
         * @param {String} eventName
         * @param {function(Boolean, [Array|Object])} callback
         * @param {Number} [timeout]
         * @param {Boolean} [isAsync]
         */
        waitForAnEventOnObjects: function(objects, eventName, callback, isAsync, timeout){
            timeout = typeof timeout === 'number' ? timeout : this._getDefaultTimeoutTime();
            var map;
            if(objects.toMap) { // an Array
                map = objects.toMap(function (obj, index) {
                    return index;
                });
            } else if(typeof objects === 'object'){
                map = _.clone(objects);
            } else{
                throw "waitForAnEventOnObjects works for objects or arrays";
            }

            var timeoutId = setTimeout(function(){
                callback(false, _.values(map));
            }, timeout);

            _.forEach(objects, function(obj, index){
                 obj.once(eventName, obj, function(){
                     delete map[index];
                     if(_.isEmpty(map)){
                         clearTimeout(timeoutId);
                         if(isAsync){
                             _.defer(callback,true);
                         } else{
                            callback(true);
                         }
                     }
                 });
            });
        },

        _getDefaultTimeoutTime: function(){
            return 10000;
        },

        callLater:function (callback, argsArray, scope, time) {
            if (callback && typeOf(callback) === 'function') {
                argsArray = argsArray || [];
                scope = scope || window;
                time = time || 1;

                this._isStackEnabled = this._isStackEnabled || (this.getQueryParam('stack') === "true") ;

                if(this._isStackEnabled){
                    // getStackTrace() can be horribly expensive, so we should use it only in debug mode:
                    var stack = this.getStackTrace() ;
                    return setTimeout(function () {
                        callback.callLaterStack = stack;
                        callback.apply(scope, argsArray);
                        delete callback.callLaterStack;
                    }, time);
                } else {
                    return setTimeout(function () {
                        callback.apply(scope, argsArray);
                    }, time);
                }
            }
        },
        clearCallLater:function (callId) {
            clearTimeout(callId);
        },
        callOnNextRender:function (callback, timeIntervalFallback) {
            timeIntervalFallback = timeIntervalFallback || 60;
            var timeFunc = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, timeIntervalFallback);
                };
            return timeFunc(callback);
        },
        clearOnNextRender:function (callId) {
            var clearFunc = window.cancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                clearTimeout;
            clearFunc(callId);
        },

        _animationPriorityCallbacks: [],
        _priorityAnimationId: null,
        _priorityCallsCount: 0,
        callOnNextRenderPriority: function(callback, priority) {
            if (!callback || typeof callback !== 'function') {
                return;
            }
            if (!this._priorityAnimationId) {
                this._priorityAnimationId = this.callOnNextRender(this._onPriorityAnimation.bind(this));
            }

            this._priorityCallsCount++;
            this._animationPriorityCallbacks.push({
                id: this._priorityCallsCount,
                callback: callback,
                priority: priority || 10000
            });
            return this._priorityCallsCount;
        },

        clearOnNextRenderPriority: function(callId) {
            for(var i = 0; i < this._animationPriorityCallbacks.length; ++i) {
                if(this._animationPriorityCallbacks[i].id === callId) {
                    this._animationPriorityCallbacks.splice(i, 1);
                    break;
                }
            }
            if(this._animationPriorityCallbacks.length === 0) {
                this.clearOnNextRender(this._priorityAnimationId);
                this._priorityAnimationId = null;
            }
        },

        _onPriorityAnimation: function() {
            this._priorityAnimationId = null;
            var sortedCallbacks = _.sortBy(this._animationPriorityCallbacks, 'priority');
            this._animationPriorityCallbacks = [];
            for(var i = 0; i < sortedCallbacks.length; ++i) {
                sortedCallbacks[i].callback();
            }
        },

        /**
         * number of field members that this object introduced (rather than inherited)
         * @param obj
         */
        objectSizeDelta:function (obj) {
            var numberOfKeys = 0;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    numberOfKeys++;
                }
            }
            return numberOfKeys;
        },

        /**
         * replaces invalid unicode chars
         * @param text {Object}
         * @return {Object} if <i>text</i> is a string, returns the sanitized text, otherwise returns text <b>unchanged</b>
         */
        sanitizeUnicode:function (text) {
            // remove lsep/rsep unicode chars;
            return typeof text == 'string' ?
                text.replace(/[\u2028\u2029]/g, '\u000A') :
                text;
        },

        encodeUrl: function(url) {
            if(!url) {
                return "" ;
            }
            return encodeURI(url) ;
        },

        encodeValue: function (value) {
            if (value === null || value === undefined) {
                return "";
            }
            return encodeURIComponent(value);
        },

        getUniqueArray: function(arr) {
            var ret = [];
            var length = arr.length;
            for(var i=0; i<length; i++) {
                for(var j=i+1; j<length; j++) {
                    // If this[i] is found later in the array
                    if (arr[i] === arr[j]){
                        j = ++i;
                    }
                }
                ret.push(arr[i]);
            }
            return ret;
        },

        areArraysContainSameElements: function(arrA, arrB) {
            var elementsWhichAreOnArrAButNotOnArrB = arrA.filter(function(value) {
                return arrB.indexOf(value) == -1;
            });

            var elementsWhichAreOnArrBButNotOnArrA = arrB.filter(function(value) {
                return arrA.indexOf(value) == -1;
            });

            if ( (elementsWhichAreOnArrBButNotOnArrA && elementsWhichAreOnArrBButNotOnArrA.length>0) ||
                (elementsWhichAreOnArrAButNotOnArrB && elementsWhichAreOnArrAButNotOnArrB.length > 0)) {
                return false;
            }
            return true;
        },

        areObjectsEqual: function(obj1, obj2) {
            var prop;

            if ((obj1 && !obj2) || !obj1 && obj2) {
                return false;
            }

            //check obj1, obj2 have same properties
            for (prop in obj1) {
                if (!obj1.hasOwnProperty(prop)) {
                    continue;
                }
                if (typeof(obj2[prop]) == 'undefined' && typeof(obj1[prop]) != 'undefined') {
                    return false;
                }
            }

            for(prop in obj1) {
                if (!obj1.hasOwnProperty(prop)) {
                    continue;
                }
                if (obj1[prop]) {
                    switch(typeof(obj1[prop])) {
                        case 'object':
                            if (!this.areObjectsEqual(obj1[prop],obj2[prop])) {
                                return false;
                            }
                            break;
                        case 'function':
                            if (typeof(obj2[prop])=='undefined' || (obj1[prop].toString() != obj2[prop].toString())) {
                                return false;
                            }
                            break;
                        default:
                            if (obj1[prop] != obj2[prop]) {
                                return false;
                            }
                    }
                } else {
                    if (obj2[prop]) {
                        return false;
                    }
                }
            }

            for (prop in obj2) {
                if (!obj2.hasOwnProperty(prop)) {
                    continue;
                }

                if (typeof(obj1[prop]) == 'undefined' && typeof(obj2[prop]) != 'undefined') {
                    return false;
                }
            }

            return true;
        },

        deepMergeObjects: function(obj1, obj2) {
            return _.merge(obj1, obj2, function(value1, value2) {
                if (_.isArray(value1) && _.isArray(value2)) {
                    var combinedArr = value1.concat(value2);
                    return _.unique(combinedArr);
                }
                if (_.isObject(value1) && _.isObject(value2)) {
                    return this.deepMergeObjects(value1, value2);
                }
                else {
                    return value2;
                }
            }.bind(this));
        },

        stringToBoolean:function (str) {
            if (!str) {
                return false;
            }
            return str.toLowerCase() == 'true';
        },

        strEndsWith: function(str, suffix) {
           return (str.indexOf(suffix, str.length - suffix.length) !== -1);
        },

        moveItemInArray: function(arr, fromIndex, toIndex) {
            if (toIndex >= arr.length) {
                var k = toIndex - arr.length;
                while ((k--) + 1) {
                    arr.push(undefined);
                }
            }
            arr.splice(toIndex, 0, arr.splice(fromIndex, 1)[0]);
            return arr;
        },

        openPopupWindow: function(url, name, params) {
            window.open(url, name, params);
        },

        /**
         * Removes all closing and opening html/xml tags from a string, returning only plain text
         * @param text
         * @returns {string}
         */
        removeHtmlTagsFromString: function(text){
            return text.replace(/<[^<]*>/g, '');
        },
        /**
         * Replace special HTML characters in a string with their relative HTML
         * entity values.
         *
         *		alert( htmlEncode( 'A > B & C < D' ) ); // 'A &gt; B &amp; C &lt; D'
         *
         * @param {String} text The string to be encoded.
         * @returns {String} The encode string.
         *
         * Copied from CKEDITRO tools.js
         */
        htmlEncode: function( text ) {
            return String( text ).replace( /&/g, '&amp;' ).replace( />/g, '&gt;' ).replace( /</g, '&lt;' );
        },

        /**
         * Removes newline and line feed characters from a string, returning a one line string
         * @param text
         * @returns {string}
         */
        removeBreaklinesFromString: function(text){
            return text.replace(/[\n\r]/g, ' ');
        },

        /**
         * Creates an object from an array and a mapping function.
         * @param array {Array.<string>} Array of strings to be used as keys for the result object
         * @param mappingFunction {function(string, number=): *} The function called per iteration on the array param
         * @param thisArg {*=} Optional binding for the mappingFunction
         * @returns {Object} Object composed from the array elements as keys and mappingFunction results as values
         */
        arrayToObject: function(array, mappingFunction, thisArg) {
            if (typeof(thisArg) !== 'undefined') {
                mappingFunction = mappingFunction.bind(thisArg);
            }

            var result = {}, i = -1, length = array.length, key;

            while(++i < length) {
                key = array[i];
                if (typeof(key) !== 'undefined') {
                    result[key] = mappingFunction(key, i);
                }
            }

            return result;
        },

        getFullStateObject: function getFullStateObject() {
            var artifacts = {   bootstrap: W.Config.getLocationMapProperty('bootstrap'),
                ckeditor: W.Config.getLocationMapProperty('ckeditor'),
                langs: W.Config.getLocationMapProperty('langs'),
                wixapps: W.Config.getLocationMapProperty('wixapps'),
                tpa: W.Config.getLocationMapProperty('tpa')};
            var runningExperiments = W.Experiments.getRunningExperimentIds().sort();
            return {    artifacts: artifacts,
                        runningExperiments: runningExperiments};
        },

        getFullStateString: function getFullStateString() {
            return JSON.stringify(this.getFullStateObject());
        },

        /**
         * Copied from https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollY
         * @returns {{x: Number, y: Number}}
         */
        getWindowScrollOffset: function() {
            return {
                x: ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft),
                y: ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop)
            };
        },

        isSiteNameAlreadyExist:function(siteName) {
            var usedMetaSiteNames = this.getUsedMetaSiteNames(); // window.editorModel.usedMetaSiteNames;
            var _siteName = siteName.replace(/\s+/g, '-').toLowerCase();
            return _.contains(_.invoke(usedMetaSiteNames, 'toLowerCase'), _siteName);
        },

        getUsedMetaSiteNames:function(){
            return W.Config.getEditorModelProperty("usedMetaSiteNames");
        }
    });
});
