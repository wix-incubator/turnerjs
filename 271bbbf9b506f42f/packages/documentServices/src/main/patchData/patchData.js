define([
    'lodash',
    'utils',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/patchData/patchList',
    'documentServices/page/pageData'
], function (
    _,
    utils,
    siteMetadata,
    patchList,
    pageData) {
    'use strict';

    var ajaxLibrary = utils.ajaxLibrary;

    function dataToPatchExists(privateServices) {
        var autosaveInfo = privateServices.dal.get(privateServices.pointers.general.getAutosaveInfo());
        return autosaveInfo && autosaveInfo.shouldRestoreDiffs;
    }

    function isAutosaveRestoreDisabled() {
        return utils.urlUtils.getParameterByName('autosaveRestore') === 'false';
    }

    function getDataToPatch(privateServices, onSuccess, onError) {
        var baseDomain = privateServices.dal.get(privateServices.pointers.general.getServiceTopology()).baseDomain;
        var diffsEndpoint = 'http://editor.' + baseDomain + '/html/autosave/get_diffs/';
        var siteId = siteMetadata.getProperty(privateServices, 'SITE_ID');
        var metaSiteId = siteMetadata.getProperty(privateServices, 'META_SITE_ID');
        var siteVersion = siteMetadata.getProperty(privateServices, 'SITE_VERSION');
        var url = diffsEndpoint + siteId + '?metaSiteId=' + metaSiteId + '&siteVersion=' + siteVersion;
        ajaxLibrary.ajax({
            type: 'GET',
            dataType: 'json',
            url: url,
            success: function (response) {
                if (response.success) {
                    onSuccess(response.payload);
                } else {
                    onError(new Error('Failed to fetch diffs. error code: ' + response.errorCode));
                }
            },
            error: function (response) {
                onError(new Error('Error while fetching diffs. status code: ' + response.status));
            }
        });
    }

    function revertAutosaveChanges(privateServices, beforeSnapshot, paths) {
        _.forEach(paths, function (path) {
            var pathArr = path.split('.');
            privateServices.dal.full.setByPath(pathArr, _.get(beforeSnapshot, pathArr));
        });
    }

    return {
        /**
         *
         * @param privateServices
         * @param {DocumentServicesConfiguration} config
         * @param {applyPatchSuccessCallback} onSuccess
         * @param {function} onError
         */
        applyPatchIfExists: function (privateServices, config, onSuccess, onError) {
            /**
             *
             * @param {autosavePatchPayload} payload
             */
            function onGetSuccess(payload) {
                var diffs = _(payload.diffPayloads)
                    .map('payload')
                    .map(JSON.parse)
                    .value();
                var payloadsCount = diffs.length;
                var additionalData = {
                    patches: payloadsCount,
                    patchesSize: _.sum(diffs, 'length'),
                    pagesCount: pageData.getNumberOfPages(privateServices)
                };

                utils.performance.finish('autosave-load-ajax', true, additionalData);
                utils.performance.start('autosave-load-apply');

                diffs = _.flatten(diffs);

                privateServices.dal.takeSnapshot('before-autosave-apply');

                try {
                    patchList.applyPatchList(privateServices, diffs);

                    var previousDiffPointer = privateServices.pointers.general.getAutoSaveInnerPointer('previousDiffId');
                    privateServices.dal.set(previousDiffPointer, payload.latestDiffId);

                    var autosaveCountPointer = privateServices.pointers.general.getAutoSaveInnerPointer('autosaveCount');
                    privateServices.dal.set(autosaveCountPointer, payloadsCount);

                    onSuccess(null, {changesApplied: true});
                } catch (e) {
                    var beforeSnapshot = privateServices.dal.getLastSnapshotByTagName('before-autosave-apply');
                    revertAutosaveChanges(privateServices, beforeSnapshot, config.autosavePaths);

                    utils.log.error(e, e.patch);
                    onError(e);
                } finally {
                    privateServices.dal.removeLastSnapshot('before-autosave-apply');
                    utils.performance.finish('autosave-load-apply', true, _.assign(additionalData, {diffs: diffs.length}));
                }

                privateServices.dal.takeSnapshot('saveDocumentAutosave');
            }

            if (dataToPatchExists(privateServices) && !isAutosaveRestoreDisabled()) {
                utils.performance.start('autosave-load-ajax');
                getDataToPatch(privateServices, onGetSuccess, onError);
            } else {
                onSuccess(null, {changesApplied: false});
            }
        }
    };
});

/**
 * Information about autosave patch payload
 * @typedef {Object} autosavePatchPayload
 * @property {string[]} diffPayloads
 * @property {string} latestDiffId
 */

/**
 * @typedef {Object} SuccessDetails
 * @property {boolean} changesApplied
 */

/**
 * @callback applyPatchSuccessCallback
 * @param {SuccessDetails} successDetails
 */
