define(['documentServices/dataModel/dataModel', 'documentServices/structure/structure'], function (dataModel, structure) {
    'use strict';

    function replaceFullScreenPropertyWithDocking(ps, compPointer) {
        var propertiesItem = dataModel.getPropertiesItem(ps, compPointer);
        if (propertiesItem && propertiesItem.fullScreenModeOn) {
            structure.setDock(ps, compPointer, {left: {vw: 0}, right: {vw: 0}});
            dataModel.updatePropertiesItem(ps, compPointer, {fullScreenModeOn: false});
        }
    }

    return {
        replaceFullScreenPropertyWithDocking: replaceFullScreenPropertyWithDocking
    };

});
