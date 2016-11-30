/**
 * @class bootstrap.utils.Hash
 */
define.Class('bootstrap.utils.Hash', function(classDefinition){
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.resources(['W.Utils','W.Experiments']);
    def.fields({
        // used to insure a single interval at any given time
        intervalId: 0

    });

    def.methods({
        /**
         * Manage hash changes and dispatch event for changes
         */
        initialize: function(){
            /**
             * Listen to hash change and call _onHashChange when changed
             */
            this._flags = {};
            this._storedHashObject = this.getHashObject(window.location.hash);
            if ("onhashchange" in window && !Browser.ie8){ // event supported? AND not stupid ie8 (onhashchange works VERY slow on it)
                window.onhashchange = function(){
                    this._onHashChange();
                }.bind(this);
            } else { // event not supported OR stupid ie8
                clearInterval(this.intervalId);
                this._oldHref = window.location.href;
                this.intervalId = window.setInterval(function(){
                    this._onHashChange();
                }.bind(this), 100);
            }
        },

        fireHashChangeEvent: function(forceChange){
            if (forceChange || Browser && Browser.ie8){
                this._onHashChange('force change');
            } else{
                this._onHashChange();
            }
        },

        /**
         * Gets our flags to use when handling the hash change and resets them for the next _onHashChange
         * @param forceChange
         * @private
         */
        _onHashChange: function(forceChange){

            var newHref = window.location.href;
            if(!forceChange && this._oldHref === newHref){
                return;
            }
            this._oldHref = newHref;
            this.fireEvent('browserChange', window.location.hash);
            var isChangeFromSetHash = this._flags.isChangeFromSetHash;
            var isSilentChange = this._flags.silent;
            this._resetHashChangeFlags();
            this._handleHashChange(forceChange, isChangeFromSetHash, isSilentChange);
        },

        /**
         * sets all enumerable non-prototype properties of this._flags object to false
         * @private
         */
        _resetHashChangeFlags: function(){
            for(var flag in this._flags){
                if(Object.hasOwnProperty.call(this._flags, flag) && Object.propertyIsEnumerable.call(this._flags, flag)){
                    this._flags[flag] = false;
                }
            }
        },

        /**
         * sets specific flag(s) in this._flags.  For example: this._setHashChangeFlags({silent: true});
         * @param flags
         * @private
         */
        _setHashChangeFlags: function(flags){
            for(var flag in flags){
                if(Object.hasOwnProperty.call(flags, flag) && Object.propertyIsEnumerable.call(flags, flag)){
                    this._flags[flag] = flags[flag];
                }
            }
        },

        _handleHashChange: function(forceChange, isChangeFromSetHash, isSilentChange){
            var newHashObject = this.getHashObject(),
                idChanged = this._storedHashObject.id !== newHashObject.id,
                isExtDataChanged = this._storedHashObject.extData !== newHashObject.extData;

            //TODO: find out scenario and refactor this...
            if (forceChange === 'force change'){
                idChanged = true;
                isExtDataChanged = !!newHashObject.extData;
            }


            if(!isChangeFromSetHash && !newHashObject.extData && newHashObject.id === this._getHomePageId()){
                this._replaceHistoryState(newHashObject);
            }


            if (idChanged || isExtDataChanged){
                this._storedHashObject = newHashObject;
                var event  = {
                    'isIdChanged'         : idChanged,
                    'isExtraDataChanged'  : isExtDataChanged,
                    'silent'              : !!isSilentChange,
                    'isForSureAfterChange': true,
                    'isChangeFromSetHash': false,
                    'extData' : newHashObject.extData,
                    'newHash' : newHashObject.id
                };
                this.fireEvent('change', event);
            }
        },

        /**
         * Get Hash
         *
         * Example for hash format: "#!My Sample Page|0a4"
         * "#!" - hash prefix
         * "My Sample Page"  - page title (to be ignored)
         * "|" pipeline
         * "0a4" - page id (base 36 encoded number) or component id
         */
        getHash: function(){
            var hash = window.location.hash;
            hash = unescape(hash);
            var hashParts = this.getHashParts(hash);
            return hashParts.id;
        },

        /**
         * getHashObject
         * This is a preliminary part of a refactor.
         * @param [hashString]
         * @returns {{id: (string|*), title: string, extData: string}}
         */
        getHashObject: function(hashString){
            hashString = hashString|| window.location.hash;
            return this.getHashParts(hashString);
        },

        /**
         * Take a given hash (or gets it from window if none is supplied) and returns it in a broken down 'hash object' format
         * @param {string} hash
         * @returns {{id: (string|*), title: string, extData: string}}
         * @private
         * @deprecated Use getHashObject(hashString) instead
         */
        getHashParts: function(hash){
            hash = hash || window.location.hash;
            var _pipeline = '|', _slash = '/', _extData_slash = '/',   // _slash for third party application data
                viewerObjectId = hash, // viewer object id
                title = '',            // page title
                extData = '';             // third party application data

            //remove "#!" prefix
            if ((hash.length > 1) && hash.substr(0, 2) == "#!"){
                viewerObjectId = hash.substr(2);  // support "#!" hash prefix
            } else if (hash.charAt(0) == '#'){
                // if no "#!" prefix, remove "#" prefix for backward compatibility
                viewerObjectId = hash.substr(1);
            }

            var _firstSlashPos = viewerObjectId.indexOf(_slash), _firstPipelinePos = viewerObjectId.indexOf(_pipeline), _idTitleDelimiter = _slash;

            if ((_firstPipelinePos != -1) && (_firstPipelinePos < _firstSlashPos) || (_firstPipelinePos > -1) && (_firstSlashPos == -1)){
                // there is a pipeline and it appears before the first slash, meaning it is not part of application data
                // or there is a pipeline, but no slash - this means this is the old format
                _idTitleDelimiter = _pipeline;
            }

            // split page title and page id by the _slash. if _slash is not present, try old _slash
            var _delimiterPos = viewerObjectId.indexOf(_idTitleDelimiter);
            if (_delimiterPos > -1){
                title = viewerObjectId.substr(0, _delimiterPos);
                viewerObjectId = viewerObjectId.substr(_delimiterPos + 1);
            }

            // split third party application data
            _delimiterPos = viewerObjectId.indexOf(_extData_slash);
            if (_delimiterPos > -1){
                extData = viewerObjectId.substr(_delimiterPos + 1);
                viewerObjectId = viewerObjectId.substr(0, _delimiterPos);
            }

            return {
                "id"     : viewerObjectId ? viewerObjectId : '',
                "title"  : title ? title : '',
                "extData": extData ? extData : ''
            };

        },

        /**
         * See getHashPartsString. This is a preliminary part of a refactor.
         * @param hashObject
         * @returns {string}
         */
        getHashStringFromObject: function(hashObject){
            return this.getHashPartsString(hashObject.id, hashObject.title, hashObject.extData);
        },

        /**
         * returns the actual string that would be represented by a hash object
         * @param {string} objectId - page or other object id in the hash
         * @param {string} title - object/page title from hash
         * @param {string} extData - extra data for
         * @returns {string}
         * @private
         * @deprecated
         */
        getHashPartsString: function(objectId, title, extData){
            var _slash = '/';
            var fullHash = '';
            if (title){
                fullHash = title.replace(/([^\s\w\d_-])/g, '').replace(/\s+/g, '-');
            }
            fullHash += _slash + objectId;
            if (extData){
                fullHash += _slash + extData;
            }
            return fullHash;
        },


        /**
         *
         * @param hashObject
         * @returns {string} normalized hash string
         * @private
         */
        _getNormalizedHashStringFromObject: function(hashObject){
            var isHomePage = hashObject.id === this._getHomePageId();

            if(!isHomePage || hashObject.extData){
                return this.getHashStringFromObject(hashObject);
            } else{
                return '';
            }
        },

        /**
         *
         * @param objectId
         * @param title
         * @param extData
         * @param homePageId
         * @returns {string}
         * @private
         */
        _getNormalizedHashString: function(objectId, title, extData, homePageId) {
            var isHomePage = objectId === homePageId;
            return isHomePage && !extData ?
                '' :
                '!' + this.getHashPartsString(objectId, title, extData);
        },


        replaceState: function(hashObject){
            this._replaceHistoryState(hashObject);
        },

        _replaceHistoryState: function(hashObject){
            if(!this._isHistoryApiAvailable()){
                return;
            }
            var urlpart = this._getNormalizedHashStringFromObject(hashObject);
            if(urlpart){
                urlpart = '#!' + urlpart;
            }
            history.replaceState({}, hashObject.title, window.location.pathname + window.location.search + urlpart);
        },

        /**
         * setHash - soon to be deprecated. Kept here for legacy until merge, which will be as soon as the new version is deemed stable.
         * @param {string} objectId
         * @param {string} title
         * @param {string} extData
         * @param {boolean} silentChangeEvent
         */
        setHash: function(objectId, title, extData, silentChangeEvent){
            title = title || "untitled";

            var homePageId = this._getHomePageId();

            var newHash = this._getNormalizedHashString(objectId, title, extData, homePageId);

            // remove leading '#' if it exists
            var currentHash = window.location.hash.replace(/^[#]/, '');

            if (newHash === currentHash) {
                return;
            }

            var idChanged = this._storedHashObject.id !== objectId;
            var extDataChanged = this._storedHashObject.extData !== extData;

            this._setHashChangeFlags({silent: !!silentChangeEvent});
            /*We cannot call _onHashChange at this state because IE will go nuts. */
            this.fireEvent('change', {
                newHash               : objectId,
                'isForSureAfterChange': false,
                'extData'             : extData,
                'isExtraDataChanged'  : extDataChanged,
                'isIdChanged'         : idChanged,
                'silent'              : !!silentChangeEvent
            });

            _.defer(function(someHash) {
                this._setHashChangeFlags({isChangeFromSetHash: true});
                window.location.hash = someHash;
                // remove empty hash '#' if history API is available
                if (someHash === '' && this._isHistoryApiAvailable()) {
                    history.replaceState({}, document.title, window.location.pathname + window.location.search);
                }
            }.bind(this), newHash);
        },

        /**
         *
         * @returns {?string} homepageId (or null if viewer isn't ready)
         * @private
         */
        _getHomePageId: function(){
            if(W && W.Viewer){
                return W.Viewer.getHomePageId();
            }
            return null;
        },

        _isHistoryApiAvailable: function() {
            return Modernizr.history;
        }
    });

});
