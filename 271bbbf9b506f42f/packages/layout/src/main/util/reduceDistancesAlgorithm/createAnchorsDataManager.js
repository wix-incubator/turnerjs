define(['lodash', 'layout/util/reduceDistancesAlgorithm/anchorsTypes'], function (_, anchorsTypes) {
    'use strict';

    var HARD_WIRED_COMPS = {
        'SITE_FOOTER': true,
        'SITE_HEADER': true,
        'SITE_PAGES': true,
        'PAGES_CONTAINER': true,
        'masterPage': true,
        'SITE_BACKGROUND': true
    };

    function getAnchorsData(anchorsMap, filterHardWiredCompsOnly, shrinkableContainersMap){
        var pageAnchors = _.flatten(_.values(anchorsMap));
        var siblingsAnchors = {
            from: {},
            to: {}
        };
        var childToParentAnchors = {
            from: {},
            to: {}
        };

        function addToSiblingsAnchorsMap(anchor){
            siblingsAnchors.from[anchor.fromComp] = siblingsAnchors.from[anchor.fromComp] || [];
            siblingsAnchors.from[anchor.fromComp].push(anchor);

            siblingsAnchors.to[anchor.targetComponent] = siblingsAnchors.to[anchor.targetComponent] || [];
            siblingsAnchors.to[anchor.targetComponent].push(anchor);
        }

        function addToChildToParentAnchorsMap(anchor){
            if (shrinkableContainersMap[anchor.targetComponent]){
                anchor = _.assign({}, anchor, {locked: true, distance: 0});
            }

            childToParentAnchors.from[anchor.fromComp] = anchor;

            childToParentAnchors.to[anchor.targetComponent] = childToParentAnchors.to[anchor.targetComponent] || [];
            childToParentAnchors.to[anchor.targetComponent].push(anchor);
        }

        function isAnchorToEnforce(anchor){
            return !filterHardWiredCompsOnly || (HARD_WIRED_COMPS[anchor.fromComp] && HARD_WIRED_COMPS[anchor.targetComponent]);
        }

        var anchorsToEnforce = _.filter(pageAnchors, isAnchorToEnforce);

        _.forEach(anchorsToEnforce, function(anchor){
            if (anchor.type === anchorsTypes.BOTTOM_PARENT){
                addToChildToParentAnchorsMap(anchor);
            } else {
                addToSiblingsAnchorsMap(anchor);
            }
        });

        return {
            anchors: anchorsToEnforce,
            siblingsAnchors: siblingsAnchors,
            childToParentAnchors: childToParentAnchors
        };
    }

    function AnchorsDataManager(anchorsMap, filterHardWiredComps, shrinkableContainersMap){
        var anchorsData = getAnchorsData(anchorsMap, filterHardWiredComps, shrinkableContainersMap);
        _.merge(this, {
            getComponentPushers: function(componentId){
                return anchorsData.siblingsAnchors.to[componentId] || [];
            },
            getComponentAnchorToParent: function(componentId){
                return anchorsData.childToParentAnchors.from[componentId];
            }
        });
    }

    return function createAnchorsDataManager(anchorsMap, filterHardWiredComps, shrinkableContainersMap){
        return new AnchorsDataManager(anchorsMap, filterHardWiredComps, shrinkableContainersMap);
    };
});
