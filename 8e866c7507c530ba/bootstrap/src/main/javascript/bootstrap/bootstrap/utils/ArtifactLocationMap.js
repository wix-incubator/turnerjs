function getIndexTopology(mode, artifactDefinitionArray, callback) {
    resource.getResources(['scriptLoader','BrowserUtils', 'ExperimentsList'], function(resources){
        function _createArtifactLocationMap(oldMap, artifactDefinitionMap, getIndexFileNameFunc, mode, callback) {

            function replaceAliases(map) {
                map = cloneMap(map);
                if (artifactDefinitionMap.aliases) {
                    for (var key in artifactDefinitionMap.aliases) {
                        var newName = artifactDefinitionMap.aliases[key];
                        var oldName = key;
                        if (oldName !== newName && map[oldName] !== undefined) {
                            map[newName] = map[oldName];
                            delete map[oldName];
                        }
                    }
                }
                return map;
            }

            function replaceBaseUrls(map) {
                map = cloneMap(map);
                if (artifactDefinitionMap.baseUrls) {
                    for (var key in map) {
                        if (artifactDefinitionMap.baseUrls[key] !== undefined) {
                            map[key] = artifactDefinitionMap.baseUrls[key];
                        }
                    }
                }
                return map;
            }

            function buildManifestsUrls(map, getIndexFileNameFunc) {
                var results = [];
                for (var key in map) {
                    if (!isExcludedOrHasBaseUrl(key)) {
                        var isDebug = mode.debug || (mode.debugModeArtifacts && mode.debugModeArtifacts[key]);
                        var indexFileName = getIndexFileNameFunc(isDebug);
                        results.push(map[key] + '/' + indexFileName);
                    }
                }
                return results;
            }

            function isExcludedOrHasBaseUrl(key){
                return (artifactDefinitionMap.exclude && artifactDefinitionMap.exclude[key] !== undefined) ||
                    (artifactDefinitionMap.baseUrls && artifactDefinitionMap.baseUrls[key] !== undefined);
            }

            var map = replaceAliases(oldMap);
            map = replaceBaseUrls(map);
            map = removeTrailingSlashes(map);
            map = filterOutUnopenedExperimentsFromTopology(map, artifactDefinitionMap);

            callback({
                manifestsUrls: buildManifestsUrls(map, getIndexFileNameFunc),
                all:map
            });
        }

        function removeTrailingSlashes(topology){
            return Object.keys(topology).reduce(function(res, key){
                    res[key] = topology[key].replace(/\/$/, "");
                    return res;
                } ,{});
        }

        function cloneMap(obj) {
            var result = {};
            for (var i in obj) {
                result[i] = obj[i];
            }
            return result;
        }

        function getIndexFileName(isDebug) {
            return isDebug ? 'index.debug.json' : 'index.json';
        }
        function _getIndexTopology(mode, artifactDefinitionArray, callback) {
            var topologyMap = getServiceTopologyMap();
            _createArtifactLocationMap(topologyMap, artifactDefinitionArray, getIndexFileName, mode, callback);
        }

        function getServiceTopologyMap() {
            var override_map = getOverrideMap();
            var override_versions = getOverrideVersions();
            var topologyMap  = serviceTopology.scriptsLocationMap;
            return replaceTopologyWithOverrides(topologyMap, override_map, override_versions);
        }

        function filterOutUnopenedExperimentsFromTopology(topology, artifactDefinitionMap){
            var filteredTopology = {};
            if(!artifactDefinitionMap['main-artifacts']){
                return topology;
            } else {
                var experiments = resources.ExperimentsList.getExperimentsList();
                Object.keys(topology).forEach(function(artifact){
                    if(experiments[artifact] || artifactDefinitionMap['main-artifacts'].lastIndexOf(artifact) > -1){
                        filteredTopology[artifact] = topology[artifact];
                    }
                });

                return filteredTopology;
            }
        }

        function replaceTopologyWithOverrides(topologyMap, overrideMap, overrideVersions){
            try {
                Object.keys(overrideMap).forEach(function(key) {
                     topologyMap[key] = overrideMap[key];
                });
                Object.keys(overrideVersions).forEach(function(key) {
                    if (typeof topologyMap[key] === 'string') {
                        topologyMap[key] = topologyMap[key].replace(/\b\d+\.\d+\.\d+(?=\/|$)/, overrideVersions[key]);
                    }
                });
            }
            catch (e) {}
            return topologyMap;
        }

        function getOverrideMap(){
            try{
                var override_map = resources.BrowserUtils.getQueryParams()['override_map'];
                if(!!override_map){
                    return JSON.parse(override_map);
                }
            } catch(e){ }
            return {};
        }

        //format: override_versions=html-client:2.708.2,tpa:2.500.1
        function getOverrideVersions(){
            var result = {};
            try{
                var overrideVersionsParam = resources.BrowserUtils.getQueryParams().override_versions || [];
                overrideVersionsParam.forEach(function(val) {
                    var regex = /([^:]+):([^,]+),?/g;
                    var match;
                    while((match = regex.exec(val))) {
                        result[match[1]] = match[2];
                    }
                });

                var htmlClientOverrideVersion = result['html-client'];
                if (htmlClientOverrideVersion) {
                    delete result['html-client'];
                    result.bootstrap = result.core = result.web = result.skins = htmlClientOverrideVersion;
                }
            } catch(e){ }
            return result;
        }

        _getIndexTopology(mode, artifactDefinitionArray, callback);
    }) ;
}