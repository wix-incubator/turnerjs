define(['layout/util/reduceDistancesAlgorithm/enforceComponentsMinHeight', 'layout/util/reduceDistancesAlgorithm/enforceAnchorsAndDocking'],
    function (enforceComponentsMinHeight, enforceAnchorsAndDocking) {
        'use strict';

        return {
            enforce: function(enforceData){
                if (!enforceData.skipEnforce){
                    enforceComponentsMinHeight(enforceData.structure, enforceData.measureMapManager,
                        enforceData.anchorsDataManager, enforceData.originalValuesManager, enforceData.isMobileView, enforceData.lockedCompsMap, enforceData.layoutsMap);

                    enforceAnchorsAndDocking(enforceData.structure, enforceData.measureMapManager,
                        enforceData.anchorsDataManager, enforceData.originalValuesManager, enforceData.isMobileView, enforceData.lockedCompsMap, enforceData.layoutsMap);
                }

                return enforceData.flatDataMap;
            }
        };
    });
