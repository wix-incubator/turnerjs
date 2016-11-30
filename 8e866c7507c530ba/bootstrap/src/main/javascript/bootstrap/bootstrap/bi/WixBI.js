var WixBILogger = function(wixLogger, floggerURL, majorVer, version, siteId, metaSiteId, userId, userType, wixGlobalSessionId, computerId, creationSource, wixAppId, server, editingSessionId) {
    // encode params which require encoding and set defaults
    this._wixLogger = wixLogger;

    this._beatVersion = 2;
    this._beatEventTypes = {'START': 1, 'RESET': 2, 'FINISH': 3};
    this._beatSiteTypes = {'WixSite': 1, 'UGC': 2, 'Template': 3};
    this._beatTimestamps = {};
    this._pageNumberInSession = 0;

    creationSource = encodeURIComponent(creationSource);
    wixAppId = wixAppId ? wixAppId : 3;
    this.logScript = null;
    // Save server url
    this._floggerServerURL = (floggerURL.charAt(floggerURL.length-1) !== '/') ? floggerURL + '/' : floggerURL;
    // Define common params\

    this._commonFieldsFiltersByAdapter = {
        //this is for bi on the HTML editor
        'hed': ['src', 'did', 'msid', 'evid', 'majorVer', 'ver', 'ts', 'esi', 'server', 'viewMode', 'vsi', 'ownerId', 'roles'],
        //this is for errors on the HTML editor
        'trg': ['src', 'did', 'msid', 'uid', 'gsi', 'cid', 'majorVer', 'ver', 'lng', 'evid', 'ts', 'esi', 'cat', 'errc', 'iss', 'sev', 'errscp', 'trgt', 'dsc', 'server', 'viewMode', 'vsi']
    };

    this._common = {
        /* non changeable */
        /* src - 3 = mobile */
        "src": wixAppId,
        /* change in initialize */
        /*user type
         "ut":userType, */
        /*globalSessionId*/
        "gsi":(wixGlobalSessionId != '')  ? wixGlobalSessionId : this.generateGUID(),
        /*computer id*/
        'cid':computerId,
        /*majorVer e.g. 2 */
        'majorVer': majorVer,
        /*version*/
        "ver":version,
        /*language*/
        "lng":"en-US",
        /* change per request - hardcoded */
        /* Events - 20 = timers, 10 = errors */
        "evid":0,
        /* category 1 - editor 2 - viewer 3 - load time - 4 - server
         "cat":0, */
        /*Time stamp for error time */
        "ts":0,
        /*creation source*/
        // "app":creationSource
        "server": server,
        "esi": editingSessionId,
        'viewMode':window.viewMode,
        'vsi':window.viewMode=='site' ? this.generateGUID() : null
    };

    if (window.editorModel) {
        this._common.ownerId = editorModel.permissionsInfo.ownerId;
        this._common.roles = stringifyRoles(editorModel.permissionsInfo.loggedInUserRoles);
    }

    if (window.viewMode.toLowerCase() === "site") {
        if (window.publicModel && window.publicModel.timeSincePublish) {
            this._common.tsp = window.publicModel.timeSincePublish;
        } else {            this._common.tsp = -1;
        }
    }

    // Define keys arrays
    this._keyArray = {
        errorKeys:["errc","iss","sev", "dsc"],
        funnelKeys:["g1","g2","i1","i2","c1","c2"]
    };

};

// Same function as in rolesUtils, we don't have utils loaded yet
function stringifyRoles(rolesArray) {
    var roles = '';
    for (var i = 0; i < rolesArray.length; i++) {
        roles += rolesArray[i].role;
        i < rolesArray.length - 1 ? roles += ', ' : roles += '';
    }
    return roles;
}

//This function exists in UserCookies.js which isn't used yet, and in any case, we should use the one in utils.misc.helper
WixBILogger.prototype.generateGUID = function () {
    var S4 = function () {
        /*
         * 1. 0x10000 equals 65536.
         * 2. Adding 1 to Math.random() forces the result to be at least 65536, so when converting it to Hexadecimal it will be at least 5-digits number (10000).
         * 3. Remove the first char in order to get 4-digits String.
         * */
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };

    return (
        S4() + S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + "-" +
        S4() + S4() + S4()
        );
};

