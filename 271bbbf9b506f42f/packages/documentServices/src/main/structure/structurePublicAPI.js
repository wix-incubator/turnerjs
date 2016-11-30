define([
    'documentServices/structure/structure',
    'documentServices/structure/structureUtils',
    'documentServices/structure/utils/arrangement',
    'documentServices/utils/utils'
], function(
    structure,
    structureUtils,
    arrangement,
    dsUtils
) {
    "use strict";

    return {
        initMethod: structure.initialize,
        methods: {
            components: {
                setContainer: {dataManipulation: structure.setContainer, isUpdatingAnchors: dsUtils.YES, getReturnValue: structure.getNewComponentPointerAfterReparent},
                reparentComponentToPage: {dataManipulation: structure.reparentComponentToPage, isUpdatingAnchors: dsUtils.YES, getReturnValue: structure.getNewComponentPointerAfterReparent},
                isShowOnAllPages: structure.isShowOnAllPages,
                layout: {
                    /**
                     * Update the layout of a component - resize, move or rotate it.
                     * Angle is validated to the range of 0-359 degrees.
                     *
                     * @member documentServices.components.layout
                     * @param {compPointer} compReference
                     * @param {Object} layoutObject
                     * @param {number} layoutObject.x
                     * @param {number} layoutObject.y
                     * @param {number} layoutObject.width
                     * @param {number} layoutObject.height
                     * @param {number} layoutObject.rotationInDegrees
                     * @param {boolean} layoutObject.fixedPosition
                     * @param {number} layoutObject.scale
                     *      @example
                     *      documentServices.components.layout.update(comp, {x:100, width: 50, angleInDegrees: 255}, false)
                     */
                    update: {
                        dataManipulation:structure.updateCompLayout,
                        isUpdatingAnchors: dsUtils.YES,
                        singleComp: structure.shouldUpdateSingleComp,
                        noRefresh: true
                    },
                    updateAndAdjustLayout: {dataManipulation:structure.updateCompLayoutAndAdjustLayout, isUpdatingAnchors: dsUtils.NO, singleComp: true},
                    /**
                     * Changes the component to/from fixed/absolute positioning
                     *
                     * @member documentServices.components.layout
                     * @param {compPointer} compPointer
                     * @param {boolean} shouldBeFixed
                     */
                    updateFixedPosition: {dataManipulation: structure.updateFixedPosition, isUpdatingAnchors: dsUtils.YES, singleComp: false},
                    updateAndPreserveProportions: {dataManipulation: structure.updateAndPreserveProportions, isUpdatingAnchors: dsUtils.YES, singleComp: false},

                    /**
                     * Gets the component's layout relative to the structure - meaning the X and the Y will be relative to the whole document and not just the parent
                     *
                     * @member documentServices.components.layout
                     * @param {compPointer} compPointer
                     * @return {layoutObject}
                     */
                    getRelativeToStructure: structure.getCompLayoutRelativeToStructure,
                    /**
                     * Gets the component's layout relative to the screen.
                     * The X will be relative to the screen, and the Y will be relative to the structure (legacy issues).
                     *
                     * For a 'real' relative to screen position (viewport), see getRelativeToScreenConsideringScroll
                     *
                     * @member documentServices.components.layout
                     * @param {compPointer} compPointer
                     * @return {layoutObject}
                     */
                    getRelativeToScreen: structure.getCompLayoutRelativeToScreen,
                    /**
                     * Gets the component's layout relative to the screen.
                     * The X and Y will be relative to the screen (viewport)
                     *
                     * @member documentServices.components.layout
                     * @param {compPointer} compPointer
                     * @return {layoutObject}
                     */
                    getRelativeToScreenConsideringScroll: structure.getCompLayoutRelativeToScreenConsideringScroll,

                    getProportionStructure: structure.getProportionStructure,

                    getEffectiveTextDimensions: structure.getEffectiveTextDimensions,

                    getMinDimensions: structure.getMinDimensions,
                    isFixedPosition: structure.isFixedPosition,
                    isHorizontallyStretchedToScreen: structure.isHorizontallyStretchedToScreen,
                    isHorizontallyStretchedToScreenByStructure: structure.isHorizontallyStretchedToScreenByStructure,
                    isRenderedInFixedPosition: structure.isRenderedInFixedPosition,
                    isAncestorRenderedInFixedPosition: structure.isAncestorRenderedInFixedPosition,
                    isShowOnFixedPosition: structure.isShowOnFixedPosition,
                    isDocked: structure.isDocked,
                    isRotated: structure.isRotated,
                    getDockedStyle: structure.getDockedStyle,
                    getDock: structure.getDock,
                    setDock: {dataManipulation: structure.setDock, isUpdatingAnchors: dsUtils.YES, singleComp: true},
                    updateDock: {dataManipulation: structure.updateDock, isUpdatingAnchors: dsUtils.YES, singleComp: true},
                    unDock: {dataManipulation: structure.unDock, isUpdatingAnchors: dsUtils.YES},
                    updateAspectRatio: {dataManipulation: structure.updateAspectRatio, singleComp: true},
                    removeAspectRatio: {dataManipulation: structure.removeAspectRatio, singleComp: true},
                    isAspectRatioOn: structure.isAspectRatioOn
                },
                arrangement: {
                    canMoveForward: arrangement.canMoveForward,
                    canMoveBackward: arrangement.canMoveBackward,
                    moveBackward: {dataManipulation: arrangement.moveBackward},
                    moveForward: {dataManipulation: arrangement.moveForward},
                    moveToFront: {dataManipulation: arrangement.moveToFront},
                    moveToBack: {dataManipulation: arrangement.moveToBack},
                    moveToIndex: {dataManipulation: arrangement.moveToIndex}
                }
            },
            siteSegments: {
                layout: {
                    update: {
                        dataManipulation: structure.updateCompLayout,
                        isUpdatingAnchors: dsUtils.YES,
                        singleComp: true,
                        noRefresh: true
                    }
                },
                /**
                 * @class documentServices.siteSegments.arrangement
                 * @link documentServices.components.arrangement
                 */
                arrangement: {
                    canMoveForward: structure.canMoveForward,
                    canMoveBackward: structure.canMoveBackward,
                    moveBackward: {dataManipulation: structure.moveBackward},
                    moveForward: {dataManipulation: structure.moveForward},
                    moveToFront: {dataManipulation: structure.moveToFront},
                    moveToBack: {dataManipulation: structure.moveToBack}
                }
            },
            utils: {
                getBoundingLayout: structureUtils.getBoundingLayout,
                getLayoutFromBoundingLayout: structureUtils.getLayoutFromBoundingLayout
            },
            site: {
                getHeight: structure.getSiteHeight,
                setScrollAndScale: {dataManipulation: structure.setScrollAndScale},
                setScroll: structure.setScroll,
                getScroll: structure.getScroll,
                isScrollingEnabled: structure.isScrollingEnabled,
                getSiteX: structure.getSiteX
            }
        }
    };

    /**
     * @typedef {{
     *  x: [number],
     *  y: [number],
     *  width: [number],
     *  height: [number]
     * }} positionAndSize
     */


    /**
     * @typedef {object} compPointer
     */
});
