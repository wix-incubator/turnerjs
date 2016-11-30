define(['lodash',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/dataModel/dataModel',
    'documentServices/structure/structure'
],
    function (
        _,
        componentDetectorAPI,
        dataModel,
        structure
    ){
    'use strict';

        function replaceFullScreenModeToDock(ps, compPointer, compProperties) {
            structure.setDock(ps, compPointer, {left: {vw: 0}, right: {vw: 0}});
            compProperties.fullScreenModeOn = false;
            dataModel.updatePropertiesItem(ps, compPointer, compProperties);
        }


    return {
        exec: function (ps) {
            var allFiveGridLinesPointersInSite = componentDetectorAPI.getComponentByType(ps, 'wysiwyg.viewer.components.FiveGridLine');
            _.forEach(allFiveGridLinesPointersInSite, function(compPointer){
                var compProperties = dataModel.getPropertiesItem(ps, compPointer);
                var isFullModeOn = compProperties && compProperties.fullScreenModeOn;
                if (isFullModeOn){
                    replaceFullScreenModeToDock(ps, compPointer, compProperties);
                }
            });
        }
    };

});