// setter for src. default is 3 for Wix/Mobile
WixBILogger.prototype.setSrc = function(newSrc){
    this._common.src = newSrc;
};

//this function should be safely removed
WixBILogger.prototype.setDocId = function(newId){
    this._common.did = newId;
};

//this function should be safely removed
WixBILogger.prototype.setMetaSiteId = function(newId){
    this._common.msid = newId;
};

WixBILogger.prototype.setEditorSessionId = function(newId){
    this._common.esi = newId;
};

/**
 * Send an error report to the BI server
 * @param error {String} a member of the errors map
 * @param errorScope {String} class name
 * @param target {String} method name
 * @param params {Object} extra parameters, if string, it will be added to the description
 * @param serverError
 */
WixBILogger.prototype.sendError = function(error, errorScope, target, params, serverError){
    if(!error) {return;}
    //if the query string has "automation=true" as a parameter, then we filter the bi sent, so that their listener isn't bombarded with useless stuff
    if(this.isInAutomationMode()) {
        if (!this.leaveOnlyImportantErrors(error)) return;
        try {
            throw('>>>>>>>>ERROR ' + error.errorCode + ': ' + error.desc);
        }
        catch(e) {}
    }

    /* event type - error */
    this._common.evid = error['type'] || 10;
    this._common.cat = error['category'];

    // Save error time
    this._common.ts = this._wixLogger.getSessionTime();

    // Save http code if available
    var httpc = serverError || error['httpResponse'] || 0;

    // Save error code id
    var errorc =  error['errorCode'];

    var errorn = window.wixErrors.namesMap[errorc] || 'error_name_not_found';

    var dsc;

    var errorCommon = this._common;
    var extraParams = null;
    delete params.time; //TODO: don't even know why it's here. check
    if (typeof(params) === "string") {
        dsc = params;
    }else if(params instanceof Array){
        dsc = JSON.stringify(params);
    }else if(typeof(params) === "object") {
        if (params.hasOwnProperty("src") || params.hasOwnProperty("desc")) {
            errorCommon = Object.clone(this._common);
            errorCommon.src = params.src || 44; //if there's a description and no src, then src should be 44 for client errors
            dsc = params.desc || '';
        } else {
            // Save params + stack trace
            //dsc = (window.W && window.W.Utils) ? window.W.Utils.getStackTrace() : "";
            dsc = '';
            extraParams = this._collectAndMapExtraParams(params);
        }
    }

    /* Make sure fields dont break BI's size limits */
    dsc = encodeURI(dsc).slice(0,512);
    target = !target ? '' : target.toString().slice(0,64);

    /* If the error came from server we need to take its own err id */
    /*
     if(cat === 4 && params){
     errorc = params['errorCode'];
     dsc = params['errorDescription'];
     }
     */
    /* unique array for errors */
    var errorParams = {'errc': errorc,
        'errn': errorn,
        'iss': error['issue'],
        'sev': error['severity'],
        'errscp': errorScope,
        'trgt': target,
        'dsc': dsc
    };

    if (extraParams){
        //merge the params in extraParams into errorParams
        for (var p in extraParams) {
            errorParams[p]=extraParams[p];
        }
    }
    // Create params string
    var str = this._combineObjectToString(errorParams);
    /* send error report */
    this._createReport('trg', str, errorCommon);
};

WixBILogger.prototype._collectAndMapExtraParams = function(params){
    var ret={};
    var validTypes=['p1','p2','p3','p4'];
    var typesToMap=['i1','i2','c1','c2','g1','g2'];

    //this is the tricky part of mapping the old type of params to the new ones (i1,i2,c1 to p1-p4). no more than 4
    //note that if anyone calls us with both types of params, we'll override them with the new valid ones
    var pIndex=1;
    var pMax=4;
    for(var i=0; i<typesToMap.length && pIndex<=pMax; i++){
        if (params.hasOwnProperty(typesToMap[i])){
            ret['p'+pIndex]=params[typesToMap[i]];
            pIndex++;
        }
    };
    //this is the easy part. if there's any of p1-p4, just copy them
    for(var i=0; i<validTypes.length; i++){
        if (params.hasOwnProperty(validTypes[i])){
            ret[validTypes[i]]=params[validTypes[i]];
        }
    };

    if (typeof ret != 'object' || Object.keys(ret).length===0) {
        return null;
    }
    return ret;
};

