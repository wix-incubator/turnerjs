define([
    'lodash',
    'immutable',
    'immutableDiff',
    'utils',
    'documentServices/errors/errors',
    'documentServices/bi/events',
    'documentServices/bi/errors',
    'documentServices/saveAPI/saveDataFixer/saveDataFixer',
    'documentServices/wixCode/utils/constants',
    'experiment',
    'documentServices/hooks/hooks',
    'documentServices/jsonConfig/jsonConfig',
    'documentServices/platform/common/constants'
    ],
    function (
        _,
        Immutable,
        immutableDiff,
        utils,
        errorConstants,
        biEvents,
        biErrors,
        saveDataFixer,
        wixCodeConstants,
        experiment,
        hooks,
        jsonConfig,
        platformConstants) {

        'use strict';

        var ajaxLibrary = utils.ajaxLibrary;
        var urlUtils = utils.urlUtils;

        var relativeEndPoints = {
            partialSave: '/api/partially_update',
            fullSave: '/api/new_override_save',
            firstSave: '/api/first_save',
            saveAsTemplate: '/api/save_as_template/',
            publish: '/api/publish',
            autosave: '/auto_save/save_diff'
        };

        var ERROR_CODE_MAPPING = {
            '-15': errorConstants.save.NOT_LOGGED_IN,
            '-17': errorConstants.save.USER_NOT_AUTHORIZED_FOR_SITE,
            '-10116': errorConstants.save.CONCURRENT_SAVE,
            '-40003': errorConstants.save.SITE_NAME_TAKEN,
            '-10132': errorConstants.save.SAVE_PUBLISH_DISABLED_ON_SERVER,
            '-10104': function (response) {
                var payload = response.payload;
                if (!_.isEmpty(payload.duplicateComponents)) {
                    return errorConstants.save.DUPLICATE_COMPONENTS;
                }
                if (!_.isEmpty(payload.dataReferenceMismatches)) {
                    return errorConstants.save.DATA_REFERENCE_MISMATCH;
                }
                if (!_.isEmpty(payload.missingContainers)) {
                    return errorConstants.save.MISSING_CONTAINERS;
                }
            },
            '-10145': errorConstants.save.CONCURRENT_AUTO_SAVE,
            '-10148': errorConstants.save.SITE_STALE_STATE_FROM_AUTO_SAVE
        };

        var VALIDATION_ERROR_TYPES = [errorConstants.save.DUPLICATE_COMPONENTS, errorConstants.save.DATA_REFERENCE_MISMATCH, errorConstants.save.MISSING_CONTAINERS];

        function getErrorType(response) {
            var errorType = ERROR_CODE_MAPPING[response.errorCode];
            if (_.isFunction(errorType)) {
                errorType = errorType(response);
            }
            return errorType || errorConstants.save.UNKNOWN_SERVER_ERROR;
        }

        function isValidationError(response) {
            return _.includes(VALIDATION_ERROR_TYPES, getErrorType(response));
        }


        function extractMasterPage(lastImmutablePagesData, currentImmutablePagesData) {
            var currentMasterPageStructure = currentImmutablePagesData.getIn(['masterPage', 'structure']);
            if (!lastImmutablePagesData || !currentMasterPageStructure.equals(lastImmutablePagesData.getIn(['masterPage', 'structure']))) {
                return _.pick(currentMasterPageStructure.toJS(), ['children', 'mobileComponents', 'type', 'behaviorQuery', 'layout']);
            }
        }

        function isMasterPage(immutablePageRoot, pageId) {
            return pageId === 'masterPage';
        }

        function pageStructureChanged(lastImmutablePagesData, currentImmutablePageStructure, pageId) {
            return !lastImmutablePagesData && currentImmutablePageStructure || !currentImmutablePageStructure.equals(lastImmutablePagesData.getIn([pageId, 'structure']));
        }

        function extractUpdatedPages(lastImmutablePagesData, currentImmutablePagesData) {
            return currentImmutablePagesData
                .map(function (immutablePageRoot) {
                    return immutablePageRoot.get('structure');
                })
                .filterNot(isMasterPage)
                .filter(pageStructureChanged.bind(null, lastImmutablePagesData))
                .toList()//not using .toArray, because it created a problem in tests where it is still an 'immutable' array-map...
                .toJS();
        }

        function extractDeletedPageIds(lastPagesData, currentPagesData) {
            return lastPagesData.keySeq().toSet().subtract(currentPagesData.keySeq().toSet()).toArray();
        }

        var DATA_TYPES_IN_PAGE = ['component_properties', 'document_data', 'theme_data', 'design_data', 'behaviors_data', 'connections_data'];

        function getChangedDataItems(oldDataMap, newDataMap) {
            if (!oldDataMap) {
                return newDataMap;
            }
            return newDataMap.filter(function (newDataItem, dataId) {
                if (newDataItem === oldDataMap.get(dataId)) { //for primitives, we must check and exit early
                    return false;
                }
                return !newDataItem.equals(oldDataMap.get(dataId));
            });
        }

        function extractDataDelta(lastImmutablePagesData, currentImmutablePagesData) {
            var dataMap = _.groupBy(DATA_TYPES_IN_PAGE);
            return _.mapValues(dataMap, function (v, dataType) {
                return currentImmutablePagesData
                    .flatMap(function (rootPageData, pageId) {
                        var currentDataMap = rootPageData.getIn(['data', dataType]);
                        if (!lastImmutablePagesData) {
                            return currentDataMap;
                        }
                        var oldDataMap = lastImmutablePagesData.getIn([pageId, 'data', dataType]);
                        if (currentDataMap && !currentDataMap.equals(oldDataMap)) {
                            return getChangedDataItems(oldDataMap, currentDataMap);
                        }
                    })
                    .toJS();
            });
        }

        function extractSiteMetaDataIfChanged(lastSnapshot, currentSnapshot) {
            var oldSiteMetaData = getSiteMetaData(lastSnapshot);
            var currentSiteMetaData = getSiteMetaData(currentSnapshot);

            if (!_.isEqual(oldSiteMetaData, currentSiteMetaData)) {
                return currentSiteMetaData;
            }
        }

        function extractMetaSiteDataIfChanged(lastSnapshot, currentSnapshot) {
            var lastMetaSiteData = getMetaSiteData(lastSnapshot);
            var currentMetaSiteData = getMetaSiteData(currentSnapshot);

            if (!_.isEqual(lastMetaSiteData, currentMetaSiteData)) {
                return currentMetaSiteData;
            }
        }

        function filterOutUndefinedData(data) {
            return _.omit(data, function (value) {
                return _.isUndefined(value) || _.isNull(value);
            });
        }

        function getSiteMetaData(snapshot) {
            return _(snapshot.getIn(['rendererModel', 'siteMetaData']).toJS())
                .omit(['adaptiveMobileOn'])
                .merge({headTags: snapshot.getIn(['documentServicesModel', 'customHeadTags']) || ''})
                .value();
        }

        function getMetaSiteData(snapshot) {
            return _.merge({}, snapshot.getIn(['documentServicesModel', 'metaSiteData']).toJS(), {adaptiveMobileOn: isAdaptiveMobileOn(snapshot)});
        }

        function isAdaptiveMobileOn(snapshot) {
            return snapshot.getIn(['rendererModel', 'siteMetaData', 'adaptiveMobileOn']);
        }

        function getProtectedPagesData(lastImmutableSnapshot, currentImmutableSnapshot) {
            var currentPageToHashedPasswordMap = currentImmutableSnapshot.getIn(['rendererModel', 'pageToHashedPassword']);
            if (currentPageToHashedPasswordMap) {
                var lastPageToHashedPasswordMap = lastImmutableSnapshot && lastImmutableSnapshot.getIn(['rendererModel', 'pageToHashedPassword']);

                if (!lastPageToHashedPasswordMap) {
                    return currentPageToHashedPasswordMap.toJS();
                }

                return currentPageToHashedPasswordMap.filter(function (newHash, pageId) {
                    return newHash !== lastPageToHashedPasswordMap.get(pageId);
                }).toJS();
            }
            return {};
        }

        /*TODO : REMOVE ONCE SERVER CHANGE THWE ROUTER TABLE SCHEMA*/
        function tempMigrationForRouterTable(allRouters, currentImmutableSnapshot) {
            var clientSpecMap = currentImmutableSnapshot.getIn(['rendererModel', 'clientSpecMap']);
            _.forEach(allRouters, function (router) {
                if (router.appDefinitionId === platformConstants.APPS.DATA_BINDING.appDefId) {
                    router.appId = -1;
                } else {

                    router.appId = _.get(_.find(clientSpecMap.toJS(), {appDefinitionId: router.appDefinitionId}), 'applicationId');
                }
                delete router.appDefinitionId;
            });
            return allRouters;
        }

        function getRouters(lastImmutableSnapshot, currentImmutableSnapshot) {
            var currentRoutersData = currentImmutableSnapshot.getIn(['routers']);
            if (currentRoutersData) {
                var lastRoutersData = lastImmutableSnapshot && lastImmutableSnapshot.getIn(['routers']);

                if (!_.isEqual(lastRoutersData, currentRoutersData)) {
                    var configMapJS = currentRoutersData.toJS();
                    configMapJS.configMap = tempMigrationForRouterTable(configMapJS.configMap, currentImmutableSnapshot);
                    return configMapJS;
                }
            }

            return undefined;
        }

        function getDataNodeIdsToDelete(immutableSnapshot) {
            return immutableSnapshot.get('orphanPermanentDataNodes').toJS();
        }

        function getSiteId(immutableSnapshot) {
            return immutableSnapshot.getIn(['rendererModel', 'siteInfo', 'siteId']);
        }

        function getRevision(immutableSnapshot) {
            return immutableSnapshot.getIn(['documentServicesModel', 'revision']);
        }

        function getVersion(immutableSnapshot) {
            return immutableSnapshot.getIn(['documentServicesModel', 'version']);
        }

        function getWixCodeAppData(lastImmutableSnapshot, currentImmutableSnapshot) {
            var path = wixCodeConstants.paths.WIX_CODE_APP_DATA;
            var currentWixCodeAppData = currentImmutableSnapshot.getIn(path);
            if (currentWixCodeAppData &&
                (!lastImmutableSnapshot || !currentWixCodeAppData.equals(lastImmutableSnapshot.getIn(path)))
            ) {
                var wixCodeAppData = currentWixCodeAppData.toJS();
                wixCodeAppData.signedAppRenderInfo = currentImmutableSnapshot.getIn(wixCodeConstants.paths.SCARI);
                return wixCodeAppData;
            }
        }

        function createPartialDataToSave(lastImmutableSnapshot, currentImmutableSnapshot) {
            var currentImmutablePagesData = currentImmutableSnapshot.get('pagesData');
            var lastImmutablePagesData = lastImmutableSnapshot.get('pagesData');
            var dataToSave = {
                protectedPagesData: getProtectedPagesData(lastImmutableSnapshot, currentImmutableSnapshot),
                dataDelta: extractDataDelta(lastImmutablePagesData, currentImmutablePagesData),
                dataNodeIdsToDelete: getDataNodeIdsToDelete(currentImmutableSnapshot),
                deletedPageIds: extractDeletedPageIds(lastImmutablePagesData, currentImmutablePagesData),
                id: getSiteId(currentImmutableSnapshot),
                masterPage: extractMasterPage(lastImmutablePagesData, currentImmutablePagesData),
                revision: getRevision(currentImmutableSnapshot),
                version: getVersion(currentImmutableSnapshot),
                updatedPages: extractUpdatedPages(lastImmutablePagesData, currentImmutablePagesData),
                siteMetaData: extractSiteMetaDataIfChanged(lastImmutableSnapshot, currentImmutableSnapshot),
                metaSiteData: extractMetaSiteDataIfChanged(lastImmutableSnapshot, currentImmutableSnapshot),
                wixCodeAppData: getWixCodeAppData(lastImmutableSnapshot, currentImmutableSnapshot)
            };

            if (experiment.isOpen('sv_dpages')) {
                _.assign(dataToSave, {routers: getRouters(lastImmutableSnapshot, currentImmutableSnapshot)});
            }

            if (isAutoFullSave(currentImmutableSnapshot)) {
                _.assign(dataToSave, {initiator: 'auto_save'});
            }

            saveDataFixer.fixData(dataToSave, lastImmutableSnapshot, currentImmutableSnapshot);

            return filterOutUndefinedData(dataToSave);
        }

        function isAutoFullSave(immutableSnapshot) {
            return immutableSnapshot.getIn(['documentServicesModel', 'autoSaveInfo', 'autoFullSaveFlag']);
        }

        function getDataInPath(pathArr, immutableSnapshot, prefix) {
            var data = {};
            prefix = prefix || [];

            if (pathArr.length === 1) {
                data[pathArr[0]] = immutableSnapshot.getIn(prefix.concat(pathArr[0]));
            } else {
                prefix = prefix.concat(pathArr.splice(0, 1));
                data[_.last(prefix)] = getDataInPath(pathArr, immutableSnapshot, prefix);
            }

            return data;
        }

        function getOnlySaveableData(immutableSnapshot) {
            var autosavePaths = jsonConfig.getAutosavePaths();

            var dataToSave = Immutable.fromJS({});

            _.forEach(autosavePaths, function (path) {
                var pathArr = path.split('.');
                var dataItem = getDataInPath(pathArr, immutableSnapshot);
                dataToSave = dataToSave.merge(dataItem);
            });

            return dataToSave;
        }

        function getAutosaveDiffList(snapshots) {
            return immutableDiff.apply(immutableDiff, snapshots.map(getOnlySaveableData)).toJS();
        }

        function assembleAutosaveDto(currentSnapshot, diffs) {
            return {
                siteId: getSiteId(currentSnapshot),
                metaSiteId: currentSnapshot.getIn(['rendererModel', 'metaSiteId']),
                siteVersion: getVersion(currentSnapshot),
                previousDiffId: currentSnapshot.getIn(['documentServicesModel', 'autoSaveInfo', 'previousDiffId']) || null,
                diffPayload: JSON.stringify(diffs)
            };
        }

        function createFullDataToSave(currentImmutableSnapshot) {
            var currentImmutablePagesData = currentImmutableSnapshot.get('pagesData');
            var dataToSave = {
                protectedPagesData: getProtectedPagesData(null, currentImmutableSnapshot),
                dataDelta: extractDataDelta(null, currentImmutablePagesData),
                dataNodeIdsToDelete: getDataNodeIdsToDelete(currentImmutableSnapshot),
                deletedPageIds: [],
                id: getSiteId(currentImmutableSnapshot),
                masterPage: extractMasterPage(null, currentImmutablePagesData),
                revision: getRevision(currentImmutableSnapshot),
                version: getVersion(currentImmutableSnapshot),
                updatedPages: extractUpdatedPages(null, currentImmutablePagesData),
                siteMetaData: getSiteMetaData(currentImmutableSnapshot),
                metaSiteData: getMetaSiteData(currentImmutableSnapshot),
                wixCodeAppData: getWixCodeAppData(null, currentImmutableSnapshot)
            };
            if (experiment.isOpen('sv_dpages')) {
                _.assign(dataToSave, {routers: getRouters(null, currentImmutableSnapshot)});
            }

            saveDataFixer.fixData(dataToSave, null, currentImmutableSnapshot);

            return filterOutUndefinedData(dataToSave);
        }

        function createDocumentForFirstSave(fullSaveDTO) {
            var masterPageStructure = fullSaveDTO.masterPage;
            var pagesContainer = _.find(masterPageStructure.children, {componentType: "wysiwyg.viewer.components.PagesContainer"});
            var pageGroup = pagesContainer.components[0];
            pageGroup.components = fullSaveDTO.updatedPages;

            return _.merge(fullSaveDTO.masterPage, {componentProperties: fullSaveDTO.dataDelta.component_properties}, {themeData: fullSaveDTO.dataDelta.theme_data});
        }

        function convertFullSaveToFirstSaveDto(fullSaveDTO, currentSnapshot) {
            var data = {
                dataNodes: fullSaveDTO.dataDelta.document_data,
                documents: [
                    createDocumentForFirstSave(fullSaveDTO)
                ],
                protectedPagesData: fullSaveDTO.protectedPagesData,
                siteMetaData: fullSaveDTO.siteMetaData,
                metaSiteData: fullSaveDTO.metaSiteData,
                sourceSiteId: fullSaveDTO.id,
                targetName: currentSnapshot.getIn(['documentServicesModel', 'siteName']),
                wixCodeAppData: fullSaveDTO.wixCodeAppData,
                urlFormat: currentSnapshot.getIn(['urlFormatModel', 'format']),
                behaviors: fullSaveDTO.dataDelta.behaviors_data
            };
            if (experiment.isOpen('sv_dpages')) {
                data.routers = fullSaveDTO.routers;
            }

            if (experiment.isOpen('connectionsData')) {
                data.connections = fullSaveDTO.dataDelta.connections_data;
            }

            data.designNodes = fullSaveDTO.dataDelta.design_data;
            return data;
        }

        function createFirstSaveResultObject(firstSaveResponsePayload, rendererModel, documentServicesModel) {
            var rendererModelResult = {
                'rendererModel.siteInfo.siteId': firstSaveResponsePayload.previewModel.siteId,
                'rendererModel.metaSiteId': firstSaveResponsePayload.previewModel.metaSiteModel.metaSiteId,
                'rendererModel.premiumFeatures': firstSaveResponsePayload.previewModel.metaSiteModel.premiumFeatures,
                'rendererModel.siteInfo.documentType': firstSaveResponsePayload.previewModel.metaSiteModel.documentType,
                'rendererModel.clientSpecMap': _.merge(rendererModel.clientSpecMap, firstSaveResponsePayload.previewModel.metaSiteModel.clientSpecMap, function (oldVal, newVal) {
                    if (!newVal.demoMode || !oldVal || oldVal.demoMode) {
                        // We would like to merge the new value only if:
                        //  1. It is not in demo mode
                        //  2. There is no old value
                        //  3. The old value is not in demo mode
                        return _.merge({}, oldVal, newVal);
                    }
                    return oldVal;
                })
            };

            var documentServicesModelResult = {
                'documentServicesModel.neverSaved': false,
                'documentServicesModel.siteName': firstSaveResponsePayload.previewModel.metaSiteModel.siteName,
                'documentServicesModel.metaSiteData': firstSaveResponsePayload.metaSiteData,
                'documentServicesModel.publicUrl': firstSaveResponsePayload.publicUrl,
                'documentServicesModel.usedMetaSiteNames': documentServicesModel.usedMetaSiteNames.push(firstSaveResponsePayload.publicUrl.match(/^.*\/([^\/]+)/)[1]) && documentServicesModel.usedMetaSiteNames,
                'documentServicesModel.version': firstSaveResponsePayload.siteHeader.version,
                'documentServicesModel.revision': firstSaveResponsePayload.siteHeader.revision,
                'documentServicesModel.autoSaveInfo': firstSaveResponsePayload.autoSaveInfo
            };

            if (experiment.isOpen('sv_permissionInfoUpdateOnFirstSave')) {
                documentServicesModelResult['documentServicesModel.permissionsInfo'] = firstSaveResponsePayload.permissionsInfo;
            } else {
                documentServicesModelResult['documentServicesModel.permissionsInfo.isOwner'] = true;
            }

            return _.merge({}, rendererModelResult, documentServicesModelResult, {orphanPermanentDataNodes: []});
        }

        function getEndpointQueryString(rendererModel, documentServicesModel) {
            return urlUtils.toQueryString({
                metaSiteId: rendererModel.metaSiteId,
                editorSessionId: documentServicesModel.editorSessionId
            });
        }

        function sendRequest(url, data, snapshot, onSuccess, onError) {
            ajaxLibrary.ajax({
                type: 'POST',
                dataType: 'json',
                headers: getSaveDocumentHeaders(snapshot),
                url: url,
                data: data,
                success: onSuccess,
                error: onError
            });
        }

        function createErrorObject(response) {
            return {
                errorCode: response.errorCode,
                errorType: getErrorType(response),
                errorDescription: response.errorDescription
            };
        }

        function onFirstSaveComplete(resolve, reject, currentSnapshot, response) {
            if (response.success) {
                var payload = response.payload;
                resolve(createFirstSaveResultObject(payload, currentSnapshot.get('rendererModel').toJS(), currentSnapshot.get('documentServicesModel').toJS()));
            } else {
                reject(createErrorObject(response));
            }
        }

        function hasAutoSaveInfo(snapshot) {
            return Boolean(snapshot.getIn(['documentServicesModel', 'autoSaveInfo']));
        }

        function onPartialSaveComplete(lastSnapshot, currentSnapshot, resolve, reject, bi, response) {
            if (!response.success && isValidationError(response)) {
                bi.event(biEvents.FULL_DOCUMENT_SAVE_ATTEMPTED_AFTER_PARTIAL_FAILURE);
                fullSave(lastSnapshot, currentSnapshot, resolve, reject, bi);
            } else {
                onSaveComplete(currentSnapshot, resolve, reject, bi, response);
            }
        }

        function onSaveComplete(currentSnapshot, resolve, reject, bi, response) {
            if (response.success) {
                var resolveObject = {
                    'documentServicesModel.revision': response.payload.revision,
                    'documentServicesModel.version': response.payload.version,
                    'orphanPermanentDataNodes': []
                };
                if (hasAutoSaveInfo(currentSnapshot)) {
                    _.assign(resolveObject, {'documentServicesModel.autoSaveInfo.previousDiffId': undefined});
                }
                resolve(resolveObject);
            } else {
                var rejectionInfo = createErrorObject(response);

                bi.error(biErrors.SAVE_DOCUMENT_FAILED_ON_SERVER, {
                    serverErrorCode: rejectionInfo.errorCode,
                    errorType: rejectionInfo.errorType,
                    origin: currentSnapshot.get('origin')
                });
                reject(rejectionInfo);
            }
        }

        function onSaveAsTemplateComplete(resolve, reject, response) {
            if (response.success) {
                resolve();
            } else {
                reject(createErrorObject(response));
            }
        }

        function onPublishComplete(resolve, reject, response) {
            if (response.success) {
                resolve({
                    'documentServicesModel.revision': response.payload.revision,
                    'documentServicesModel.version': response.payload.version,
                    'documentServicesModel.isPublished': true
                });
            } else {
                reject(createErrorObject(response));
            }
        }

        function onRequestError(reject, response) {
            reject({
                errorCode: response.status,
                errorType: errorConstants.save.HTTP_REQUEST_ERROR,
                errorDescription: response.statusText
            });
        }

        function getSaveDocumentHeaders(snapshot) {
            return {
                'X-Wix-Editor-Version': 'new',
                'X-Wix-DS-Origin': snapshot.get('origin')
            };
        }

        function getUrlParams(currentSnapshot) {
            return '?' + getEndpointQueryString(currentSnapshot.get('rendererModel').toJS(), currentSnapshot.get('documentServicesModel').toJS());
        }

        function getEditorServerRoot(immutableSnapshot) {
            return immutableSnapshot.getIn(['serviceTopology', 'editorServerRoot']);
        }

        function fullSave(lastSnapshot, currentSnapshot, resolve, reject, bi) {
            var fullSaveEndPoint = getEditorServerRoot(currentSnapshot) + relativeEndPoints.fullSave;
            var url = fullSaveEndPoint + getUrlParams(currentSnapshot);
            var dataToSave = createFullDataToSave(currentSnapshot);

            var onSuccess = _.curry(onSaveComplete)(currentSnapshot, resolve, reject, bi);
            var onError = _.curry(onRequestError)(reject);
            sendRequest(url, dataToSave, currentSnapshot, onSuccess, onError);
        }

        /**
         * @exports documentServices/saveAPI/saveTasks/saveDocument
         */
        return {
            /**
             *
             * @param {object} lastSnapshot - the DAL snapshot, since the last save
             * @param {object} currentSnapshot - the DAL snapshot, as it is right now
             * @param {Function} resolve - resolve this task (success).
             * @param {Function} reject - reject this save (fail). Can be called with errorType, errorMessage
             * @param {{error: Function, event: Function}} bi
             */
            partialSave: function (lastSnapshot, currentSnapshot, resolve, reject, bi) {
                var partialSaveEndPoint = getEditorServerRoot(currentSnapshot) + relativeEndPoints.partialSave;
                var dataToSave = createPartialDataToSave(lastSnapshot, currentSnapshot);
                var url = partialSaveEndPoint + getUrlParams(currentSnapshot);

                var onSuccess = _.curry(onPartialSaveComplete)(lastSnapshot, currentSnapshot, resolve, reject, bi);
                var onError = _.curry(onRequestError)(reject);
                sendRequest(url, dataToSave, currentSnapshot, onSuccess, onError);
            },

            /**
             *
             * @param {object} lastSnapshot - the DAL snapshot, since the last save
             * @param {object} currentSnapshot - the DAL snapshot, as it is right now
             * @param {Function} resolve - resolve this task (success).
             * @param {Function} reject - reject this save (fail). Can be called with errorType, errorMessage
             */
            fullSave: fullSave,

            /**
             *
             * @param {object} lastSnapshot - the DAL snapshot, since the last save
             * @param {object} currentSnapshot - the DAL snaUpshot, as it is right now
             * @param {Function} resolve - resolve this task (success).
             * @param {Function} reject - reject this save (fail). Can be called with errorType, errorMessage
             */
            firstSave: function (lastSnapshot, currentSnapshot, resolve, reject) {
                var firstSaveEndPoint = getEditorServerRoot(currentSnapshot) + relativeEndPoints.firstSave;
                var url = firstSaveEndPoint + getUrlParams(currentSnapshot);
                var fullSaveDTO = createFullDataToSave(currentSnapshot);
                var firstSaveDTO = convertFullSaveToFirstSaveDto(fullSaveDTO, currentSnapshot);

                var onSuccess = _.curry(onFirstSaveComplete)(resolve, reject, currentSnapshot);
                var onError = _.curry(onRequestError)(reject);
                sendRequest(url, firstSaveDTO, currentSnapshot, onSuccess, onError);
            },

            saveAsTemplate: function (lastSnapshot, currentSnapshot, resolve, reject) {
                var saveAsTemplateEndPoint = getEditorServerRoot(currentSnapshot) + relativeEndPoints.saveAsTemplate;
                var siteId = getSiteId(currentSnapshot);
                var url = saveAsTemplateEndPoint + siteId + getUrlParams(currentSnapshot);

                var onSuccess = _.curry(onSaveAsTemplateComplete)(resolve, reject);
                var onError = _.curry(onRequestError)(reject);
                sendRequest(url, null, currentSnapshot, onSuccess, onError);
            },

            /**
             * @param {object} currentSnapshot - the DAL snapshot, as it is right now
             * @param {Function} resolve - resolve this task (success).
             * @param {Function} reject - reject this save (fail). Can be called with errorType, errorMessage
             */
            publish: function (currentSnapshot, resolve, reject) {
                var publishEndPoint = getEditorServerRoot(currentSnapshot) + relativeEndPoints.publish + '/' + getSiteId(currentSnapshot);
                var url = publishEndPoint + getUrlParams(currentSnapshot);

                var onSuccess = _.curry(onPublishComplete)(resolve, reject);
                var onError = _.curry(onRequestError)(reject);

                hooks.executeHook(hooks.HOOKS.PUBLISH.BEFORE);

                ajaxLibrary.ajax({
                    type: 'POST',
                    url: url,
                    headers: getSaveDocumentHeaders(currentSnapshot),
                    success: onSuccess,
                    error: onError
                });
            },

            autosave: function (lastSnapshot, currentSnapshot, resolve, reject) {
                function onAutosaveSuccess(response) {
                    if (response.success) {
                        resolve({
                            'documentServicesModel.autoSaveInfo.previousDiffId': response.payload.diffId
                        });
                    } else {
                        reject(createErrorObject(response));
                    }
                }

                var baseDomain = currentSnapshot.getIn(['serviceTopology', 'baseDomain']);
                var autosaveEndPoint = 'http://editor.' + baseDomain + '/html/autosave/save_diff';
                var diffs = getAutosaveDiffList([lastSnapshot, currentSnapshot]);
                if (diffs.length > 0) {
                    var autosaveDTO = assembleAutosaveDto(currentSnapshot, diffs);
                    ajaxLibrary.ajax({
                        type: 'POST',
                        dataType: 'json',
                        url: autosaveEndPoint,
                        data: autosaveDTO,
                        success: onAutosaveSuccess,
                        error: onRequestError.bind(null, reject)
                    });
                }
            },

            getTaskName: function () {
                return 'saveDocument';
            }
        };

    });
