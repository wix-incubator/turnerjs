/**
 * This is the description for documentServices.
 * @namespace documentServices
 */
define([
    'lodash',
    'utils',
    'documentServices/privateServices/privateServices',
    'documentServices/constants/constants',
    'documentServices/undoRedo/UndoRedo',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/documentServicesDataFixer/documentServicesDataFixer',
    'documentServices/patchData/patchData',
    'documentServices/utils/utils',
    'documentServices/bi/errors',
    'documentServices/bi/events',
    'documentServices/deprecation/deprecation',
    'experiment'
], function
    (_,
     utils,
     PrivateServices,
     constants,
     UndoRedo,
     documentModeInfo,
     documentServicesDataFixer,
     patchData,
     dsUtils,
     errors,
     biEvents,
     deprecation,
     experiment) {
    'use strict';

    /**
     * @typedef {object} ComponentReference
     * @property {string} id
     * @property {string} pageId
     * @property {string} [viewMode]
     *
     */

    /**
     * callback executed upon success
     * @callback onSuccess
     */

    /**
     * callback executed upon error
     * @callback onError
     * @param {failInfo} failInfo
     */

    /**
     * A map of 'serviceName: errorInfo'
     * @typedef {Object.<String, errorInfo>} failInfo
     */

    /**
     * information about the failure of a specific service within the process
     * @typedef {Object} errorInfo
     * @property {number} errorCode
     * @property {string} description
     */


    function getViewMode(ps, viewMode) {
        return viewMode || documentModeInfo.getViewMode(ps);
    }

    /**
     *
     */
    var publicServices = {
        methods: {
            /**
             * @class documentServices.siteSegments
             */
            siteSegments: {
                getFooter: function (ps, viewMode) {
                    return ps.pointers.components.getFooter(getViewMode(ps, viewMode));
                },
                getHeader: function (ps, viewMode) {
                    return ps.pointers.components.getHeader(getViewMode(ps, viewMode));
                },
                getPagesContainer: function (ps, viewMode) {
                    return ps.pointers.components.getPagesContainer(getViewMode(ps, viewMode));
                },
                getSiteStructure: function (ps, viewMode) {
                    return ps.pointers.components.getMasterPage(getViewMode(ps, viewMode));
                },
                getSiteStructureId: function () {
                    return constants.MASTER_PAGE_ID;
                }
            }
        }
    };

    /**
     * @typedef {Object} DocumentServicesModule
     * @property {Object.<string, Object>} methods
     * @property {Function} initMethod
     */

    /**
     * @typedef {Object} DocumentServicesConfiguration
     * @property {boolean} shouldRender
     * @property {boolean} isReadOnly
     * @property {boolean} noUndo
     * @property {string[]} pathsInJsonData
     * @property {string[]} undoablePaths
     * @property {DocumentServicesModule[]} modules
     */

    function addSetOperationsQueueMethods(publicAPI, privateServices, shouldRender) {
        if (shouldRender) {
            /**
             *
             * @param callback
             * @param [onlyChangesAlreadyRegistered] - used in integration, will force to stop the batching
             */
            publicAPI.waitForChangesApplied = function (callback, onlyChangesAlreadyRegistered) {
                if (onlyChangesAlreadyRegistered) {
                    privateServices.setOperationsQueue.flushQueueAndExecute(callback);
                } else {
                    privateServices.setOperationsQueue.waitForChangesApplied(callback);
                }
            };
            publicAPI.registerToErrorThrown = privateServices.setOperationsQueue.registerToErrorThrown.bind(privateServices.setOperationsQueue);
            publicAPI.unRegisterFromErrorThrown = privateServices.setOperationsQueue.unRegisterFromErrorThrown.bind(privateServices.setOperationsQueue);
            publicAPI.registerToSiteChanged = privateServices.setOperationsQueue.registerToSiteChanged.bind(privateServices.setOperationsQueue);
        } else {
            publicAPI.registerToSiteDataChanged = privateServices.setOperationsQueue.registerToSiteDataChanged.bind(privateServices.setOperationsQueue);
            publicAPI.waitForChangesApplied = function (callback) {
                callback();
            };
        }
        //ds_OperationsQAllAsync
        publicAPI.__setDs_OperationsQAllAsyncIsOpen = _.noop;

    }

    function initiateDSModules(config, /***/ps, renderedWixSite) {
        if (config.shouldRender) {
            if (!renderedWixSite) {
                throw "you need to pass the Site instance if you want to be able to render it...";
            }
            ps.initiateSiteAPI(renderedWixSite);
        }

        var autosaveInfo = ps.dal.get(ps.pointers.general.getAutosaveInfo());
        if (autosaveInfo) {
            if (autosaveInfo.changesApplied) {
                ps.siteAPI.reportBI(biEvents.AUTO_SAVE_DIFFS_RESTORED, {});
            } else if (autosaveInfo.restoreError) {
                ps.siteAPI.reportBI(errors.AUTOSAVE_RESTORE_FAILED, autosaveInfo.restoreError);
            }
        }

        var permissions = ps.dal.get(ps.pointers.general.getPermissions());
        if (permissions && permissions.isOwner) {
            ps.siteAPI.reportBI(biEvents.PETRI_BUG_JSON_ANCHORS, {
                "label_id": experiment.isOpen('petriConsistencyExp') ? 'B' : 'A'
            });
        }

        if (!config.isReadOnly) {
            documentServicesDataFixer.fix(ps);
            _.invoke(config.modules, 'initMethod', ps, {
                runStylesGC: config.runStylesGC
            });
            addSetOperationsQueueMethods(this, ps, config.shouldRender);
        }

        if (!config.noUndo) {
            this.history = new UndoRedo(ps, config.undoablePaths, config.nonUndoablePaths);
        }
    }

    /**
     * @constructor
     * @param {DocumentServicesConfiguration} config
     * @param {{siteData: Object, dataLoadedRegistrar: Function}} siteDataWrapper
     * @param {function} fixPages
     * @param {function} buildRenderedSite
     */
    function Site(config, siteDataWrapper, fixPages, buildRenderedSite) {
        var methods = publicServices.methods;
        var modulesMethods = _(config.modules)
            .map('methods')
            .clone();
        modulesMethods.unshift(methods);
        _.merge.apply(_, modulesMethods);

        var privateServices = new PrivateServices(config, siteDataWrapper);
        if (config.isTest) {
            this.ps = privateServices;
        }
        var self = this;

        function onApplyPatchDone(err, patchProps) {
            var onReady = initiateDSModules.bind(self, config, privateServices);
            if (err) {
                var restoreError = _.merge({errorMsg: err.message}, err.patch);
                privateServices.dal.set(privateServices.pointers.general.getAutoSaveInnerPointer('restoreError'), restoreError);
            } else if (patchProps.changesApplied) {
                privateServices.dal.set(privateServices.pointers.general.getAutoSaveInnerPointer('changesApplied'), true);
            }

            //running the data fixers without setting to dal will work in readonly because dal.get gets data from the json and not the immutable
            var pagesData;
            pagesData = siteDataWrapper.fullPagesData.pagesData;
            var siteStructureDataNodeBeforeDataFixer = _.get(pagesData, 'masterPage.data.document_data.SITE_STRUCTURE');
            var fixedPagesData = (fixPages && fixPages(pagesData)) || pagesData;

            if (experiment.isOpen('openRemoveJsonAnchors')) {
                var isJsonAnchorsRemoved = isJsonAnchorsRemovedInSite(pagesData);
                if (isJsonAnchorsRemoved && siteDataWrapper.siteData.rendererModel.runningExperiments) {
                    //we clone the running experiments so the experiment module will recognize the change
                    var updatedRunningExperiments = _.clone(siteDataWrapper.siteData.rendererModel.runningExperiments);
                    updatedRunningExperiments.removeJsonAnchors = 'new';
                    siteDataWrapper.siteData.rendererModel.runningExperiments = updatedRunningExperiments;
                    if (!experiment.isOpen('removeJsonAnchors')) {
                        utils.log.error('we tried to force open removeJsonAnchors without success');
                    }
                }
            }

            if (!config.isReadOnly) {
                privateServices.dal.full.setByPath(['pagesData'], fixedPagesData);
                if (siteStructureDataNodeBeforeDataFixer) {
                    removeLegacySiteStructureData(privateServices, fixedPagesData.masterPage);
                }
            }

            if (config.isReadOnly || !config.shouldRender) {
                onReady();
                _.attempt(function () {
                    if (!_.isUndefined(window) && window.parent) {
                        //TODO: this should be in main-r, or better, it should be only here
                        window.parent.postMessage('documentServicesLoaded', '*');
                    }
                });
            } else {
                buildRenderedSite.call(self, onReady);
            }
        }

        _.forEach(methods, addPublicMethodsToScope.bind(null, this, privateServices, config, ''));
        patchData.applyPatchIfExists(privateServices, config, onApplyPatchDone, onApplyPatchDone);
    }

    function isJsonAnchorsRemovedInSite(pagesData) {
        var masterPageChildren = pagesData.masterPage.structure.children;
        var noAnchorsOnMaster = isAnchorsRemovedOnPage(masterPageChildren);
        if (noAnchorsOnMaster) {
            return true;
        }

        //maybe we can check only home page
        var landingPagesDataItems = _.filter(pagesData.masterPage.data.document_data, {
            type: 'Page',
            isLandingPage: true
        });
        var landingPagesChildren = _.map(landingPagesDataItems, function (pageDataItem) {
            var res = [];
            var page = pagesData[pageDataItem.id];
            var children = page && page.structure.components;
            return res.concat(children || []).concat(_.omit(page.structure, 'components'));
        });

        return _.some(landingPagesChildren, isAnchorsRemovedOnPage);
    }

    function isAnchorsRemovedOnPage(pageChildren) {
        return _.every(pageChildren, function (child) {
            return !child.layout.anchors;
        });
    }

    function removeLegacySiteStructureData(ps) {
        var orphanDataNodesPointer = ps.pointers.general.getOrphanPermanentDataNodes();
        ps.dal.push(orphanDataNodesPointer, 'SITE_STRUCTURE');
    }

    function addPublicMethodsToScope(namespace, privateServices, config, path, methodDef, methodName) {
        var nextPath = (path ? path + '.' : '') + methodName;

        methodDef = deprecation.wrapDeprecatedFunction(privateServices, methodDef, methodName);

        if (_.isFunction(methodDef)) {
            namespace[methodName] = _.partial(methodDef, privateServices);

        } else if (_.isArray(methodDef)) {
            namespace[methodName] = methodDef;

        } else if (_.isObject(methodDef) && methodDef.dataManipulation) {

            if (config.isReadOnly && !config.allowInReadOnly) {
                namespace[methodName] = function () {
                    throw new Error("you are in read only mode, so you cannot do this!!");
                };
            } else {
                namespace[methodName] = getDataManipulationFunction(methodDef, privateServices, nextPath);
            }

        } else if (_.isObject(methodDef)) {
            namespace[methodName] = {};
            _.forEach(methodDef, addPublicMethodsToScope.bind(null, namespace[methodName], privateServices, config, nextPath));

        } else {
            namespace[methodName] = methodDef; // consts
        }
    }

    function shouldUpdateSingleComp(ps, compRef, methodDef) {
        if (compRef) {
            var singleComp = _.isFunction(methodDef.singleComp) ? methodDef.singleComp(ps, compRef) : methodDef.singleComp;
            if (singleComp) {
                if (_.isArray(compRef) && compRef.length === 1) {
                    compRef = compRef[0];
                }
                if (compRef.id) {
                    return compRef.id;
                }
                if (_.isString(compRef)) {
                    return compRef;
                }
            }
        }
        return false;
    }

    function isUpdatingAnchors(ps, compRef, methodDef, methodArgs) {
        var updatingAnchors = _.isFunction(methodDef.isUpdatingAnchors) ?
            methodDef.isUpdatingAnchors(ps, compRef, methodArgs) :
            methodDef.isUpdatingAnchors;
        if (_.isString(updatingAnchors)) {
            return updatingAnchors;
        }
        return updatingAnchors ? dsUtils.YES : dsUtils.NO;
    }

    function getDataManipulationFunction(methodDef, privateServices, methodName) {
        return function () {
            var newArgs = _.toArray(arguments);
            newArgs.unshift(privateServices);

            var returnValue = null;
            if (methodDef.getReturnValue) {
                returnValue = methodDef.getReturnValue.apply(null, newArgs);
                newArgs.splice(1, 0, returnValue);
            }

            var params = _.clone(methodDef);
            params.methodName = methodName;

            var singleCompPointer = newArgs[1];
            params.singleComp = shouldUpdateSingleComp.bind(null, privateServices, singleCompPointer, methodDef);
            params.isUpdatingAnchors = isUpdatingAnchors(privateServices, singleCompPointer, methodDef, newArgs);

            var handle = privateServices.setOperationsQueue.runSetOperation(methodDef.dataManipulation, newArgs, params);

            if (privateServices.siteAPI.getQueryParam('dsQTrace')) {
                /*eslint no-console:0*/
                if (console.trace) {
                    console.trace();
                }
                console.log('Q OPERATION ADDED', handle, methodName, arguments);
            }

            return returnValue;
        };
    }


    return Site;
});