/**
 * Send event to google analytics
 * @param event
 * @param params
 */
WixBILogger.prototype.sendEvent = function(event, params) {
    //if the query string has "automation=true" as a parameter, then we filter the bi sent, so that their listener isn't bombarded with useless stuff
    if(this.isInAutomationMode()) {
        if (!this.leaveOnlyTimingEvents(event)) return;
        try {
            throw('>>>>>>>>EVENT ' + event.biEventId + ': ' + event.desc);
        }
        catch(e) {}
    }

    var eventUrlParams = this.generateEventString(event, params);
    var adapter = event.biAdapter ? event.biAdapter : 'mee';
    /* send funnel report */
    var eventCommon = this._common;
    if (typeof params == "object" && params.hasOwnProperty("src")) {
        eventCommon = Object.clone(this._common);
        eventCommon.src = params.src;
    }
    this._createReport(adapter, eventUrlParams, eventCommon);
};



WixBILogger.prototype.sendEventWithCustomParams= function(event, params, customParams) {
    //if the query string has "automation=true" as a parameter, then we filter the bi sent, so that their listener isn't bombarded with useless stuff
    if(this.isInAutomationMode()) {
        if (!this.leaveOnlyTimingEvents(event)) return;
        try {
            throw('>>>>>>>>EVENT ' + event.biEventId + ': ' + event.desc);
        }
        catch(e) {}
    }

    var eventUrlParams = this.generateEventString(event, params);

    if (eventUrlParams.slice(-1) !== '&') {
        eventUrlParams += '&';
    }
    if (customParams) {
        var queryParams = [];

        _.each(customParams, function (val, key) {
            queryParams.push(key + "=" + val);
        });

        eventUrlParams += queryParams.join("&");
    }
    var adapter = event.biAdapter ? event.biAdapter : 'mee';
    /* send funnel report */
    var eventCommon = this._common;
    if (typeof params == "object" && params.hasOwnProperty("src")) {
        eventCommon = Object.clone(this._common);
        eventCommon.src = params.src;
    }
    this._createReport(adapter, eventUrlParams, eventCommon);
};


//wanted to put this in ConfigurationManager.js, but it's not loaded right away...
WixBILogger.prototype.isInAutomationMode = function() {
    return (/[?&]automation=true\b/i.test(window.location.search));
};

WixBILogger.prototype.leaveOnlyImportantErrors = function(error) {
    var l = window.wixLogLegend || {};
    if (error.severity >= l.severity.error) {
        return true;
    }
    //otherwise...
    return false;
};
WixBILogger.prototype.leaveOnlyTimingEvents = function(event) {
    var l = window.wixLogLegend || {};
    if (event.type == l.type.timing) {
        return true;
    }
    //otherwise...
    return false;
};


/**
 * Initialize new page context
 */
WixBILogger.prototype.initNewBeatPage = function() {
    this._pageNumberInSession++;
    this._beatTimestamps[this._pageNumberInSession] = this._getTimestamp();
};

/**
 * Send START/RESET event to /bt.
 * RESET event is sent when the user switched to another page when current page was still loading
 * @param {isFromReset: boolean, pageId: string, mute: boolean} params
 */
WixBILogger.prototype.sendBeatStartEvent = function(params) {
    if (params) {
        var eventType = params.isFromReset ? this._beatEventTypes.RESET : this._beatEventTypes.START;

        this.initNewBeatPage();
        this._sendBeatEvent(eventType, params.pageId, this._pageNumberInSession);
    }
};

/**
 * Send FINISH event to /bt
 * @param {pageId: string} params
 */
WixBILogger.prototype.sendBeatFinishEvent = function(params) {
    if (params) {
        var delta = this._getTimestamp() - this._beatTimestamps[this._pageNumberInSession];

        this._sendBeatEvent(this._beatEventTypes.FINISH, params.pageId, this._pageNumberInSession, delta);
    }
};

