/**
 * @class bootstrap.bootstrap.scriptloader.Plugins
 */
resource.getResources(['scriptLoader', 'fnvHash'], function (res) {

    var scriptLoader = res.scriptLoader;
    var mode = scriptLoader.mode;
    var topology;

    /**
     * Copied from Helpers.js that is not ready at time of execution
     */
    var blobUrl;
    var isUnitTests = function() {
        return (window.editorModel && window.editorModel.mode === 'unit_test');
    };
    if (!isUnitTests()) {
        blobUrl = serviceTopology.blobUrl;
        splitedBlobUrl = blobUrl.replace('/wix_blob', '');
        blobSupportedServers = (mode.debug||mode.test) ? ['http://wysiwyg.pita.wixpress.com'] : [splitedBlobUrl];
    } else {
        var blobBaseUrl = (mode.debug || window.location.host.indexOf('wysiwyg') === 0) ? 'http://wysiwyg.pita.wixpress.com/' : serviceTopology.staticServerUrl;
        blobUrl = blobBaseUrl + 'wix_blob';
        blobSupportedServers = (mode.debug||mode.test) ? ['http://wysiwyg.pita.wixpress.com'] : [serviceTopology.staticServerUrl];
    }


    var blobIgnoreMap = ['ckeditor.js'];
    var wixBlob = define.createBootstrapClassInstance('bootstrap.bootstrap.scriptloader.WixBlob').init( blobUrl, blobSupportedServers , 4);

    var isBlobActivated =
        !isUnitTests() &&
        (
            window.W && window.W.isExperimentOpen && window.W.isExperimentOpen('UseBlob') ||
            /[&?]UseBlob=true\b/.test(window.location.search)
        );

    var isJSONP_Override = /[&?]jsonpOverride=true\b/.test(window.location.search);

    function getFileExentionFromUrl(url){
        return (url.split('.').pop().split('?')[0]);
    }

    scriptLoader.initPlugin('js',
        function isMatch(resource, scriptLoader, context) {
            return (getFileExentionFromUrl(resource.url) === 'js');
        },
        function exec(resource, context) {
           loadJsScript(resource, context);
        }
    );

    scriptLoader.initPlugin('json',
        function isMatch(resource, scriptLoader, context) {
            return (getFileExentionFromUrl(resource.url) === 'json');
        },
        function exec(resource, context) {
            if (context.useJsonp || scriptLoader.IsIE8Browser || isJSONP_Override) {
                scriptLoader.getWithJSONP(resource, context);
            } else {
                var addedToBlob = loadJsViaBlob(resource, context);
                if (!addedToBlob){
                    var jsonpFallbackContext = {
                        onLoad : context.onLoad,
                        onFailed : scriptLoader.getWithJSONP.bind(scriptLoader, resource, context)
                    };
                    scriptLoader.getWithCORS(resource, jsonpFallbackContext);
                }
            }
        }
    );

    scriptLoader.initPlugin('css',
        function isMatch(resource, scriptLoader, context) {
            return (getFileExentionFromUrl(resource.url) === 'css');
        },
        function exec(resource, context) {
            var link = scriptLoader.createTagWithInfo('link', {type: "text/css", href:resource.url, rel:"stylesheet"}, resource.url, context);
            link.$called = false;
            function cssLoaded(e) {
                if(!link.$called){
                    link.$called = true;
                    context && context.onLoad && context.onLoad(link, resource, e);
                }
            }
            link.onload = cssLoaded;
            link.onerror = function (e) {
                context && context.onFailed && context.onFailed(link, resource, e);
            };
            document.getElementsByTagName('head')[0].appendChild(link);
            cssLoaded({});
        }
    );

    scriptLoader.initPlugin('svgShape',
        function isMatch(resourceDef) {
            var packageName = resourceDef.url.replace(/^.*\//, '').split("."),
                isPrefix = function(str, prefix){
                    return str.indexOf(prefix) === 0;
                };
            return isPrefix(resourceDef.url, 'svgshape.') && packageName.length === 4;
        },
        function exec(resourceDef, context) {
            //Example resourceDef: svgshape.v1.svg_1d23a4adcc180e6168c9eb24b62ae238.CartIcon
            //Example resourceUri: 1d23a4adcc180e6168c9eb24b62ae238_svgshape.v1.CartIcon.js

            var partsArr = resourceDef.url.replace(/^.*\//, '').split("."),
                resourceUri = partsArr[2].replace('svg_', '') + '_svgshape.' + partsArr[1] + '.' + partsArr[3] + '.js',
                artifactTopology = (function(){
                    var staticsUrl = window.serviceTopology.staticServerUrl;
                    return staticsUrl[staticsUrl.length - 1] === '/' ? staticsUrl : staticsUrl + '/';
                }()) + 'shapes/',
                resourceToLoad = {
                    url: artifactTopology + resourceUri + '?t=' + Math.random().toString(),   //TODO: remove random() to work with CDN (after dev is finished)
                    id: resourceDef.id
                };

            loadJsScript(resourceToLoad, context);
        }
    );

    scriptLoader.initPlugin('class',
        function isMatch(resourceDef, scriptLoader, context) {
            var packageName = resourceDef.url.replace(/^.*\//, '').split(".");
            var className = packageName.pop();

            return getArtifactUrl(packageName, scriptLoader) && className.test(/^([A-Z][\w\d_]*)+$/) && packageName.every(function (name) {
                return name.test(/^[a-z][a-z_\d]+$/);
            }, context);
        },
        function exec(resourceDef, context) {
            var packageName = resourceDef.url.replace(/^.*\//, '').split(".");
            var artifactUrl = getArtifactUrl(packageName);

            packageName.unshift('javascript');
            packageName.unshift(artifactUrl);

            var resourceToLoad = {
                url:packageName.join('/') + ".js",
                id:resourceDef.id
            };
            loadJsScript(resourceToLoad, context);
        }
    );

    scriptLoader.initPlugin('external',
        function isMatch(resource, scriptLoader, context) {
            //this plugin needs to be explicitly requsted useing resource.usePlugin = 'external'
            return false;
        },
        function exec(resource, context) {
            resource.noBlob = true;
            loadJsScript(resource, context);
        }
    );

    function loadJsViaBlob(resource, context, type){
        //returning false means that the request is not inserted to the blob
        if((resource.noBlob || mode.debug || !isBlobActivated)){
            return false;
        }

        var isInSupportedServer = blobSupportedServers.some(function(supportedServer){
            return resource.url.indexOf(supportedServer) === 0;
        });

        if(!isInSupportedServer){
            return false;
        }

        for (var i = 0; i < blobIgnoreMap.length; i++) {
            var ignore = blobIgnoreMap[i];
            if(~resource.url.indexOf(ignore)){
                return false;
            }
        }

        if(!context){
            context = {
                onLoad:function(){console.log('blob resource is loaded without context', resource);},
                onFailed:function(){console.log('blob resource failed to load without context', resource);}
            };
        }
        //console.log(type);
        if(type === 'js'){
            wixBlob.addRequest(resource.url, context.onLoad.bind(context, resource,resource), context.onFailed.bind(context,resource,resource));
        } else {
            wixBlob.addRequest(resource.url, context.onLoad.bind(context), context.onFailed.bind(context));
        }

        return true;

    }

    function loadJsScript(_resource, context) {
        if(!loadJsViaBlob(_resource, context, 'js')){
            scriptLoader.loadScript(_resource, context);
        }
    }

    function getArtifactUrl(packageName) {
        !topology && resource.getResourceValue('topology', function(_topology){
            topology = _topology;
        });
        if(!topology){
            throw 'You are trying to load a class before the topology is defined you need to create a ' +
                'bootstrap class in order to be alive in this phase PATH:"' + packageName+'"';
        }
        var artifactTopology;
        //var artifactId = resources.topology[packageName[0]];
        /**
         * Hardcoded artifact rule for skin project - because the skins don't have a main
         * project package yet.
         * ToDo: move all the skins into the skin project under one unique project package.
         */
        if(packageName[0] === 'mobile'){console.warn('mobile package is deprecated: "' + packageName.join('.') + '"');}

        var hasSkins = packageName.indexOf("skins") > 0;
        var hasComponents = packageName.indexOf("components") > 0;
        if (packageName[0] === 'wysiwyg' && hasSkins && !hasComponents) {
            artifactTopology = topology['skins'];
        } else {
            artifactTopology = topology[packageName[0]];
        }

        if(!artifactTopology && artifactTopology !== ''){
            console.log('Unknown Topology for ' + packageName.join('.'));
            return false;
        }

        return  artifactTopology.url || artifactTopology;
    }

});
