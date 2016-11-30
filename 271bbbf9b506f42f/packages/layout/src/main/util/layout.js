define([
    'zepto',
    'lodash',
    'layout/util/anchors',
    'layout/util/layoutAlgorithm',
    'utils',
    'coreUtils',
    'layout/util/createDOMPatchers',
    'layout/util/singleCompLayout',
    'experiment'
], function ($, _, anchors, layoutAlgorithm, utils, coreUtils, createDOMPatchers, singleCompLayout, experiment) {
    /**
     * Created with IntelliJ IDEA.
     * User: avim
     * Date: 5/18/14
     * Time: 1:57 PM
     * To change this template use File | Settings | File Templates.
     */
    'use strict';

    var cachedNodesMap = {};

    var classBasedLayoutInnerCompsFirst = {};
    var classBasedMeasureChildrenFirst = {};

    var PERFORMANCE_NAME = 'reLayout';

    function getComponentAdditionalChildren(structureHierarchy, isMobileView) {
        var compStructure = _.last(structureHierarchy);
        var children = coreUtils.dataUtils.getChildrenData(compStructure, isMobileView);

        return _.transform(children, function (relatedCompsMap, childStructure) {
            relatedCompsMap[childStructure.id] = true;
        }, {});
    }

    var classBasedRelatedCompsToRelayout = {
        'wysiwyg.viewer.components.Group': getComponentAdditionalChildren,
        'wysiwyg.viewer.components.BoxSlideShow': getComponentAdditionalChildren,
        'wysiwyg.viewer.components.StripContainerSlideShow': getComponentAdditionalChildren,
        'wysiwyg.viewer.components.StripColumnsContainer': getComponentAdditionalChildren,
        'wysiwyg.viewer.components.Column': function (structureHierarchy, isMobileView) {
            var parentStructure = structureHierarchy[structureHierarchy.length - 2];
            var siblingsStructures = coreUtils.dataUtils.getChildrenData(parentStructure, isMobileView);

            var relatedComps = [parentStructure].concat(siblingsStructures);

            return _.transform(relatedComps, function (relatedCompsMap, relatedCompStructure) {
                relatedCompsMap[relatedCompStructure.id] = true;
            }, {});
        }
    };

    function enforceRange(value, min, max) {
        return value && Math.max(min, Math.min(max, value));
    }

    var componentTypesToNeverSkip = {
        'mobile.core.components.Page': true,
        'wysiwyg.viewer.components.StripColumnsContainer': true,
        'wysiwyg.viewer.components.Column': true
    };

    /**
     * @typedef {{
     *      dataItem: data.compDataItem,
     *      propertiesItem: data.compPropertiesItem,
     *      layout: compStructure.layout,
     *      styleItem: data.compThemeItem,
     *      id: string,
     *      type: string
     * }} layout.structureInfo
     */

    function shouldSkipComponent(compsToMeasure, structureInfo) {
        if (experiment.isOpen('sv_partialReLayout')) {
            return !!(compsToMeasure && !compsToMeasure[structureInfo.id]);
        }
        var lockedCompsMap = compsToMeasure;
        return (lockedCompsMap && !lockedCompsMap[structureInfo.id] && !anchors.HARD_WIRED_COMPS[structureInfo.id] && !_.has(componentTypesToNeverSkip, structureInfo.type));
    }

    function getComponentTypeForLayout(structure) {
        return structure.componentType || structure.documentType;
    }

    /**
     *
     * @param compStructure
     * @param siteAPI
     * @param pageId
     * @returns {layout.structureInfo}
     */
    function getComponentStructureInfo(compStructure, siteAPI, pageId) {
        var siteData = siteAPI.getSiteData();
        var layout = compStructure.layout;

        var structureInfo = {
            dataItem: null,
            propertiesItem: null,
            layout: layout,
            styleItem: null,
            id: compStructure.id,
            type: getComponentTypeForLayout(compStructure),
            structure: compStructure,
            rootId: pageId
        };
        if (structureInfo.layout) {
            if (_.isFinite(structureInfo.layout.height)) {
                structureInfo.layout.height = enforceRange(structureInfo.layout.height, coreUtils.siteConstants.COMP_SIZE.MIN_HEIGHT, coreUtils.siteConstants.COMP_SIZE.MAX_HEIGHT);
            }
            if (_.isFinite(structureInfo.layout.width)) {
                structureInfo.layout.width = enforceRange(structureInfo.layout.width, coreUtils.siteConstants.COMP_SIZE.MIN_WIDTH, coreUtils.siteConstants.COMP_SIZE.MAX_WIDTH);
            }
        }

        if (compStructure.dataQuery) {
            structureInfo.dataItem = siteAPI.getRuntimeDal().getCompData(compStructure.id) || siteData.getDataByQuery(compStructure.dataQuery, pageId);
        }

        if (compStructure.propertyQuery) {
            structureInfo.propertiesItem = siteAPI.getRuntimeDal().getCompProps(compStructure.id) || siteData.getDataByQuery(compStructure.propertyQuery, pageId, siteData.dataTypes.PROPERTIES);
        }

        if (compStructure.behaviorQuery || compStructure.behaviors) {
            structureInfo.behaviorsItem = siteAPI.getRuntimeDal().getActionsAndBehaviors(compStructure.id);
            if (!structureInfo.behaviorsItem) {
                structureInfo.behaviorsItem = compStructure.behaviors || _.get(siteData.getDataByQuery(compStructure.behaviorQuery, pageId, siteData.dataTypes.BEHAVIORS), 'items');
            }
        }

        if (compStructure.designQuery) {
            var runtimeDesign = siteAPI.getRuntimeDal().getCompDesign(compStructure.id);
            structureInfo.designDataItem = runtimeDesign || siteData.getDataByQuery(compStructure.designQuery, pageId, siteData.dataTypes.DESIGN);
        }

        if (compStructure.styleId) {
            structureInfo.styleItem = siteData.getDataByQuery(compStructure.styleId, pageId, siteData.dataTypes.THEME);
        }
        return structureInfo;
    }

    function isCollapsed(compId, measureMap) {
        return Boolean(measureMap.collapsed[compId]);
    }

    function fix(patchers, nodesMap, changedCompsStructures, measureMap, siteAPI, pageId, lockedCompsMap) {
        var siteData = siteAPI.getSiteData();
        var componentsToRender = [];

        var componentsToPatch = _(changedCompsStructures)
            .keys()
            .filter(function shouldPatch(compId) {
                return !isCollapsed(compId, measureMap);
            })
            .value();

        _.forEach(componentsToPatch, function (id) {
            var structureInfo = getComponentStructureInfo(changedCompsStructures[id], siteAPI, pageId);
            if (!experiment.isOpen('sv_partialReLayout') && shouldSkipComponent(lockedCompsMap, structureInfo)) {
                return;
            }
            var needsRender = singleCompLayout.patchComponent(structureInfo, patchers, nodesMap, measureMap, siteData);
            if (needsRender) {
                componentsToRender.push(id);
            }
        });
        return componentsToRender;
    }


    //TODO: remove lockedCompsMap when sv_partialReLayout is merged
    function patchAllStructures(structuresDesc, measureMap, nodesMap, changedCompsStructures, siteAPI, lockedCompsMap) {
        var componentsToRender = [];

        var patchers = createDOMPatchers(nodesMap);
        _.forEach(structuresDesc, function (structureDesc, name) {
            componentsToRender = componentsToRender.concat(fix(patchers, nodesMap, changedCompsStructures[name], measureMap, siteAPI, structureDesc.pageId, lockedCompsMap));
        });
        return componentsToRender;
    }

    function measureStructure(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure) {
        var $domNode = $(getDomNodeFunc(structure.id));
        if ($domNode.attr('data-leaving')) {
            return;
        }
        if ($domNode.attr('data-collapsed')) {
            measureCollapsedComponent(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure);
        } else if (classBasedMeasureChildrenFirst[structure.componentType]) {
            measureStructureChildrenFirst(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure);
        } else {
            measureStructureChildrenLast(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure);
        }
    }

    function measureCollapsedComponent(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure) {
        var siteData = siteAPI.getSiteData();
        var structureInfo = getComponentStructureInfo(structure, siteAPI, pageId);
        if (shouldSkipComponent(compsToMeasure, structureInfo)) {
            return;
        }

        addCompNodeToNodesMap(structure, getDomNodeFunc, nodesMap);
        measureMap.collapsed[structure.id] = true;
        measureComponentItself(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData, structure, compsToMeasure);
    }

    function measureStructureChildrenFirst(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure) {
        var siteData = siteAPI.getSiteData();
        var structureInfo = getComponentStructureInfo(structure, siteAPI, pageId);
        addCompNodeToNodesMap(structure, getDomNodeFunc, nodesMap);
        measureContainerChildren(structureInfo, siteAPI, getDomNodeFunc, measureMap, nodesMap, pageId, compsToMeasure);
        measureComponentItself(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData, structure, compsToMeasure);
    }

    function measureStructureChildrenLast(structure, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure) {
        var siteData = siteAPI.getSiteData();
        var structureInfo = getComponentStructureInfo(structure, siteAPI, pageId);
        addCompNodeToNodesMap(structure, getDomNodeFunc, nodesMap);
        measureComponentItself(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData, structure, compsToMeasure);
        measureContainerChildren(structureInfo, siteAPI, getDomNodeFunc, measureMap, nodesMap, pageId, compsToMeasure);
    }

    function addCompNodeToNodesMap(structure, getDomNodeFunc, nodesMap) {
        var domNode = getDomNodeFunc(structure.id);
        if (domNode) {
            nodesMap[structure.id] = domNode; //we need this before the childrenMeasure, but measureComponent also needs to do this independently...
        }
    }

    function measureContainerChildren(structureInfo, siteAPI, getDomNodeFunc, measureMap, nodesMap, pageId, compsToMeasure) {
        var siteData = siteAPI.getSiteData();
        var children = coreUtils.dataUtils.getChildrenData(structureInfo.structure, siteData.isMobileView());
        _.forEach(children, function (child) {
            measureStructure(child, getDomNodeFunc, measureMap, nodesMap, siteAPI, pageId, compsToMeasure);
        });
    }

    function measureComponentItself(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData, structure, compsToMeasure) {
        if (shouldSkipComponent(compsToMeasure, structureInfo)) {
            return;
        }
        singleCompLayout.measureComponentChildren(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData);
        singleCompLayout.measureComponent(structure, structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData);
    }

    function measureAllStructures(structuresDesc, measureMap, nodesMap, siteAPI, compsToMeasure) {
        _.forOwn(structuresDesc, function (structureDesc) {
            measureStructure(structureDesc.structure, structureDesc.getDomNodeFunc, measureMap, nodesMap, siteAPI, structureDesc.pageId, compsToMeasure);
        });
    }

    function enforceAnchorsAllStructures(structuresDesc, measureMap, siteAPI, skipEnforceAnchors, lockedCompsMap, renderedCompsMap) {
        var flatDataMaps = {};
        var siteData = siteAPI.getSiteData();
        var ignoreBottomBottom;
        siteData.anchorsMap = siteData.anchorsMap || {};
        siteData.originalValuesMap = siteData.originalValuesMap || {};
        var isMobileView = siteData.isMobileView();

        if (structuresDesc.inner) {
            ignoreBottomBottom = siteData.isRootIgnoreBottomBottom(_.get(structuresDesc, 'inner.structure.id'));
            flatDataMaps.inner = layoutAlgorithm.enforceStructure(structuresDesc.inner.structure, measureMap, siteData.anchorsMap, siteData.originalValuesMap, isMobileView, skipEnforceAnchors, lockedCompsMap, renderedCompsMap, ignoreBottomBottom);
            if (measureMap.height.SITE_PAGES) {
                measureMap.height.SITE_PAGES = measureMap.height[structuresDesc.inner.pageId];
            }
        }
        _.forOwn(structuresDesc, function (structureDesc, name) {
            if (name !== 'inner') {
                ignoreBottomBottom = siteData.isRootIgnoreBottomBottom(_.get(structureDesc, ['structure', 'id']));
                flatDataMaps[name] = layoutAlgorithm.enforceStructure(structureDesc.structure, measureMap, siteData.anchorsMap, siteData.originalValuesMap, isMobileView, skipEnforceAnchors, lockedCompsMap, renderedCompsMap, ignoreBottomBottom);
            }
        });


        return flatDataMaps;
    }

    function calculateAbsolutePosition(structure, measureMap, siteAPI, baseTop, baseLeft) {
        var siteData = siteAPI.getSiteData();
        var compId = structure.id;

        if (compId) {
            if (measureMap.fixed[compId]) {
                baseTop = measureMap.top[compId];
                baseLeft = measureMap.left[compId];
            } else {
                baseTop += measureMap.top[compId];
                baseLeft += measureMap.left[compId] || 0;
            }

            measureMap.absoluteTop[compId] = baseTop;
            measureMap.absoluteLeft[compId] = baseLeft;
        }
        var children = coreUtils.dataUtils.getChildrenData(structure, siteData.isMobileView());
        _.forEach(children, function (child) {
            calculateAbsolutePosition(child, measureMap, siteAPI, baseTop, baseLeft);
        });
    }

    function calculateAbsolutePositionAllStructures(structuresDesc, measureMap, siteAPI) {
        var structureNamesSortSoInnerIsLast = _.sortBy(_.keys(structuresDesc), function (name) {
            return name === 'inner' ? 1 : 0;
        });

        _.forEach(structureNamesSortSoInnerIsLast, function (name) {
            calculateAbsolutePosition(structuresDesc[name].structure, measureMap, siteAPI,
                name === 'inner' ? measureMap.absoluteTop.SITE_PAGES : 0,
                name === 'inner' ? measureMap.absoluteLeft.SITE_PAGES : 0
            );
        });
    }

    function addCompsThatNeedLayoutOfInnerComps(structure, getDomNodeFunc, siteAPI, components, structureAnchors) {
        var domNode = structure.id && getDomNodeFunc(structure.id);
        if (domNode && singleCompLayout.isComponentDead(domNode)) {
            return;
        }
        if (domNode && classBasedLayoutInnerCompsFirst[structure.componentType]) {
            components.push({
                anchorsMap: structureAnchors,
                structure: structure,
                getDomNodeFunc: getDomNodeFunc,
                domNode: domNode
            });
        }

        var isMobileView = siteAPI.getSiteData().isMobileView();
        var children = coreUtils.dataUtils.getChildrenData(structure, isMobileView);
        _.forEach(children, function (child) {
            addCompsThatNeedLayoutOfInnerComps(child, getDomNodeFunc, siteAPI, components, structureAnchors);
        });

    }

    function runLayoutOfInnerComps(components, measureMap, patchers, nodesMap, siteAPI, lockedCompsMap, skipEnforceAnchors, compsToRelayoutMap) {
        var compsToLayoutAgain = [];
        var changedComps = {};
        var siteData = siteAPI.getSiteData();
        var isMobileView = siteData.isMobileView();

        _.forEach(components, function (compInfo) {
            var structureInfo = getComponentStructureInfo(compInfo.structure, siteAPI);
            var measureResult = classBasedLayoutInnerCompsFirst[structureInfo.structure.componentType]
                .measure(structureInfo, compInfo.domNode, measureMap, nodesMap, siteData, function (structure){
                    measureStructure(structure, compInfo.getDomNodeFunc, measureMap, nodesMap, siteAPI, structureInfo.rootId, compsToRelayoutMap);
                }, function(structure){
                    // This enforceAnchors call handles columns and children of columns. It does not need ignore bottomBottom anchors flag, since the columns and strip containers were created in santa-editor which does not create bottomBottom anchors.
                    // Only the old editor creates bottomBottom anchors
                    return anchors.enforceAnchors(structure, measureMap, compInfo.anchorsMap, isMobileView, skipEnforceAnchors, lockedCompsMap, compsToRelayoutMap);
                });

            if (measureResult.needsAdditionalInnerLayout) {
                compsToLayoutAgain.push(compInfo);
            }

            if (measureResult.changedCompsMap) {
                _.assign(changedComps, measureResult.changedCompsMap);
            }
        });

        _.forEach(components, function (compInfo) {
            var structureInfo = getComponentStructureInfo(compInfo.structure, siteAPI);
            if (!compInfo.skipPatch) {
                classBasedLayoutInnerCompsFirst[structureInfo.structure.componentType].patch(structureInfo, measureMap, patchers, nodesMap, siteAPI.getSiteData());
            }
        });

        return {
            compsToInnerLayoutAgain: compsToLayoutAgain,
            changedComps: changedComps
        };
    }

    function runLayoutOfInnerCompsAllStructures(structuresDesc, measureMap, nodesMap, siteAPI, lockedCompsMap, skipEnforceAnchors, compsToRelayoutMap) {
        var siteData = siteAPI.getSiteData();
        var viewMode = siteData.getViewMode();
        var changedComps = {};
        var compsWithInner = [];
        _.forOwn(structuresDesc, function (structureDesc) {
            var structureId = _.get(structureDesc, 'structure.id');
            var structureAnchors = _.get(siteData.anchorsMap, [structureId, viewMode]);
            addCompsThatNeedLayoutOfInnerComps(structureDesc.structure, structureDesc.getDomNodeFunc, siteAPI, compsWithInner, structureAnchors);
        });

        compsWithInner.reverse();
        var compsThatStillNeedInnerLayout = compsWithInner;
        var counter = 0;
        var patchers = createDOMPatchers(nodesMap);

        while (compsThatStillNeedInnerLayout.length && counter < 3) {
            var innerLayoutResult = runLayoutOfInnerComps(compsThatStillNeedInnerLayout, measureMap, patchers, nodesMap, siteAPI, lockedCompsMap, skipEnforceAnchors, compsToRelayoutMap);
            compsThatStillNeedInnerLayout = innerLayoutResult.compsToInnerLayoutAgain;
            changedComps = _.assign(changedComps, innerLayoutResult.changedComps);
            counter++;
        }

        return changedComps;
    }

    //function flattenStructure(siteData, structuresMap, structure){
    //    if (structure.id){
    //        structuresMap[structure.id] = structure;
    //    }
    //
    //    var children = utils.dataUtils.getChildrenData(structure, siteData.isMobileView());
    //    _.forEach(children, _.partial(flattenStructure, siteData, structuresMap));
    //}

    /**
     * @name layout.measureMap
     * @type {{height: Object.<string, number>, width: Object.<string, number>, innerWidth: Object.<string, number>, custom: Object.<string, Object>, containerHeightMargin: Object.<string, number>, minHeight: Object.<string, number>, top: Object.<string, number>}}
     */
    var siteRoot;

    function getEmptyMeasureMap(siteData) {
        siteRoot = siteRoot || $('#SITE_ROOT');
        var siteOffset = siteRoot.offset() || {top: 0};
        var measureMap = {
            pageBottomByComponents: {},
            collapsed: {},
            height: {},
            width: {},
            innerWidth: {},
            innerHeight: {},
            custom: {},
            containerHeightMargin: {},
            minHeight: {},
            minWidth: {},
            top: {},
            left: {},
            absoluteTop: {},
            absoluteLeft: {},
            fixed: {},
            zIndex: {},
            isDeadComp: {},
            siteMarginBottom: (_.parseInt(siteRoot.css('padding-bottom'), 10) || 0),
            siteOffsetTop: siteOffset.top,
            clientWidth: 0,
            skipPatch: {},
            shrinkableContainer: {},
            injectedAnchors: {}
        };
        measureMap.clientWidth = siteData.getBodyClientWidth();
        if (experiment.isOpen('onboardingviewportmode')) {
            measureMap.clientHeight = getOnboardingClientHeight(siteData);
        } else {
            measureMap.clientHeight = window.document.documentElement.clientHeight;
        }
        measureMap.width.screen = siteData.getScreenWidth();
        measureMap.height.screen = measureMap.clientHeight;
        measureMap.innerHeight.screen = window.innerHeight;
        measureMap.innerWidth.screen = window.innerWidth;

        return measureMap;
    }

    /**
     * return a real or custom client height according to on boarding render flag
     * @returns {number}
     */
    function getOnboardingClientHeight(siteData) {
        var viewportMode = _.get(siteData.renderFlags, 'onboardingViewportMode', 'auto');
        if (viewportMode === 'parent') {
            return window.parent.document.documentElement.clientHeight;
        } else if (/fixed:/.test(viewportMode)) {
            return parseInt(viewportMode.split(':')[1], 10);
        }
        return window.document.documentElement.clientHeight;
    }

    function reuseMeasureMap(measureMap, compsToReset) {
        _.forOwn(compsToReset, function(v, compId) {
            delete measureMap.top[compId];
        });

        return measureMap;
    }

    function getAdditionalCompsToReLayoutForComp(compStructureHierarchy, isMobileView) {
        var compStructure = _.last(compStructureHierarchy);

        if (compStructure && classBasedRelatedCompsToRelayout[compStructure.componentType]) {
            return classBasedRelatedCompsToRelayout[compStructure.componentType](compStructureHierarchy, isMobileView);
        }

        return null;
    }

    function getAdditionalCompsToReLayout(structureHierarchy, renderedCompsMap, isMobileView) {
        var structure = _.last(structureHierarchy);

        var additionalComps = {};
        if (renderedCompsMap[structure.id]) {
            _.assign(additionalComps, getAdditionalCompsToReLayoutForComp(structureHierarchy, isMobileView));
        }

        var compChildren = coreUtils.dataUtils.getChildrenData(structure, isMobileView);
        _.forEach(compChildren, function (childStructure) {
            _.assign(additionalComps, getAdditionalCompsToReLayout(structureHierarchy.concat([childStructure]), renderedCompsMap, isMobileView));
        });

        return additionalComps;
    }

    function getAdditionalCompsToReLayoutAllStructures(renderedCompsMap, structuresDesc, isMobileView) {
        var additionalComps = {};
        _.forOwn(structuresDesc, function (structureDesc) {
            _.assign(additionalComps, getAdditionalCompsToReLayout([structureDesc.structure], renderedCompsMap, isMobileView));
        });

        return additionalComps;
    }

    function getCompsToReLayout(structuresDesc, specificCompsToReLayout, innerLayoutModifiedComps, renderedRootIds, isMobileView) {
        var compsToReLayout = {};

        _.assign(compsToReLayout, specificCompsToReLayout, innerLayoutModifiedComps, anchors.HARD_WIRED_COMPS, coreUtils.arrayUtils.toTrueObj(renderedRootIds));

        _.assign(compsToReLayout, getAdditionalCompsToReLayoutAllStructures(compsToReLayout, structuresDesc, isMobileView));

        return compsToReLayout;
    }

    function getReLayoutedCompsMap(changedCompsStructures) {
        var changedCompsIds = _(changedCompsStructures)
            .values()
            .map(_.keys)
            .flatten()
            .value();

        return coreUtils.arrayUtils.toTrueObj(changedCompsIds);
    }

    function reLayout(structuresDesc, siteAPI, noEnforceAnchors, lockedCompsMap, specificCompsToReLayout) {
        if (experiment.isOpen('sv_reportPerformance')) {
            utils.performance.clearMeasures(PERFORMANCE_NAME);
            utils.performance.start(PERFORMANCE_NAME);
        }

        var siteData = siteAPI.getSiteData();
        siteData.updateScreenSize(); //TODO: this needs to happen before render, so value is already correct here
        /*eslint dot-notation:0*/
        delete structuresDesc['undefined'];
        var nodesMap = experiment.isOpen('sv_partialReLayout') ? cachedNodesMap[siteData.siteId] || {} : {};

        var partialReLayout = false;
        var measureMap;
        if (experiment.isOpen('sv_partialReLayout')) {
            measureMap = specificCompsToReLayout ? reuseMeasureMap(siteData.measureMap, specificCompsToReLayout) : getEmptyMeasureMap(siteData);
        } else {
            partialReLayout = siteData.measureMap && lockedCompsMap && noEnforceAnchors;
            if (partialReLayout) {
                measureMap = reuseMeasureMap(siteData.measureMap, lockedCompsMap);
            } else {
                measureMap = getEmptyMeasureMap(siteData);
            }
        }

        var innerLayoutModifiedComps = runLayoutOfInnerCompsAllStructures(structuresDesc, measureMap, nodesMap, siteAPI, lockedCompsMap, noEnforceAnchors, specificCompsToReLayout);

        if (specificCompsToReLayout) {
            specificCompsToReLayout = getCompsToReLayout(structuresDesc, specificCompsToReLayout, innerLayoutModifiedComps, siteAPI.getAllRenderedRootIds(), siteData.isMobileView());
        }

        if (experiment.isOpen('sv_partialReLayout')) {
            measureAllStructures(structuresDesc, measureMap, nodesMap, siteAPI, specificCompsToReLayout);
        } else {
            measureAllStructures(structuresDesc, measureMap, nodesMap, siteAPI, partialReLayout && lockedCompsMap);
        }

        var changedCompsStructures = enforceAnchorsAllStructures(structuresDesc, measureMap, siteAPI, noEnforceAnchors, lockedCompsMap, specificCompsToReLayout);

        var componentsToRender = patchAllStructures(structuresDesc, measureMap, nodesMap, changedCompsStructures, siteAPI, !experiment.isOpen('sv_partialReLayout') && partialReLayout && lockedCompsMap);

        calculateAbsolutePositionAllStructures(structuresDesc, measureMap, siteAPI);

        cachedNodesMap[siteData.siteId] = nodesMap;

        if (experiment.isOpen('sv_reportPerformance')) {
            utils.performance.finish(PERFORMANCE_NAME, true, {
                partialReLayout: experiment.isOpen('sv_partialReLayout')
            });
        }

        return {
            componentsToRender: componentsToRender,
            measureMap: measureMap,
            reLayoutedCompsMap: getReLayoutedCompsMap(changedCompsStructures)
        };
    }

    /**
     * @class layout.layout
     */
    return {

        registerLayoutInnerCompsFirst: function (className, measureFunction, patchFunction) {
            classBasedLayoutInnerCompsFirst[className] = {
                measure: measureFunction,
                patch: patchFunction
            };
        },
        /**
         *
         * @param {string} className
         * @param {boolean} value
         */
        registerMeasureChildrenFirst: function (className, value) {
            classBasedMeasureChildrenFirst[className] = value;
        },

        /**
         * Allows to plugin a patching method to component that needs it
         * @deprecated please use registerSAFEpatcher instead!
         * @param {string} className The component class name
         * @param {function(string, Object.<string, Element>,  layout.measureMap, layout.structureInfo, core.SiteData)} patcher The patching method
         */
        registerPatcher: function (className, patcher) {
            singleCompLayout.registerPatcher(className, patcher);
        },

        /**
         * Allows to plugin a patching method to component that needs it
         * @param {string} className The component class name
         * @param {function(string, patchers,  layout.measureMap, layout.structureInfo, core.SiteData)} patcher The patching method
         */
        registerSAFEPatcher: function (className, patcher) {
            singleCompLayout.registerSAFEPatcher(className, patcher);
        },

        /**
         * Allows to plugin a patching method to component that needs it
         * @param {string} className The component class name
         * @param {function(string, patchers,  layout.measureMap, layout.structureInfo, core.SiteData)[]} patchersArray The patcher methods
         */
        registerSAFEPatchers: function (className, patchersArray) {
            singleCompLayout.registerSAFEPatchers(className, patchersArray);
        },

        /**
         * @deprecated please use registerSAFEPatchers instead!
         * @param {string} className
         * @param {function(string, Object.<string, Element>, layout.measureMap, layout.structureInfo, core.SiteData)[]}patchersArray
         */
        registerPatchers: function (className, patchersArray) {
            singleCompLayout.registerPatchers(className, patchersArray);
        },

        /**
         * the fix will run after the measure but before enforce anchors.
         * use this if you need to update the comp size according to some inner element size (example in site-button)
         * @param {String} className
         * @param {function(string, layout.measureMap, Object.<string, Element>, core.SiteData, layout.structureInfo)} mapFix
         * a function that runs during measure, you can change only the measure map there
         */
        registerCustomMeasure: function (className, mapFix) {
            singleCompLayout.registerCustomMeasure(className, mapFix);
        },

        /**
         * this is used in DocumentServices (now only text)
         * @param {string} className
         * @param {function(string, layout.measureMap, Object.<string, Element>, core.SiteData, layout.structureInfo)} measureFunction
         */
        registerAdditionalMeasureFunction: function (className, measureFunction) {
            singleCompLayout.registerAdditionalMeasureFunction(className, measureFunction);
        },

        /**
         * Allows to request to be measured during layout
         * @param className The component class name
         */
        registerRequestToMeasureDom: function (className) {
            singleCompLayout.registerRequestToMeasureDom(className);
        },

        /**
         * Allows to request to measure children during layout
         * @param className The component class name
         * @param {(Array.<String>|function)} pathArray An array of children paths (array of strings) to be measured.
         *  This can also be a callback method that returns the pathArray
         */
        registerRequestToMeasureChildren: function (className, pathArray) {
            singleCompLayout.registerRequestToMeasureChildren(className, pathArray);
        },

        reLayout: reLayout,
        //used in tests
        enforceAnchors: anchors.enforceAnchors
    };

});