WixBILogger.prototype._sendBeatEvent = function(eventType, pageId, pageNum, delta) {
    var baseUrl = this._floggerServerURL + 'bt?';
    var queryParams = this._getBeatParams(eventType, pageId, pageNum, delta);

    this._createHit(baseUrl + this._getBeatQueryString(queryParams));
};

WixBILogger.prototype._getBeatQueryString = function(params) {
    var res = [];

    for (var i = 0; i < params.length; i += 2) {
        var key = params[i], value = params[i+1];

        if (typeof value == 'undefined' || value == null)  {
            value = '';
        }

        res.push(key + '=' + value);
    }

    return res.join('&');
};

WixBILogger.prototype._getBeatParams = function(eventType, pageId, pageNum, delta) {
    var rendererModel = window.rendererModel || {};
    var serviceTopology = window.serviceTopology || {};
    var W = window.W || {};
    var Config = W.Config || {};
    var svSession = typeof Config.getSvSession === 'function' ? Config.getSvSession() : '';
    var isPremium = typeof Config.isPremiumUser === 'function' ? Config.isPremiumUser() : '';
    var version = this._beatVersion + '|' + this._common.ver;

    delta = delta || 0;

    if (typeof isPremium == 'boolean') {
        isPremium = isPremium ? 1 : 0;
    }

    // array is used because the properties are order-sensitive
    var params = [
        'src', 29,
        'evid', 3,
        'uuid', this._common.uid,
        'sid', window.siteId,
        'msid', rendererModel.metaSiteId,
        'dc', serviceTopology.serverName,
        'pid', this._encodeURIComponent(pageId || ''),
        'vid', svSession || this._getCookie('svSession'),
        'vsi', this._common.vsi,
        'sr', this._getDesktopSize(),
        'wr', this._getWindowSize(),
        'st', this._beatSiteTypes[rendererModel.documentType] || -1,
        'isjp', null, // TODO is data json preloaded
        'isp', isPremium,
        'vuuid', this._getVisitorUuid(),
        'et', eventType,
        'ts', delta,
        'pn', pageNum,
        'v', this._encodeURIComponent(version),
        'c', this._getTimestamp(),
        'url', this._encodeURIComponent(this._trimUrl(document.location.href)),
        'ref', this._encodeURIComponent(this._trimUrl(document.referrer))
    ];

    return params;
};

WixBILogger.prototype.generateEventString = function(event, params) {
    if(!event) {return '';}
    params =  params || {};
    var loggerArr = [params.g1,params.g2,params.i1,params.i2,params.c1,params.c2];
    /* event id */
    this._common.evid = event.biEventId;
    /* event type */
    // this._common.cat = event.type;
    /*get timestamp from pageload t'ill event */
    this._common.ts = this._wixLogger.getSessionTime();
    // Create params string
    return this._combineArraysToString(this._keyArray.funnelKeys, loggerArr);
};

WixBILogger.prototype._getRelevantModelWithFallbackEmptyObject = function _getRelevantModelWithFallbackEmptyObject() {
    return window.editorModel || window.rendererModel || {};
};

WixBILogger.prototype._createReport = function(adapter, eventUrlParams, commonUrlParamsObj) {
    /* create global common string */
    var commonUrlParamsStr=
        //add fresh did and msid, always (they could change, so it's not good to keep them in the _common fromt the start)
        'did=' + window['siteId'] + '&' +
        'msid=' + this._getRelevantModelWithFallbackEmptyObject().metaSiteId + '&' +
        this._objToURLParamsStringWithFilter(commonUrlParamsObj, this._commonFieldsFiltersByAdapter[adapter]);
    this._createHit(this._floggerServerURL + adapter + '?' + commonUrlParamsStr + eventUrlParams);
};

WixBILogger.prototype._createHit = function(params){
    var img = new Image(0, 0);
    img.src = params;
    //if the query string has "log=true" or "logbi=true" as a parameter, then we also write every event/error message to the console.log (the first option also opens a popup)
    if (window.location.search.search(/[?&]log[^=]*?=true/i)!==-1) {
        console.log('>>>>LOG ' + params.replace('http://','').replace(/[&?]/g,' '));
    }
};

