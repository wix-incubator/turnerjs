define(['lodash', 'dataFixer/helpers/runOnAllCompsRecursively'], function (_, runOnAllCompsRecursively) {
    'use strict';

    function fixMasterPage(masterPageDocumentData) {
        if (masterPageDocumentData.SITE_STRUCTURE) {
            masterPageDocumentData.masterPage = masterPageDocumentData.SITE_STRUCTURE;
        }
        if (!masterPageDocumentData.masterPage) {
            masterPageDocumentData.masterPage = {};
        }
        masterPageDocumentData.masterPage.id = 'masterPage';
        delete masterPageDocumentData.SITE_STRUCTURE;
    }

    function hasCorruptedWidth(comp) {
        return _.get(comp, 'layout.width') === 0;
    }

    function hasCorruptedHeight(comp) {
        return _.get(comp, 'layout.height') === 0;
    }

    function setDefaultSizesForCorruptedComponents(comp) {
        if (hasCorruptedWidth(comp)) {
            _.set(comp, 'layout.width', 100);
        }
        if (hasCorruptedHeight(comp)) {
            _.set(comp, 'layout.height', 100);
        }
    }

    function fixAnchorDistances(children) {
        _.forEach(children, function(child) {
            _.forEach(_.get(child, 'layout.anchors'), function(anchor) {
                switch (child.id) {
                    case 'SITE_FOOTER':
                        if (anchor.type === 'BOTTOM_PARENT') {
                            anchor.distance = 0;
                        }
                        break;

                    case 'PAGES_CONTAINER':
                        if (anchor.type === 'BOTTOM_TOP' && anchor.locked && anchor.distance >= 70) {
                            anchor.originalValue = 0;
                            anchor.locked = false;
                        }
                        break;
                }
            });
        });
    }

    function fixCorruptedMasterPageComponentLayouts(masterPageChildren, siteWidthForHeaderAndFooter) {
        var hasCorruption = false;

        _.forEach(['SITE_HEADER', 'SITE_FOOTER'], function (id) {
            var comp = _.find(masterPageChildren, {id: id});
            if (hasCorruptedWidth(comp)) {
                hasCorruption = true;
            }
            if (hasCorruptedHeight(comp)) {
                _.set(comp, 'layout.height', 100);
                hasCorruption = true;
            }

            _.set(comp, 'layout.width', siteWidthForHeaderAndFooter);
        });
        if (hasCorruption) {
            var rootCompsOnMasterPage = _.reject(masterPageChildren, {id: 'PAGES_CONTAINER'});
            runOnAllCompsRecursively(rootCompsOnMasterPage, [setDefaultSizesForCorruptedComponents]);
        }
    }

    function fixMasterPageStructure(masterPageStructure, masterPageData) {
        var desktopMasterPageComps = masterPageStructure.children;
        var mobileMasterPageComps = masterPageStructure.mobileComponents;
        var siteWidthForHeaderAndFooter = _.get(masterPageData, 'masterPage.renderModifiers.siteWidth', 980);
        fixMissingMasterPagePartsIfNeeded(desktopMasterPageComps);
        fixCorruptedMasterPageComponentLayouts(desktopMasterPageComps, siteWidthForHeaderAndFooter);
        fixMissingMasterPagePartsIfNeeded(mobileMasterPageComps);
        fixCorruptedMasterPageComponentLayouts(mobileMasterPageComps, 320);
        fixAnchorDistances(mobileMasterPageComps);
    }

    var mandatoryMasterPageParts = [
        {componentType: 'wysiwyg.viewer.components.PagesContainer', id: 'PAGES_CONTAINER'},
        {componentType: 'wysiwyg.viewer.components.FooterContainer', id: 'SITE_FOOTER'},
        {componentType: 'wysiwyg.viewer.components.HeaderContainer', id: 'SITE_HEADER'}
    ];

    function fixMissingMasterPagePartsIfNeeded(comps) {
        _.forEach(mandatoryMasterPageParts, function (mandatoryPart) {
            var partByID = _.find(comps, 'id', mandatoryPart.id);
            if (!partByID) {
                var partByType = _.find(comps, 'componentType', mandatoryPart.componentType);
                if (partByType) {
                    partByType.id = mandatoryPart.id;
                }
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/masterPageFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            if (pageJson.structure && pageJson.structure.type === 'Document') {
                pageJson.structure.id = 'masterPage';
                fixMasterPage(pageJson.data.document_data);
                fixMasterPageStructure(pageJson.structure, pageJson.data.document_data);
            }
            return pageJson;
        }
    };

    return exports;
});
