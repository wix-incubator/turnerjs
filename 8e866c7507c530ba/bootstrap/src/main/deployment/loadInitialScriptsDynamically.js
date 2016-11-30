(function() {
    'use strict';

    var utils = (function() {
        var utils = {};

        utils.getArgumentNames = function(fn) {
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var FN_ARG_SPLIT = /,/;
            var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
            var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

            var result = [];
            var functionText = fn.toString().replace(STRIP_COMMENTS, '');
            var argumentsDeclaration = functionText.match(FN_ARGS)[1].split(FN_ARG_SPLIT);

            var replaceFunc = function(all, underscore, name) {
                result.push(name);
            };

            for(var i=0; i<argumentsDeclaration.length; i++) {
                argumentsDeclaration[i].replace(FN_ARG, replaceFunc);
            }

            return result;
        };

        utils.getArgumentsObject = function(fn, argumentValues) {
            var result = {};

            var names = utils.getArgumentNames(fn);

            for(var i=0; i<names.length; i++) {
                result[names[i]] = argumentValues[i];
            }

            return result;
        };

        utils.renderTemplate = function(template, model) {
            return template.replace(/\${([^}]+)}/g, function(match, token) {
                return model[token] || '';
            });
        };

        utils.createErrorCheckingCallback = function(nextCallback, successHandler) {
            nextCallback = typeof nextCallback === 'function' ? nextCallback : function() {};

            return function(err, value) {
                if (err) {
                    nextCallback(err);
                } else {
                    successHandler(value, nextCallback);
                }
            };
        };

        return utils;
    })();

    var BasicAjaxClientClass = function(dependencies) {
        dependencies = dependencies || {};
        var windowScope = dependencies.windowScope = dependencies.windowScope || {};

        /* jshint ignore:start */
        this._sendGetRequestWithXmlHttp = function(url, callback) {
            var req;

            try {
                req = new XMLHttpRequest();
            } catch (e) {}

            if (!req) {
                callback(new Error('Could not create XHR object'));
                return;
            }

            req.open('GET', url, true);
            req.onreadystatechange = function () {
                if (req.readyState != 4) {
                    return;
                }
                if (req.status != 200 && req.status != 304) {
                    callback(new Error('Error while loading "' + url + '"; HTTP error ' + req.status));
                    return;
                }
                callback(null, req.responseText);
                return;
            };
            if (req.readyState == 4) {
                return;
            }
            req.send();
        };
        /* jshint ignore:end */

        this._sendGetRequestWithXdr = function(url, callback) {
            var req = new windowScope.XDomainRequest();
            req.onload = function() {
                callback(null, req.responseText);
            };
            req.onerror = function() {
                callback(new Error('Error while loading "' + url + '" with XDR; See console messages for details'));
            };
            req.ontimeout = function() {
                callback(new Error('Timeout error while loading "' + url + '" with XDR'));
            };
            req.open('get', url);
            req.send();
        };

        this._sendGetRequestWithJsonp = function(url, callback){
            callback = typeof callback === 'function' && callback;
            var urlForJsonp = this._getUrlForJSonp(url, callback);

            var errorOnlyCallback = function(err) {
                if (err && callback) {
                    callback(err);
                }
            };

            var script = this._createScriptElement(urlForJsonp, errorOnlyCallback);
            var scriptContainer = this._getScriptContainer();
            scriptContainer.appendChild(script);
        };

        this._getScriptContainer = function() {
            var document = dependencies.document;
            var head = document.getElementsByTagName("head");
            return head ? head[0] : document.documentElement;
        };

        var normalizeScriptLoadError = function(err, src) {
            return (!err || (Event && err instanceof Event)) ?
                new Error('There was an error loading a script from ' + src + ' \n Error: ' + (err || '')) :
                err;
        };

        this._createScriptElement = function(src, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = src;

            if (typeof callback === 'function') {
                script.onload = script.onreadystatechange = function() {
                    if ( !this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                        script.onload = script.onreadystatechange = null;
                        callback(null, script);
                    }
                };

                script.onerror = function(err) {
                    err = normalizeScriptLoadError(err, src);
                    callback(err);
                };
            }

            return script;
        };

        this.loadScript = function(url, callback) {
            var head = this._getScriptContainer();

            var callbackWrapper = utils.createErrorCheckingCallback(callback, function(script, callback) {
                if (head && script.parentNode) {
                    head.removeChild(script);
                }

                callback(null, script);
            });

            var script = this._createScriptElement(url, callbackWrapper);
            head.appendChild(script);
        };

        this.loadScriptsSequentially = function(urls, callback) {
            var url = urls.shift();
            if (url) {
                var self = this;
                this.loadScript(url, utils.createErrorCheckingCallback(callback, function() {
                    self.loadScriptsSequentially(urls, callback);
                }));
            } else if (typeof callback === 'function') {
                callback();
            }
        };

        this._getUrlForJSonp = function(url, callback){
            windowScope.jsonpCallbacks = windowScope.jsonpCallbacks || {};
            var jsonpCallbackId = 'BSL' + Math.random().toString(36).substring(2,7);
            windowScope.jsonpCallbacks[jsonpCallbackId] = function (data) {
                callback(null, data);
                try {
                    delete windowScope[jsonpCallbackId];
                } catch(e) {
                    windowScope[jsonpCallbackId] = undefined; // workaround for IE8 bug: Can't delete from window
                }
            };

            return url + '?jsonp=jsonpCallbacks.' + jsonpCallbackId;
        };

        this._isStaticUrl = function(url){
            return typeof url === 'string' && url.indexOf('static.') !== -1;
        };

        var ensureObject = this._ensureObject = function(objectOrText) {
            return typeof objectOrText === 'string' ? JSON.parse(objectOrText) : objectOrText;
        };

        this._getSendFunc = function(url) {
            if (this._isStaticUrl(url)) {
                // supports jsonp
                return this._sendGetRequestWithJsonp;
            } else if ('withCredentials' in new windowScope.XMLHttpRequest()) {
                // supports cross-domain requests
                return this._sendGetRequestWithXmlHttp;
            } else if(typeof windowScope.XDomainRequest !== 'undefined'){
                // supports XDR requests (probably IE8 or IE9)
                return this._sendGetRequestWithXdr;
            }
        };

        this.loadJson = function(url, callback) {
            var wrappedCallback = utils.createErrorCheckingCallback(callback, function(json, callback) {
                json = ensureObject(json);
                callback(null, json);
            });

            var sendFunc = this._getSendFunc(url);

            if (sendFunc) {
                sendFunc.call(this, url, wrappedCallback);
            } else {
                callback(new Error('Could not determine which method to use for HTTP Get with CORS support, your browser is probably not supported'));
            }
        };
    };

    var CachedAjaxLoaderClass = function(dependencies) {
        var self = this;

        self._cachedResult = null;
        self._cachedError = null;
        self._pendingCallbacks = [];

        self._callCallbacks = function() {
            var callback;
            while ((callback = self._pendingCallbacks.shift())) {
                try {
                    callback(self._cachedError, self._cachedResult);
                } catch(e) {}
            }
        };

        self._callbackForGetRequest = function(err, text) {
            if (err) {
                self._cachedError = err;
            } else {
                try {
                    self._cachedResult = self._extractResponse(text);
                } catch(e) {
                    self._cachedError = e;
                }
            }

            self._callCallbacks();
        };

        self.load = function(callback) {
            if (self._cachedResult || self._cachedError) {
                callback(self._cachedError, self._cachedResult);
            } else {
                var length = self._pendingCallbacks.push(callback);
                if (length === 1) {
                    dependencies.ajaxClient.loadJson(
                        dependencies.url,
                        self._callbackForGetRequest
                    );
                }
            }
        };

        self._extractResponse = function(response) { return response; };
    };

    var PublishedClientArtifactVersionsLoaderClass = function(dependencies) {
        CachedAjaxLoaderClass.apply(this, arguments); // inherit

        this._extractResponse = function(response) {
            var artifacts = response;

            if (!artifacts || typeof artifacts !== 'object') {
                throw new Error('Invalid response when loading client artifact versions from url ' +
                    dependencies.url + '\n' + JSON.stringify(response, null, 4));
            }

            return artifacts;
        };
    };

    var SnapshotVersionsLoaderClass = function(dependencies) {
        CachedAjaxLoaderClass.apply(this, arguments); // inherit
    };

    var TopologyResolverClass = function(dependencies) {
        var getUrlUsingTemplate = function(templateName, urlPathPrefix, name, value) {
            var templateModel = {artifactName: name, artifactVersion: value, urlPathPrefix: urlPathPrefix};
            return utils.renderTemplate(dependencies.urlTemplates[templateName], templateModel);
        };

        var getStaticsUrl = function(urlPathPrefix, artifactName, artifactVersion) {
            return getUrlUsingTemplate('statics', urlPathPrefix, artifactName, artifactVersion);
        };

        var getLocalUrl = function(urlPathPrefix, artifactName) {
            return getUrlUsingTemplate('local', urlPathPrefix, artifactName);
        };

        var getSnapshotUrl = function(artifactName, artifactVersion) {
            return getUrlUsingTemplate('snapshot', null, artifactName, artifactVersion);
        };

        var createAsyncResolverFromSyncResolver = function(syncResolverFunc) {
            return function(name, value, callback) {
                var resolvedValue, err;
                try {
                    resolvedValue = syncResolverFunc(name, value);
                } catch(e) {
                    err = e;
                }

                callback(err, name, resolvedValue);
            };
        };

        var findArtifactInMap = function(artifactName, mapDescriptionForError, versionsMap, ignoreNotFound) {
            var artifact = versionsMap[artifactName];
            if (!artifact && !ignoreNotFound) {
                throw new Error('Could not find "' +
                    artifactName +
                    '" in ' + mapDescriptionForError + ':\n' +
                    JSON.stringify(versionsMap, null, 4));
            }

            return artifact;
        };

        var resolveUsingAjaxCall = function(loader, convertResponse, name, callback) {
            loader.load(utils.createErrorCheckingCallback(callback, function(response, callback) {
                var result, err;
                try {
                    result = convertResponse(response);
                } catch(e) {
                    err = e;
                }

                callback(err, name, result);
            }));
        };

        var resolveSnapshot = function(artifactName, ignoredValue, callback) {
            var convertResponse = function(snapshotsMap) {
                var snapshotVersion = findArtifactInMap(artifactName, 'latest client snapshots map', snapshotsMap);
                return getSnapshotUrl(artifactName, snapshotVersion);
            };

            return resolveUsingAjaxCall(
                dependencies.snapshotVersionsLoader,
                convertResponse,
                artifactName,
                callback
            );
        };

        var resolveUsingClientArtifactVersionsLoader = function(name, convertArtifactVersions, ignoreIfNotFound, callback) {
            var convertResponse = function(versionsMap) {
                var artifactVersions = findArtifactInMap(name, 'published client artifacts map', versionsMap, ignoreIfNotFound);
                return convertArtifactVersions(artifactVersions);
            };

            return resolveUsingAjaxCall(
                dependencies.clientArtifactVersionsLoader,
                convertResponse,
                name,
                callback
            );
        };

        var resolveStaticsByArtifactVersionsProperty = function(artifactName, versionPropertyName, callback) {
            var convertArtifactVersions = function(artifactVersions) {
                var version = artifactVersions[versionPropertyName];
                if (!version) {
                    throw new Error(
                        'Could not find property "' + versionPropertyName +
                        '" in client artifact "' + artifactName + '":\n' +
                        JSON.stringify(artifactVersions, null, 4)
                    );
                }

                var urlPathPrefix = artifactVersions.urlPathPrefix;

                return getStaticsUrl(urlPathPrefix, artifactName, version);
            };

            return resolveUsingClientArtifactVersionsLoader(artifactName, convertArtifactVersions, false, callback);
        };

        var resolveUsingPrefixedUrl = function(resolverFunc, artifactName, val, callback) {
            var convertArtifactVersions = function(artifactVersions) {
                var urlPathPrefix = artifactVersions && artifactVersions.urlPathPrefix;
                return resolverFunc(urlPathPrefix, artifactName, val);
            };

            resolveUsingClientArtifactVersionsLoader(artifactName, convertArtifactVersions, true, callback);
        };

        var resolveLocal = function(artifactName, val, callback) {
            return resolveUsingPrefixedUrl(getLocalUrl, artifactName, null, callback);
        };

        var resolveSpecificVersion = function(artifactName, version, callback) {
            return resolveUsingPrefixedUrl(getStaticsUrl, artifactName, version, callback);
        };

        var resolvers = [
            {
                match: /^local$/i,
                resolve: resolveLocal
            },
            {
                match: /^\d{1,4}\.\d{1,4}\.\d{1,4}$/,
                resolve: resolveSpecificVersion
            },
            {
                match: /^snapshot$/i,
                resolve: resolveSnapshot
            },
            {
                match: /^(rc)|(ga)$/i,
                resolve: resolveStaticsByArtifactVersionsProperty
            }
        ];

        this._findMatchingResolver = function(val) {
            var resolver;
            for (var i=0; i< resolvers.length; i++) {
                resolver = resolvers[i];
                if (resolver.match.test(val)) {
                    return resolver.resolve;
                }
            }
        };

        this._resolveSingleNameValue = function(artifactName, val, callback) {
            var resolverFunc = this._findMatchingResolver(val);
            if (!resolverFunc) {
                callback(null, artifactName, val);
            } else {
                resolverFunc(artifactName, val, callback);
            }
        };

        this._getKeys = function(obj) {
            var result = [];
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    result.push(property);
                }
            }
            return result;
        };

        this._expandHtmlClientArtifactNames = function(topology) {
            var val = topology['html-client'];
            if (val) {
                delete topology['html-client'];
                topology.bootstrap = topology.core = topology.web = topology.skins = val;
            }
        };

        this.resolve = function(topology, callback) {
            callback = typeof callback === 'function' && callback;

            this._expandHtmlClientArtifactNames(topology);

            var result = {};
            var hasError = false;
            var pendingArtifactNames = this._getKeys(topology);
            var pendingCount = pendingArtifactNames.length;

            if (pendingCount === 0) {
                if (callback) {
                    callback(null, topology);
                    return;
                }
            }

            function wrappedCallback(err, name, resolvedValue) {
                if (hasError) {
                    return;
                }

                if (err) {
                    hasError = true;
                    if (callback) {
                        callback(err);
                    }
                    return;
                }

                result[name] = resolvedValue;
                pendingCount--;
                if (pendingCount === 0 && callback) {
                    callback(null, result);
                }
            }

            var artifactName;
            for (var i=0; i < pendingArtifactNames.length; i++) {
                artifactName = pendingArtifactNames[i];
                this._resolveSingleNameValue(artifactName, topology[artifactName], wrappedCallback);
            }
        };
    };

    var StatemapOrTopologyLoaderClass = function(dependencies) {
        dependencies = dependencies || {};
        var windowScope = dependencies.windowScope = dependencies.windowScope || {};

        // Stolen and adapted http://stackoverflow.com/a/1099670/2481449
        this._getQueryParamsFromUrl = function(qs) {
            qs = qs || dependencies.queryString || '';
            qs = qs.replace(/^\?/, '').replace(/\++/, ' ');

            var params = {}, tokens, val, re = /[?&]?([^=&]+)(?:=([^&]*))?/g;

            while ((tokens = re.exec(qs))) {
                val = tokens[2];
                val = val === undefined ? true : decodeURIComponent(val);
                params[decodeURIComponent(tokens[1])] = val;
            }

            return params;
        };

        var queryParams = dependencies.queryParams || this._getQueryParamsFromUrl();

        this._getRunningExperiments = function(){
            var model = windowScope.editorModel || windowScope.rendererModel || {};
            return model.runningExperiments || {};
        };

        this._getStatemapFromRunningExperiments = function(){
            var runningExperiments = this._getRunningExperiments();
            var statemap = runningExperiments.htmlEditorUseGivenStatemap || runningExperiments.htmlRendererUseGivenStatemap;
            return (statemap !== "default") ? statemap : undefined;
        };

        this._getStatemapUrlFromName = function(statemapName){
            return "//static.wixstatic.com/statemap/" + statemapName.replace(/\./g, '') + ".json";
        };

        this._getStatemapParamValue = function(){
            return windowScope.statemap || queryParams.statemap || this._getStatemapFromRunningExperiments();
        };

        this._getInlineTopology = function(statemap) {
            var regex = /\s*([^:\s/]+)\s*:\s*([^,\s/]+)\s*(?:,+|$)/g;
            var match;
            var result = {};
            var hasMatch = false;

            while((match = regex.exec(statemap)) && (hasMatch || match.index === 0)) {
                hasMatch = true;
                result[match[1]] = match[2];
            }

            return hasMatch && result;
        };

        this._getTopologyUrl = function() {
            /* jshint ignore:start */
            return queryParams.topology_url;
            /* jshint ignore:end */
        };

        this._loadStatemapFromUrl = function(url, callback) {
            var fullStatemapCallback = utils.createErrorCheckingCallback(callback, function(statemap) {
                statemap = statemap || {};
                var topology = statemap.topology || {};

                var topologyCallback = utils.createErrorCheckingCallback(callback, function(resolvedTopology, callback) {
                    statemap.topology = resolvedTopology;
                    callback(null, statemap);
                });

                dependencies.topologyResolver.resolve(topology, topologyCallback);
            });

            dependencies.ajaxClient.loadJson(url, fullStatemapCallback);
        };

        this._loadTopologyFromUrl = function(url, callback) {
            var topologyCallback = utils.createErrorCheckingCallback(callback, dependencies.topologyResolver.resolve);
            dependencies.ajaxClient.loadJson(url, topologyCallback);
        };

        this.loadStatemapOrTopology = function(callback) {
            var url;
            var inlineTopology;
            var statemapParamValue;

            if ((statemapParamValue = this._getStatemapParamValue())) {
                inlineTopology = this._getInlineTopology(statemapParamValue);
                if (inlineTopology) {
                    dependencies.topologyResolver.resolve(inlineTopology, callback);
                } else {
                    url = this._getStatemapUrlFromName(statemapParamValue);
                    this._loadStatemapFromUrl(url, callback);
                }
            } else if ((url = this._getTopologyUrl())) {
                this._loadTopologyFromUrl(url, callback);
            } else {
                callback(null, {});  // empty statemap
            }
        };
    };

    var ScriptMapLoaderClass = function(dependencies) {
        dependencies = dependencies || {};

        var ajaxClient = dependencies.ajaxClient;

        this._throwArtifactNotFound = function(artifactName, errorArgs) {
            throw new Error('Location "' + artifactName + '" specified in the scriptsMap does not exist in the specified statemap, topology or the default scriptsLocationMap. arguments: ' + JSON.stringify(errorArgs, null, 4));
        };

        this._overrideScriptsMap = function(scriptsMap, defaultScriptsLocationMap, overrideScriptsLocationMap) {
            scriptsMap = scriptsMap || {};
            defaultScriptsLocationMap = defaultScriptsLocationMap || {};
            overrideScriptsLocationMap = overrideScriptsLocationMap || {};

            var scriptUrls = [];

            for(var artifactName in scriptsMap) {
                if (scriptsMap.hasOwnProperty(artifactName)) {
                    var artifactBaseUrl =
                        overrideScriptsLocationMap[artifactName] || defaultScriptsLocationMap[artifactName];

                    if (!artifactBaseUrl) {
                        var argumentsObject = utils.getArgumentsObject(this._overrideScriptsMap, arguments);
                        this._throwArtifactNotFound(artifactName, argumentsObject);
                    }

                    var scriptUrl = this._appendToUrlPath(artifactBaseUrl, scriptsMap[artifactName]);
                    scriptUrls.push(scriptUrl);
                }
            }

            return scriptUrls;
        };

        this._appendToUrlPath = function(url, appendedPath) {
            return this._removeRedundantSlashes(url + '/' + appendedPath);
        };

        this._removeRedundantSlashes = function(url) {
            return url.replace(/(https?:)?\/\/+/g, function(match, http, offset) {
                return http || offset === 0 ? match : '/';
            });
        };

        this.loadScripts = function(scriptsMap, defaultScriptsLocationMap, statemapOrTopology, callback) {
            statemapOrTopology = statemapOrTopology || {};
            var overrideScriptsLocationMap = statemapOrTopology.topology || statemapOrTopology;

            var scriptUrls =
                this._overrideScriptsMap(scriptsMap, defaultScriptsLocationMap, overrideScriptsLocationMap);

            ajaxClient.loadScriptsSequentially(scriptUrls, function(err) { callback(err, scriptUrls); });
        };
    };

    if (window.W && window.W.isUnitTestMode) {
        window.WT = window.WT || {};
        window.WT.utils = utils;
        window.WT.BasicAjaxClientClass = BasicAjaxClientClass;
        window.WT.StatemapOrTopologyLoaderClass = StatemapOrTopologyLoaderClass;
        window.WT.ScriptMapLoaderClass = ScriptMapLoaderClass;
        window.WT.PublishedClientArtifactVersionsLoaderClass = PublishedClientArtifactVersionsLoaderClass;
        window.WT.SnapshotVersionsLoaderClass = SnapshotVersionsLoaderClass;
        window.WT.TopologyResolverClass = TopologyResolverClass;
    }

    window.loadInitialScriptsDynamically = function(initialScriptsMap, onStatemapOrTopologyLoadedHook) {
        var ajaxClient = new BasicAjaxClientClass({
            windowScope: window,
            document: document
        });

        var clientArtifactVersionsLoader = new PublishedClientArtifactVersionsLoaderClass({
            ajaxClient: ajaxClient,
            url: 'http://s3.amazonaws.com/wix-client-versions/versions.json'
        });

        var snapshotVersionsLoaderClass = new SnapshotVersionsLoaderClass({
            ajaxClient: ajaxClient,
            url: 'http://static.snapshots.wixpress.com/services/versions.json'
        });

        var topologyResolver = new TopologyResolverClass({
            clientArtifactVersionsLoader: clientArtifactVersionsLoader,
            snapshotVersionsLoader: snapshotVersionsLoaderClass,
            urlTemplates: {
                statics:  'http://static.parastorage.com/services/${urlPathPrefix}${artifactName}/${artifactVersion}',
                snapshot: 'http://static.snapshots.wixpress.com/services/${artifactName}/${artifactVersion}',
                local:    'http://localhost/${urlPathPrefix}${artifactName}'
            }
        });

        var statemapOrTopologyLoader = new StatemapOrTopologyLoaderClass({
            windowScope: window,
            queryString: window.location.search,
            ajaxClient: ajaxClient,
            topologyResolver: topologyResolver
        });

        var handleError = function(error, contextDescription) {
            if (!error) {
                return;
            }

            var console = window.console;
            if (console && console.error) {
                console.error('loadInitialScriptsDynamically: error ' + contextDescription);
                console.error(error);
            }

            throw error;
        };

        var completionCallback = function(error, scriptUrls) {
            handleError(error, 'loading scripts: ' + scriptUrls);

            var console = window.console;
            if (console) {
                console.info('loadInitialScriptsDynamically completed successfully');
            }
        };

        var loadScriptMap = function(error, statemapOrTopology) {
            handleError(error, 'loading statemap or topology');

            window.W = window.W || {};
            window.W.statemapOrTopology = statemapOrTopology;

            if (typeof onStatemapOrTopologyLoadedHook === 'function') {
                onStatemapOrTopologyLoadedHook(statemapOrTopology);
            }

            var scriptMapLoader = new ScriptMapLoaderClass({
                ajaxClient: ajaxClient
            });

            var defaultScriptsLocationMap = (window.serviceTopology || {}).scriptsLocationMap;

            scriptMapLoader.loadScripts(
                initialScriptsMap,
                defaultScriptsLocationMap,
                statemapOrTopology,
                completionCallback
            );
        };

        statemapOrTopologyLoader.loadStatemapOrTopology(loadScriptMap);
    };
})();