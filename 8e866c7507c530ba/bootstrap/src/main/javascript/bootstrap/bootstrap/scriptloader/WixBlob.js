define.bootstrapClass('bootstrap.bootstrap.scriptloader.WixBlob', function () {
    "use strict";

    var urlParser = document.createElement('a');
    var documentHead = document.getElementsByTagName('head')[0];

    function arrayChunk(array, numOfSlices) {
        var n = Math.ceil(array.length / numOfSlices);
        if (!array.length) {
            return [];
        }
        return [ array.slice(0, n) ].concat(arrayChunk(array.slice(n), numOfSlices - 1));
    }

    function doNothing() {
    }

    function Request(url, onLoad, onFail) {
        this.url = url;
        this.onLoad = onLoad || doNothing;
        this.onFail = onFail || doNothing;
        this.responseId = null;
        if (!url) {
            //TODO: maybe call with some args
            onFail();
        }
    }

    function BlobGroup(base, files, ns){
        this.base = base;
        this.files = files;
        this.ns = ns || 'loaded';
        this.requestStartTime = Date.now();
        this.requestEndTime = null;
        this.elapse = null;
    }
    BlobGroup.prototype.getFilesResourceId = function () {
        return this.files.map(function (name) {
            return this.ns + '.' + this.base + name;
        },this);
    };


    function WixBlob() {
    }

    WixBlob.extendPrototype({
        init: function (blobUrl, supportedServers, sep, hashMethod) {
            var _this = this;
            this.requested = [];
            this._requestsBuffer = [];
            this.throttleTimeout = 60;
            this.maxUrlLength = 1024;
            this.sep = sep || 3;
            this.hashMethod = hashMethod;
            this.blobUrl = blobUrl || '//static.wixstatic.com/wix_blob';
            this._clearBuffer();
            supportedServers = supportedServers || [];
            this._supportedServers = supportedServers.map(function(path){
                return path[path.length-1] === '/' ? path.substr(0,path.length-1) : path;
            });

            resource.getResources(['topology', 'scriptLoader'], function (res) {
                _this._topology = res.topology;
                _this._scriptLoader = res.scriptLoader;
                _this._throttle();
            });
            return this;
        },
        _getGzipQueryValue : function(){
            return "&zip=1";
        },

        addRequest: function (url, onLoad, onFail) {
            url = url.split('?').shift();
            this._requestsBuffer.push(new Request(url, onLoad, onFail));
            this._throttle();
        },
        cancel: function () {
            clearTimeout(this._throttle.timeoutId);
            this._throttle.timeoutId = undefined;
            this._requestsBuffer = [];
        },
        _throttle: function () {
            var self = this;
            if(this._requestsBuffer.length){
                clearTimeout(this._throttle.timeoutId);
                this._throttle.timeoutId = setTimeout(function () {
                    self._sendBlobRequest();
                }, this.throttleTimeout);
            }
        },
        _extractFiles: function (supportedServerUrl, rootPath) {
            return this._requestsBuffer
                       .filter(this._isRequestInSupportedServer.bind(this, supportedServerUrl))
                       .map(this._setResponseId.bind(this, supportedServerUrl, rootPath));
        },
        _isRequestInSupportedServer:function (artifactUrl, request) {
            return request.url.indexOf(artifactUrl) !== -1;
        },
        _setResponseId: function (supportedServerUrl, rootPath, request) {
            urlParser.href = request.url;
            //console.log('supportedServerUrl:', supportedServerUrl, 'rootPath:', rootPath, 'urlParser.href:', urlParser.href);
            var fileUrl = urlParser.href.replace(supportedServerUrl + rootPath, '');
            fileUrl = this.hashMethod ? this.hashMethod(fileUrl) : fileUrl;
            request.responseId = 'loaded.' + rootPath + fileUrl;
            return fileUrl;
        },
        _getServerRootPath: function (supportedServerUrl) {
            if (supportedServerUrl[supportedServerUrl.length - 1] !== '/') {
                supportedServerUrl += '/';
            }
            urlParser.href = supportedServerUrl;
            supportedServerUrl = urlParser.pathname;
            if(supportedServerUrl[0] !== '/'){
                supportedServerUrl = '/' + supportedServerUrl;
            }
            return supportedServerUrl;
        },
        _createGroupForServers: function (supportedServerUrl) {
            var rootPath = this._getServerRootPath(supportedServerUrl);
            var files = this._extractFiles(supportedServerUrl, rootPath);
            if (files.length) {
                return new BlobGroup(rootPath, files.sort());
            }else{
                deployStatus('blob dose not find any files for supportedServerUrl', supportedServerUrl);
            }
        },
        _buildUrl: function (group) {
            return (this.blobUrl + '?base=' + group.base + '&flist=' + group.files.join() + '&sep=' + this.sep + this._getGzipQueryValue()).replace(/\/\//g, '/').replace(/(https?):\//g, '$1://');
        },
        _createBlobGroups: function () {
            if (this._scriptLoader && this._supportedServers.length && this._requestsBuffer.length) {
                var servers = this._supportedServers;
                var groups = [];
                var i,j;
                for (i = 0; i < servers.length; i++) {
                    var group = this._createGroupForServers(servers[i]);
                    if (group) {
                        var subGroups = this._splitToSubGroups(group);
                        for (j = 0; j < subGroups.length; j++) {
                            groups.push(subGroups[j]);
                        }
                    }
                }
                return groups;
            }
        },
        _splitToFixedNumberOfSubGroups: function (group, numOfChunks) {
            var subGroupsFiles = arrayChunk(group.files, numOfChunks);
            var subGroups = subGroupsFiles.map(function (chunk) {
                return new BlobGroup(group.base, chunk);
            });
            return subGroups;
        },
        _isSubGroupsUrlIsTooLong: function (subGroup) {
            return this._buildUrl(subGroup).length > this.maxUrlLength;
        },
        _splitToSubGroups: function (group) {
            var numOfChunks = 1;

            var subGroups = this._splitToFixedNumberOfSubGroups(group, numOfChunks);
            while (subGroups.some(this._isSubGroupsUrlIsTooLong, this)) {
                numOfChunks++;
                subGroups = this._splitToFixedNumberOfSubGroups(group, numOfChunks);
            }
            return subGroups;
        },
        _handleLoadedScriptAsString:function(rawCode){
            var script = document.createElement('script');
            //IE8 fallback to script.text
            try{
                script.appendChild(document.createTextNode(rawCode));
            }catch(e){
                script.text = rawCode;
            }
            documentHead.appendChild(script);
            setTimeout(function(){
                script.parentNode && script.parentNode.removeChild(script);
            },0);

        },
        _handleGroupLoad:function(group){
            if(!this._scriptLoader){
                throw new Error('WixBlob has no scriptLoader');
            }
            var script = document.createElement('script');
            var blob = this;
            var src = blob._buildUrl(group);
            var onComplete = function (){
                group.requestEndTime = Date.now();
                group.elapse = group.requestEndTime - group.requestStartTime;
                deployStatus('blob_group_elapse', src + ' (elapse time: ' + group.elapse + ')');
                LOG.reportError(wixErrors.BLOB_TIME_REPORT, src, {elapse:group.elapse});
            };
            LOG.reportError(wixErrors.BLOB_TIME_REPORT, src, {requestStartTime:group.requestStartTime});
            this._scriptLoader.loadScript({url:src}, {
                onLoad:onComplete,
                onFailed:onComplete
            });
        },
        _clearBuffer: function () {
            this.requested.push.apply(this.requested, this._requestsBuffer);
            this._requestsBuffer = [];
        },
        _getRequested: function (fileResourceId) {
            for (var i = 0; i < this.requested.length; i++) {
                var request = this.requested[i];
                if (request.url === fileResourceId || request.responseId === fileResourceId) {
                    return request;
                }
            }
        },
        _getExtension:function(fileResourceId){
            return fileResourceId.split('?').shift().split('.').pop().toLowerCase();
        },
        _evaluateContent: function (fileResourceId, content) {
            var request = this._getRequested(fileResourceId);
            var extension = this._getExtension(fileResourceId);
            if (content.size > 0) {
                try{
                    if(extension === 'json'){
                        request.onLoad(content.code());
                    }else if(extension === 'js'){
                        var rawCode = content.code.toString();
                        rawCode = this._removeFunctionWrapper(rawCode);

                        window._onBlobParseSuccess = request.onLoad;
                        window._onBlobParseError = request.onFail;
                        rawCode = 'try{' + rawCode + '; window._onBlobParseSuccess();}catch(err){ LOG.reportError(wixErrors.BLOB_TIME_REPORT, "'+fileResourceId+'", {message: "blob failed to eval: ' + fileResourceId + '" + " " + err}); window._onBlobParseError();}';
                        this._handleLoadedScriptAsString(rawCode.toString());
                    }
                }catch(err){
                    LOG.reportError(wixErrors.BLOB_TIME_REPORT, fileResourceId, {message: 'Eval Error'});
                    request.onFail(err);
                }
            }else{
                LOG.reportError(wixErrors.BLOB_TIME_REPORT, fileResourceId, {message: 'content loaded with no size'});
            }
        },
        _removeFunctionWrapper: function(rawCode) {
            rawCode = rawCode.replace(/\s*function\s*\(\s*\)\s*\{/, '');
            return rawCode.substr(0, rawCode.length - 1);
        },
        _attachLoadHandler: function (group) {
            group.getFilesResourceId().forEach(function (fileResourceId) {
                deployStatus('blob_handler', fileResourceId);
                resource.getResourceValue(fileResourceId, this._evaluateContent.bind(this, fileResourceId));
            }, this);
        },
        _sendBlobRequest: function () {
            var groups = this._createBlobGroups();
            if (groups) {
                this._clearBuffer();
                groups.forEach(this._attachLoadHandler, this);
                groups.forEach(this._handleGroupLoad, this);
            }
        }
    });

    return WixBlob;

});


