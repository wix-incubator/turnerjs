/**
 * deployment def for the base classes
 */
define.deployment('deployment.BaseClasses', function (deploymentDef) {

    deploymentDef.atPhase(PHASES.BOOTSTRAP, function (deploy) {
        console.log('deploy constants');
        deploy.copyNamespace('Constants', 'Const');

        //TODO: quick temporary fix, so that we get the 300 event. TBD
        switch(window.viewMode) {
            case 'editor':
                // determine screen resolution
                var w=0, h= 0, runningExperiments='';
                if (window && window.screen && window.screen.width) {w = window.screen.width;}
                if (window && window.screen && window.screen.height) {h= window.screen.height;}
                if (window && window.editorModel && window.editorModel.runningExperiments) {
                    //this is ugly and unsorted and this includes experiments that won't eventually be used becuase they don't have descriptors, dependencies, etc. needs to be improved. the problem here is that W.Experiments isn't created yet.
                    runningExperiments = JSON.stringify(editorModel.runningExperiments).replace(/[{}]/g,'').replace(/"/g, '').replace(/:New/ig,'').replace(/[^,]+:Old/ig,'').replace(/,,/g,',').replace(/,$/,'').replace(/^,/,'');
                }                var params = {'i1': w, 'c1': h, 'g1': runningExperiments};
                LOG.reportEvent(wixEvents.EDITOR_DOM_LOADED, params);
                break;
            case 'site':
                var isNewPublishSite = !window.wixData;
                var params = {'c1': isNewPublishSite};
                LOG.initNewBeatPage();
                LOG.reportEvent(wixEvents.SITE_DOM_LOADED, params);
                break;
            case 'preview':
                sendBIofStartingToLoadPreviewWithStats();
            break;
        }

    });

    deploymentDef.atPhase(PHASES.CLASSMANAGER, function (deploy) {
        deploy.createBootstrapClassInstance('W.Utils', 'bootstrap.utils.Utils', []);
        deploy.publishBootstrapClass('XClass', 'bootstrap.bootstrap.XClass');
        deploy.createBootstrapClassInstance('W.Experiments', 'bootstrap.managers.experiments.Experiments', []);
        deploy.createBootstrapClassInstance('W.Classes', 'bootstrap.managers.classmanager.ClassManager', []);
        var done = deploy.async(10, 'Waiting for W.Classes');
        this.resource.getResourceValue('W.Classes', function (classManager) {
            classManager.getClass('bootstrap.utils.Tween', function (Tween) {
                define.utils('Tween:this', function () {
                    done();
                    return {
                        Tween:Tween
                    };
                });
            });
            classManager.getClass('bootstrap.utils.Hash', function (Hash) {
                define.utils('hash:this', function () {
                    done();
                    return {
                        'hash':new Hash()
                    };
                });
            });
//            done();
        });
    });

    deploymentDef.atPhase(PHASES.CLASSMANAGER, function (deploy) {
        deploy.publishBootstrapClass('Element', 'bootstrap.extendnative.Element');
        deploy.publishBootstrapClass('Array', 'bootstrap.extendnative.Array');
    });

    deploymentDef.atPhase(PHASES.UTILS, function (deploy) {
        deploy.createClassInstance('W.Queue', 'bootstrap.utils.Queue');
        deploy.createClassInstance('W.Commands', 'bootstrap.managers.commands.Commands');
        deploy.createClassInstance('W.Events', 'bootstrap.managers.events.EventsManager');
        deploy.createClassInstance('W.CommandsNew', 'bootstrap.managers.events.CommandsManager');
        deploy.createClassInstance('W.InputBindings', 'bootstrap.managers.InputBindings');

    });

    deploymentDef.atPhase(PHASES.POST_DEPLOY, function (deploy) {
        var done = deploy.async(10, 'Waiting for W.Classes');
        this.resource.getResourceValue('W.Classes', function (classManager) {
            classManager.loadMissingClasses();
            done();
        });
    });

    //this should ordinarily be in utils, but we wanted to send the BI before loading anything.
    //TODO: find a better way (minimalUtils.js perhaps?)
    function sendBIofStartingToLoadPreviewWithStats() {
        try {
            var isTooMany = false; //this is used to minimize the execution time, and stop counting at a certain point.
            var editorStats = {
				documentType: rendererModel.documentType,
				appDefinitionIds: [],
                pages: window.siteAsJson.pages.length,
                comps: 0
            };

			/**
			 * Gets the id's of the applications found in the object we get from the server - {rendererModel.clientSpecMap}
			 * @returns {Array}
			 */
			var getAppDefinitionIds = function() {
				return _.reduce(rendererModel.clientSpecMap, function(result, appDef){
					if (appDef.appDefinitionId) {
						result.push(appDef.appDefinitionId);
					}
					return result;
				}, []);
			};

            var countNumberOfCompsInSiteAsJson = function () {
                var containers = window.siteAsJson.pages;
                containers = containers.concat(window.siteAsJson.masterPage.structure.children);

                _.forEach(containers, function (container) {
                    if (!isTooMany) {
                        getCompsAmountFromContainers(container, editorStats);
                    } else {
                        return false;
                    }
                }, this);
            };

            /**
             * This function updates the editorStats object with the amount of components on
             * @param compsContainer Can be either a page, or a container component which has a 'components' property
             */

            var getCompsAmountFromContainers = function (compsContainer) {
                var components = compsContainer.components || compsContainer.structure && compsContainer.structure.components;

                if (components) {
                    editorStats.comps += components.length;
                    if (editorStats.comps <= 1000) {
                        var containers = _.filter(components, 'components');
                        _.forEach(containers, function (container) {
                            if (!isTooMany) {
                                getCompsAmountFromContainers(container);
                            } else {
                                return false;
                            }
                    });
                    } else {
                       isTooMany = true;
                    }
                }
            };

			editorStats.appDefinitionIds = getAppDefinitionIds();
            countNumberOfCompsInSiteAsJson();


            var params = {c1: JSON.stringify(editorStats)};
            LOG.reportEvent(wixEvents.DESKTOP_PREVIEW_DOM_LOADED, params);
        }
        catch (e) {

		}
    }

});
