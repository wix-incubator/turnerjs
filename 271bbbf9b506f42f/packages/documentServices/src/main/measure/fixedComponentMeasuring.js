define(['lodash'], function (_) {
    'use strict';

    var measuringTypes = {};

    function setMeasuringForType(compTypes, measuringFunc) {
        if (!_.isArray(compTypes)) {
            compTypes = [compTypes];
        }

        _.forEach(compTypes, function (type) {
            measuringTypes[type] = measuringFunc;
        });
    }

    function getMeasuringByType(compType) {
        return measuringTypes[compType];
    }
    
    function getFixedComponentMeasurements(measuringFunc, compMeasuringInfo, screenSize, siteMarginBottom) {
        var compLayout = compMeasuringInfo.layout;
        var measurements;

        if (measuringFunc) {
            measurements = measuringFunc(compMeasuringInfo, screenSize.width, screenSize.height, siteMarginBottom || 0);
        } else {
            return null;
        }

        return {
            top: measurements.top,
            left: measurements.left,
            height: compLayout.height,
            width: compLayout.width
        };
    }

    return {
        getFixedComponentMeasurements: getFixedComponentMeasurements,
        setMeasuringForType: setMeasuringForType,
        getMeasuringByType: getMeasuringByType
    };
});