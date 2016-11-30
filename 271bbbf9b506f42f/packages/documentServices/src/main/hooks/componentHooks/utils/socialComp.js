define(['documentServices/dataModel/dataModelPublicAPI'], function (dataModelPublicAPI) {
    'use strict';

    function updateComponentData(ps, compPointer, compData) {
        var methodDef = dataModelPublicAPI.methods.components.data.update;
        var args = [ps, compPointer, compData];
        var params = {
            methodName: 'components.data.update',
            singleComp: methodDef.singleComp(ps, compPointer)
        };
        ps.setOperationsQueue.runSetOperation(methodDef.dataManipulation, args, params);
    }

    function updateUrlFormatIfNeeded(ps, compPointer, dataType, urlFormat) {
        var compData = dataModelPublicAPI.methods.components.data.get(ps, compPointer) || {type: dataType};

        if (compData.urlFormat !== urlFormat) {
            compData.urlFormat = urlFormat;
            updateComponentData(ps, compPointer, compData);
        }
    }

    return {
        updateUrlFormatIfNeeded: updateUrlFormatIfNeeded
    };
});
