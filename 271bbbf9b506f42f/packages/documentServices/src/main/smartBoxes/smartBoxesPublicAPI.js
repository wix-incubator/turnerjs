define([
    'documentServices/smartBoxes/smartBoxes',
    'documentServices/smartBoxes/multiComponentsUtils',
    'documentServices/smartBoxes/multiComponentsUtilsValidations',
    'documentServices/smartBoxes/grouping',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/utils/utils'
], function(smartBoxes, multiComponentsUtils, multiComponentsUtilsValidations, grouping, groupingUtils, dsUtils){
    "use strict";
    return {
        methods: {
            components: {
                layout: {
                    getSnugPositionAndSize: multiComponentsUtils.getSnugPositionAndSize,
                    getSnugLayout: multiComponentsUtils.getSnugLayout,
                    getSnugLayoutRelativeToScreen: multiComponentsUtils.getSnugLayoutRelativeToScreen,
                    getSnugLayoutRelativeToScreenConsideringScroll: multiComponentsUtils.getSnugLayoutRelativeToScreenConsideringScroll,
                    getSnugLayoutRelativeToStructure: multiComponentsUtils.getSnugLayoutRelativeToStructure
                },
                alignment: {
                    alignComponents: {dataManipulation: multiComponentsUtils.align, isUpdatingAnchors: dsUtils.YES},
                    alignInContainer: {dataManipulation: smartBoxes.alignInContainer, isUpdatingAnchors: dsUtils.YES, singleComp: true},
                    canAlign: multiComponentsUtilsValidations.canAlign
                },
                multiComponents: {
                    distribute: {dataManipulation: multiComponentsUtils.distribute, isUpdatingAnchors: dsUtils.YES},
                    canDistribute: multiComponentsUtilsValidations.canDistribute,
                    matchSize: {dataManipulation: multiComponentsUtils.matchSize, isUpdatingAnchors: dsUtils.YES},
                    canMatchSize: multiComponentsUtilsValidations.canMatchSize
                },
                groupComponents: {dataManipulation: grouping.groupComponents, isUpdatingAnchors: dsUtils.YES, getReturnValue: grouping.genGroupPointer},
                addToGroup: {dataManipulation: grouping.addToGroup, isUpdatingAnchors: dsUtils.YES},
                ungroup: {dataManipulation: grouping.ungroup, isUpdatingAnchors: dsUtils.YES, getReturnValue: grouping.getUngroupedComponents},
                is : {
                    group: groupingUtils.isGroup,
                    groupedComponent: groupingUtils.isGroupedComponent,
                    topMost: multiComponentsUtils.isTopMost,
                    leftMost: multiComponentsUtils.isLeftMost
                }
            }
        },
        initMethod: grouping.initialize
    };
});

