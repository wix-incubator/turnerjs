/**
 * @class bootstrap.bootstrap.scriptloader.ScriptLoader
 */
resource.getResources(['mode', 'tags' , 'fnvHash'], function (res) {

    var xmlHTTPObject = (function getXMLHTTPObject() {
        var e = [function () {
                return new XMLHttpRequest();
            }, function () {
                return new ActiveXObject("Msxml2.XMLHTTP");
            }, function () {
                return new ActiveXObject("Msxml3.XMLHTTP");
            }, function () {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            ],
            t = !1;
        for (var n = 0; n < e.length; n++) {
            try {
                t = e[n];
                t();
                return t;
            } catch (r) {
                continue;
            }
            break;
        }
        return t;
    })();

    define.bootstrapClass('bootstrap.bootstrap.scriptloader.ScriptLoader', ScriptLoaderDefinition);

    define.resource('scriptLoader', define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoader').init());

    function ScriptLoaderDefinition() {
        'use strict';
        function ScriptLoader() {
            this._docHead = document.getElementsByTagName('head')[0];
        }

        /** @lends bootstrap.bootstrap.scriptloader.ScriptLoader */
        ScriptLoader.extendPrototype({
            /**
             * stab to prevent errors
             */
            init: function () {

                this.mode = res.mode;
                this.tags = res.tags;
                return this;
            },

            /**
             * Loads all files of a manifest
             * @param {String} baseUrl a base url for all manifest scripts
             * @param {Array} manifest an array of objects with this structure:
             *  {artifact:'artifact name', baseUrl:'http://artifact/scripts/base', resources:['resources paths relative to baseUrl']}
             * @param {Function=} onAllScriptsLoaded Success callback for <b>all</b> the scripts. The manifest loading context is passed.
             * @param {Function=} onSomeScriptsFailed Failure callback, called <b>once</b> if some scripts failed to load. The manifest loading context is passed
             * @param {Function=} filter function. gets the resource object and returns true for resources that should be loaded
             */
            loadManifest: function (baseUrl, manifests, onAllScriptsLoaded, onSomeScriptsFailed, filter) {
                var self = this;
                var context = this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ManifestContext');

                this.resource.getResourceValue('tags', function (tags) {
                    var filteredManifests = manifests.filter(self._manifestsWithMatchingTags(tags));
                    context.init(baseUrl, filteredManifests, onAllScriptsLoaded, null, filter);

                    context.requested.forEach(function loadResource(url) {
                        var model = (window.editorModel || window.rendererModel) || {};
                        var runningExperiments = model.runningExperiments || {};
                        if (runningExperiments.scriptloaderjsretries === "new") {
                            var originalOnFailed = context.onFailed;
                            var retry = function (times, content, src) {
                                LOG.reportError(wixErrors.SCRIPTLOADER_FAILED_TO_LOAD_SCRIPT_RETRY, 'ScriptLoader', 'loadResource', 'times left=' + times + '; url=' + src.url);
                                if (times === 0) {
                                    context.onFailed = function (content, src) {
                                        LOG.reportError(wixErrors.SCRIPTLOADER_FAILED_TO_LOAD_SCRIPT_GAVE_UP, 'ScriptLoader', 'loadResource', 'url=' + src.url);
                                        originalOnFailed(content, src);
                                    };
                                } else {
                                    context.onFailed = retry.bind(self, times - 1);
                                }

                                window.setTimeout(self.loadResource.bind(self, url, context), 200);
                            };
                            context.onFailed = retry.bind(self, 2);
                        }

                        self.loadResource(url, context);

                    });
                });

                return context;
            },

            /**
             *
             * @param activeTags an array of active tags (should be the resource "tags")
             * @return {Function} a filter function that returns true if the manifest entry should be loaded
             * @private
             */
            _manifestsWithMatchingTags: function (activeTags) {
                var self = this;
                return function (manifestEntry) {
                    if (!manifestEntry.tags) {
                        return false;
                    }
                    return manifestEntry.tags.some(function (tagExpression) {
                        return self._isTagExpressionTruthy(tagExpression, activeTags);
                    });
                };
            },

            /**
             *
             * @param tagExpression
             * @return {Object} {include: the part before the first !, exclude: the part after the first !}
             * @private
             */
            _splitOnFirstExclemation: function (tagExpression) {
                var firstNotIndex = tagExpression.indexOf('!');
                var includePart = firstNotIndex >= 0 ? tagExpression.substring(0, firstNotIndex) : tagExpression;
                var excludePart = firstNotIndex >= 0 ? tagExpression.substring(firstNotIndex) : '';
                if (excludePart.indexOf('&') >= 0) {
                    throw new Error("malformed tag expression, there shouldn't be & after !. in tag " + tagExpression);
                }
                return {include: includePart, exclude: excludePart};
            },

            /**
             *
             * @param {String} tagExpression
             * @param {Array<String>} activeTags
             * @return {Boolean}
             * @private
             */
            _isTagExpressionTruthy: function (tagExpression, activeTags) {
                var parts = this._splitOnFirstExclemation(tagExpression);
                var allRequiredTagsActive = this._isAllTagsActive(parts.include, activeTags);
                var allExcludedTagsInactive = this._isAllTagsInactive(parts.exclude, activeTags);
                return allRequiredTagsActive && allExcludedTagsInactive;
            },

            /**
             *
             * @param {String} tagExpression
             * @param {Array<String>} activeTags
             * @return {Boolean}
             * @private
             */
            _isAllTagsActive: function (tagExpression, activeTags) {
                if (!tagExpression || tagExpression === '') {
                    return true;
                }
                var tags = tagExpression.split("&");
                return tags.every(function (tag) {
                    return activeTags.indexOf(tag) >= 0;
                });
            },

            /**
             *
             * @param {String} tagExpression
             * @param {Array<String>} activeTags
             * @return {Boolean}
             * @private
             */
            _isAllTagsInactive: function (tagExpression, activeTags) {
                if (!tagExpression || tagExpression === '') {
                    return true;
                }
                var tags = tagExpression.split('!');
                return tags.every(function (tag) {
                    return activeTags.indexOf(tag) < 0;
                });
            },

            /**
             * Loads a manifest by its index.json url
             * @param {String} manifestUrl the manifest json url
             * @param {Function} onAllScriptsLoaded callback
             * @param {Function} onSomeScriptsFailed callback
             * @param {Function} filter filter function for loadManifest
             */
            loadManifestFromUrl: function (manifestUrl, onAllScriptsLoaded, onSomeScriptsFailed, filter) {
                var self = this;
                var baseUrl = manifestUrl.split("/");
                baseUrl.pop();
                baseUrl = baseUrl.join("/");

                this.resource.getResourceValue('tags', function (tags) {
                    self.loadResource({url: manifestUrl}, {
                        onLoad: function (manifest) {

                            // for experiments: define manifest as resource if it exists
                            if (manifest.descriptor) {
                                var descriptor = manifest.descriptor;
                                manifest = manifest.files;
                                if (descriptor.id) {
                                    self.define.resource('experimentDescriptors.' + descriptor.id.toLowerCase(), descriptor);
                                }
                            }

                            var loadImmediately = [];
                            var loadAtPhase = self.define.getDefinition('resource.loadAtPhase') && self.define.getDefinition('resource.loadAtPhase').value || {};
                            self.define.resource('loadAtPhase', loadAtPhase);

                            manifest
                                .filter(self._manifestsWithMatchingTags(tags))
                                .forEach(self._loadAggregation.bind(this, loadImmediately, loadAtPhase, baseUrl));

                            if (loadImmediately.length) {
                                self.loadManifest(baseUrl, loadImmediately, onAllScriptsLoaded, onSomeScriptsFailed, filter);
                            } else {
                                onAllScriptsLoaded();
                            }
                        },
                        onFailed: function () {
                            onSomeScriptsFailed && onSomeScriptsFailed.apply(self, arguments);
                        },
                        useJsonp: window.W && window.W.isExperimentOpen && window.W.isExperimentOpen('UseJsonpForManifests')
                    });
                });
            },
            removeScript: function (scriptTag) {
                scriptTag && scriptTag.parentNode && scriptTag.parentNode.removeChild(scriptTag);
            },
            _loadAggregation: function (loadImmediately, loadAtPhase, baseUrl, aggregation) {
                if (aggregation.atPhase === "immediate") {
                    loadImmediately.push(aggregation);
                    return;
                }
                if (aggregation.atPhase === undefined) {
                    loadImmediately.push(aggregation);
                    return;
                }

                var atPhase = aggregation.atPhase.replace('PHASES.', '');
                if (!(atPhase in PHASES) && atPhase !== "immediate") {
                    throw new Error('Invalid phase name "' + atPhase + '" in aggregation ' + aggregation.id);
                }
                loadAtPhase[atPhase] = loadAtPhase[atPhase] || [];
                aggregation.url = baseUrl + '/' + aggregation.url;
                loadAtPhase[atPhase].push(aggregation);
                console.log("Postponing aggregation loading to phase " + atPhase, loadAtPhase[atPhase]);
            },

            loadAllIndexes: function (manifestsUrls, callback) {
                var loaded = 0;
                var scriptLoader = this;

                function _loadedCallback(url) {
                    loaded++;
                    deployStatus('manifestLoadingProgress', "(" + loaded + " / " + manifestsUrls.length + ') masifest loaded: ' + url);
                    if (loaded === manifestsUrls.length) {
                        deployStatus('manifestLoadingProgress', 'all indexes loaded { ' + loaded + ' }');
                        callback.apply(this, arguments);
                    }
                }

                manifestsUrls.forEach(function (url) {
                    var retry = false;
                    scriptLoader.loadManifestFromUrl(url, _loadedCallback.bind(null, url), function () {
                        if (!retry) {
                            retry = true;
                            var prefix = ~url.indexOf('?') ? '&' : '?';
                            var cacheKiller = prefix + 'ck=' + (Math.random() * 10000000 << 0).toString(36);
                            scriptLoader.loadManifestFromUrl(url + cacheKiller, _loadedCallback.bind(null, url + cacheKiller), function () {
                                console.error(url + cacheKiller + ' Not loaded after retry!');
                            });
                        }
                    });
                });
            },

            /**
             *
             * @param {Object} resourceObj a resource definition {id:'resourceId', url:'http://resource.url', usePlugin:'pluginName'}
             * @param {Object?} context A Context object for loading plugin execution.
             * If it contains an onLoad/onFail methods, the loading plugin may treat them as event handlers.
             * See {@link bootstrap.bootstrap.scriptloader.ScriptLoader#addPlugin} for execution details.
             */
            loadResource: function (resourceObj, context) {
                var plugin = this._getPlugin(resourceObj, context);
                return plugin && (plugin.exec(resourceObj, context, this));
            },

            _getPlugin: function (resourceObj, context) {
                // resourceObj can try to request a specific plugin ..
                var plugin;
                var pluginName = resourceObj.usePlugin;
                if (pluginName) {
                    plugin = this.pluginsMap[pluginName];
                    if (plugin) {
                        return plugin;
                    } else {
                        throw new Error('ScriptLoader:: Unable to find plugin: [' + pluginName + '], please make sure a plugin with that name exists.');
                    }
                }
                // .. or we can try to match using the isMatch method on plugins
                for (var i = 0; i < this.plugins.length; i++) {
                    plugin = this.plugins[i];
                    if (plugin.isMatch(resourceObj, this, context)) {
                        return plugin;
                    }
                }
                throw new Error('Unable to handle resource type of: ' + resourceObj.url + ' try to add a plugin in order to load this kind of file');
            },

            /**
             * Script loading plugins
             * @type {Array<bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin>
         * @see bootstrap.bootstrap.scriptloader.Plugins
             */
            plugins: [],
            pluginsMap: {},

            IsIE8Browser: (function () {
                var rv = -1;
                var ua = navigator.userAgent;
                var re = new RegExp("Trident\/([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null) {
                    rv = parseFloat(RegExp.$1);
                }
                return (rv == 4);
            }()),
            /**
             * Adds a resource loading plugin
             * @link {bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin}
             * @param {bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin} plugin
             */
            addPlugin: function (plugin) {
                this.plugins.push(plugin);
                this.pluginsMap[plugin.name] = plugin;
            },
            initPlugin: function (name, isMatch, exec) {
                return this.addPlugin(this.define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.ScriptLoaderPlugin').init(name, isMatch, exec));
            },
            createTagWithInfo: function (type, attributes, url, context) {
                var element = document.createElement(type);
                var attr;
                var i;

                for (attr in attributes) {
                    element[attr] = attributes[attr];
                }

                function existsInSrc(item) {
                    return url.indexOf(item.url) >= 0;
                }

                if ((this.mode.debug || this.mode.test) && context && context.manifest) {
                    for (i = 0; i < context.manifest.length; i++) {
                        if (context.manifest[i].resources.some(existsInSrc)) {
                            element.setAttribute('data-manifest-id', context.manifest[i].id);
                            break;
                        }
                    }
                    element.setAttribute('data-loaded-timestamp', Date.now());
                }

                return element;
            },
            getWithCORS: function (resource, context) {
                var xhr = null;
                var _this = this;
                _this.logStartLoading(resource.url);
                if (window.XDomainRequest) {
                    xhr = new XDomainRequest();
                    xhr.open("get", resource.url + '?ctype=text/plain');
                    xhr.setRequestHeader = xhr.setRequestHeader || function (key, value) {
                    }; // ignores request headers in IE (not supported)
                } else {
                    xhr = new XMLHttpRequest();
                    xhr.open('GET', resource.url, true);
                }

                // set callbacks
                xhr.onerror = xhr.ontimeout = xhr.onabort = function (e) {
                    _this.logEndLoading(resource.url, true);
                    context.onFailed && context.onFailed(xhr, resource, e);
                };
                xhr.onprogress = function () {
                };
                // handle success
                xhr.onload = function (e) {
                    var val;
                    try {
                        val = JSON.parse(xhr.responseText);
                    } catch (err) {
                        _this.logEndLoading(resource.url, true);
                        context.onFailed && context.onFailed(e);
                        return;
                    }
                    _this.logEndLoading(resource.url, false);
                    val && context.onLoad && context.onLoad(val, resource, e);
                };
                // issue request
                xhr.send();
            },
            /** this works on IE8*/
            getWithJSONP: function (resource, context, callbackName) {
                var _this = this;
                var scriptTag;
                var querySep;
                var src;
                var jsonpCallbackId = 'r_' + res.fnvHash.hash(resource.url, 32).replace('-', '_');
                callbackName = (typeof callbackName === 'string') ? callbackName : 'jsonp';
                _this.logStartLoading(resource.url);

                window.jsonpCallbacks = window.jsonpCallbacks || {};
                window.jsonpCallbacks[jsonpCallbackId] = function (data) {
                    _this.logEndLoading(resource.url, false);
                    context && context.onLoad && context.onLoad(data, resource);
                    delete window.jsonpCallbacks[jsonpCallbackId];
                    _this.removeScript(scriptTag);
                };

                querySep = ~resource.url.indexOf('?') ? '&' : '?';
                src = resource.url + querySep + callbackName + '=jsonpCallbacks.' + jsonpCallbackId;
                scriptTag = this.createTagWithInfo('script', {type: "text/javascript", src: src}, resource.url, context);

                scriptTag.onerror = function () {
                    _this.logEndLoading(resource.url, true);
                    context && context.onFailed && context.onFailed(scriptTag, resource);
                };
                document.getElementsByTagName('head')[0].appendChild(scriptTag);
            },
            loadScript: function (resource, context) {
                var _this = this;
                _this.logStartLoading(resource.url);
                var scriptTag = this.createTagWithInfo('script', {type: "text/javascript", src: resource.url}, resource.url, context);

                if (this.IsIE8Browser) {
                    scriptTag.onreadystatechange = function () {
                        if (scriptTag.readyState == 'complete' || scriptTag.readyState == 'loaded') {
                            _this.logEndLoading(resource.url, false);
                            context && context.onLoad && context.onLoad(scriptTag, resource);
                            _this.removeScript(scriptTag);
                        }
                    };
                } else {
                    scriptTag.onload = function () {
                        _this.logEndLoading(resource.url, false);
                        context && context.onLoad && context.onLoad(scriptTag, resource);
                        _this.removeScript(scriptTag);
                    };
                }

                scriptTag.onerror = function (e) {
                    _this.logEndLoading(resource.url, true);
                    context && context.onFailed && context.onFailed(scriptTag, resource, e);
                };

                this._docHead.appendChild(scriptTag);

            },

            _scriptLoadingError: function (e) {
                this.$scriptLoader.logEndLoading(this.$resource.url, true);
                this.$context && this.$context.onFailed && this.$context.onFailed(this, this.$resource, e);
            },
            getUrl: function (url, onsuccess, onerror, type) {
                var req = xmlHTTPObject();
                req.open('GET', url, true);
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        if (req.status != 200 && req.status != 304) {
                            onerror && onerror(req, new Error('General XHR Error: ' + req.status));
                        } else {
                            if (type === 'json') {
                                try {
                                    var data = JSON.parse(req.responseText);
                                    onsuccess && onsuccess(req, data);
                                } catch (error) {
                                    onerror && onerror(req, error);
                                }
                            } else {
                                onsuccess && onsuccess(req);
                            }
                        }
                    }
                };
                req.send();
            },
            ajaxGet: function (url, onsxs, onfail) {
                var xhr = new XMLHttpRequest();
                var _this = this;
                _this.logStartLoading(url);
                xhr.open('GET', url);
                // set callbacks
                xhr.onerror = xhr.ontimeout = xhr.onabort = onfail;
                // handle success
                xhr.onload = function () {
                    if (xhr.status == 200 || xhr.status == 301) {
                        _this.logEndLoading(url, false);
                        onsxs.apply(this, arguments);
                        return;
                    }
                    _this.logEndLoading(url, true);
                    onfail.apply(this, arguments);
                };
                // issue request
                xhr.send();
            },
            ajaxPost: function (url, data, onsxs, onfail) {
                var xhr = new XMLHttpRequest();
                var _this = this;
                _this.logStartLoading(url);
                xhr.open('POST', url);
                // set callbacks
                xhr.onerror = xhr.ontimeout = xhr.onabort = onfail;
                // handle success
                xhr.onload = function () {
                    if (xhr.status == 200 || xhr.status == 301) {
                        _this.logEndLoading(url, false);
                        onsxs.apply(this, arguments);
                        return;
                    }
                    _this.logEndLoading(url, true);
                    onfail.apply(this, arguments);
                };
                // issue request
                xhr.send(data);
            },
            loadResourceWithRetryPolicy: function (resourceWrapper) {
                var retries = 0;
                var fetchPos = 0;

                var next = function () {

                    if (retries > resourceWrapper.trials || resourceWrapper.url.length === 0) {
                        return resourceWrapper.onFailed('fatal!!!');
                    }

                    if (fetchPos >= resourceWrapper.url.length) {
                        fetchPos = 0;
                        retries += 1;
                        return resourceWrapper.timeBetween ? setTimeout(next, resourceWrapper.timeBetween) : next();
                    }

                    var policy = resourceWrapper.url[fetchPos];
                    fetchPos += 1;
                    if (retries > 0 && policy.once && policy.beenHere) {
                        return next(); //skip...
                    }
                    policy.beenHere = true;

                    loadWith(policy.url, policy.method || 'cors', function error() {

                        //debug!!!
                        if (resourceWrapper.trialFailNotification) {
                            resourceWrapper.trialFailNotification(policy.url, fetchPos, retries);
                        }

                        return next();
                    }, function sxs(featchedResource) {
                        resourceWrapper.onLoad(featchedResource);
                    });

                };

                var loadWith = function (url, method, fail, sxs) {

                    if (method === 'cors') {
                        this.getWithCORS({url: url}, {onLoad: sxs, onFailed: fail});
                    } else if (method === 'jsonp') {
                        this.getWithJSONP({url: url}, {onLoad: sxs, onFailed: fail});
                    }
                }.bind(this);

                next();

            },
            logStartLoading: function (url) {
                if (window.deployStatus) {
                    deployStatus.files[url] = {start: LOG.getSessionTime()};
                }
            },
            logEndLoading: function (url, isFailed) {
                if (window.deployStatus) {
                    deployStatus.files[url].end = LOG.getSessionTime();
                    if (isFailed) {
                        deployStatus.files[url].isFailed = true;
                    }
                }
            }

        });

        return ScriptLoader;
    }

});
