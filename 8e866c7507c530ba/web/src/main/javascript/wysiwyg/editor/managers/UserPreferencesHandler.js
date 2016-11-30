define.Class('wysiwyg.editor.managers.UserPreferencesHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.utilize(['core.managers.serverfacade.RESTClient']);
    def.resources(['W.Config', 'W.Commands', 'W.Preview']);
    def.binds(['_onSuccessfulLoad', '_onSuccessfulGlobalLoad', '_onUnsuccessfulGlobalLoad', '_handleLoadFailed','_reportServerError', '_resolveAllDeferredRequests']);

    //API: http://kb.wixpress.com/display/UserPreferences/User+Preferences+API
    def.methods({
        initialize: function(args) {
            args = args || {};
            this._restClient = new this.imports.RESTClient();
            this._deferredRequests = {};
            this._deferredRequestsByKey = {};
            this._deferredRequestsForGlobal = {};
            this._nameSpace = args.nameSpace || 'htmlEditor';
            this._baseUrl = 'http://' + window.location.host + '/_api/wix-user-preferences-webapp/';
            this._userPrefData = {};
            this._setPreferencesMetaData(this._userPrefData);
            this._registerCommands();
        },

        /**
         * Sets the userPrefs metadata to an object, so that it can be sent to the server later
         * @param prefDataObj
         * @private
         */
        _setPreferencesMetaData: function(prefDataObj){
            var siteHeader = this.resources.W.Config.getEditorModelProperty("siteHeader"),
                siteId = siteHeader.id;

            prefDataObj.data = prefDataObj.data || {};
            prefDataObj.nameSpace = prefDataObj.nameSpace || this._nameSpace;
            prefDataObj.siteId = prefDataObj.siteId || siteId;
        },

        /**
         * Sets the userPrefs metadata to an object, so that it can be sent to the server later
         * @param {string} key
         * @param {object} data
         * @private
         */
        _createSinglePrefDataObject: function(key, data){
            var prefDataObj = {
                'key': key,
                'nameSpace': this._nameSpace
            };
            if(typeof data.TTLInDays !== 'undefined'){
                prefDataObj.TTLInDays = data.TTLInDays;
                delete data.TTLInDays;
            }

            prefDataObj.blob = data;

            return prefDataObj;
        },

        /**
         * returns a pref data object with the 'dirty' data that was edited this session
         * @returns {{}}
         * @private
         */
        _createSitePrefDataObject: function(){
            var postData = {};
            this._setPreferencesMetaData(postData);
            this._appendDirtyDataToObj(postData);
            return postData;
        },

        /**
         *
         * @param postData
         * @private
         */
        _appendDirtyDataToObj: function(postData){
            _.forOwn(this._userPrefData.data,function(val, key){
                if(val.isDirty){
                    delete val.isDirty;
                    postData.data[key] = val;
                }
            });
        },

        /**
         * @private
         * @desc Registers all the command listeners for the UserPreferencesHandler
         */
        _registerCommands: function _registerCommands(){
            var cmdmgr = this.resources.W.Commands;

            cmdmgr.registerCommandAndListener("WEditorCommands.AfterSaveSuccess", this, this._onSuccessfulSave);
            cmdmgr.registerCommandAndListener('WEditorCommands.NoRedirectFirstSave', this, this._onSuccessfulSave);
            cmdmgr.registerCommandAndListener("WEditorCommands.BeforeDeletePage", this, this._onDeletePage);
            cmdmgr.registerCommandAndListener("WEditCommands.AfterDuplicatePage", this, this._onAfterDuplicatePage);
            this._beforeSaveUserPrefs = cmdmgr.registerCommandAndListener("WEditorCommands.BeforeSaveUserPrefs");
        },

        /**
         * @param pageData - the data sent by the BeforeDeletePage command, regarding the page to be deleted
         * @private
         * @desc when a page is deleted, the preferences for that page are removed from the UserPreferencesHandler data
         */
        _onDeletePage: function(pageData){
            var pageId = pageData.get('id');
            this.setData({key: pageId}, {}); //should find out from server how to delete a key completely
        },

        /**
         * @param eventData - in this format: {oldPageId: page1, newPageId: page2}
         * @private
         */
        _onAfterDuplicatePage: function(eventData){
            this._duplicatePagePrefs(eventData.oldPageId, eventData.newPageId);
        },


        /**
         * @private
         */
        _onSuccessfulSave: function(){
            this._setPreferencesMetaData(this._userPrefData);
            this._beforeSaveUserPrefs.execute();
            this._saveAllUserPrefs();
        },

        _handleLoadFailed: function(responseDesc, responseCode){
            this._setPrefData({});
            if(responseCode || responseDesc){
                this._reportServerError(responseCode, responseDesc);
            }
        },

        /**
         * @param data - All of the user preferences data returned by the server. We hold the data in the same format as the server.
         * @private
         */
        _onSuccessfulLoad: function (data){
            this._setPrefData(data);
        },

        /**
         * @param data - All of the 'global' (non site-specific) user preferences data returned by the server.
         * @private
         */
        _onSuccessfulGlobalLoad: function (data){
            this._userPrefData.global_preferences = data.global_preferences || {}; //the server returns it as a key:value even though the request contains the key...
        },

        /**
         * we just want to make sure our 'global_preferences' exists internally, regardless of success/failure
         * @private
         */
        _onUnsuccessfulGlobalLoad: function(){
            this._userPrefData.global_preferences = {};
        },

        /**
         * @param data
         * @desc sets the internal data of the UserPreferencesHandler
         */
        _setPrefData: function(data){
            this._userPrefData.data = data;
        },

        /**
         *
         * @param originId
         * @param targetId
         * @private
         * @desc duplicates all preferences for a given page id to another
         */
        _duplicatePagePrefs: function(originId, targetId){
            this.setData({key: targetId}, _.cloneDeep(this._userPrefData.data[originId]));
        },

        /**
         * @param {object} [optionalOverrideCallbacks] {onSuccess,onError,onComplete}
         * @private
         * @desc retrieves all user preferences for this site from the server
         * @returns {promise} a promise that all preferences will have completed loading from the server
         */
        _loadAllUserPrefs: function(optionalOverrideCallbacks){
            return Q.all([
                this._loadUserPrefsForSite(optionalOverrideCallbacks),
                this._loadGlobalUserPrefs(optionalOverrideCallbacks)
            ]);
        },

        _loadUserPrefsForSite: function(optionalOverrideCallbacks){
            var reqUrl = this._baseUrl + 'getVolatilePrefsForSite/' + this._userPrefData.nameSpace + '/' + this._userPrefData.siteId;
            var callbacks = this._createRequestCallbacks(this._onSuccessfulLoad, this._handleLoadFailed, optionalOverrideCallbacks);
            return this._createPrefGetRequest(reqUrl, callbacks);
        },


        _loadGlobalUserPrefs: function(optionalOverrideCallbacks){
            var reqUrl = this._baseUrl + 'getVolatilePrefForKey/' + this._nameSpace + '/global_preferences';
            var callbacks = this._createRequestCallbacks(this._onSuccessfulGlobalLoad, this._onUnsuccessfulGlobalLoad, optionalOverrideCallbacks);
            return this._createPrefGetRequest(reqUrl, callbacks);
        },

        /**
         * creates a callback object, using the override callback if supplied
         * @param onSuccess
         * @param onError
         * @param {object} [optionalOverrideCallbacks]
         * @returns {{onSuccess: *, onError: *}}
         * @private
         */
        _createRequestCallbacks: function(onSuccess, onError, optionalOverrideCallbacks){
            optionalOverrideCallbacks = optionalOverrideCallbacks || {};
            return {
                "onSuccess": optionalOverrideCallbacks.onSuccess || onSuccess,
                "onError": optionalOverrideCallbacks.onError || onError,
                "onComplete": optionalOverrideCallbacks.onComplete || function(){}
            };
        },


        /**
         * binds the callbacks to this creates a get request,
         * @param url
         * @param callbacks
         * @returns {promise} a promise that the request will be completed (either success or failure)
         * @private
         */
        _createPrefGetRequest: function(url, callbacks){
            var that = this,
                deferred = Q.defer(),
                originalOnComplete = callbacks.onComplete || function(){};

            callbacks.onComplete = function(){
                originalOnComplete.apply(that, arguments);
                deferred.resolve(); //we don't care about failure
            };

            this._restClient.get(url, null, callbacks);
            return deferred.promise;
        },

        /**
         * @param {object} [optionalOverrideCallbacks] {onSuccess, onError, onComplete}
         * @private
         * @desc saves all user preferences (both site and global prefs) to the server
         */
        _saveAllUserPrefs: function(optionalOverrideCallbacks){
            this._saveUserPrefsForSite(optionalOverrideCallbacks);
            this._saveGlobalUserPrefs(optionalOverrideCallbacks);
        },

        /**
         * @param {object} [optionalOverrideCallbacks] {onSuccess, onError, onComplete}
         * @private
         * @desc saves all user preferences for this site to the server
         */
        _saveUserPrefsForSite: function(optionalOverrideCallbacks){
            var reqUrl = this._baseUrl + 'bulkSet',
                callbacks = {
                    "onSuccess": function(){},
                    "onError": this._reportServerError
                };

            if(optionalOverrideCallbacks){
                _.merge(callbacks,optionalOverrideCallbacks);
            }

            var postData = this._createSitePrefDataObject();

            if(_.isEmpty(postData.data)){ //if there were no dirty prefs during this session
                return;
            }

            this._restClient.post(reqUrl, postData, callbacks);
        },

        /**
         * @param {object} [optionalOverrideCallbacks] {onSuccess, onError, onComplete}
         * @private
         * @desc saves global user preferences that the user changed during this session
         */
        _saveGlobalUserPrefs: function(optionalOverrideCallbacks){
            if(!this._userPrefData.global_preferences.isDirty){
                return;
            }
            delete this._userPrefData.global_preferences.isDirty;

            var reqUrl = this._baseUrl + 'set',
                callbacks = {
                    "onSuccess": function(){},
                    "onError": this._reportServerError
                };

            if(optionalOverrideCallbacks){
                _.merge(callbacks,optionalOverrideCallbacks);
            }

            var postData = this._createSinglePrefDataObject("global_preferences", this._userPrefData.global_preferences);

            this._restClient.post(reqUrl, postData, callbacks);
        },

        /**
         *
         * @param {string} key
         * @returns {object} the data associated with the given key. If one doesn't exist, then it creates an empty object and then returns it.
         * @private
         */
        _validateAndGetDataForKey: function(key){
            this._userPrefData.data[key] = this._userPrefData.data[key] || {};
            return this._userPrefData.data[key];
        },

        /**
         * @param {object} deferredRequest object which holds the actual deferred request in it: {key,dataPath,deferred}
         * @private
         * @desc resolves the deferred request if isDataReady is true, otherwise the deferred request will remain outstanding
         */
        _resolveDeferredRequest: function (deferredRequest) {

            deferredRequest = deferredRequest || {};

            var key = deferredRequest.key,
                dataPath = deferredRequest.dataPath,
                deferred = deferredRequest.deferred;

            var pageData = this._validateAndGetDataForKey(key),
                outputData;

            if(dataPath){
                outputData = _.inner(pageData,dataPath); //_.inner will create an empty inner object if needed. note that this is a mixin created in lodash-settings
            }
            else{
                outputData = pageData;
            }

            if (this.isDataReady()) { //if data is ready, resolve immediately, otherwise this will be resolved when we get a response from the server
                deferred.resolve(outputData);
                this._removeResolvedRequest(deferredRequest);
            }
        },

        _resolveDeferredRequestForGlobal: function(deferred, key){
            deferred.resolve(this._userPrefData.global_preferences[key] || {});
            delete this._deferredRequestsForGlobal[key];
        },

        /**
         * @private
         * @desc resolves all outstanding deferred requests for pref data. This is called when we get the data from the server.
         */
        _resolveAllDeferredRequests: function () {
            this._isDataReady = true;
            _.forOwn(this._deferredRequests, this._resolveDeferredRequest, this);
            _.forOwn(this._deferredRequestsByKey, this._resolveDeferredRequest, this);
            _.forOwn(this._deferredRequestsForGlobal, this._resolveDeferredRequestForGlobal, this);
        },

        /**
         * @desc used to clear a deferred request when we don't want it and just want the client to ignore the result.
         *      The request will be resolved with an empty object.
         * @param deferredRequest
         * @private
         */
        _clearDeferredRequest: function (deferredRequest) {
            var deferred = deferredRequest.deferred,
                outputData = {};

            deferred.resolve(outputData);
            this._removeResolvedRequest(deferredRequest);
        },

        _removeResolvedRequest: function(deferredRequest){
            var dataPath = deferredRequest.dataPath,
                key = deferredRequest.key;
            if(dataPath){
                delete this._deferredRequests[dataPath];
            }else{
                delete this._deferredRequestsByKey[key];
            }

        },

        /**  getData("rulers.desktop.h").then(function(data){})
         *
         * @param {String|object} dataPath - If it's a string: a path to the data in the object in the current pageId's data, i.e. obj.pageId.locked.compid, so path is 'locked.compid'.
         *                                   If it's an object- then it's the same format as the options object, allowing for complete control of a unique key. For example, getData({key: 'template'}) will get all data saved under the template key
         * @param {object} [options] - an object with optional params.  Currently supported params:
         *                                                                      { key: 'string' }  //key is normally the pageId when overriding
         *
         * @returns {function} promise
         */
        getData: function (dataPath, options) {
            if(!this._dataRequested){
                this._dataRequested = true;
                this._loadAllUserPrefs()
                    .done(this._resolveAllDeferredRequests);
            }
            if(typeof dataPath === 'object' && dataPath.key !== undefined){
                return this._getDataByKey(dataPath.key);
            }else if(typeof dataPath === 'string'){
                return this._getDataByPath(dataPath, options);
            }

        },

        _getDataByPath: function(dataPath, options){
            options = options || {};
            var key = options.key || this.resources.W.Preview.getPreviewCurrentPageId();

            var deferred = Q.defer(),
                deferredRequest = {
                    key: key,
                    dataPath: dataPath,
                    deferred: deferred
                };

            //if we already have a deferred request for data with this path, then we clear it and only return the new one
            //this is because the data is per page, per path, so there can only be one unique path per page - and you can only be on one page at a time
            //in other words - the previous request is now irrelevant
            if(this._deferredRequests[dataPath]){
                this._clearDeferredRequest(this._deferredRequests[dataPath]);
            }

            this._deferredRequests[dataPath] = deferredRequest;
            this._resolveDeferredRequest(deferredRequest);

            return deferred.promise;
        },

        _getDataByKey: function(key){

            var deferred = Q.defer(),
                deferredRequest = {
                    key: key,
                    deferred: deferred
                };

            if(this._deferredRequestsByKey[key]){
                this._clearDeferredRequest(this._deferredRequestsByKey[key]);
            }

            this._deferredRequestsByKey[key] = deferredRequest;
            this._resolveDeferredRequest(deferredRequest);

            return deferred.promise;

        },

        /**
         *
         * @param {string} key
         * @param {object} data
         * @param {object} [options]
         * @param {boolean} [options.saveNow]
         * @param {number} [options.TTLInDays]
         */
        setGlobalData: function(key, data, options){
            this._userPrefData.global_preferences[key] = data;
            this._userPrefData.global_preferences.isDirty = true;
            if(typeof options.TTLInDays !== 'undefined'){
                this._userPrefData.global_preferences.TTLInDays = options.TTLInDays;
            }
            if(options.saveNow){
                this._saveGlobalUserPrefs();
            }
        },

        /**
         *
         * @param {string} key
         * @returns {promise} a promise that the data will have been returned from the server, and will be available (if it exists)
         */
        getGlobalData: function(key){
            if(this._isDataReady){
                this._userPrefData.global_preferences[key] = this._userPrefData.global_preferences[key] || {};
                return Q(this._userPrefData.global_preferences[key]);
            }
            var deferred = Q.defer();
            this._deferredRequestsForGlobal[key] = deferred;
            return deferred.promise;
        },

        /** setData('rulers',data,{key:'masterPage'});
         *
         * @param {object|string} dataPath - If object: {key: 'someUniqueKey'} - if want to set a unique key for a feature, unrelated to which page you're on.
         *                                   If string: a path to the data, i.e. 'locked.theCompId' will set the data for the compId for the 'locked' feature within this current page
         * @param data - the data to save
         * @param {object} [options] - an object with optional params.
         *                              Currently supported params: { key: 'string'} // should be the pageId
         *
         */

        setData: function (dataPath, data, options) {
            if(typeof dataPath === 'object' && dataPath.key !== undefined){
                return this._setDataByKey(dataPath.key, data);
            } else if(typeof dataPath === 'string'){
                return this._setDataByPath(dataPath, data, options);
            } else{
                throw new Error('UserPrefs: dataPath can only accept an object with a key param, or a string.');
            }
        },

        _setDataByPath: function(dataPath, data, options){
            options = options || {};
            var key = options.key || this.resources.W.Preview.getPreviewCurrentPageId();

            var dataPathParts = dataPath.split('.');

            this._userPrefData.data[key] = this._userPrefData.data[key] || {};
            this._userPrefData.data[key].isDirty = true;

            var previous = this._userPrefData.data,
                dataKey = key,
                current = previous[dataKey];

            for(var i=0; i<dataPathParts.length; i++){
                if(!current){
                    previous[dataKey] = {};
                    current = previous[dataKey];
                }
                dataKey = dataPathParts[i];
                previous = current;
                current = current[dataKey];
            }
            previous[dataKey] = data;
        },

        _setDataByKey: function(key, data){
            if(typeof data === 'undefined'){
                return;
            }
            this._userPrefData.data[key] = data;
            this._userPrefData.data[key].isDirty = true;
        },

        _reportServerError: function(responseDesc, responseCode){

            var className = "UserPreferencesHandler";
            var methodName = "_reportServerError";
            var params = {src: responseCode, desc: responseDesc};

            if(responseCode === 404 || responseCode === 3001){
                return; //right now, we don't care if we reach 404 or 3001
            } else if(responseCode === 413){
                LOG.reportError(wixErrors.USER_PREF_ENTITY_TOO_LARGE,className,methodName,params);
            }else if(responseCode === 500){
                LOG.reportError(wixErrors.USER_PREF_BAD_REQUEST,className,methodName,params);
            }else{
                LOG.reportError(wixErrors.USER_PREF_UNKNOWN_ERROR,className,methodName,params);
            }
        },

        isDataReady: function (){
            return this._isDataReady;
        }
    });
});


