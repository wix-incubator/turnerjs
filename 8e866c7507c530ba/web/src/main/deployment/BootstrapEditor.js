(function () {

    // set redirection by hash as defined in SaveDialog.js
    // (Used for no-redirect on first save, in browsers that do no support history.replaceState).
    if (window.location.hash.indexOf('#REDIRECTTO') == 0) {
        window.enableNavigationConfirmation = false;
        window.location = window.location.hash.replace(/^#REDIRECTTO/,'');
    }

    var isDebugArtifactsMode = /[?&]debugArtifacts?\b/i.test(window.location.search);

    // Add dev experiment when in debug mode
    if(editorModel.mode === 'debug' || isDebugArtifactsMode) {
        editorModel.runningExperiments['dev'] = 'New';
    }

    define.resource('tags', getTags());

    define.resource('mode', {
        debug : (editorModel.mode === 'debug'),
        debugArtifacts: isDebugArtifactsMode,
        test : false
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
        }).filter(function(v) { return v; });

        return list.reduce(function(result, artifactName) {
            result[artifactName] = true;
            return result;
        }, {});
    }

    define.resource('debugModeArtifacts', getDebugModeArtifacts(window.location.search));

    function hashToLowerCase(originalHash) {
        var newHash = {};
        for (var experiment in originalHash){
            newHash[experiment.toLowerCase()] = originalHash[experiment].toLowerCase();
        }
        return newHash;
    }

    function setExperimentsFromQuery(){
        var query = window.location.search.toLowerCase().replace('?', '');
        var params = query.split('&');
        for(var i =0; i< params.length; i++){
            var paramKeyValue = params[i].split('=');
            if(paramKeyValue[0] == 'experiment'){
                var expNameGroup = paramKeyValue[1].split(':');
                window.editorModel.runningExperiments[expNameGroup[0]] = (expNameGroup[1] || 'new');
            }
        }
    }

    function getTags(){
        window.editorModel.runningExperiments = hashToLowerCase(window.editorModel.runningExperiments);
        setExperimentsFromQuery();
        var tags = ['common', 'editor'];
        var experiments = editorModel.runningExperiments;
        for(var expName in experiments){
            tags.push(expName.toLowerCase() + ':' + experiments[expName].toLowerCase());
        }

        if (/[?&]jasminespec([&=]|$)/i.test(window.location.search)) {
            tags.push('integration-tests');
        }

        return tags;
    }

    resource.getResourceValue("mode", function(mode){
        function isInTestMode() {
            return editorModel && editorModel.mode === "unit_test" ;
        }

        function createEditorNewStructure() {
            var previewHeight = isInTestMode() ? "0" : "100%" ;
            var editorStructureNode = document.createElement('div');
            editorStructureNode.id = 'EDITOR_STRUCTURE';
            editorStructureNode.innerHTML = '' +
                '<a href="template_page"></a>' +
                '<div skinPart="sitePages" id="SITE_PAGES"></div>' +
                '<div id="live-preview-iframe-wrapper">' +
                '<iframe id="live-preview-iframe" name="live-preview-iframe" width="100%" height="' + previewHeight + '" frameborder="0" src="' + getPreviewSrc() + '"></iframe>' +
                '</div>' +
                '<div comp="wysiwyg.editor.components.EditorPresenter" skin="wysiwyg.editor.skins.EditorPresenterSkin" id="editorUI"></div>';
            document.body.appendChild(editorStructureNode);
            return editorStructureNode;
        }

        function getPreviewSrc() {
            if(isInTestMode()) {
                return "" ;
            }
            var previewUrl = window.editorModel.previewUrl ;
            var extraParams = "&isEdited=true" ;
            extraParams += (editorModel.mode==="debug" ? "&mode=debug" : "") ;
            extraParams += "&" + _getAllQueryString(location.search, ["editorSessionId", "metaSiteId"]) ;
            extraParams += '&lang=' + (window.wixEditorLangauge || window.editorModel.languageCode || 'en') ;
            return previewUrl + extraParams ;
        }

        function _getAllQueryString(urlSearch, excludedParams) {
            if(!excludedParams || excludedParams.length === 0) {
                return urlSearch ;
            }
            urlSearch = _dropLeadingQuestionMark(urlSearch);
            var allParams = urlSearch.split("&") ;
            var includedParams = _filterExcludedParams(allParams, excludedParams);
            return includedParams.join("&") ;
        }

        function _filterExcludedParams(params, excludedParams) {
            var includedParams = [];
            if(!params) {
                return includedParams ;
            } else if(!excludedParams) {
                return params ;
            }
            for (var i = 0; i < params.length; i++) {
                var paramAndValue = params[i];
                var paramName = paramAndValue.split("=")[0];
                if (paramName && !(_contains(excludedParams, paramName))) {
                    includedParams.push(paramAndValue);
                }
            }
            return includedParams;
        }

        function _dropLeadingQuestionMark(value) {
            if (value && value.length > 0 && value.indexOf("?") === 0) {
                value = value.substr(1, value.length);
            }
            return value ;
        }

        function _contains(array, element) {
            if(array && array.length > 0 && element) {
                for(var i=0; i < array.length; i++) {
                    if(array[i] === element) {
                        return true ;
                    }
                }
            }
            return false ;
        }

        createEditorNewStructure();
    }) ;




    define.deployment('wysiwyg.deployment.PrepEditor', function (deploymentDef) {

        deploymentDef.atPhase(PHASES.BOOTSTRAP, function (deploy) {

            define.dataThemeItem('THEME_DATA', {
                type : 'Theme',
                'properties' : {
                    'CONTACT_DIRECTORY' : {
                        'type' : 'themeUrl',
                        'value' : 'editorIcons/links'
                    },
                    'NETWORKS_DIRECTORY' : {
                        'type' : 'themeUrl',
                        'value' : 'editorIcons/links'
                    },
                    'EXTERNAL_LINKS_DIRECTORY' : {
                        'type' : 'themeUrl',
                        'value' : 'editorIcons/links'
                    },
                    'PAGES_DIRECTORY' : {
                        'type' : 'themeUrl',
                        'value' : 'editorIcons/links'
                    },
                    'THEME_DIRECTORY' : {
                        'type' : 'themeUrl',
                        'value' : 'editor_mobile'
                    },
                    'WEB_THEME_DIRECTORY' : {
                        'type' : 'webThemeUrl',
                        'value' : 'editor_web'
                    }
                }
            });
        });

        deploymentDef.atPhase(PHASES.MANAGERS, function (deploy) {

            deploy.createClassInstance('W.Preview', 'wysiwyg.editor.managers.WPreviewManager');
            deploy.createClassInstance('W.Editor', 'wysiwyg.editor.managers.editormanager.WEditorManager');
            deploy.createClassInstance('W.EditorDialogs', 'wysiwyg.editor.managers.WDialogManager');
            deploy.createClassInstance('W.ServerFacade', 'wysiwyg.editor.managers.serverfacade.ServerFacade');
            deploy.createClassInstance('W.ClipBoard', 'wysiwyg.editor.managers.WClipBoard');
            deploy.createClassInstance('W.AlignmentTools', 'wysiwyg.editor.managers.WAlignmentTools');
            deploy.createClassInstance('W.CompSerializer', 'wysiwyg.editor.managers.WComponentSerializer');
            deploy.createClassInstance('W.CompDeserializer', 'wysiwyg.editor.managers.componentdeserializer.WComponentDeserializer');
            deploy.createClassInstance('W.UndoRedoManager', 'wysiwyg.editor.managers.UndoRedoManager');
            deploy.createClassInstance('W.AppStoreManager', 'tpa.editor.managers.AppStoreManager');
            deploy.createClassInstance('W.SMEditor', 'wysiwyg.editor.managers.SMEditorManager');
            deploy.createClassInstance('W.BackgroundManager', 'wysiwyg.editor.managers.background.BackgroundManager');
            deploy.createClassInstance('W.ScrollHandler', 'wysiwyg.editor.utils.ScrollHandler');

			if(W.Experiments.isDeployed('SitePagesValidation')) {
				deploy.createClassInstance('W.SiteValidator', 'wysiwyg.editor.validations.SiteValidator');
			}
        });

        deploymentDef.atPhase(PHASES.POST_DEPLOY, function(deploy){
            var start = Date.now();

            resource.getResourceValue('scriptLoader', function(scriptLoader){

                var version = '3.1.0.243';
//                var version = '2.6.1.172';

                var aviaryUrl = '//static.parastorage.com/services/third-party/aviary/%version%/js/feather.js'.replace('%version%', version);
                deployStatus('Aviary', 'Aviary started to load');
                scriptLoader.loadResource({
                    url: aviaryUrl,
                    noBlob: true
                }, {
                    onFailed: function(){
                        LOG.reportError(wixErrors.AVIARY_NOT_LOADED, "BootstrapEditor", "PostDeploy", {i1: Date.now() - start});
                        define.resource('Aviary', null);
                    },
                    onLoad  : function(){
                        define.resource('Aviary', window.Aviary);
                        deployStatus('Aviary', 'Aviary Loaded Successfully ' + Date.now() - start);
                    }
                });
            });
        });
    });

})();