WixBILogger.prototype._combineArraysToString = function(arrKey, arrVal){
    var val, str = "";
    for(var i = 0; i < arrKey.length; i++){
        if(!arrVal[i] && arrVal[i] !== 0 && arrVal[i] !== false){
            val =  '';
        } else {
            val = arrVal[i];
        }
        str = str + arrKey[i] + "=" + val + "&";
    }
    return str;
};

WixBILogger.prototype._combineObjectToString = function(errParams){
    var result=[];
    for (var key in errParams) {
        result.push(key + '=' + errParams[key]);
    }
    return result.join('&');
};

WixBILogger.prototype._objToURLParamsStringWithFilter = function(obj, fieldsFilter){
    var str = "";
    for(var item in obj){
        if (!fieldsFilter || (fieldsFilter.indexOf(item) != -1)) {
            var val = (!obj[item] && obj[item] !== 0) ? '' : obj[item];
            str += item + "=" + val + "&";
        }
    }
    //we're leaving the trailing '&' since we're adding more params later
    return str;
};

WixBILogger.prototype._getDesktopSize = function() {
    var width = (window.screen && window.screen.width) || 0,
        height = (window.screen && window.screen.height) || 0;

    return width + 'x' + height;
};

WixBILogger.prototype._getWindowSize = function() {
    var width = 0, height = 0;

    if (window.innerWidth) {
        width = window.innerWidth;
        height = window.innerHeight;
    } else if (window.document) {
        if (document.documentElement && document.documentElement.clientWidth) {
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
        } else if (document.body && document.body.clientWidth) {
            width = document.body.clientWidth;
            height = document.body.clientHeight;
        }
    }

    return width + 'x' + height;
};

WixBILogger.prototype._getVisitorUuid = function() {
    var rawCookieValue = this._getCookie('_wixUIDX').split('|');

    return (rawCookieValue[1] || '').replace('null', '');
};

WixBILogger.prototype._getCookie = function(name) {
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=');

        if (cookie.length >= 2 && cookie[0].replace(/^\s+|\s+$/g, '') == name) {
            return cookie.slice(1).join('=').replace(/^\s+|\s+$/g, '');
        }
    }

    return '';
};

WixBILogger.prototype._trimUrl = function(url) {
    return url ? url.replace(/^http(s)*:\/\/(www\.)*/, '') : '';
};

WixBILogger.prototype._getTimestamp = function() {
    return typeof Date.now === 'function' ? Date.now() : (new Date()).getTime();
};

WixBILogger.prototype._encodeURIComponent = function (s) {
    // manual pipe encoding for an edge case where it's not encoded automatically in some very old browsers
    return encodeURIComponent(s || '').replace(/\|/g, '%7C');
};


/* added for BackgroundBI experiment - currently called from Editor only */

/**
 * Send custom BI event to with pass-through params
 * @param event
 * @param params
 */
WixBILogger.prototype.sendCustomEvent = function(event, params) {
    //if the query string has "automation=true" as a parameter, then we filter the bi sent, so that their listener isn't bombarded with useless stuff
    if(this.isInAutomationMode()) {
        if (!this.leaveOnlyTimingEvents(event)) return;
        try {
            throw('>>>>>>>>EVENT ' + event.biEventId + ': ' + event.desc);
        }
        catch(e) {}
    }

    var eventUrlParams = this.generateCustomEventString(event, params);
    var adapter = event.biAdapter ? event.biAdapter : 'mee';
    /* send funnel report */
    var eventCommon = this._common;
    if (typeof params == "object" && params.hasOwnProperty("src")) {
        eventCommon = Object.clone(this._common);
        eventCommon.src = params.src;
    }
    this._createReport(adapter, eventUrlParams, eventCommon);
};

/**
 * generate BI params string from arbitrary keys
 * @param event
 * @param params
 * @returns {string}
 */
WixBILogger.prototype.generateCustomEventString = function(event, params) {
    if(!event) {return '';}
    params =  params || {};
    this._common.evid = event.biEventId;
    this._common.ts = this._wixLogger.getSessionTime();
    var paramString = [];
    _.each(params, function(val, key) {
        paramString.push(encodeURI(key) + '=' + encodeURI(val))
    });
    return paramString.join('&');
};
