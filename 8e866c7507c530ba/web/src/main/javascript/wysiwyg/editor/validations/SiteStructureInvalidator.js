define.Class('wysiwyg.editor.validations.SiteStructureInvalidator', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.editor.validations.SiteStructureInvalidatorUtils']);

    function isDataNodeReferencedInCompDataRefList(compData, dataNodeId){
        var reflistKey = _.findKey(compData._schema, "refList") || "items";
        var data = compData.getData();
        var reflist = data && data[reflistKey];
        return reflist && _.contains(reflist, '#' + dataNodeId);
    }

    def.methods(/** @lends wysiwyg.editor.validations.SiteStructureInvalidator*/{
        /**
         * @constructs
         */
        initialize: function(WPreview, invalidationCollector, invalidationUtils) {
            this._referenceToWPreview = WPreview;
            /** @type {wysiwyg.editor.validations.ErrorsInvalidationCollector} **/
            this.invalidationCollector = invalidationCollector;
            /** @type {wysiwyg.editor.validations.SiteStructureInvalidatorUtils} **/
            this.invalidationUtils = invalidationUtils || new this.imports.SiteStructureInvalidatorUtils(WPreview);
        },
        /**
         * Invalidates duplicate pageGroups
         * @param duplicateComponentsViewNodes
         */
        _invalidateDuplicatePageGroups: function(duplicateComponentsViewNodes){
            _.forEach(duplicateComponentsViewNodes, function(compViewNode){
                var compLogic = compViewNode.$logic;
                if(!compLogic){
                    this.invalidationCollector.invalidateUnique("noCompLogic", compViewNode);
                    return true;
                }

                // if it's not really a pageGroup and it just has the ID, it's invalid
                if(!compLogic.isInstanceOfClass("wysiwyg.viewer.components.PageGroup")){
                    this.invalidationCollector.invalidateUnique("notInstanceOfClass", compLogic);
                    return true;
                }
                //if it's not a child of the pages_container, it's invalid
                var parentComp = compLogic.getParentComponent();
                if(!parentComp || !parentComp.isInstanceOfClass("wysiwyg.viewer.components.PagesContainer")){
                    this.invalidationCollector.invalidateUnique("invalidParent", compLogic);
                    return true;
                }
                //otherwise we assume it's valid, at least for the shallow check
                this.invalidationCollector.markValid(compLogic);
            },this);
        },

        /**
         * Invalidates duplicate site segment containers
         * @param duplicateComponentsViewNodes
         */
        _invalidateSiteSegmentContainers: function(duplicateComponentsViewNodes){

            _.forEach(duplicateComponentsViewNodes, function(compViewNode){
                var compLogic = compViewNode.$logic;
                if(!compLogic){
                    this.invalidationCollector.invalidateUnique('missingContainers', compViewNode.id);
                    this.invalidationCollector.invalidateUnique("noCompLogic", compViewNode);
                    return true;
                }

                // if it's not really a site segment and it just has the ID, it's invalid
                if(!compLogic.isSiteSegment()){
                    this.invalidationCollector.invalidateUnique("notInstanceOfClass", compLogic);
                    return true;
                }
                //if it's not a child of the site structure, it's invalid
                var parentComp = compLogic.getParentComponent();
                if(!parentComp || !parentComp.isInstanceOfClass("wysiwyg.viewer.components.WSiteStructure")){
                    this.invalidationCollector.invalidateUnique("invalidParent", compLogic);
                    return true;
                }
                //otherwise we assume it's valid, at least for the shallow check
                this.invalidationCollector.markValid(compLogic);
            },this);
        },

        /**
         * Invalidates duplicate components which aren't handled elsewhere.
         * Note that in this scenario we don't have enough information to invalidate the component in another way, so we set the first node in the array to be our 'valid' one.
         * @param duplicateComponentsViewNodes
         */
        _invalidateNormalDuplicates: function(duplicateComponentsViewNodes){
            var invalidComponent, invalidComps, validComp;

            _.forEach(duplicateComponentsViewNodes, function(val){
                invalidComponent = val.$logic;
                if(!invalidComponent){
                    this.invalidationCollector.invalidateUnique("noCompLogic", val);
                    invalidComps.push(val);
                } else if(!validComp){
                    validComp = val.$logic;
                    this.invalidationCollector.markValid(validComp);
                } else{
                    this.invalidationCollector.invalidateUnique("duplicates.unknownDuplicate", invalidComponent);
                }
            }, this);

        },

        /**
         * If we have duplicate site segment / pagegroup containers and they are siblings, they may not have failed invalidation before.
         * If this is the case, we try to invalidate one of them. Currently, this only invalidates it if it is empty
         */
        _invalidateDuplicateEmptySiblings: function(){
            var validComponents = this.invalidationCollector.getMarkedValid();
            if(validComponents.length <= 1){
                return;
            }

            var revalidatedComponents = [],
                supposedlyValidComponent;

            while(validComponents.length > 0){
                supposedlyValidComponent = validComponents.pop();
                if(supposedlyValidComponent.getChildren().length === 0){
                    this.invalidationCollector.invalidateUnique("duplicates.siblings", supposedlyValidComponent);
                } else{
                    revalidatedComponents.push(supposedlyValidComponent);
                }
            }

            this.invalidationCollector.overrideMarkedValid(revalidatedComponents);
            if(revalidatedComponents.length > 1){
                this.invalidationCollector.saveErrorToAggregation('UNFIXABLE_10104_DUPLICATE_SIBLINGS');
            }

        },

        /**
         * invalidates site segments which are missing
         */
        invalidateMissingSiteSegmentContainers: function () {
            var siteSegmentIds = ["SITE_HEADER", "PAGES_CONTAINER", "SITE_FOOTER"];
            _.forEach(siteSegmentIds, function(compId){
                var compViewNode = this._referenceToWPreview.getCompByID(compId);
                //no view node- completely missing
                if(!compViewNode){
                    this.invalidationCollector.invalidateUnique('missingContainers', compId);
                    return true;
                }
                this._invalidateSiteSegmentContainers([compViewNode]);
            },this);
        },

        /**
         * invalidates duplicate components, according to their type
         * @param duplicateComponentsViewNodes
         * @param compId
         */
        invalidateDuplicateComponents: function(duplicateComponentsViewNodes, compId){
            var siteSegmentContainerIds = ["SITE_HEADER", "SITE_FOOTER", "PAGES_CONTAINER"],
                pageGroupId = "SITE_PAGES";

            //first step - invalidate by component type
            switch(true){
                case (_.contains(siteSegmentContainerIds, compId)):
                    this._invalidateSiteSegmentContainers(duplicateComponentsViewNodes);
                    break;
                case (compId === pageGroupId):
                    this._invalidateDuplicatePageGroups(duplicateComponentsViewNodes);
                    break;
                default:
                    this._invalidateNormalDuplicates(duplicateComponentsViewNodes);
                    break;
            }
            //these both need to run
            this._invalidateDuplicateEmptySiblings();
            this._invalidateDuplicateWithWrongParent();
        },

        /**
         * Note that this is run once at the end of the flow for invalidating duplicates.
         * At this point, if there are no 'valid' components, then the duplicate components were both previously invalidated and the 'valid' one is not a child of the site_structure
         * @private
         */
        _invalidateDuplicateWithWrongParent: function(){
            var validComponents = this.invalidationCollector.getMarkedValid();
            if(validComponents.length === 0){
                this.invalidationCollector.saveErrorToAggregation('UNFIXABLE_10104_INVALID_PARENTS'); //_tryToFixDuplicates
            }
        },
        /**
         * Invalidates all components from the validation error given by the server
         * @param {dataReferenceMismatch[]} dataReferenceMismatches
         */
        invalidateAllCompsWithDataReferenceMismatches: function(dataReferenceMismatches){
            _.forEach(dataReferenceMismatches, function(mismatchInfo){ //note that dataReferenceMismatches is given to us from server, and has the dataNodeId and referringComponentId that we needed
                var componentId = mismatchInfo.referringComponentId,
                    dataNodeId = mismatchInfo.dataNodeId;
                this.invalidateSingleCompWithDataReferenceMismatch(componentId, dataNodeId);
            },this);
        },

        /**
         *
         * Invalidates a single component (both mobile and desktop version) if their dataNode ID matches the invalid dataNode ID given to us by the server
         * @param compId
         * @param dataNodeId
         */
        invalidateSingleCompWithDataReferenceMismatch: function(compId, dataNodeId){
            var comp = this._referenceToWPreview.getCompLogicById(compId);
            var compDataItem = comp.getDataItem();
            var compData = compDataItem && compDataItem.getData();
            var compDataId = (compData && compData.id) || this.invalidationUtils.getDataQueryIdFromViewNode(comp.$view);

            if(compDataId === dataNodeId){
                this._invalidateDataReferenceMismatchForDataDirectlyReferencedByComp(comp, compId, dataNodeId);
            } else {
                this._invalidateDataReferenceMismatchForDataReferencedByCompData(comp, dataNodeId);

            }
        },
        _invalidateDataReferenceMismatchForDataReferencedByCompData: function(comp, dataNodeId){
            //this means the dataNodeId is probably part of a reflist from the compData
            var dataManager = this._referenceToWPreview.getPreviewManagers().Data;
            var invalidDataItem = dataManager.getDataByQuery('#' + dataNodeId);
            var invalidDataItemId = invalidDataItem && invalidDataItem.getData().id;
            if(invalidDataItem && invalidDataItemId && !dataManager.dirtyDataObjectsMap[invalidDataItemId]){
                //invalidate as ref to data from reflist, which is not dirty
                this.invalidationCollector.invalidateUnique('dataReferences.notDirty', invalidDataItem);
                this.invalidationCollector.saveErrorToAggregation('DATAQUERY_TO_DATA_BUT_NOT_DIRTY', {dataType: invalidDataItem._dataType, className: comp.$className});
            } else if(!invalidDataItem){
                var compDataItem = comp.getDataItem();
                if(isDataNodeReferencedInCompDataRefList(compDataItem, dataNodeId)){
                    this.invalidationCollector.invalidateUnique('dataReferences.missing.indirectDataReference', {dataItem: compDataItem, invalidId: dataNodeId});
                    this.invalidationCollector.saveErrorToAggregation('INVALID_DATAQUERY_MISSING_DATA_FROM_REFLIST', {className: comp.$className});
                }
            }
        },
        _invalidateDataReferenceMismatchForDataDirectlyReferencedByComp: function(desktopComp, compId, dataNodeId){
            var mobileComp = this._referenceToWPreview.getCompLogicById(compId, Constants.ViewerTypesParams.TYPES.MOBILE);
            var hasDesktop = !!desktopComp;
            var hasMobile = !!mobileComp && desktopComp !== mobileComp;

            // we take the dataquery id from the view node, because if there is an invalid dataQuery where the data is missing,
            // the comp won't have data and therefore we can't know which ID it was using to look for the data.
            var desktopDataId = this.invalidationUtils.getDataQueryIdFromViewNode(desktopComp.$view),
                mobileDataId = this.invalidationUtils.getDataQueryIdFromViewNode(mobileComp.$view),
                isDesktopIdInvalid = hasDesktop && desktopDataId === dataNodeId,
                isMobileIdInvalid = hasMobile && mobileDataId === dataNodeId;

            if(hasDesktop && hasMobile){
                if(isDesktopIdInvalid && isMobileIdInvalid){
                    this.invalidationCollector.invalidateUnique('dataReferences.missing.mobile', mobileComp);
                    this.invalidationCollector.invalidateUnique('dataReferences.missing.desktop', desktopComp);
                    this.invalidationCollector.saveErrorToAggregation('INVALID_DATAQUERY_BOTH_STRUCTURES');
                } else if(isMobileIdInvalid){
                    this.invalidationCollector.invalidateUnique('dataReferences.mismatch.mobile', {comp: mobileComp, dataItem: desktopComp.getDataItem()});
                    this.invalidationCollector.saveErrorToAggregation('INVALID_DATAQUERY_ONLY_MOBILE');
                } else if(isDesktopIdInvalid){ // if we reach this if, it should always be true..
                    this.invalidationCollector.invalidateUnique('dataReferences.mismatch.desktop', {comp: desktopComp, dataItem: mobileComp.getDataItem()});
                    this.invalidationCollector.saveErrorToAggregation('INVALID_DATAQUERY_ONLY_DESKTOP');
                }
            } else if(isMobileIdInvalid){
                this.invalidationCollector.invalidateUnique('dataReferences.missing.mobile', mobileComp);
                this.invalidationCollector.saveErrorToAggregation('COMP_IN_MOBILE_BUT_NOT_DESKTOP');
            } else if(isDesktopIdInvalid){
                this.invalidationCollector.invalidateUnique('dataReferences.missing.desktop', desktopComp);
                this.invalidationCollector.saveErrorToAggregation('COMP_IN_DESKTOP_BUT_NOT_MOBILE');
            }
        }
    });
});
