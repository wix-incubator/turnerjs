define(['lodash', 'utils',
    'documentServices/componentsMetaData/metaDataMap',
    'documentServices/theme/theme',
    'layout',
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/metaDataUtils',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/page/popupUtils',
    'experiment'
], function
    (_, utils, metaDataMap, theme, layout, constants, metaDataUtils, documentModeInfo, popupUtils, experiment) {
    'use strict';

    var META_DATA_TYPES = {
        ANCHORS: 'anchors',
        CONTAINABLE: 'containable',
        CONTAINABLE_BY_STRUCTURE: 'containableByStructure',
        CAN_CONTAIN: 'canContain',
        CAN_CONTAIN_BY_STRUCTURE: 'canContainByStructure',
        IS_CONTAIN_CHECK_RECURSIVE: 'isContainCheckRecursive',
        GROUPABLE: 'groupable',
        ENFORCE_CONTAINER_CHILD_LIMITS_BY_WIDTH: 'enforceContainerChildLimitsByWidth',
        ENFORCE_CONTAINER_CHILD_LIMITS_BY_HEIGHT: 'enforceContainerChildLimitsByHeight',
        CONTAINER: 'container',
        MOVE_DIRECTIONS: 'moveDirections',
        RESIZABLE_SIDES: 'resizableSides',
        ROTATABLE: 'rotatable',
        FIXED_POSITION: 'canBeFixedPosition',
        MODAL: 'modal',
        MOBILE_ONLY: 'mobileOnly',
        CAN_BE_STRETCHED: 'canBeStretched',
        REMOVABLE: 'removable',
        DUPLICATABLE: 'duplicatable',
        HIDDENABLE: 'hiddenable',
        COLLAPSIBLE: 'collapsible',
        DOCKABLE: 'dockable',
        LAYOUT_LIMITS: 'layoutLimits',
        FULL_WIDTH: 'fullWidth',
        FULL_WIDTH_BY_STRUCTURE: 'fullWidthByStructure',
        STYLE_CAN_BE_APPLIED: 'styleCanBeApplied',
        ALIGNABLE: 'alignable',
        DISABLEABLE: 'disableable',
        RESIZE_ONLY_PROPORTIONALLY: 'resizeOnlyProportionally',
        ENFORCE_RESIZABLE_CORNERS: 'enforceResizableCorners',
        IS_PROPORTIONALLY_RESIZABLE: 'isProportionallyResizable',
        USING_LEGACY_APP_PART_SCHEMA: 'usingLegacyAppPartSchema',
        DEFAULT_MOBILE_PROPERTIES: 'defaultMobileProperties',
        MOBILE_CONVERSION_CONFIG: 'mobileConversionConfig'
    };

    function isTryingToInsertParentIntoChild(ps, parentComponentPointer, childComponentPointer) {
        var parent = ps.pointers.components.getParent(childComponentPointer);
        while (parent) {
            if (_.isEqual(parent, parentComponentPointer)) {
                return true;
            }
            parent = ps.pointers.components.getParent(parent);
        }

        return false;
    }

    function isComponentAContainer(ps, componentPointer){
        return metaDataUtils.isContainer(metaDataUtils.getComponentType(ps, componentPointer)) ||
            ps.pointers.components.isMasterPage(componentPointer);
    }

    function isSwitchingScopesAllowed(ps, componentPointer, potentialContainerPointer) {
        var compPageId = ps.pointers.components.getPageOfComponent(componentPointer).id;
        var containerPageId = ps.pointers.components.getPageOfComponent(potentialContainerPointer).id;

        if (compPageId !== containerPageId) {
            if (!ps.pointers.components.isInMasterPage(componentPointer) && !ps.pointers.components.isInMasterPage(potentialContainerPointer)) {
                return false;
            } else if (documentModeInfo.isMobileView(ps)) {
                return false;
            }
        }
        return true;
    }

    function isPotentialContainerMatchesContained (isByStructure, ps, containedComp, potentialContainerPointer) {
        var potentialContainerCompType = metaDataUtils.getComponentType(ps, potentialContainerPointer);
        var containedCompType = isByStructure ? containedComp.componentType : metaDataUtils.getComponentType(ps, containedComp);
        return metaDataUtils.isComponentParentTypeMatchesComponentChildType(potentialContainerCompType, containedCompType);

    }

    function isPopupContainer(ps, potentialContainerPointer) {
        var potentialContainerCompType = metaDataUtils.getComponentType(ps, potentialContainerPointer);
        return popupUtils.isPopupContainer(potentialContainerCompType);
    }

    function isContainerWidthWiderThanComp(isByStructure, ps, containedComp, potentialContainerPointer) {
        var potentialContainerCompType = metaDataUtils.getComponentType(ps, potentialContainerPointer);
        var containedCompType = isByStructure ? containedComp.componentType : metaDataUtils.getComponentType(ps, containedComp);

        var isContainedFullWidth = isCompFullWidth(ps, containedComp, isByStructure);
        var isPotentialContainerFullWidth = isCompFullWidth(ps, potentialContainerPointer);
        var isPotentialContainerSiteSegment = metaDataUtils.isHeaderOrFooterOrPageOrMasterPage(potentialContainerCompType);
        //I think this shouldn't be, and any component should be containable in a strip
        var isContainedNonContainableFullWidth = metaDataUtils.isNonContainableFullWidth(containedCompType);

        return !isContainedFullWidth || (isPotentialContainerFullWidth && !isContainedNonContainableFullWidth) || isPotentialContainerSiteSegment;

    }

    function isContainable(isByStructure, ps, comp, potentialContainerPointer) {
        var canBeContained = isComponentAContainer(ps, potentialContainerPointer) &&
            (
                isContainerWidthWiderThanComp(isByStructure, ps, comp, potentialContainerPointer) ||
                isPotentialContainerMatchesContained(isByStructure, ps, comp, potentialContainerPointer) ||
                isPopupContainer(ps, potentialContainerPointer)
            ) &&
            !isTryingToInsertParentIntoChild(ps, comp, potentialContainerPointer);

        if (isByStructure) {
            return canBeContained;
        }
        return canBeContained && isSwitchingScopesAllowed(ps, comp, potentialContainerPointer);
    }

    function defaultContainable(isByStructure, ps, comp, potentialContainerPointer) {
        if (potentialContainerPointer) {
            return isContainable(isByStructure, ps, comp, potentialContainerPointer);
        } else if (documentModeInfo.isMobileView(ps) || isCompFullWidth(ps, comp, isByStructure) || isHorizontalDockToScreen(ps, comp)){
            return false;
        }
        return true;
    }

    function defaultGroupable(ps, comp) {
        return getMetaData(ps, META_DATA_TYPES.CONTAINABLE, comp);
    }

    function defaultDuplicatable(ps) {
        if (documentModeInfo.isMobileView(ps)) {
            return false;
        }
        return true;
    }


    function getComponentStyle(ps, compPointer) {
        var styleId = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'styleId'));
        if (styleId) {
            return theme.styles.get(ps, styleId);
        }
        return null;
    }

    function getAnchorableHeight(ps, compPointer) {
        var compHeight = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout.height'));
        if (!isContainer(ps, compPointer)) {
            return compHeight;
        }
        var compStyle = getComponentStyle(ps, compPointer);
        var compSkin = compStyle && compStyle.skin || ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'skin'));

        return compHeight - utils.layoutAnchors.getNonAnchorableHeightForSkin(compSkin, compStyle);
    }

    function defaultIsAlignable(ps, compPointer) {
        var compLayout = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'layout'));
        return !(compLayout.fixedPosition || compLayout.docked);
    }

    var DEFAULTS = {
        containable: defaultContainable.bind(null, false),
        containableByStructure: defaultContainable.bind(null, true),
        container: isComponentAContainer,
        canContain: isComponentAContainer,
        canContainByStructure: isComponentAContainer,
        isContainCheckRecursive: true,
        moveDirections: [constants.MOVE_DIRECTIONS.HORIZONTAL, constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.BOTTOM, constants.RESIZE_SIDES.RIGHT],
        rotatable: false,
        anchors: {
            to: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.THRESHOLD},
            from: {allow: true, lock: constants.ANCHORS.LOCK_CONDITION.THRESHOLD}
        },
        canBeFixedPosition: true,
        canBeStretched: false,
        showMarginsIndicator: false,
        removable: true,
        alignable: defaultIsAlignable,
        duplicatable: defaultDuplicatable,
        hiddenable: true,
        collapsible: true,
        dockable: true,
        fullWidth: defaultIsFullWidth,
        fullWidthByStructure: defaultIsFullWidthByStructure,
        styleCanBeApplied: false,
        groupable: defaultGroupable,
        enforceContainerChildLimitsByWidth: true,
        enforceContainerChildLimitsByHeight: true,
        layoutLimits: {
            minWidth: utils.siteConstants.COMP_SIZE.MIN_WIDTH,
            minHeight: utils.siteConstants.COMP_SIZE.MIN_HEIGHT,
            maxWidth: utils.siteConstants.COMP_SIZE.MAX_WIDTH,
            maxHeight: utils.siteConstants.COMP_SIZE.MAX_HEIGHT,
            aspectRatio: null
        },
        isProportionallyResizable: isProportionallyResizable,
        resizeOnlyProportionally: false,
        enforceResizableCorners: false
    };

    var componentsMetaDataMap = metaDataMap.getMap();

    function getCompOrDefaultMetaData(compType, metaDataKey) {
        var metadataValue = _.get(componentsMetaDataMap, [compType, metaDataKey]);
        return _.isUndefined(metadataValue) ? DEFAULTS[metaDataKey] : metadataValue;
    }


    function defaultIsFullWidth(ps, compPointer){
        var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);

        return utils.dockUtils.isHorizontalDockToScreen(compLayout) || metaDataUtils.isLegacyFullWidthContainer(ps, compPointer);
    }

    function defaultIsFullWidthByStructure(ps, compStructure){
        return utils.dockUtils.isHorizontalDockToScreen(compStructure.layout) || metaDataUtils.isLegacyFullWidthContainerByType(compStructure.componentType);
    }

    /**
     * @param {ps} ps
     * @param {string} metaDataKey
     * @param {Pointer} componentPointer
     * @param {...*} [] additional params per specific meta-data type requirements - will be passed on to the meta-data function
     * @returns {boolean}
     */
    function getMetaData(ps, metaDataKey, componentPointer) {
        var compType = metaDataUtils.getComponentType(ps, componentPointer);
        var metaData = getCompOrDefaultMetaData(compType, metaDataKey);

        if (typeof (metaData) === 'function') {
            var args = _.toArray(arguments);
            args.splice(1, 1); // remove metaDataKey from arguments, leave additional trailing optional params
            return metaData.apply(this, args);
        }

        return metaData;
    }

    function getMetaDataByStructure(ps, componentStructure, metaDataKey) {
        var compType = componentStructure.componentType;
        var metaData = getCompOrDefaultMetaData(compType, metaDataKey);
        if (_.isFunction(metaData)) {
            metaData = metaData(ps, componentStructure);
        }
        return metaData;
    }

    function getCompResizableSides(ps, component) {
        return getMetaData(ps, META_DATA_TYPES.RESIZABLE_SIDES, component);
    }

    function isCompFullWidth(ps, comp, isByStructure) {
        if (isByStructure) {
            return getMetaDataByStructure(ps, comp, META_DATA_TYPES.FULL_WIDTH_BY_STRUCTURE);
        }
        return getMetaData(ps, META_DATA_TYPES.FULL_WIDTH, comp);
    }

    function isContainer(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.CONTAINER, componentPointer);
    }

    function isMovable(ps, componentPointer) {
        return !!getMetaData(ps, META_DATA_TYPES.MOVE_DIRECTIONS, componentPointer).length;
    }

    function isResizable(ps, componentPointer) {
        return !!getCompResizableSides(ps, componentPointer).length;
    }

    function isAlignable(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.ALIGNABLE, componentPointer) && isMovable(ps, componentPointer);
    }

    function isRotated(ps, componentPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);

        return isRotatedByLayout(compLayout);
    }

    function isRotatedByLayout(layoutData) {
        return (_.isObject(layoutData) && layoutData.rotationInDegrees !== 0);
    }

    function canBeStretched(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.CAN_BE_STRETCHED, componentPointer) && !isRotated(ps, componentPointer);
    }

    function canBeStretchedByStructure(ps, componentStructure) {
        return getMetaDataByStructure(ps, componentStructure, META_DATA_TYPES.CAN_BE_STRETCHED) && !isRotatedByLayout(componentStructure.layout);
    }

    function isStretched(ps, componentPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);

        return utils.dockUtils.isStretched(compLayout);
    }

    function isHorizontalDockToScreen(ps, componentPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);

        return utils.dockUtils.isHorizontalDockToScreen(compLayout);
    }

    function isRotatable(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.ROTATABLE, componentPointer) && !isStretched(ps, componentPointer);
    }

    function isPotentialContainerForScreenWidthComp(ps, potentialContainerPointer){
        var compType = metaDataUtils.getComponentType(ps, potentialContainerPointer);
        return metaDataUtils.isLegacyFullWidthContainer(ps, potentialContainerPointer) || popupUtils.isPopupContainer(compType);
    }

    /**
     *
     * @param {ps} ps
     * @param {Pointer} componentPointer
     * @param {Pointer} potentialContainerPointer
     */
    function canContain(ps, componentPointer, potentialContainerPointer){
        var isRecursive;
        var res = true;
        while (potentialContainerPointer && res){
            isRecursive = getMetaData(ps, META_DATA_TYPES.IS_CONTAIN_CHECK_RECURSIVE, potentialContainerPointer);
            res = getMetaData(ps, META_DATA_TYPES.CAN_CONTAIN, potentialContainerPointer, componentPointer);
            if (isRecursive) {
                potentialContainerPointer = ps.pointers.components.getParent(potentialContainerPointer);
            } else {
                potentialContainerPointer = null;
            }

        }
        return res;
    }

    function isComponentContainable(ps, componentPointer, potentialContainerPointer) {
        if (!potentialContainerPointer || !isContainer(ps, potentialContainerPointer)) {
            return false;
        }

        return canContain(ps, componentPointer, potentialContainerPointer) &&
            getMetaData(ps, META_DATA_TYPES.CONTAINABLE, componentPointer, potentialContainerPointer) &&
            (!isHorizontalDockToScreen(ps, componentPointer) || isPotentialContainerForScreenWidthComp(ps, potentialContainerPointer));
    }

    function isEnforcingContainerChildLimitationsByWidth(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.ENFORCE_CONTAINER_CHILD_LIMITS_BY_WIDTH, componentPointer);
    }

    function isEnforcingContainerChildLimitationsByHeight(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.ENFORCE_CONTAINER_CHILD_LIMITS_BY_HEIGHT, componentPointer);
    }

    function resizeOnlyProportionally(ps, componentPointer) {
        var layoutLimits = _.defaults(getMetaData(ps, META_DATA_TYPES.LAYOUT_LIMITS, componentPointer), DEFAULTS.layoutLimits);
        return !_.isNull(layoutLimits.aspectRatio);
    }

    function enforceResizableCorners(ps, componentPointer) {
        return getMetaData(ps, META_DATA_TYPES.ENFORCE_RESIZABLE_CORNERS, componentPointer);
    }

    function isHorizontallyResizable(ps, componentPointer) {
        return !!_.intersection(getCompResizableSides(ps, componentPointer), [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]).length ||
                resizeOnlyProportionally(ps, componentPointer);
    }

    function isVerticallyResizable(ps, componentPointer) {
        return !!_.intersection(getCompResizableSides(ps, componentPointer), [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM]).length ||
                resizeOnlyProportionally(ps, componentPointer);
    }

    function isProportionallyResizable(ps, componentPointer) {
        return isHorizontallyResizable(ps, componentPointer) && isVerticallyResizable(ps, componentPointer);
    }

    function isAnchorableFrom(ps, componentPointer) {
        var compType = metaDataUtils.getComponentType(ps, componentPointer);
        var compAnchorsMetaData = utils.componentsAnchorsMetaData;
        return _.get(compAnchorsMetaData[compType], 'from.allow', compAnchorsMetaData.default.from.allow);
    }

    function isAnchorableTo(ps, componentPointer) {
        var compType = metaDataUtils.getComponentType(ps, componentPointer);
        var compAnchorsMetaData = utils.componentsAnchorsMetaData;
        return _.get(compAnchorsMetaData[compType], 'to.allow', compAnchorsMetaData.default.to.allow);
    }

    return {
        public: {
            /**
             * Checks if a component can be contained in a potential container
             * @param {PrivateDocumentServices} ps
             * @param {AbstractComponent} componentPointer the component that will be contained
             * @param {AbstractComponent} potentialContainerPointer the container which will be the component's new parent
             * @returns {boolean}
             */
            isContainable: isComponentContainable,

            /**
             * Checks if a component can be contained in a potential container, using the component's serialized structure
             * @param {ps} ps
             * @param {object} componentStructure the serialized structure of the component that will be contained
             * @param {AbstractComponent} potentialContainerPointer the container which will be the component's new parent
             * @returns {boolean}
             */
            isContainableByStructure: function (ps, componentStructure, potentialContainerPointer) {
                var compType = componentStructure.componentType;
                var canContainByStructure = getMetaData(ps, META_DATA_TYPES.CAN_CONTAIN_BY_STRUCTURE, potentialContainerPointer, componentStructure);

                if (utils.dockUtils.isHorizontalDockToScreen(componentStructure.layout)){
                    canContainByStructure = canContainByStructure && isPotentialContainerForScreenWidthComp(ps, potentialContainerPointer);
                }

                var containableByStructureMetaData = getCompOrDefaultMetaData(compType, META_DATA_TYPES.CONTAINABLE_BY_STRUCTURE);
                var isContainableByStructure = _.isFunction(containableByStructureMetaData) ? containableByStructureMetaData(ps, componentStructure, potentialContainerPointer) :
                    containableByStructureMetaData;

                return Boolean(canContainByStructure && isContainableByStructure);
            },

            /**
             * Checks if a component is a valid container
             * @param {PrivateDocumentServices} ps
             * @param {AbstractComponent} componentPointer
             * @returns {boolean}
             */
            isContainer: isContainer,

            /**
             *
             * @param ps
             * @param componentPointer
             * @returns {boolean|*}
             */
            isAlignable: isAlignable,

            /**
             * Checks if a component is movable
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isMovable: isMovable,

            /**
             * Checks if a component is horizontally movable
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isHorizontallyMovable: function isHorizontallyMovable(ps, componentPointer) {
                return _.includes(getMetaData(ps, META_DATA_TYPES.MOVE_DIRECTIONS, componentPointer), constants.MOVE_DIRECTIONS.HORIZONTAL);
            },

            /**
             * Checks if a component is vertically movable
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isVerticallyMovable: function isVerticallyMovable(ps, componentPointer) {
                return _.includes(getMetaData(ps, META_DATA_TYPES.MOVE_DIRECTIONS, componentPointer), constants.MOVE_DIRECTIONS.VERTICAL);
            },

            /**
             * Checks if a component can move up
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            canMoveUp: function canMoveUp(ps, componentPointer) {
                return _.includes(getMetaData(ps, META_DATA_TYPES.MOVE_DIRECTIONS, componentPointer), constants.MOVE_DIRECTIONS.UP);
            },

            /**
             * Returns component settings in mobile view
             * @param {ps} ps
             * @param {Component} comp
             * @param {string} pageId
             * @returns {MobileConversionConfig}
             */
            getMobileConversionConfig: function getMobileConversionConfig(ps, comp, pageId) {
                var compType = comp.componentType;
                if (compType === 'tpa.viewer.components.tpapps.TPAGluedWidget') {
                    compType = 'wysiwyg.viewer.components.tpapps.TPAGluedWidget';
                } else if (compType === 'tpa.viewer.components.tpapps.TPAWidget') { 
                    compType = 'wysiwyg.viewer.components.tpapps.TPAWidget'; 
                }
                var mobileConversionConfig = _.get(componentsMetaDataMap, [compType, META_DATA_TYPES.MOBILE_CONVERSION_CONFIG]);
                return _.mapValues(mobileConversionConfig, function (value) {
                   return _.isFunction(value) ? value(ps, comp, pageId) : value;
                });
            },

            getDefaultMobileProperties: function getDefaultMobileProperties(ps, componentStructure, desktopProps) {
                var compType = componentStructure.componentType;
                var metaData = getCompOrDefaultMetaData(compType, META_DATA_TYPES.DEFAULT_MOBILE_PROPERTIES);
                return _.isFunction(metaData) ? metaData(ps, componentStructure, desktopProps) : metaData;
            },

            /**
             * Gets a component's resizable sides
             * @member documentServices.components.layout
             * @param {Pointer} componentPointer
             * @returns {Array}
             */
            getResizableSides: function getResizableSides(ps, componentPointer) {
                return getCompResizableSides(ps, componentPointer);
            },

            /**
             * Checks if a component is horizontally resizable
             * @param {PrivateDocumentServices} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isHorizontallyResizable: isHorizontallyResizable,

            /**
             * Checks if a component is vertically resizable
             * @param {PrivateDocumentServices} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isVerticallyResizable: isVerticallyResizable,

            /**
             * Checks if a component is proportionally resizable
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isProportionallyResizable: function (ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.IS_PROPORTIONALLY_RESIZABLE, componentPointer);
            },

            /**
             * Checks if a component is resizable
             * @param {PrivateDocumentServices} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isResizable: isResizable,

            /**
             * Checks if a component is rotatable
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            isRotatable: isRotatable,

            isGroupable: function isGroupable(ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.GROUPABLE, componentPointer);
            },

            /**
             * Checks if a component can be fixed position
             * @param {ps} ps
             * @param {Pointer} componentPointer
             * @returns {boolean}
             */
            canBeFixedPosition: function canBeFixedPosition(ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.FIXED_POSITION, componentPointer);
            },

            isModal: function isModal(ps, componentPointer) {
                return !!getMetaData(ps, META_DATA_TYPES.MODAL, componentPointer);
            },

            isMobileOnly: function isMobileOnly(ps, componentPointer) {
                return !!getMetaData(ps, META_DATA_TYPES.MOBILE_ONLY, componentPointer);
            },

            isUsingLegacyAppPartSchema: function isUsingLegacyAppPartSchema(ps, componentPointer) {
                return !!getMetaData(ps, META_DATA_TYPES.USING_LEGACY_APP_PART_SCHEMA, componentPointer);
            },

            /**
             * Checks if a component can be horizontal dock to screen
             * @param {PrivateDocumentServices} ps
             * @param {AbstractComponent} componentPointer
             * @returns {boolean}
             */
            canBeStretched: canBeStretched,

            canBeStretchedByStructure: canBeStretchedByStructure,

            resizeOnlyProportionally: resizeOnlyProportionally,

            enforceResizableCorners: enforceResizableCorners,

            isEnforcingContainerChildLimitations: function isEnforcingContainerChildLimitations(ps, componentPointer) {
                return isEnforcingContainerChildLimitationsByWidth(ps, componentPointer) ||
                    isEnforcingContainerChildLimitationsByHeight(ps, componentPointer);
            },

            isEnforcingContainerChildLimitationsByWidth: isEnforcingContainerChildLimitationsByWidth,

            isEnforcingContainerChildLimitationsByHeight: isEnforcingContainerChildLimitationsByHeight,

            /**
             * Checks if a component is rendered in a full width mode
             * @param {ps} ps
             * @param {AbstractComponent} componentPointer
             * @returns {boolean}
             */
            isFullWidth: function isFullWidth(ps, componentPointer) {
                return isCompFullWidth(ps, componentPointer, false);
            },

            /**
             * Checks if a component is rendered in a full width mode, using the component's serialized structure
             * @param {ps} ps
             * @param {object} componentStructure the serialized structure of the component
             * @returns {boolean}
             */
            isFullWidthByStructure: function isFullWidthByStructure(ps, componentStructure) {
                return isCompFullWidth(ps, componentStructure, true);
            },

            isRemovable: function isRemovable(ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.REMOVABLE, componentPointer);
            },

            isDuplicatable: function isDuplicatable(ps, componentPointer, potentialParentPointer) {
                return getMetaData(ps, META_DATA_TYPES.DUPLICATABLE, componentPointer, potentialParentPointer);
            },

            isStyleCanBeApplied: function isStyleCanBeApplied(ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.STYLE_CAN_BE_APPLIED, componentPointer);
            },

            getLayoutLimits: function (ps, compPointer) {
                var layoutLimits = _.defaults(getMetaData(ps, META_DATA_TYPES.LAYOUT_LIMITS, compPointer), DEFAULTS.layoutLimits);
                layoutLimits.maxWidth = Math.min(layoutLimits.maxWidth, DEFAULTS.layoutLimits.maxWidth);
                layoutLimits.maxHeight = Math.min(layoutLimits.maxHeight, DEFAULTS.layoutLimits.maxHeight);
                layoutLimits.minWidth = Math.max(layoutLimits.minWidth, DEFAULTS.layoutLimits.minWidth);
                layoutLimits.minHeight = Math.max(layoutLimits.minHeight, DEFAULTS.layoutLimits.minHeight);
                return layoutLimits;
            },
            isHiddenable: function (ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.HIDDENABLE, componentPointer);
            },
            isCollapsible: function (ps, componentPointer) {
                if (!experiment.isOpen('collapseComponent')){
                    return false;
                }

                return getMetaData(ps, META_DATA_TYPES.COLLAPSIBLE, componentPointer);
            },

            isDockable: function (ps, componentPointer) {
                return getMetaData(ps, META_DATA_TYPES.DOCKABLE, componentPointer);
            },
            isDisableable: function (ps, componentPointer) {
                return !!getMetaData(ps, META_DATA_TYPES.DISABLEABLE, componentPointer);
            },
            isAnchorableFrom: isAnchorableFrom,
            isAnchorableTo: isAnchorableTo,
            isPotentialContainerForScreenWidthComp: function(ps, compPointer){
                return isPotentialContainerForScreenWidthComp(ps, compPointer);
            }
        },

        // Internal methods for use within DocumentServices

        /**
         * Used internally in documentServices by the anchors module
         * @param {Object} compPointer
         * @returns {Number} height that can be used to calculate distance when creating bottom_parent anchors
         */
        getAnchorableHeight: getAnchorableHeight,

        /**
         * Used internally in documentServices by the component module
         * @param {ps} ps
         * @param {AbstractComponent} componentPointer
         * @returns {string} component type name
         */
        getComponentType: metaDataUtils.getComponentType
    };
});
