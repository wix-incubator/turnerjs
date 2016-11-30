define.deployment('core.deployment.DeployViewer', function (deploymentDef) {
    var logMethodsObj = define.getBootstrapClass('deployment.ViewerDeploymentLogs');
    setTimeout(function() {
        logMethodsObj.sendPageLoadingBI340(10);
        logMethodsObj.sendImageLoadingBI341();
    }, 10000);

    setTimeout(function() {
        logMethodsObj.sendPageLoadingBI340(20);
    }, 20000);

    setTimeout(function() {
        logMethodsObj.sendPageLoadingBI340(30);
    }, 30000);

    deploymentDef.atPhase(PHASES.BOOTSTRAP, function(deploy){
        var headElements = document.querySelectorAll('head *');
        var bodyElements = document.querySelectorAll('body *');
        for (var i = 0; i< headElements.length; i++){
            headElements[i]["serverGenerated"] = true;
            headElements[i].setAttribute("serverGenerated", true);
        }
        for (i = 0; i< bodyElements.length; i++){
            bodyElements[i]["serverGenerated"] = true;
            bodyElements[i].setAttribute("serverGenerated", true);
        }
    });

    deploymentDef.atPhase(PHASES.INIT, function (deploy) {
        W.ComponentLifecycle.setComponentErrorHandler(function(failedCompInfo, error, phase){
            "use strict";
            var componentType = failedCompInfo.component.$className;
            LOG.reportError(wixErrors.COMPONENT_ERROR, componentType, phase, error.stack);
        });

        if(W.Config.env.$isEditorViewerFrame){
            W.Components.setComponentDefinitionModifier(function(compName, compDef) {
                applyEditorPart(compName, compDef);
            });
        }

        function applyEditorPart(compName, compDefObject) {
            var compNameObj = parseCompName(compName);

            var editorPartDefinition = getEditorPartDefinition(compNameObj);

            if(editorPartDefinition && editorPartDefinition[compNameObj.componentName]){
                compDefObject = mergeComponentEditorPart(compDefObject, editorPartDefinition[compNameObj.componentName]);
            }
            /*
             * will be called in the following cases:
             * 1. new component with editor part
             * 2. experiment on existing editor part
             * */
            W.Experiments.applyExperiments('Editor.' + compName, compDefObject, 'ExperimentComponentPlugin');
        }

        function getEditorPartDefinition(compNameObj) {
            var editorPartDefinition;
            try {
                editorPartDefinition = this.define.getDefinition('component', 'Editor.' + compNameObj.componentNamespace);
            }
            catch(err) {
                editorPartDefinition = null;
            }
            return editorPartDefinition;
        }


        function parseCompName(compName) {
            var compNameObject = {};
            var classNameIndex = compName.lastIndexOf(".");
            compNameObject.componentNamespace = compName.substring(0, classNameIndex);
            compNameObject.componentName = compName.substring(classNameIndex + 1);
            return compNameObject;
        }

        function mergeComponentEditorPart(originalComponentDef, experimentComponentDef) {
            var experimentStrategy = this.define.createBootstrapClassInstance('bootstrap.managers.experiments.ExperimentStrategy');
            var ComponentDefinition = this.define.createBootstrapClassInstance('core.managers.component.ComponentDefinition');
            // Original data
            var originalData = originalComponentDef;
            if(typeof originalComponentDef === 'function') {
                originalData = new ComponentDefinition();
                originalComponentDef(originalData);
            }
            // Experiment data
            var experimentData = ComponentDefinition;
            experimentComponentDef(experimentData, experimentStrategy);
            // Overrides
            originalData.resources(experimentStrategy._mergeField_(originalData._resources_ , experimentData._resources_));
            originalData.binds(experimentStrategy._mergeField_(originalData._binds_, experimentData._binds_));
            originalData.traits(experimentData._traits_ || originalData._traits_);//needed??
            originalData.utilize(experimentStrategy._mergeField_(originalData._imports_, experimentData._imports_));
            originalData.statics(experimentStrategy._mergeObjects_(originalData._statics_, experimentData._statics_));
            originalData.fields(experimentStrategy._mergeObjects_(originalData._fields_, experimentData._fields_));
            originalData.methods(experimentStrategy._mergeObjects_(originalData._methods_, experimentData._methods_));
            originalData.states(experimentStrategy._mergeField_(originalData._states_, experimentData._states_));
            originalData.panel(experimentData._panel_ );
            originalData.styles(experimentData._styles_);
            originalData.helpIds(experimentData._helpIds_);
            originalData.toolTips(experimentData._toolTips_);

            return originalData;
        }

        function resolveMissingPagesStructureBug() {
            try {
                if (window.viewMode !== 'preview') {
                    return;
                }
                if (!(window.wixData && wixData.document_data && wixData.document_data.MAIN_MENU && wixData.document_data.MAIN_MENU.items)) {
                    return;
                }
                var pagesData = wixData.document_data.MAIN_MENU.items;
                var pagesNode = $('SITE_PAGES');
                if (!pagesNode) {
                    return;
                }

                for (var i=0; i<pagesData.length; i++) {
                    if (pagesData[i].refId) {
                        checkIfNeedToFillInMissingPageStructure(pagesData[i].refId, pagesNode)
                    }
                    //now, check the same for sub-pages (only one level of nesting is possible)
                    if (pagesData[i].items) {
                        for (var sub=0; sub<pagesData[i].items.length; sub++) {
                            if (pagesData[i].items[sub].refId) {
                                checkIfNeedToFillInMissingPageStructure(pagesData[i].items[sub].refId, pagesNode)
                            }
                        }
                    }
                }
            }
            catch (e) {}
        }
        function checkIfNeedToFillInMissingPageStructure(pageDataRef, pagesNode) {
            try {
                var pageId = pageDataRef.substr(1); //remove the leading #;
                if (pagesNode.getElementById(pageId)==null) {
                    var elem = new Element('div', {id:pageId, dataquery:pageDataRef, comp:'mobile.core.components.Page', styleid:'p1', 'class':'initHidden', x:'0', y:'0', width:'980', height:'600', skin:'wysiwyg.viewer.skins.page.BasicPageSkin'});
                    pagesNode.appendChild(elem);

                    wixData.document_data[pageId].hidePage = true;

                    LOG.reportError(wixErrors.RESTORED_BLANK_PAGE_WHERE_MISSING_PAGE_DATA);
                }
            }
            catch (e) {}
        }

        resource.getResourceValue('status.structure.loaded', function(isLoaded){
            if (!isLoaded) {
                throw new Error('Site structure failed to load');
            }

            resolveMissingPagesStructureBug();

            W.Viewer.initiateSite();
        });
    });

    deploymentDef.atPhase(PHASES.POST_DEPLOY, function (deploy) {
        W.Viewer.addEvent('SiteReady', function() {
            W.Utils.callLater(runAfterViewerLoads);
        });
    });

    function runAfterViewerLoads(){
        W.Classes.getClass('external_apis.GoogleTagManager', function(GoogleTagManager){
            var tagManager = new GoogleTagManager('viewer');
        });
        if(W.Experiments.isDeployed({'verifypremium':'New'})) {
            W.Classes.getClass('wysiwyg.viewer.VerifyPremium', function(Result){
                var verifyPremium = new Result();
                verifyPremium.verify();
            });
        }
        if(W.Experiments.isDeployed({'ClientSideUserGUIDCookie':'New'})) {
            if(rendererModel.documentType=='WixSite') {
                resource.getResourceValue('scriptLoader',function(scriptLoader){
                    scriptLoader.loadScript({url:'//static.parastorage.com/services/third-party/misc/ClientSideUserGUIDCookie.js'},{});
                });
            }
        }

        var paramsObj = W.Utils.getQueryStringParamsAsObject();

        var initializeFeedbackFeature = function(){
            var reviewsContainer = new Element('div', {'id': 'reviewsContainer'});
            document.body.appendChild(reviewsContainer);

            W.Components.createComponent(
                'wysiwyg.previeweditorcommon.components.SiteFeedbackPanel',
                'wysiwyg.previeweditorcommon.SiteFeedbackPanelSkin',
                null, null,
                function(compLogic){
                    compLogic.getViewNode().insertInto(reviewsContainer);
                }, function(compLogic){
                    compLogic.showQuickTour();
                }
            );
        };
        if (paramsObj.feedback === "true"){
            W.Resources.loadLanguageBundle('FEEDBACK_REVIEW', initializeFeedbackFeature);
        }
    }
});