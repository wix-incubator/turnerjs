define(['documentServices/componentsMetaData/componentsMetaData'], function(componentsMetaData){
    "use strict";
    return {
        initMethod: function () {},

        methods: {
            components: {
                layout: {
                    getResizableSides: componentsMetaData.public.getResizableSides,
                    canBeFixedPosition: componentsMetaData.public.canBeFixedPosition,
                    canBeStretched: componentsMetaData.public.canBeStretched,
                    canBeStretchedByStructure: componentsMetaData.public.canBeStretchedByStructure,
                    getLimits: componentsMetaData.public.getLayoutLimits
                },
                is: {
                    /**
                     * Checks if a container need to enforce child size limitation
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    enforcingContainerChildLimitations: componentsMetaData.public.isEnforcingContainerChildLimitations,
                    /**
                     * Checks if a component is a valid container
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    container: componentsMetaData.public.isContainer,
                    /**
                     * Checks if a component can be contained in a potential container
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer the component that will be contained
                     * @param {AbstractComponent} potentialContainerPointer the container which will be the component's new parent
                     * @returns {boolean}
                     */
                    containable: componentsMetaData.public.isContainable,
                    /**
                     * Checks if a component can be contained in a potential container, using the component's serialized structure
                     * @member documentServices.components.is
                     * @param {Object} componentStructure the serialized structure of the component that will be contained
                     * @param {AbstractComponent} potentialContainerPointer the container which will be the component's new parent
                     * @returns {boolean}
                     */
                    containableByStructure: componentsMetaData.public.isContainableByStructure,
                    styleCanBeApplied: componentsMetaData.public.isStyleCanBeApplied,
                    /**
                     * Checks if a component is movable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    movable: componentsMetaData.public.isMovable,
                    /**
                     * Checks if a component is horizontally movable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    horizontallyMovable: componentsMetaData.public.isHorizontallyMovable,
                    /**
                     * Checks if a component is vertically movable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    verticallyMovable: componentsMetaData.public.isVerticallyMovable,
                    /**
                     * Checks if a component can move up
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    canMoveUp: componentsMetaData.public.canMoveUp,
                    /**
                     * Checks if a component is resizable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    resizable: componentsMetaData.public.isResizable,
                    /**
                     * Checks if a component is horizontally resizable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    horizontallyResizable: componentsMetaData.public.isHorizontallyResizable,
                    /**
                     * Checks if a component is vertically resizable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    verticallyResizable: componentsMetaData.public.isVerticallyResizable,
                    /**
                     * Checks if a component is proportionally resizable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    proportionallyResizable: componentsMetaData.public.isProportionallyResizable,
                    /**
                     * Checks if a component should keep its proportions and allow resizing by corner knobs only
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    resizeOnlyProportionally: componentsMetaData.public.resizeOnlyProportionally,

                    enforceResizableCorners: componentsMetaData.public.enforceResizableCorners,
                    /**
                     * Checks if a component is rotatable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    rotatable: componentsMetaData.public.isRotatable,
                    /**
                     * Checks if a component is rendered in a full width mode
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    fullWidth: componentsMetaData.public.isFullWidth,
                    /**
                     * Checks if a component is rendered in a full width mode
                     * @member documentServices.components.is
                     * @param {object} componentStructure
                     * @returns {boolean}
                     */
                    fullWidthByStructure: componentsMetaData.public.isFullWidthByStructure,
                    /**
                     * Checks if a component can be contained in a group
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentPointer
                     * @returns {boolean}
                     */
                    groupable: componentsMetaData.public.isGroupable,

                    /**
                     * Checks if a component is alignable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @returns {boolean}
                     */
                    alignable: componentsMetaData.public.isAlignable,
                    /**
                     * Checks if a component is hiddenable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @returns {boolean}
                     */
                    hiddenable: componentsMetaData.public.isHiddenable,
                    /**
                     * Checks if a component is collapsible
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @returns {boolean}
                     */
                    collapsible: componentsMetaData.public.isCollapsible,
                    dockable: componentsMetaData.public.isDockable,
                    /**
                     * Checks if a component is disableable
                     * @member documentServices.components.is
                     * @param {AbstractComponent} componentReference
                     * @returns {boolean}
                     */
                    disableable: componentsMetaData.public.isDisableable,
                    anchorableFrom: componentsMetaData.public.isAnchorableFrom,
                    anchorableTo: componentsMetaData.public.isAnchorableTo,
                    potentialContainerForScreenWidthComp: componentsMetaData.public.isPotentialContainerForScreenWidthComp
                },
                /**
                 * Returns mobile view configuration for a component
                 * @member documentServices.components.getMobileConversionConfig
                 * @param {AbstractComponent} componentReference
                 * @returns {Object|undefined}
                 */
                getMobileConversionConfig: componentsMetaData.public.getMobileConversionConfig
            },
            siteSegments: {
                layout: {
                    getResizableSides: componentsMetaData.public.getResizableSides
                }
            }
        }
    };
});
