define(['lodash',
    'zepto',
    'tpa/layout/tpaMeasurer',
    'tpa/utils/gluedWidgetMeasuringUtils'
], function (
    _,
    $,
    tpaMeasurer,
    gluedWidgetMeasuringUtils
) {
    'use strict';

    function measureWixAdComponent(id, measureMap, nodesMap, siteData) {
        var skinPart = siteData.isMobileView() ? 'mobileWADTop' : 'desktopWADTop';
        var childNodeId = id + skinPart;
        var childNode = nodesMap[id].querySelector('#' + childNodeId);

        if (childNode) {
            measureMap.custom[id] = {
                topAd: childNode.getBoundingClientRect()
            };
        }
    }

    function addAutoPositionIfNeeded(measurements) {
        if (measurements.right === 0) {
            measurements.left = 'auto';
        }

        if (measurements.bottom === 0) {
            measurements.top = 'auto';
        }

        if (measurements.left === 0) {
            measurements.right = 'auto';
        }

        if (measurements.top === 0) {
            measurements.bottom = 'auto';
        }

        return measurements;
    }



    function measureGluedWidget(tryGetDefaultPlacement, id, measureMap, nodesMap, siteData, flatStructure) {
        var compProps = flatStructure.propertiesItem;
        var compData = flatStructure.dataItem;
        var compLayout = _.assign(flatStructure.layout, {
            height: $(nodesMap[id]).height(),
            width: $(nodesMap[id]).width()
        });
        var windowWidth = measureMap.width.screen;
        var windowHeight = measureMap.height.screen;

        compProps.placement = compProps.placement || tryGetDefaultPlacement(compData, siteData);

        var compStructure = {
            props: compProps,
            data: compData,
            layout: compLayout
        };
        var clientSpecMap = siteData.rendererModel.clientSpecMap;
        var measurements = gluedWidgetMeasuringUtils.getGluedWidgetMeasurements(clientSpecMap, compStructure, windowWidth, windowHeight, measureMap.siteMarginBottom);
        measurements = addAutoPositionIfNeeded(measurements);

        // Rename property names for top/left not being overridden
        measurements.fixedTop = measurements.top;
        measurements.fixedLeft = measurements.left;
        delete measurements.top;
        delete measurements.left;

        _.forEach(measurements, function (val, key) {
            measureMap[key] = measureMap[key] || {};
            measureMap[key][id] = val;
        });

        measureMap.width[id] = compLayout.width;

        tpaMeasurer.measureTPA(id, measureMap, nodesMap);
    }

    function GluedWidgetMeasurer(placementStrategy) {

        function tryGetDefaultPlacement(compDataQuery, siteData) {
            try {
                return placementStrategy.getDefaultPlacement(compDataQuery, siteData);
            } catch (e) {
                return '';
            }
        }

        this.measureWixAdComponent = measureWixAdComponent;
        this.measureGluedWidget = measureGluedWidget.bind(this, tryGetDefaultPlacement);
    }

    return GluedWidgetMeasurer;
});