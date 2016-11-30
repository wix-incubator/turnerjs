function Logger(settings) {
    this.setSettings(settings);
}

/**
 *
 * @typedef Logger
 * @type {{constructor: Function, init: Function, getArtifactVersion: Function, getAllArtifactsVersions: Function, setSettings: Function, doNotSendReports: Function, isReady: Function, clone: Function, _initGoogleAnalytics: Function, reset: Function, getSessionTime: Function, updateSetting: Function, getLog: Function, clearLog: Function, setDebugMode: Function, reportError: Function, reportEvent: Function, reportEditorLoadingEvent: Function, reportPageEvent: Function, _sanitizePageUrl: Function, _sanitizeUrlForWixBI: Function, isUniqueErrorCode: Function, _handleLogObj: Function, _logLog: Function, _checkTime: Function, _getTime: Function, isThisSiteInEventSampleRatio: Function}}
 */
Logger.prototype = {
    /**
     * @constructs
     */
    constructor: Logger,
    init:function(settings){
        this.setSettings(settings);
    },
    /**
     * Setup method for Logger
     * @return {bootstrap.bi.Logger|string} self
     */
    //tried to put this in W.Utils.HelperUtils, but it isn't defined yet when we reach this point.
    getArtifactVersion: function (artifactName) {
        var originalTopology = window.serviceTopology ? window.serviceTopology.scriptsLocationMap : {};
        var topology = window.define && define._definitions && define._definitions.resource && define._definitions.resource.topology ?
            define._definitions.resource.topology.value : originalTopology;
        if (artifactName==='html-client') { artifactName='bootstrap'; } //small hack so that we show web rather than bootstrap
        var artifactUrl = topology[artifactName];
        if (typeof(artifactUrl) !== 'string') {
            return 'unknown';
        }
        var arr = artifactUrl.split('/').filter(function(str) { return str.length > 0; });
        return arr.length ? arr[arr.length - 1] : 'invalid';
    },

    getAllArtifactsVersions: function (delimiter, asDictionary) {
        var artifact = ['html-client', 'ck-editor', 'langs', 'wixapps', 'tpa', 'ecommerce'];

        var obj = {};

        if (asDictionary) {
            for (var i = 0; i < artifact.length; i++) {
                obj[artifact[i]] = this.getArtifactVersion(artifact[i]);
            }
            return obj;
        }
        var versions = artifact.map(this.getArtifactVersion);
        return versions.join(delimiter || '|');
    },

    setSettings: function (settings) {
        // Reset logger params
        this.reset();
        // Save logger settings
        this._settings = settings;

        this._dontSendReports = window.location.search.search(/[?&]suppressbi=true/i) > -1; //if there's suppressbi=true in the URL, don't send anything

        this.setDebugMode(settings.debugMode || false);
        // Create analytics manager
        this._initGoogleAnalytics(settings);

        // Crete wix BI manager
        try {
            var server;
            var ver = settings.version; //fallback values
            if (window.serviceTopology) {
                server = window.serviceTopology.editorServerName ? window.serviceTopology.editorServerName.split('.')[0] :
                    (window.serviceTopology.serverName ? window.serviceTopology.serverName.split('.')[0] : '?');
                ver = this.getAllArtifactsVersions();
            }
            this._wixBI = new WixBILogger(
                this,
                settings.floggerServerURL,
                settings.majorVer,
                ver,
                settings.siteId,
                settings.metaSiteId,
                settings.userId,
                settings.userType,
                settings.wixGlobalSessionId,
                settings.computerId,
                settings.creationSource,
                settings.wixAppId,
                server,
                settings.editingSessionId
            );


            if (window.wixErrors && !window.wixErrors.namesMap) {
                (function createErrNamesMap(window){
                    var errKeys = Object.keys(wixErrors);

                    var errNamesMap = errKeys.reduce(function(accumulator, errKey) {
                        var errObj = wixErrors[errKey];
                        accumulator[errObj.errorCode] = errKey;
                        return accumulator;
                    }, {});

                    window.wixErrors.namesMap = errNamesMap;
                })(window);
            }

        } catch (ee) {
            this._wixBI = { setDocId: function () {
            }, sendError: function () {
            }, sendEvent: function () {
            } };
        }

        this.reportEditorLoadingEvent('LOGGER STARTED', 110);
    },

    doNotSendReports: function () {
        this._dontSendReports = true;
    },

    isReady: function () {
        return true;
    },

    clone: function () {
        return this;
    },
    _initGoogleAnalytics: function (settings) {
        var isEnabled = (settings.enableGoogleAnalytics !== false);
        var defaultAnalytics = {
            sendError: function () {},
            sendEvent: function () {},
            sendPageEvent: function () {}
        };
        if (isEnabled) {
            try {
                this._analytics = new WixGoogleAnalytics(settings.wixAnalytics, settings.userAnalytics, settings.version, settings.userType, settings.userLanguage, settings.sendPageTrackToUser, settings.sendPageTrackToWix);
            } catch (e) {
                this._analytics = defaultAnalytics;
            }
        } else{
            this._analytics = defaultAnalytics;
        }
    },

    reset: function () {
        // Set an array to save all logs
        this._logList = [];
        // Set an abject that saves times delta
        this._timeData = {};
        // Save init time
        this._initTime = new Date().getTime();
    },

    getSessionTime: function () {
        return new Date().getTime() - this._initTime;
    },

    updateSetting: function (prop, value) {
        var settings = this._settings || {};
        settings[prop] = value;
        switch (prop) {
            case 'siteId':
                this._wixBI.setDocId(value);
                break;
            case 'wixAppId':
                this._wixBI.setSrc(value);
                break;
            case 'editorSessionId':
                this._wixBI.setEditorSessionId(value);
                break;
            case 'metaSiteId':
                this._wixBI.setMetaSiteId(value);
                break;

        }
    },

    getLog: function () {
        return this._logList.concat();
    },

    clearLog: function () {
        this._logList = [];
    },

    setDebugMode: function (isDebugMode) {
        this._debugMode = isDebugMode;
    },

    /**
     * Reports a runtime error
     * @param {Object} err error object (@see errors map at logger.ja)
     * @param {String} className the class in which the error occurred
     * @param {String} methodName the method in which the error occurred
     * @param {Object} params extra parameters. if the type is String, it will be added to the description
     * @returns {?function} either an empty function, or null when there was no err provided, or if _debugMode. That way, you can place () after the call, so you get an exception in those conditions
     */
    reportError: function (err, className, methodName, params) {
        if (!err) {
            return null; // this actually caused the editor not to load
        }

        if (err.ignore) {
            return function () {
            };
        }

        // Set default params
        params = params || {};
        if (!this._handleLogObj('reportError', err, params, {'className': className, 'methodName': methodName})) {
            return function () {
            };
        }

        if (!this._dontSendReports) {
            // Send wix BI error
            this._wixBI.sendError(err, className, methodName, params);
            // Send google analytics
            this._analytics.sendError(err, className, methodName, params);
        }
        // Send error to callback
        this._settings.onError && this._settings.onError(err, className, methodName, params);

        if (this._debugMode) {
            return null;
        }

        // do nothing in production
        return function () {
        };
    },

    /**
     * Report event
     * @param event
     * @param params
     * @returns {function} an empty function
     */
    reportEvent: function (event, params) {
        // Set default params
        params = params || {};
        if (!this._handleLogObj('reportEvent', event, params)) {
            return function () {
            };
        }

        if (!this._dontSendReports) {
            // Send BI event if wix bi id is provided
            if (event.biEventId) {
                this._wixBI.sendEvent(event, params);
            }
            // Send google analytics to wix
            this._analytics.sendEvent(event, params);
        }
        // Send event to callback
        this._settings.onEvent && this._settings.onEvent(event, params);

        return function () {
        };
    },


    reportEventWithCustomParams: function (event, params, customParams) {
        // Set default params
        params = params || {};
        if (!this._handleLogObj('reportEvent', event, params)) {
            return function () {
            };
        }

        if (!this._dontSendReports) {
            // Send BI event if wix bi id is provided
            if (event.biEventId) {
                this._wixBI.sendEventWithCustomParams(event, params, customParams);
            }
            // Send google analytics to wix
            this._analytics.sendEvent(event, params);
        }
        // Send event to callback
        this._settings.onEvent && this._settings.onEvent(event, params);

        return function () {
        };
    },

    reportCustomEvent: function (event, params) {
        // Set default params
        params = params || {};
        if (!this._handleLogObj('reportEvent', event, params)) {
            return function () {
            };
        }

        if (!this._dontSendReports) {
            // Send BI event if wix bi id is provided
            if (event.biEventId) {
                this._wixBI.sendCustomEvent(event, params);
            }
            // Send google analytics to wix
            this._analytics.sendEvent(event, params);
        }
        // Send event to callback
        this._settings.onEvent && this._settings.onEvent(event, params);

        return function () {
        };
    },

    initNewBeatPage: function() {
        this._wixBI.initNewBeatPage();
    },

    reportBeatStartEvent: function(params) {
        this._wixBI.sendBeatStartEvent(params);
    },

    reportBeatFinishEvent: function(params) {
        this._wixBI.sendBeatFinishEvent(params);
    },

    reportEditorLoadingEvent: function (message, id) {
        // report loading events only for editor (window.viewMode may be "editor" ,"preview" or "site")
        var _vm = window.viewMode;
        if (_vm != 'site') {
            this.reportEvent(wixEvents.LOADING_STEPS, {"c1": id + ':' + _vm + ': ' + message});
        }
    },

    reportPageEvent: function (url) {
        if (this._debugMode || this._dontSendReports) {
            return;
        }

        this._analytics.sendPageEvent(this._sanitizePageUrl(url, window.viewMode));
    },

    _sanitizePageUrl: function (url, viewMode) {
        if (viewMode == 'editor') {
            url = this._sanitizeUrlForWixBI(url);
        }

        return url;
    },

    _sanitizeUrlForWixBI: function (url) {
        return url;
    },

    isUniqueErrorCode: function (errorCode) {
        return Object.every(this._settings.errors, function (errorObject) {
            return errorCode !== errorObject.errorCode;
        });
    },

    /**
     * Checks to see that log event is valid and should be logged..
     */
    _handleLogObj: function (calledFrom, logObj, params, extraParams) {
        // Check that log object is passes
        if (!logObj) {
            return false;
        }

        if (logObj.sampleRatio && logObj.sampleRatio > 1 && !this.isThisSiteInEventSampleRatio(logObj.sampleRatio)) {
            return false;
        }

        // Check call limit
        logObj.callCount = logObj.callCount || 0;
        if (logObj.callLimit && logObj.callLimit <= logObj.callCount) {
            return false;
        } else {
            // Check error times
            this._checkTime(logObj, params);
            // Save log ob
            this._logLog(calledFrom, logObj, params, extraParams);
            // Check for threshold time
            if ((logObj.thresholdTime || logObj.thresholdTime === 0) && params.time >= logObj.thresholdTime) {
                if (logObj.thresholdError) {
                    var error = this._settings.errors[logObj.thresholdError];
                    this.reportError(error);
                }
            }
            // Increase call counter
            logObj.callCount++;
        }
        // return true indicating that log object should be dispatched
        return true;
    },

    /**
     * Logs all event and errors
     */
    _logLog: function () {
        this._logList.push(arguments);
    },

    /**
     * adds delta time to params and dispatch time threshold errors if needed
     */
    _checkTime: function (logObj, params) {
        params = params || {};
        params.time = this._getTime(logObj.timerId);
    },

    /**
     * Return delta time from a specific timer ID and update time group current time
     */
    _getTime: function (timerId) {
        // Validate timer ID
        timerId = timerId || 'initTime';
        // Check for previous time or take delta from init
        var prevTime = this._initTime;
        var currentTime = new Date().getTime();
        if (timerId != 'initTime') {
            // Get prev time
            prevTime = this._timeData[timerId] || this._initTime;
            // Save new time
            this._timeData[timerId] = currentTime;
        }
        // Return delta time
        return currentTime - prevTime;
    },

    isThisSiteInEventSampleRatio: function (sampleRatio) {
        //if we're in debug mode, sampleRatio is disabled (therefore events and errors are not diluted) unless forcesampleratio is in the URL
        //tried to use the one in W.Utils, but it isn't defined yet when we reach this point.
        if (this._debugMode) {
            if (window.location.search.search(/[?&]forcesampleratio/i) == -1) {
                //otherwise, proceed below with normal sample ratio mechanism
                return true;
            }
        } else if (window.location.search.search(/[?logg&]nosampleratio/i) !== -1) {
            //when not in debug mode, if there's a nosampleratio in the URL, we don't dilute the events
            return true;
        }

        //if we have the user's UID, we'll base on that. otherwise, we'll take the site id. that way it's either sticky with the user, or at least with the sites
        var id = (window.siteHeader && siteHeader.userId) || window.siteId;
        if (id) {
            var lastDigits = id.substr(-4);
            return parseInt(lastDigits, 16) % sampleRatio === 0; //run a modulu on factor, and return true only when it's 0
        } else {
            //as a final fallback, if we have neither, just randomize. we could make this persistent for this session, but i don't think we'll really be getting here, so i didn't bother for now
            return Math.floor(Math.random() * sampleRatio) === 0;
        }
    }
};
