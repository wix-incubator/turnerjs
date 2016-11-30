define(['lodash', 'layout/util/layout', 'layout/specificComponents/wixappsLayout'], function(_, /** layout.layout */ layout, wixappsLayout){
    "use strict";

    function getAppPartDataId(dataItem){
        return dataItem.appPartName ? dataItem.id : dataItem.dataItemRef.id;
    }

    function getAppPartNodeId(zoomNodeId, permaLinkDataItem){
        var mediaZoomId = permaLinkDataItem.id;
        var appPartId = getAppPartDataId(permaLinkDataItem);
        return zoomNodeId + mediaZoomId + appPartId;
    }

    function patchAppPartInMobile(appPartId, patchers, measureMap){
        var inlineContentId = appPartId + "inlineContent";
        var height = Math.max(measureMap.height[appPartId], measureMap.height.screen);

        patchers.css(inlineContentId, {
            height: height
        });

    }
    function patchAppPartZoomInMobile(id, appPartId, patchers, measureMap) {
        var height = Math.max(measureMap.height[appPartId], measureMap.height.screen);

        patchers.css(id, {
            height: height
        });
    }

    function isApplicationExists(data, siteData){
        var appId = _.has(data, 'dataItemRef') ? data.dataItemRef.appInnerID : data.appInnerID;
        return !!siteData.getClientSpecMapEntry(appId);
    }

    layout.registerRequestToMeasureChildren('wixapps.integration.components.AppPartZoom', function(siteData, id, nodesMap, structureInfo){
        if (!isApplicationExists(structureInfo.dataItem, siteData)){
            return null;
        }
        var appPartId = getAppPartDataId(structureInfo.dataItem);
        var mediaZoomId = structureInfo.dataItem.id;
        return [[mediaZoomId, appPartId], [mediaZoomId, appPartId, wixappsLayout.inlineContentId]];
    });

    layout.registerCustomMeasure('wixapps.integration.components.AppPartZoom', function(id, measureMap, nodesMap, siteData, structureInfo){
        if (!isApplicationExists(structureInfo.dataItem, siteData)){
            return null;
        }
        var appPartId = getAppPartNodeId(id, structureInfo.dataItem);
        wixappsLayout.appPartMeasureFunction(appPartId, measureMap, nodesMap, siteData);
        measureMap.custom[id] = {
            marginTop: Math.max((measureMap.height.screen - measureMap.height[appPartId]) / 2, 0),
            height: measureMap.height[appPartId]
        };
    });

    layout.registerSAFEPatcher('wixapps.integration.components.AppPartZoom', function(id, patchers, measureMap, structureInfo, siteData){
        if (!isApplicationExists(structureInfo.dataItem, siteData)){
            return;
        }
        //structureInfo is not in use so we are lazy :)
        var appPartNodeId = getAppPartNodeId(id, structureInfo.dataItem);

        if (siteData.isMobileView()){
            patchAppPartZoomInMobile(id, appPartNodeId, patchers, measureMap);
            patchAppPartInMobile(appPartNodeId, patchers, measureMap);
        } else {
            wixappsLayout.appPartPatcherFunction(appPartNodeId, patchers, measureMap, null, siteData);
        }

    });


    layout.registerLayoutInnerCompsFirst("wixapps.integration.components.AppPartZoom", function(structureInfo, zoomNode, measureMap, nodesMap, siteData){
        if (!isApplicationExists(structureInfo.dataItem, siteData)){
            return null;
        }
        var appPartNodeId = getAppPartNodeId(structureInfo.id, structureInfo.dataItem);
        var fakeStructure = {
            id: appPartNodeId
        };
        var appPartNode = window.document.getElementById(appPartNodeId);

        var changedCompsMap = {};
        changedCompsMap[structureInfo.id] = true;

        return {
            needsAdditionalInnerLayout: wixappsLayout.preMeasureProxies(fakeStructure, appPartNode, measureMap, nodesMap, siteData),
            changedCompsMap: changedCompsMap
        };


    }, function(structureInfo, measureMap, patchers, nodesMap, siteData){
        if (!isApplicationExists(structureInfo.dataItem, siteData)){
            return null;
        }
        var appPartNodeId = getAppPartNodeId(structureInfo.id, structureInfo.dataItem);
        var fakeStructure = {
            id: appPartNodeId
        };

        return wixappsLayout.postPatchProxies(fakeStructure, measureMap, patchers, nodesMap, siteData);
    });
});
