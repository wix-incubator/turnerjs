define(['lodash',
    'documentServices/anchors/anchors',
    'documentServices/siteAccessLayer/postUpdateOperations',
    'documentServices/utils/utils'
], function (_, anchors, postUpdateOperations, dsUtils) {
    "use strict";

    var privateScopes = {};

    function PrivateScope(privateServices, updateProcessDoneCallback) {
        this.clearLastUpdate();

        this.ps = privateServices;
        this.siteUpdatedCallbacks = [];
        this.updateProcessDoneCallback = updateProcessDoneCallback;
    }

    PrivateScope.prototype = {
        clearLastUpdate: function () {
            this.isUpdatingAnchors = dsUtils.DONT_CARE;
            this.batchedItemsCount = 0;
            this.postUpdateOperations = [];
            this.addedToBatchItems = [];
            this.affectedComps = [];
            this.singleCompFunctions = [];
            this.methodNames = [];
            this.batchClosed = false;
            this.isDuringBatch = false;
            this.waitingForTransition = false;
        },

        processSiteUpdated: function(){
            if (this.isDuringBatch) {
                return;
            }
            var shouldForceUpdate = postUpdateOperations.runPostUpdateOperations(this.ps, this.ps.siteAPI);
            _.forEach(this.postUpdateOperations, function (postUpdateOperation) {
                postUpdateOperation.operation();
            });
            if (this.updateAnchorsOnNextRelayout){
                anchors.updateAnchorsForMultipleComps(this.ps);
                this.updateAnchorsOnNextRelayout = false;
            }

            var methodNames = this.methodNames;
            if (shouldForceUpdate) {
                this.ps.siteAPI.forceUpdate(false, this.affectedComps, methodNames);
                return;
            }

            var finishedUpdate = this.addedToBatchItems;
            this.clearLastUpdate();

            _.forEach(this.siteUpdatedCallbacks, function(callback){
                try {
                    callback(finishedUpdate, methodNames);
                } catch (e){
                    utils.log.error(e);
                    if (this.ps.siteAPI.isDebugMode() && !window.karmaIntegration){
                        /*eslint block-scoped-var:0*/
                        /*eslint no-undef:0*/
                        /*eslint no-alert:0*/
                        window.alert("you have error (probably in the editor) !!! look at the console");
                    }

                }
            }, this);

            this.updateProcessDoneCallback(finishedUpdate);
        },

        onSiteUpdated: function () {
            if (this.isDuringBatch || (this.waitingForTransition && this.ps.siteAPI.isSiteBusyIncludingTransition())){
                return;
            }
            this.waitingForTransition = false;
            this.processSiteUpdated();
        },

        listenToPageTransitionEnded: function(){
            var actionsAspect = this.ps.siteAPI.getSiteAspect('actionsAspect');
            var self = this;
            actionsAspect.registerNavigationComplete(function(){
                self.waitingForTransition = false;
                self.processSiteUpdated();
            });
        }
    };

    function SiteUpdatesHandler(privateServices, updateProcessDoneCallback) {
        this.siteId = privateServices.siteAPI.getSiteId();
        var privates = new PrivateScope(privateServices, updateProcessDoneCallback);
        privateScopes[this.siteId] = privates;
        privates.boundOnSiteUpdate = privates.onSiteUpdated.bind(privates);
        privateServices.siteAPI.registerToDidLayout(privates.boundOnSiteUpdate);
    }

    function getPrivates() {
        return privateScopes[this.siteId];
    }

    function updateViewer() {
        var privates = getPrivates.call(this);
        privates.affectedComps = _.reduce(privates.singleCompFunctions, function (acc, isSingleCompFunc) {
            var compId = _.isFunction(isSingleCompFunc) ? isSingleCompFunc() : false;
            if (!acc || !compId) {
                return false;
            }
            return _(acc).concat([compId]).uniq().value();
        }, []);
        if (privates.ps.siteAPI.getQueryParam('dsQTrace')) {
            /*eslint no-console:0*/
            console.log('VIEWER RENDERED FROM Q', privates.addedToBatchItems);
        }
        privates.ps.siteAPI.forceUpdate(privates.isUpdatingAnchors === dsUtils.YES, privates.affectedComps, privates.methodNames, privates.refreshRootsData);
    }

    SiteUpdatesHandler.prototype = {
        addItemToUpdateBatch: function (itemId, params) {
            var privates = getPrivates.call(this);
            if (!this.canAddItemToUpdateBatch(params)) {
                throw "the site is during update or this item isn't compatible with the current batch";
            }
            privates.batchedItemsCount++;
            privates.addedToBatchItems.push(itemId);
            if (params.isUpdatingAnchors !== dsUtils.DONT_CARE) {
                privates.isUpdatingAnchors = params.isUpdatingAnchors;
            }
            privates.batchClosed = !!params.noBatchingAfter;
            privates.isDuringBatch = true;
            privates.singleCompFunctions.push(params.singleComp);
            privates.waitingForTransition = privates.waitingForTransition || params.waitingForTransition;
            privates.methodNames = _.union(privates.methodNames, [params.methodName]);
            privates.refreshRootsData = !params.noRefresh;
            return privates.addedToBatchItems.length === 1;
        },

        closeBatch: function () {
            var privates = getPrivates.call(this);
            if (_.isEmpty(privates.addedToBatchItems)) {
                throw "there are no items in the batch..";
            }
            privates.batchClosed = true;
        },

        /**
         *
         * @param params
         * @returns {boolean}
         */
        canAddItemToUpdateBatch: function (params) {
            var privates = getPrivates.call(this);
            var canAdd = !privates.ps.siteAPI.isSiteBusyIncludingTransition();
            canAdd = canAdd && !privates.batchClosed;
            canAdd = canAdd && (privates.isUpdatingAnchors === dsUtils.DONT_CARE || params.isUpdatingAnchors === dsUtils.DONT_CARE || privates.isUpdatingAnchors === params.isUpdatingAnchors);
            return canAdd;
        },

        removeItemFromUpdateBatch: function (itemId) {
            var privates = getPrivates.call(this);
            if (!_.includes(privates.addedToBatchItems, itemId)) {
                throw "no such item in the batch";
            }
            privates.batchedItemsCount--;
            _.remove(privates.postUpdateOperations, {itemId: itemId});
        },

        addItemPostUpdateOperation: function (operation, itemId) {
            var privates = getPrivates.call(this);
            if (!_.includes(privates.addedToBatchItems, itemId)) {
                throw "no such item in the batch";
            }
            privates.postUpdateOperations.push({
                itemId: itemId,
                operation: operation
            });
        },

        closeBatchAndUpdate: function () {
            var privates = getPrivates.call(this);
            privates.isDuringBatch = false;
            if (privates.isUpdatingAnchors === dsUtils.YES) {
                privates.updateAnchorsOnNextRelayout = true;
            }
            if (privates.batchedItemsCount > 0) {
                if (privates.waitingForTransition){
                    privates.listenToPageTransitionEnded();
                }

                updateViewer.call(this);
            } else if (!_.isEmpty(privates.addedToBatchItems)) {
                var finishedUpdate = privates.addedToBatchItems;
                privates.clearLastUpdate();
                privates.updateProcessDoneCallback(finishedUpdate);
            }
        },

        registerToSiteUpdated: function (callback) {
            var privates = getPrivates.call(this);
            privates.siteUpdatedCallbacks.push(callback);
        },

        dispose: function () {
            var privates = getPrivates.call(this);
            privates.clearLastUpdate();
            privates.siteUpdatedCallbacks = [];
            privates.ps.siteAPI.unRegisterFromDidLayout(privates.boundOnSiteUpdate);
            privates.updateProcessDoneCallback = null;
            privates.disposed = true;
            this.siteId = null;
        }
    };

    return SiteUpdatesHandler;
});
