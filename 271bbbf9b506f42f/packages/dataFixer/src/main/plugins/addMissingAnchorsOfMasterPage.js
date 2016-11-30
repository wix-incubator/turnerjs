define(['lodash'], function (_) {
    'use strict';

    function degreesToRadians(angleInDegrees) {
        return angleInDegrees * Math.PI / 180;
    }

    function getBoundingHeight(layout) {
        if (!layout.rotationInDegrees) {
            return layout.height;
        }
        var currentAngleInRadians = degreesToRadians(layout.rotationInDegrees);
        return parseInt(Math.abs(layout.width * Math.sin(currentAngleInRadians)) + Math.abs(layout.height * Math.cos(currentAngleInRadians)), 10);
    }

    function getBoundingY(layout) {
        if (!layout.rotationInDegrees) {
            return layout.y;
        }
        var boundingHeight = getBoundingHeight(layout);
        return parseInt(layout.y - (boundingHeight - layout.height) / 2, 10);
    }

    function getLowestComp(comps) {
        return _.max(comps, function (comp) {
            return getBoundingY(comp.layout);
        });
    }

    function removeInvalidAnchors(parts) {
        var pagesContainer = parts.pagesContainer;
        var header = parts.header;
        if (pagesContainer && header) {
            _.remove(pagesContainer.layout.anchors, {targetComponent: 'SITE_HEADER', type: 'TOP_TOP'});
            _.remove(header.layout.anchors, {targetComponent: 'PAGES_CONTAINER', type : 'TOP_TOP'});
        }
    }

    function addMissingAnchors(components, parts) {
        var pagesContainer = parts.pagesContainer;
        var header = parts.header;
        var footer = parts.footer;

        var sitePages = pagesContainer && pagesContainer.components && _.find(pagesContainer.components, {id: "SITE_PAGES"});
        if (sitePages && sitePages.layout && (!sitePages.layout.anchors || sitePages.layout.anchors.length === 0)) {
            sitePages.layout.anchors = [
                {
                    distance: 0,
                    locked: true,
                    originalValue: 0,
                    targetComponent: "PAGES_CONTAINER",
                    type: "BOTTOM_PARENT"
                }
            ];
        }
        if (pagesContainer && pagesContainer.layout && (!pagesContainer.layout.anchors || pagesContainer.layout.anchors.length === 0) &&
            footer && footer.layout && !footer.layout.fixedPosition) {
            pagesContainer.layout.anchors = [
                {
                    distance: 10,
                    locked: true,
                    originalValue: 0,
                    targetComponent: "SITE_FOOTER",
                    type: "BOTTOM_TOP"
                }
            ];
        }

        if (header) {
            var hasBottomParentAnchorToSiteStructure = _.find(components, function (component) {
                return _.find(component.layout.anchors, {type: 'BOTTOM_PARENT', targetComponent: 'masterPage'});
            });
            if (!hasBottomParentAnchorToSiteStructure) {
                var lowestComp = getLowestComp(components);
                if (!lowestComp.layout.anchors) {
                    return;
                }
                lowestComp.layout.anchors.push({
                    distance: 0,
                    locked: true,
                    originalValue: getBoundingY(lowestComp.layout) + getBoundingHeight(lowestComp.layout) + (header ? getBoundingHeight(header.layout) : 0),
                    targetComponent: "masterPage",
                    type: "BOTTOM_PARENT"
                });
            }
        }
    }

    function childrenAnchorsDeleted(childrenArr) {
        return !(childrenArr.length && childrenArr[0].layout && childrenArr[0].layout.anchors);
    }

    function findParts(components) {
        // Optimization: single _.forEach instead of three _.find
        var parts = {};
        _.forEach(components, function (component) {
            switch (component.id) {
                case 'SITE_HEADER':
                    parts.header = component;
                    return !(parts.footer && parts.pagesContainer);
                case 'SITE_FOOTER':
                    parts.footer = component;
                    return !(parts.header && parts.pagesContainer);
                case 'PAGES_CONTAINER':
                    parts.pagesContainer = component;
                    return !(parts.header && parts.footer);
                default:
                    return true; // continue
            }
        });
        return parts;
    }

    function fixAnchors(components) {
        if (components && !_.isEmpty(components) && !childrenAnchorsDeleted(components)) {
            var parts = findParts(components);
            removeInvalidAnchors(parts);
            addMissingAnchors(components, parts);
        }
    }

    /**
     * @exports utils/dataFixer/plugins/addMissingAnchorsOfMasterPage
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            if (!structureData || structureData.type !== "Document") {
                return;
            }
            fixAnchors(structureData.children);
            fixAnchors(structureData.mobileComponents);
        },

        test: {
            getBoundingHeight: getBoundingHeight,
            getBoundingY: getBoundingY,
            getLowestComp: getLowestComp
        }
    };

    return exports;
});
