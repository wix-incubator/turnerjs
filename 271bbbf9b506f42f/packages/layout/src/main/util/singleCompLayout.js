define(['lodash', 'utils', 'experiment', 'layout/util/rootLayoutUtils'], function (_, utils, experiment, rootLayoutUtils) {
    "use strict";

    var unitize = utils.style.unitize;

    var classBasedPatchers = {};
    var classBasedCustomMeasures = {};
    var classBasedShouldMeasureDOM = {};
    var classBasedMeasureChildren = {};

    var classBasedAdditionalMeasure = {};

    var SAFEclassBasedPatchers = {};

    function isCompRenderedInFixedPosition(style) {
        return style.position === 'fixed';
    }

    function shouldOnlyMeasureDomWidth(structure) {
        return utils.layout.isHorizontallyStretched(structure.layout);
    }

    function shouldClassBasedMeasureDomWidth(structure) {
        return classBasedShouldMeasureDOM[structure.componentType];
    }

    function shouldOnlyMeasureDomHeight(structure) {
        return utils.layout.isVerticallyStretched(structure.layout);
    }

    function shouldClassBasedMeasureDomHeight(structure) {
        return classBasedShouldMeasureDOM[structure.componentType];
    }

    function measureComponentZIndex(measureMap, compId, style) {
        var zIndex = style.zIndex;
        if (zIndex !== "auto") {
            zIndex = parseFloat(zIndex);
            if (!isNaN(zIndex)) {
                measureMap.zIndex[compId] = zIndex;
            }
        }
    }

    function measurePositionForFixedComp(measureMap, compId, domNode, style) {
        if (isCompRenderedInFixedPosition(style)) {
            measureMap.fixed[compId] = true;
            measureMap.top[compId] = domNode.offsetTop;
            measureMap.left[compId] = domNode.offsetLeft;
        }
    }

    function measureComponentWidth(measureMap, compId, domNode, structure) {
        var structureWidth = _.get(structure, 'layout.width', 0);

        if (shouldOnlyMeasureDomWidth(structure)) {
            measureMap.width[compId] = domNode.offsetWidth;
        } else if (shouldClassBasedMeasureDomWidth(structure) || !_.get(structure, 'layout.width')) {
            measureMap.width[compId] = Math.max(domNode.offsetWidth, structureWidth);
        } else {
            measureMap.width[compId] = structureWidth;
            measureMap.innerWidth[compId] = structureWidth || domNode.clientWidth;
        }
    }

    function measureComponentTop(measureMap, compId, domNode) {
        measureMap.top[compId] = domNode.offsetTop;
    }

    function measureComponentHeight(measureMap, compId, domNode, structure) {
        var minHeight = _.get(structure, 'layout.height', 0);
        var aspectRatio = _.get(structure, 'layout.aspectRatio', 0);
        if (aspectRatio) {
            minHeight = aspectRatio * measureMap.width[compId]; //aspect ratio is a minimum height, domNode height should override for a dynamically resizing component
        }
        if (shouldOnlyMeasureDomHeight(structure)) {
            measureMap.height[compId] = domNode.offsetHeight;
        } else if (shouldClassBasedMeasureDomHeight(structure) || !_.get(structure, 'layout.height')) {
            measureMap.height[compId] = Math.max(domNode.offsetHeight, minHeight);
        } else {
            measureMap.height[compId] = minHeight;
        }
    }

    function measureDeadComp(measureMap, compId, domNode, structure) {
        var structureWidth = _.get(structure, 'layout.width', 0);
        var structureHeight = _.get(structure, 'layout.height', 0);
        measureMap.width[compId] = structureWidth;
        measureMap.innerWidth[compId] = structureWidth || domNode.clientWidth;
        measureMap.height[compId] = structureHeight;
    }

    function getLeft(structure, domNode) {
        var offsetLeft = domNode.offsetLeft;
        var x = _.get(structure, 'layout.x', 0);
        var diff = Math.abs(x - offsetLeft);

        return diff === 0.5 ? x : offsetLeft;
    }

    function measureComponentLeft(measureMap, compId, domNode, structure) {
        measureMap.left[compId] = getLeft(structure, domNode);
    }

    function updateStructureCompMeasures(compId, domNode, structure, measureMap) {
        if (measureMap.isDeadComp[compId]) {
            measureDeadComp(measureMap, compId, domNode, structure);
            return;
        }
        var computedStyle = window.getComputedStyle(domNode);
        measurePositionForFixedComp(measureMap, compId, domNode, computedStyle);
        measureComponentZIndex(measureMap, compId, computedStyle);
        measureComponentWidth(measureMap, compId, domNode, structure);
        measureComponentHeight(measureMap, compId, domNode, structure);

        if (experiment.isOpen('layout_verbs_with_anchors') || experiment.isOpen('sv_partialReLayout')){
            measureComponentTop(measureMap, compId, domNode);
        }
        if (experiment.isOpen('sv_hoverBox') || classBasedShouldMeasureDOM[structure.componentType]) {
            measureComponentLeft(measureMap, compId, domNode, structure);
            measureMap.width[compId] = domNode.offsetWidth;
        }
    }

    function isComponentDead(domNode) {
        return domNode.getAttribute('data-dead-comp');
    }

    function getDomNode(compId, getDomNodeFunc) {
        if (!compId) {
            return false;
        }
        var domNode = getDomNodeFunc(compId);
        if (!domNode) {
            return false;
        }
        return domNode;
    }

    function measureComponent(structure, structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData) {
        var compId = structureInfo.id;
        var domNode = getDomNode(compId, getDomNodeFunc);
        if (!domNode) {
            return;
        }
        nodesMap[compId] = domNode;
        updateStructureCompMeasures(compId, domNode, structure, measureMap);

        var isDeadComp = isComponentDead(domNode);
        if (isDeadComp) {
            measureMap.isDeadComp[compId] = true;
            return;
        }

        if (classBasedAdditionalMeasure[structureInfo.type]) {
            classBasedAdditionalMeasure[structureInfo.type](compId, measureMap, nodesMap, siteData, structureInfo);
        }

        if (classBasedCustomMeasures[structureInfo.type]) {
            classBasedCustomMeasures[structureInfo.type](compId, measureMap, nodesMap, siteData, structureInfo);
        }
    }

    function measureComponentChildren(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData) {
        var compId = structureInfo.id;
        var domNode = getDomNode(compId, getDomNodeFunc);
        if (!domNode || isComponentDead(domNode)) {
            return;
        }

        if (classBasedMeasureChildren[structureInfo.type]) {
            var childrenSelectors = classBasedMeasureChildren[structureInfo.type];
            if (typeof childrenSelectors === 'function') {
                childrenSelectors = childrenSelectors(siteData, compId, nodesMap, structureInfo);
            }
            _.forEach(childrenSelectors, function (selector) {
                var isChildComponent = _.isPlainObject(selector);
                var childIdPath = isChildComponent ? selector.pathArray : selector;
                var childNode = getDomNodeFunc.apply(undefined, [compId].concat(childIdPath));
                if (childNode) {
                    var childIdString = childIdPath.join("");
                    var childId = compId + childIdString;
                    nodesMap[childId] = childNode;
                    measureMap.height[childId] = childNode.offsetHeight;
                    measureMap.width[childId] = childNode.offsetWidth;
                    measureMap.innerWidth[childId] = childNode.clientWidth;

                    if (isChildComponent && classBasedCustomMeasures[selector.type]) {
                        classBasedCustomMeasures[selector.type](childId, measureMap, nodesMap, siteData, structureInfo);
                    }
                }
            });
        }
    }

    function patchNodeDefault(id, patch, measureMap, layout) {
        var style = {};

        if (!utils.layout.isVerticallyDocked(layout) || utils.layout.isVerticallyStretchedToScreen(layout)) {
            style.top = unitize(measureMap.top[id]);
        }
        if (!utils.layout.isVerticallyStretched(layout) || utils.layout.isVerticallyStretchedToScreen(layout)) {
            style.height = unitize(measureMap.height[id]);
        }
        if (!_.isEmpty(style)) {
            patch.css(id, style);
        }
    }

    function patchScreenWidthComponents(id, patchers, measureMap, structureInfo, siteData) {
        var layout = structureInfo.layout;
        if (layout && utils.dockUtils.isHorizontalDockToScreen(layout)) {
            var rootWidth = rootLayoutUtils.getRootWidth(siteData, measureMap, structureInfo.rootId);
            var screenOffsetFromRoot = 0 - rootLayoutUtils.getRootLeft(siteData, measureMap, structureInfo.rootId);
            var style = utils.dockUtils.getDockedStyle(layout, siteData.getPageBottomMargin(), siteData.getScreenWidth(), rootWidth, screenOffsetFromRoot);
            var verticallyStyleProperties = _.pick(style, ['left', 'width']);
            measureMap.left[id] = (parseInt(verticallyStyleProperties.left, 10)); //only ok since style.left is always in px only for horizontalDockToScreen
            patchers.css(id, verticallyStyleProperties); //style for screenWidth will have both left and width
        }
    }

    function patchComponent(structureInfo, patchers, nodesMap, measureMap, siteData) {
        var id = structureInfo.id;
        var layout = structureInfo.layout;
        patchNodeDefault(id, patchers, measureMap, layout);
        patchScreenWidthComponents(id, patchers, measureMap, structureInfo, siteData);
        var isDeadComp = measureMap.isDeadComp[id];

        var needsRender = false;
        if (!isDeadComp && classBasedPatchers[structureInfo.type]) {
            needsRender = classBasedPatchers[structureInfo.type](id, nodesMap, measureMap, structureInfo, siteData);
        } else if (!isDeadComp && SAFEclassBasedPatchers[structureInfo.type]) {
            needsRender = SAFEclassBasedPatchers[structureInfo.type](id, patchers, measureMap, structureInfo, siteData);
        }
        return needsRender;
    }

    return {
        patchComponent: patchComponent,
        measureComponent: measureComponent,
        measureComponentChildren: measureComponentChildren,
        isComponentDead: isComponentDead,

        /**
         * @deprecated
         * Allows to plugin a patching method to component that needs it
         * @param {string} className The component class name
         * @param {function(string, Object.<string, Element>,  layout.measureMap, layout.structureInfo, core.SiteData)} patcher The patching method
         */
        registerPatcher: function (className, patcher) {
            classBasedPatchers[className] = patcher;
        },

        /**
         * Allows to plugin a patching method to component that needs it
         * @param {string} className The component class name
         * @param {function(string, patchers,  layout.measureMap, layout.structureInfo, core.SiteData)} patcher The patching method
         */
        registerSAFEPatcher: function (className, patcher) {
            SAFEclassBasedPatchers[className] = patcher;
        },


        /**
         *
         * @param {string} className
         * @param {function(string, Object.<string, Element>, layout.measureMap, layout.structureInfo, core.SiteData)[]}patchersArray
         */
        registerPatchers: function (className, patchersArray) {
            classBasedPatchers[className] = function () {
                var args = arguments;
                _.forEach(patchersArray, function (patcher) {
                    patcher.apply(null, args);
                });
            };
        },

        /**
         * Allows to plugin a patching method to component that needs it
         * @param {string} className The component class name
         * @param {function(string, patchers,  layout.measureMap, layout.structureInfo, core.SiteData)[]} patchersArray The patching methods
         */
        registerSAFEPatchers: function (className, patchersArray) {
            SAFEclassBasedPatchers[className] = function () {
                var args = arguments;
                _.forEach(patchersArray, function (patcher) {
                    patcher.apply(null, args);
                });
            };
        },


        /**
         * the fix will run after the measure but before enforce anchors.
         * use this if you need to update the comp size according to some inner element size (example in site-button)
         * @param {String} className
         * @param {function(string, layout.measureMap, Object.<string, Element>, core.SiteData, layout.structureInfo)} fix
         * a function that runs during measure, you can change only the measure map there
         */
        registerCustomMeasure: function (className, fix) {
            classBasedCustomMeasures[className] = fix;
        },

        /**
         * Allows to request to be measured during layout
         * @param className The component class name
         */
        registerRequestToMeasureDom: function (className) {
            classBasedShouldMeasureDOM[className] = true;
        },

        /**
         * Allows to request to measure children during layout
         * @param className The component class name
         * @param {(Array.<String|{pathArray: Array.<String>, type: string}>|function|)} pathArray An array of children paths (array of strings) to be measured.
         *  This can also be a callback method that returns the pathArray
         */
        registerRequestToMeasureChildren: function (className, pathArray) {
            classBasedMeasureChildren[className] = pathArray;
        },

        registerAdditionalMeasureFunction: function (className, measureFunction) {
            classBasedAdditionalMeasure[className] = measureFunction;
        },

        maps: {
            classBasedMeasureChildren: classBasedMeasureChildren,
            classBasedCustomMeasures: classBasedCustomMeasures,
            classBasedPatchers: classBasedPatchers
        }
    };
});
