define(['lodash', 'documentServices/dataModel/dataIds'], function(_, dataIds) {
    'use strict';

    var DESIGN_TYPES_REF_KEYS = {
        MediaContainerDesignData: ['background'],
        BackgroundMedia: ['mediaRef', 'imageOverlay'],
        MediaTransforms: [],
        WixVideo: ['posterImageRef'],
        Image: ['link', 'originalImageDataRef']
    };

    var VALID_DESIGN_ITEM = 'VALID';
    var INVALID_DESIGN_ITEM = 'INVALID';
    var INVALID_DESIGN_ITEM_REFS = 'ONLY_REFS_INVALID';


    function fixSiteDuplicatedReferencedDesignItemsInData(/** ps */ps) {
        var includeMasterPage = true;
        var allPageIds = _.map(ps.pointers.page.getNonDeletedPagesPointers(includeMasterPage), 'id');
        var siteDesignDataFixModel = {
            idToPageId: {},
            SKIPPED_PAGES_TO_FIX: {}
        };
        fixDesignDataOnPages(ps, allPageIds, siteDesignDataFixModel);
    }

    function fixDesignDataOnPages(ps, pageIds, siteDesignDataFixModel) {
        _.forEach(pageIds, function (pageId) {
            fixPageDesignDataItemsWithDuplicateIds(ps, pageId, siteDesignDataFixModel);
        });

        _.forEach(siteDesignDataFixModel.SKIPPED_PAGES_TO_FIX, function (pageWithDataToFix, pageId) {
            fixPageDesignDataItemsWithDuplicateIds(ps, pageId, siteDesignDataFixModel);
        });
    }

    function fixPageDesignDataItemsWithDuplicateIds(ps, pageId, siteDesignDataFixModel) {
        var pageDesignDataPointer = ps.pointers.page.getPageDesignData(pageId);
        var pageDesignDataKeys = ps.dal.full.getKeys(pageDesignDataPointer);

        var oldIDsToFixedDesignItems = createValidPageDesignItems(ps, pageId, pageDesignDataKeys, siteDesignDataFixModel);

        _.forEach(oldIDsToFixedDesignItems, function(fixedDesignItem, oldDesignItemId) {
            var itemToRemovePointer = ps.pointers.data.getDesignItem(oldDesignItemId, pageId);
            ps.dal.full.remove(itemToRemovePointer);
            var itemToAddPointer = ps.pointers.data.getDesignItem(fixedDesignItem.id, pageId);
            ps.dal.full.set(itemToAddPointer, fixedDesignItem);
        });
    }

    function createValidPageDesignItems(/** ps */ps, pageId, pageDesignDataKeys, siteDesignDataFixModel) {
        var designItemsKeysToFixInPage = getDesignItemsKeysOnlyForTypes(ps, pageId, pageDesignDataKeys, DESIGN_TYPES_REF_KEYS);

        var oldIdsToNewIdsInPage = {};
        var fixedDesignItems = {};
        _.forEach(designItemsKeysToFixInPage, function (designItemKeyToFix) {
            var currentId = designItemKeyToFix;
            var fixedDesignItem = createValidDesignItem(ps, designItemKeyToFix, pageId, oldIdsToNewIdsInPage, siteDesignDataFixModel);
            if (fixedDesignItem) {
                fixedDesignItems[currentId] = fixedDesignItem;
            }
        });

        return fixedDesignItems;
    }

    function getDesignItemsKeysOnlyForTypes(ps, pageId, pageDesignDataItemsKeys, designTypesToFilter) {
        return _.filter(pageDesignDataItemsKeys, function(designItemKey) {
            var designPointer = ps.pointers.data.getDesignItem(designItemKey, pageId);
            var designTypePointer = ps.pointers.getInnerPointer(designPointer, 'type');
            return designTypesToFilter[ps.dal.full.get(designTypePointer)];
        });
    }

    function createValidDesignItem(/** ps */ps, designItemKeyToFix, pageId, oldIdsToNewIdsInPage, siteDesignDataFixModel) {
        var validationResult = validateDesignItem(ps, designItemKeyToFix, pageId, siteDesignDataFixModel);

        updateAndCountDesignItemIdOnPage(designItemKeyToFix, pageId, siteDesignDataFixModel);

        if (validationResult === VALID_DESIGN_ITEM) {
            return null;
        }
        var shouldChangeRefsOnly = validationResult === INVALID_DESIGN_ITEM_REFS;
        var designItemPointer = ps.pointers.data.getDesignItem(designItemKeyToFix, pageId);
        return fixDesignItem(ps, designItemPointer, oldIdsToNewIdsInPage, !shouldChangeRefsOnly);
    }

    function updateAndCountDesignItemIdOnPage(designItemKeyToCount, pageId, siteDesignDataFixModel) {
        if (!siteDesignDataFixModel.idToPageId[designItemKeyToCount]) {
            siteDesignDataFixModel.idToPageId[designItemKeyToCount] = pageId;
        } else if (siteDesignDataFixModel.idToPageId[designItemKeyToCount] !== pageId) {
            var firstPageWithId = siteDesignDataFixModel.idToPageId[designItemKeyToCount];
            var skippedPagesToFix = siteDesignDataFixModel.SKIPPED_PAGES_TO_FIX;
            skippedPagesToFix[firstPageWithId] = skippedPagesToFix[firstPageWithId] || {};

            var idMetaData = skippedPagesToFix[firstPageWithId][designItemKeyToCount];
            if (!idMetaData) {
                idMetaData = {id: designItemKeyToCount, isReferencedMoreThanOnce: true};
                skippedPagesToFix[firstPageWithId][designItemKeyToCount] = idMetaData;
            }
        }
    }

    function validateDesignItem(/** ps */ps, designItemKeyToFix, pageId, siteDesignDataFixModel) {
        var isItemIdInAnotherPage = isDesignItemIdAlsoInOtherPage(designItemKeyToFix, pageId, siteDesignDataFixModel);
        if (isItemIdInAnotherPage) {
            return INVALID_DESIGN_ITEM;
        }

        var isSomeRefInvalid = isSomeDesignItemRefAlsoInOtherPage(ps, designItemKeyToFix, pageId, siteDesignDataFixModel);
        return isSomeRefInvalid ? INVALID_DESIGN_ITEM_REFS : VALID_DESIGN_ITEM;
    }

    function isSomeDesignItemRefAlsoInOtherPage(ps, designItemKeyToFix, pageId, siteDesignDataFixModel) {
        var designPointer = ps.pointers.data.getDesignItem(designItemKeyToFix, pageId);
        var designTypePointer = ps.pointers.getInnerPointer(designPointer, 'type');
        var refsFieldsToCheck = DESIGN_TYPES_REF_KEYS[ps.dal.full.get(designTypePointer)];

        return _.some(refsFieldsToCheck, function (referenceFieldName) {
            var designRefPointer = ps.pointers.getInnerPointer(designPointer, referenceFieldName);
            var refValue = stripHashIfExists(ps.dal.full.get(designRefPointer));
            return isDesignItemIdAlsoInOtherPage(refValue, pageId, siteDesignDataFixModel);
        });
    }

    function isDesignItemIdAlsoInOtherPage(designItemId, pageId, siteDesignDataFixModel) {
        var idToOriginalPageId = siteDesignDataFixModel.idToPageId;
        return (idToOriginalPageId[designItemId] && idToOriginalPageId[designItemId] !== pageId) ||
            _.get(siteDesignDataFixModel.SKIPPED_PAGES_TO_FIX, [pageId, designItemId, 'isReferencedMoreThanOnce']);
    }

    function fixDesignItem(/** ps */ps, designItemPointer, oldIdsToNewIdsInPage, shouldFixItemID) {
        var designItemToFix = ps.dal.full.get(designItemPointer);
        fixDesignItemReferences(designItemToFix, oldIdsToNewIdsInPage);
        if (shouldFixItemID) {
            fixDesignItemID(designItemToFix, oldIdsToNewIdsInPage);
        }
        return designItemToFix;
    }

    function fixDesignItemID(designItemToFix, oldIdsToNewIdsInPage) {
        var currentIdValue = stripHashIfExists(designItemToFix.id);
        var generatedNewDesignId = oldIdsToNewIdsInPage[currentIdValue] || dataIds.generateNewDesignId();
        designItemToFix.id = generatedNewDesignId;
        oldIdsToNewIdsInPage[currentIdValue] = generatedNewDesignId;
    }

    function fixDesignItemReferences(designItemToFix, oldIdsToNewIdsInPage) {
        var referenceFieldsToFix = DESIGN_TYPES_REF_KEYS[designItemToFix.type];
        _.forEach(referenceFieldsToFix, function (referenceFieldName) {
            var refValue = designItemToFix[referenceFieldName];
            if (!_.isEmpty(refValue)) {
                var currentRefValue = stripHashIfExists(refValue);
                var generatedNewDesignId = oldIdsToNewIdsInPage[currentRefValue] || dataIds.generateNewDesignId();
                designItemToFix[referenceFieldName] = '#' + generatedNewDesignId;
                oldIdsToNewIdsInPage[currentRefValue] = generatedNewDesignId;
            }
        });
    }

    function stripHashIfExists(value) {
        return _.isString(value) ? value.replace('#', '') : value;
    }

    return {
        exec: fixSiteDuplicatedReferencedDesignItemsInData
    };
});
