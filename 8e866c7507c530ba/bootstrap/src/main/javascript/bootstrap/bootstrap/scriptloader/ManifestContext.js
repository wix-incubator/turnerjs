/**
 * @class bootstrap.bootstrap.scriptloader.ManifestContext
 */
define.bootstrapClass('bootstrap.bootstrap.scriptloader.ManifestContext', function () {
    'use strict';
    /**
     *
     * @constructor
     */
    function ManifestContext() {
    }

    /**
     * @lends bootstrap.bootstrap.scriptloader.ManifestContext
     */
    ManifestContext.extendPrototype({
        /**
         * Setup method for ManifestContext
         * <b>A valid manifest looks like this:</b>
         *  <pre><code>[
         *      {"id": "jquery", "url": "http://other.external.libs/like/jquery.js"},
         *      {"id": "myJson", "url": "http://some.random.url/index.json"},
         *      {
         *          "id": "artifact name",
         *          "url":"http://artifact/scripts/base",
         *          "resources":[
         *              {"id": "resource1", "url":"resources/paths/relative/to/baseUrl"}
         *         ]
         *      }
         *  ]</code></pre>
         * @param {String} baseUrl a base url for all manifest scripts
         * @param {Array} manifest a valid manifest structure (see function jsDocs)
         * @param {Function?} onAllScriptsLoaded
         * @param {Function?} onSomeScriptsFailed
         * @param {Function?} filter
         * @return {bootstrap.bootstrap.scriptloader.ManifestContext} self
         */
        init:function (baseUrl, manifest, onAllScriptsLoaded, onSomeScriptsFailed, filter) {
            var self = this;
            this.validateManifest(manifest);
            this.baseUrl = baseUrl;
            this.manifest = manifest;
            this.loaded = [];
            this.failed = [];
            this.filter = filter;
            this.requested = filter ? this.getManifestUrls(baseUrl, manifest).filter(filter) : this.getManifestUrls(baseUrl, manifest);
            this.onAllScriptsLoaded = onAllScriptsLoaded || function () {
            };
            this.onSomeScriptsFailed = onSomeScriptsFailed || function () {
                clearTimeout(self.timeoutForError);
                self.timeoutForError = setTimeout(function(){
                    var inManifests = self.manifest.map(function(item){return item.id;});
                    throw new Error('A manifest with id`s: ["'+inManifests.join('","')+'"] failed to load these scripts: ' + JSON.stringify(self.failed,null,4) + '\n from this base url: "' +  self.baseUrl +'"');
                }, 300);
            };

            if (window.W && window.W.isExperimentOpen && window.W.isExperimentOpen('UseJsonpForManifests')) {
                this.useJsonp = true;
            }

            return this;
        },

        /**
         * Event handler for a single resource load
         * @param {*} content
         * @param {Object} resourceDef Resource object: {id:'resourceId', url:'resourceUrl'}
         * @param {*?}event
         */
        onLoad:function (content, resourceDef) {
            this.loaded.push(resourceDef);
            if (resourceDef.id) {
                this.define.resource(resourceDef.id, content);
            }
            deployStatus('ManifestContext.onLoad',this.loaded.length + ' / ' + this.requested.length + ' ' + resourceDef.url);
            if (this.loaded.length >= this.requested.length) {
                this.onAllScriptsLoaded(this);
            }
        },

        /**
         * Event handler for a single resource load failure
         * @param {*} content
         * @param {String} src
         * @param {*?} event
         */
        onFailed:function (content, src) {
            this.failed.push(src);
            deployStatus('ManifestContext.onFailed',this.failed.length + ' / ' + this.loaded.length + ' / ' + this.requested.length);
            this.onSomeScriptsFailed(this);
            this.onSomeScriptsFailed = function () {
                // Prevents multiple calls to onFail
            };
        },

        /**
         * Process a manifest object, and extracts urls array from it.
         * <b>A valid manifest looks like this:</b>
         *  <pre><code>[
         *      {"id": "jquery", "url": "http://other.external.libs/like/jquery.js"},
         *      {"id": "myJson", "url": "http://some.random.url/index.json"},
         *      {
         *          "id": "artifact name",
         *          "url":"http://artifact/scripts/base",
         *          "resources":[
         *              {"id": "resource1", "url":"resources/paths/relative/to/baseUrl"}
         *         ]
         *      }
         *  ]</code></pre>
         * @param {String} baseUrl a base url for all manifest scripts
         * @param {Array} manifest See JsDocs example
         * @return {Array} Full urls of all the scripts included in all the artifacts (each item contains: {id:urlId, url:url}
         */
        getManifestUrls:function (baseUrl, manifest) {
            var urlsToLoad = [];
            //this.validateManifest(manifest);

            var addUrl = this._addUrl;

            manifest.forEach(function (entry) {
                if (!entry.resources) {
                    return addUrl(baseUrl, urlsToLoad, entry);
                }
                entry.resources.forEach(function (resource) {
                    addUrl(baseUrl, urlsToLoad, entry, resource);
                });
            });

            return urlsToLoad;
        },

        /**
         *
         * @param {Array} targetUrlsArray and array to add the urls to
         * @param {Object} entry manifest entry object (single aggregation)
         * @param {Object} resource a single manifest resource (include url and optional id fields)
         * @private
         */
        _addUrl:function (baseUrl, targetUrlsArray, entry, resource) {
            resource = resource || {url:''};
            var entryBaseUrl = cleanUrl(entry.url,baseUrl);
            var resourceObj = {
                url:cleanUrl(resource.url, entryBaseUrl)
            };

            if (resource && resource.id) {
                resourceObj.id = entry.id ? cleanId(entry.id + '.' + resource.id) : cleanId(resource.id);
            }

            if (entry.id && !resource) {
                resourceObj.id = cleanId(entry.id);
            }

            targetUrlsArray.forEach(validateUniqueResource, resourceObj);
            targetUrlsArray.push(resourceObj);
        },

        /**
         * Validates a manifest structure. throws errors for invalid manifest.
         * <b>A valid manifest looks like this:</b>
         *  <pre><code>[
         *      {"id": "jquery", "url": "http://other.external.libs/like/jquery.js"},
         *      {"id": "myJson", "url": "http://some.random.url/index.json"},
         *      {
         *          "id": "artifact name",
         *          "url":"http://artifact/scripts/base",
         *          "resources":[
         *              {"id": "resource1", "url":"resources/paths/relative/to/baseUrl"}
         *         ]
         *      }
         *  ]</code></pre>
         * @param manifest See JsDocs example
         */
        validateManifest:function (manifest) {
            if (!(manifest instanceof Array)) {
                throw new Error('Invalid manifest: must be an array');
            }
            manifest.forEach(function (entry) {
                if (typeof entry.url !== 'string') {
                    throw new Error('Invalid manifest: "url" not defined (must be a string), ID: ' + entry.id);
                }

                if (entry.resources) {
                    entry.resources.forEach(function (resource) {
                        if (typeof resource.url !== 'string') {
                            throw new Error('Invalid manifest: some resources of ' + entry.id + ' have no "url" field (must be a string), ID: ' + entry.id);
                        }
                    });
                }
                if (entry['atPhase']) {
                    var atPhase = entry.atPhase.replace("PHASES.", "");
                    if (!(atPhase in PHASES) && atPhase !== "immediate") {
                        throw new Error('atPhase is not defined with a known PHASE its current value is ' + entry.atPhase);
                    }
                }
            });
        }
    });

    function validateUniqueResource(item) {
        if (item.id && item.id === this.id) {
            throw new Error('Invalid manifest: contains duplicate ids: ' + this.id, item, this);
        }
        if (item.url == this.url) {
            throw new Error('Invalid manifest: contains duplicate urls: ' + this.url, item, this);
        }
    }

    function cleanId(id) {
        return id.replace(/\.$/, '').replace(/\.\./g, '.');
    }

    function cleanUrl(url, base) {
        if (base &&
                // url is not absolute
                !(url.indexOf("://") >= 3 && url.indexOf("://") < 10) &&
                // url is not relative to domain
                url.indexOf("/") !== 0
                ) {
            url = base + '/' + url;
        }
        return url.replace(/\/+/g, "/").replace(/\/$/, '').replace(":/", "://");
    }

    return ManifestContext;
});