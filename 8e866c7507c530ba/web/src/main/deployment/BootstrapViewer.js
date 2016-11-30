(function() {
    define.resource('tags', getTags());
    define.resource('mode', {
        debug: (rendererModel.debugMode === 'debug'),
        test: false
    });

    function getDebugModeArtifacts(queryString) {
        var list = [];
        var regex = /[&?]debugArtifacts?=([^&]+)/ig;
        var match;
        while (match = regex.exec(queryString)) {
            var matchVal = decodeURIComponent(match[1]);
            list = list.concat(matchVal.split(','));
        }

        list = list.map(function(artifactName) {
            var result = artifactName.toLowerCase().replace(/\s/g, '');
            if (result === 'web') {
                result = 'wysiwyg';
            }

            return result;
        }).filter(function(v) {
            return v;
        });

        return list.reduce(function(result, artifactName) {
            result[artifactName] = true;
            return result;
        }, {});
    }

    define.resource('debugModeArtifacts', getDebugModeArtifacts(window.location.search));

    function hashToLowerCase(originalHash) {
        var newHash = {};
        for (var experiment in originalHash) {
            newHash[experiment.toLowerCase()] = originalHash[experiment].toLowerCase();
        }
        return newHash;
    }

    function setExperimentsFromQuery() {
        var query = window.location.search.toLowerCase().replace('?', '');
        var params = query.split('&');
        for (var i = 0; i < params.length; i++) {
            var paramKeyValue = params[i].split('=');
            if (paramKeyValue[0] == 'experiment') {
                var expNameGroup = paramKeyValue[1].split(':');
                window.rendererModel.runningExperiments[expNameGroup[0]] = (expNameGroup[1] || 'new');
            }
        }
    }

    function getTags() {
        window.rendererModel.runningExperiments = hashToLowerCase(window.rendererModel.runningExperiments);

        setExperimentsFromQuery();
        var tags = ['common', 'viewer'];
        if (window.viewMode === "preview") {
            tags.push('preview');
        }
        var experiments = rendererModel.runningExperiments;
        for (var expName in experiments) {
            tags.push(expName.toLowerCase() + ':' + experiments[expName].toLowerCase());
        }

        if (/[?&]jasminespec([&=]|$)/i.test(window.location.search)) {
            tags.push('integration-tests');
        }

        return tags;
    }

    define.deployment('wysiwyg.deployment.PrepViewer', function(deploymentDef) {
        deploymentDef.atPhase(PHASES.BOOTSTRAP, function(deploy) {
            if (window.wixData) {
                resource.getResources(['dataFixer'], function(res) {
                    var fixedWixData = res.dataFixer.fix(window.wixData);
                    this.define.dataItem.multi(fixedWixData.document_data);
                    this.define.dataPropertyItem.multi(fixedWixData.component_properties);
                    this.define.dataThemeItem.multi(fixedWixData.theme_data);
                });
            }
        });

        deploymentDef.atPhase(PHASES.MANAGERS, function(deploy) {
            deploy.createClassInstance('W.Layout', 'wysiwyg.viewer.managers.LayoutManager');
            deploy.createClassInstance('W.Viewer', 'wysiwyg.viewer.managers.WViewManager');
            deploy.createClassInstance('W.SiteMembers', 'wysiwyg.viewer.managers.SiteMembersManager');
            deploy.createClassInstance('W.MessagesController', 'wysiwyg.viewer.utils.MessageViewController');
            deploy.createClassInstance('W.Actions', 'wysiwyg.viewer.managers.ActionsManager');

            if(W.isExperimentOpen('SocialActivity')) deploy.createClassInstance('W.SocialActivityDataManager', 'wysiwyg.viewer.managers.SocialActivityDataManager');

        });
    });

})();
