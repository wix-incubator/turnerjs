define([
    'zepto', 'lodash',
    'utils',
    'layout/wixappsLayout/proxyLayoutRegistrar',
    'layout/util/layout',
    'layout/util/singleCompLayout',
    'experiment'
], function (
    $, _,
    utils,
    /** layout.proxyLayoutRegistrar */
    proxyLayoutRegistrar,
    layout,
    singleCompLayout
) {
    'use strict';

    var inlineContent = "inlineContent";

    function getDomNodeFunc() {
        var idsArr = _.toArray(arguments);
        var childIdString = idsArr.join("");
        var childIdWithoutRootComp = idsArr.slice(1).join(""); //this is a workaround for bug #CLNT-6844, since wixapps dont cant use the reactPageFunc to travel on the refs to get the child component
        return $('#' + childIdString)[0] || $('#' + childIdWithoutRootComp)[0];
    }

    function patchAppPart(id, patchers, measureMap) {
        return measureMap.custom[id] && measureMap.custom[id].appPartShouldRenderAgain;
    }

    function measureComponentChildren(structureInfo, siteData, nodesMap, measureMap) {
        singleCompLayout.measureComponentChildren(structureInfo, getDomNodeFunc, measureMap, nodesMap, siteData);
    }

    function customMeasureComponent(proxyCompInfo, nodesMap, measureMap, siteData) {
        var compId = proxyCompInfo.compId;
        var node = getDomNodeFunc(compId);
        nodesMap[compId] = node;
        var structureInfo = proxyCompInfo.structureInfo;
        structureInfo.id = compId;
        structureInfo.type = proxyCompInfo.compType;
        measureComponentChildren(structureInfo, siteData, nodesMap, measureMap);
        if (singleCompLayout.maps.classBasedCustomMeasures[proxyCompInfo.compType]) {
            singleCompLayout.maps.classBasedCustomMeasures[proxyCompInfo.compType](compId, measureMap, nodesMap, siteData, proxyCompInfo.structureInfo);
        }
    }

    function measureAppPart(id, measureMap, nodesMap) {
        var inlineContentId = id + inlineContent;
        var dataState = _.get(nodesMap, [id, 'attributes', 'data-state', 'value']);

        if (utils.stringUtils.isTrue(nodesMap[id].getAttribute('data-dynamic-height')) &&
            dataState !== 'loading') {
            measureMap.height[id] = measureMap.height[inlineContentId];
            measureMap.minHeight[id] = measureMap.height[inlineContentId];
        }
    }

    function preMeasureProxies(structure, appPartNode, measureMap, nodesMap, siteData) {
        var id = structure.id;
        var inlineContentId = id + inlineContent;
        var rootNode = appPartNode.querySelector('#' + inlineContentId);
        measureMap.custom[id] = measureMap.custom[id] || {};

        var needsRelayout = false;

        _.forEach(proxyLayoutRegistrar.getProxiesToMeasure(), function (measureFunction, proxyName) {
            var proxyNodes = getProxyNodesFunc(proxyName, rootNode);
            measureMap.custom[id][proxyName] = measureMap.custom[id][proxyName] || [];

            _.forEach(proxyNodes, function (node, index) {
                var proxyNodeMeasure = measureFunction(node, siteData, measureMap);
                measureMap.custom[id][proxyName][index] = proxyNodeMeasure;
                if (proxyNodeMeasure.comp) {
                    customMeasureComponent(proxyNodeMeasure.comp, nodesMap, measureMap, siteData);
                }

                if (proxyNodeMeasure.needsRelayout && !measureMap.custom[id][proxyName][index].didRelayout) {
                    needsRelayout = true;
                    measureMap.custom[id][proxyName][index].didRelayout = true;
                }
            });
        });

        var changedCompsMap = {};
        changedCompsMap[structure.id] = true;

        return {
            needsAdditionalInnerLayout: needsRelayout,
            changedCompsMap: changedCompsMap
        };
    }

    function postPatchProxies(structure, measureMap, patchers, nodesMap, siteData) {
        var id = structure.id;

        measureMap.custom[id].appPartShouldRenderAgain = _.reduce(proxyLayoutRegistrar.getProxiesToMeasure(), function (appPartShouldRenderAgain, measureFunction, proxyName) {
            var proxyNodesMeasuringResult = measureMap.custom[id][proxyName];

            var proxyShouldRenderAgain = _.reduce(proxyNodesMeasuringResult, function (prxyShouldRenderAgain, measureResult) {
                applyDomManipulations(measureResult.domManipulations);

                var compShouldRenderAgain = false;
                var compInfo = measureResult.comp;
                if (compInfo) {
                    compShouldRenderAgain = singleCompLayout.patchComponent(compInfo.structureInfo, patchers, nodesMap, measureMap, siteData);
                }
                return prxyShouldRenderAgain || compShouldRenderAgain;
            }, false);

            return appPartShouldRenderAgain || proxyShouldRenderAgain;
        }, false);
    }

    function applyDomManipulations(domManipulations) {
        _.forEach(domManipulations, function (manipulation) {
            var node = $(manipulation.node);
            var funcName = manipulation.funcName;
            var params = _.isArray(manipulation.params) ? manipulation.params : [manipulation.params];

            if (_.isFunction(node[funcName])) {
                node[funcName].apply(node, params);
            }
        });
    }

    function getProxyNodesFunc(proxyName, contextNode) {
        return $("[data-proxy-name=" + proxyName + "]", contextNode);
    }

    layout.registerLayoutInnerCompsFirst("wixapps.integration.components.AppPart", preMeasureProxies, postPatchProxies);
    layout.registerLayoutInnerCompsFirst("wixapps.integration.components.AppPart2", preMeasureProxies, postPatchProxies);

    layout.registerRequestToMeasureChildren("wixapps.integration.components.AppPart", [[inlineContent]]);
    layout.registerRequestToMeasureDom("wixapps.integration.components.AppPart");
    layout.registerCustomMeasure("wixapps.integration.components.AppPart", measureAppPart);
    layout.registerSAFEPatcher("wixapps.integration.components.AppPart", patchAppPart);

    layout.registerRequestToMeasureChildren("wixapps.integration.components.AppPart2", [[inlineContent]]);
    layout.registerRequestToMeasureDom("wixapps.integration.components.AppPart2");
    layout.registerCustomMeasure("wixapps.integration.components.AppPart2", measureAppPart);
    layout.registerSAFEPatcher("wixapps.integration.components.AppPart2", patchAppPart);

    return {
        appPartMeasureFunction: measureAppPart,
        appPartPatcherFunction: patchAppPart,
        inlineContentId: inlineContent,
        preMeasureProxies: preMeasureProxies,
        postPatchProxies: postPatchProxies
    };
});
