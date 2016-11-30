define(['lodash',
    'santaProps',
    'skins',
    'react',
    'utils',
    'core/components/baseCompMixin',
    'core/core/Touchy',
    'core/components/fixedPositionRenderPlugin',
    'experiment'
], function
    (_,
     santaProps,
     skinsPackage,
     React,
     utils,
     baseCompMixin,
     Touchy,
     fixedPositionRenderPlugin,
     experiment) {
    'use strict';

    var SantaTypes = santaProps.Types;
    var propsSelectorsFactory = santaProps.propsSelectorsFactory;

    var skinsRenderer = skinsPackage.skinsRenderer;
    var skins = skinsPackage.skins;

    skinsRenderer.registerRenderPlugin(fixedPositionRenderPlugin);

    function getCompCssStates() {
        var state;

        if (_.isFunction(this.getTransformedCssStates)) {
            var transformedCssStates = this.getTransformedCssStates();
            state = transformedCssStates !== undefined ? transformedCssStates : this.state;
        } else {
            state = this.state;
        }

        if (!state) {
            return {};
        }
        var stateAttribute = {};
        var cssState = [];

        _.forOwn(state, function (stateValue, stateGroup) {
            if (stateGroup.lastIndexOf('$', 0) === 0) {
                cssState.push(stateValue);
            }
        });

        //should be removed when no component uses this options
        if (_.isEmpty(cssState) && state.hasOwnProperty("cssState")) {
            cssState = _.values(state.cssState);
        }

        if (!_.isEmpty(cssState)) {
            stateAttribute["data-state"] = cssState.join(' ');
        }

        return stateAttribute;
    }

    function getSkin(comp) {
        var skinName = comp.props.skin;
        var skin = skins[skinName];
        if (!skin && comp.getDefaultSkinName) {
            skinName = comp.getDefaultSkinName();
            skin = skins[skinName];
        }
        return skin;
    }

    function ensureCursorPointerForClickableSkinParts(refData) {
        //this is due to a bug in iOS that doesn't fire onClick
        // event for non-clickable elements like div/span
        // since we don't see the cursor, it's ok to put it on all elements
        _(refData).filter(function (skinPart) {
            return _.has(skinPart, 'onClick');
        }).forEach(function (skinPart) {
            skinPart.style = _.assign(skinPart.style || {}, {cursor: 'pointer'});
        }).value();
    }

    function addHoverModeListeners(refData) {
        if (this.props.structure && this.props.structure.modes) {
            var hoverMode = _.find(this.props.structure.modes.definitions, {type: utils.siteConstants.COMP_MODES_TYPES.HOVER});
            if (hoverMode) {
                var compId = this.props.structure.id;
                refData[""].onMouseEnter = onHoverModeActivate(this.props.activateModeById, compId, this.props.rootId, hoverMode.modeId);
                refData[""].onMouseLeave = onHoverModeDeactivate(this.props.deactivateModeById, compId, this.props.rootId, hoverMode.modeId);
            }
        }
    }

    function getScrollModes() {
        var modeDefinitions = _.get(this, 'props.structure.modes.definitions');
        return _(modeDefinitions)
            .filter({type: 'SCROLL'})
            .sortBy('params.scrollPos')
            .value();
    }

    function scrollModesListener(position) {
        var compId = this.props.structure.id;
        var rootId = this.props.rootId;
        var scrollModes = getScrollModes.call(this);
        if (!scrollModes.length) {
            return;
        }
        var modeToActivate = _.findLast(scrollModes, function (modeDef) {
            return modeDef.params.scrollPos <= position.y;
        });
        var activeModes = this.props.getActiveModes();
        var currentActiveScrollMode = _.find(scrollModes, function(modeDef){
            return _.get(activeModes, [rootId, modeDef.modeId]);
        });

        if (modeToActivate && !currentActiveScrollMode) {
            this.props.activateModeById(compId, rootId, modeToActivate.modeId);
        } else if (!modeToActivate && currentActiveScrollMode) {
            this.props.deactivateModeById(compId, rootId, currentActiveScrollMode.modeId);
        } else if (modeToActivate && currentActiveScrollMode && modeToActivate.modeId !== currentActiveScrollMode.modeId) {
            this.props.switchModesByIds(compId, rootId, currentActiveScrollMode.modeId, modeToActivate.modeId);
        }

    }

    function addScrollModeListeners() {
        var scrollModes = getScrollModes.call(this);
        if (scrollModes.length) {
            this.props.windowScrollEventAspect.registerToScroll(this);
            this.onScroll = this.onScroll || scrollModesListener;
        }
    }


    function turnMobileDisplayModeOn() {
        if (_.get(this.props, ['structure', 'modes'])) {
            var hoverMode = _.find(this.props.structure.modes.definitions, {type: utils.siteConstants.COMP_MODES_TYPES.HOVER});
            if (hoverMode) {
                var mobileDisplayedModeId = _.get(this.props, ['compProp', 'mobileDisplayedModeId']);
                var compId = this.props.structure.id;
                if (mobileDisplayedModeId) {
                    this.props.activateModeById(compId, this.props.rootId, mobileDisplayedModeId);
                } else {
                    this.props.activateModeById(compId, this.props.rootId, hoverMode.modeId);
                }
            }
        }
    }

    function onHoverModeActivate(activateModeById, compId, pageId, modeId) {
        return function () {
            return activateModeById(compId, pageId, modeId);
        };
    }

    function onHoverModeDeactivate(deactivateModeById, compId, pageId, modeId) {
        return function () {
            return deactivateModeById(compId, pageId, modeId);
        };
    }

    function getStyleProperty(paramName, defaultValue) {
        return _.get(this.props.compTheme, ['style', 'properties', paramName], defaultValue);
    }

    function getDataPreviewStates() {
        var state = this.getComponentPreviewState();
        if (state) {
            return {"data-preview": state};
        }
    }


    function getRefData(skin) {
        var refData = this.getSkinProperties();

        // TODO: REMOVE AFTER BOTH EDITOR AND VIEWER ARE SYNCED (Santa Types Does)
        if (_.isFunction(this.transformRefDataTemp)) {
            this.transformRefDataTemp(refData);
        } else if (_.isFunction(this.transformRefData)) {
            this.transformRefData(refData);
        }

        if (this.props.transformSkinProperties) {
            refData = this.props.transformSkinProperties(refData);
        }

        if (!refData[""]) {
            refData[""] = {};
        }

        if (this.props.isMobileDevice) {
            ensureCursorPointerForClickableSkinParts(refData);
        }

        if (experiment.isOpen('sv_hoverBox')) {
            if (this.props.siteData && this.props.siteData.isMobileView()) {
                if (this.props.siteData.isViewerMode()) {
                    turnMobileDisplayModeOn.call(this, refData);
                }
            } else {
                addHoverModeListeners.call(this, refData);
            }
        }

        if (experiment.isOpen('dynamicHeader')) {
            addScrollModeListeners.call(this);
        }

        if (experiment.isOpen('collapseComponent') &&
            _.get(this.props.compProp, 'isCollapsed') &&
            this.props.renderFlags.componentViewMode !== 'editor') {
            refData[""]['data-collapsed'] = true;
        }

        this.updateRootRefDataStyles(refData[""]);

        _.assign(refData[""], getCompCssStates.call(this), getDataPreviewStates.call(this));
        if (!skin.react || skin.react.length === 0) {
            refData[""] = _.defaults(refData[""], refData.inlineContent);
        }

        return refData;
    }

    function createSantaTypesProps(childClassName, childProps) {
        var childSantaPropTypes = propsSelectorsFactory.getPropTypesForChildComponent(childClassName);
        return santaProps.santaTypesUtils.resolveComponentProps(childSantaPropTypes, childProps);
    }

    function createOldChildProps(itemData, className, skinPartName, extraProperties) {
        extraProperties = extraProperties || {};
        var skinExports = this.getSkinExports();
        var styleData = typeof skinPartName === 'string' ? {
            skin: skinExports[skinPartName].skin,
            styleId: this.props.styleId + skinPartName
        } : skinPartName;
        var props = {
            siteData: this.props.siteData,
            siteAPI: this.props.siteAPI,
            compProp: _.omit(this.props.compProp, 'isHidden'),
            loadedStyles: this.props.loadedStyles,
            compData: itemData,
            refInParent: _.get(itemData, 'id', ''),
            skin: styleData.skin,
            styleId: styleData.styleId,
            /**@deprecated */
            pageId: this.props.pageId,
            rootId: this.props.rootId,
            rootNavigationInfo: this.props.rootNavigationInfo,
            currentUrlPageId: this.props.currentUrlPageId
        };

        if (!itemData && !extraProperties.id) {
            throw new Error('Unable to set child comp id - no data item\\custom id were passed');
        }
        props.id = extraProperties.id || this.props.id + itemData.id;

        if (!itemData && !extraProperties.ref) {
            throw new Error('Unable to set child comp ref - no data item\\custom ref were passed');
        }
        props.ref = extraProperties.ref || itemData.id;

        props.compDesign = this.props.compDesign;
        // partial structure to be used by QA renderer plugin
        props.structure = _.assign({
            componentType: className,
            styleId: this.props.structure ? this.props.structure.styleId : "",
            skinPart: extraProperties.skinPart || props.ref
        }, extraProperties.structure);

        var childSantaTypesProps = createSantaTypesProps(className, props);

        props = _.merge(childSantaTypesProps, props, _.omit(extraProperties, 'structure'));

        return props;
    }

    function createRRChildProps(itemData, className, skinPartName, extraProperties) {
        extraProperties = extraProperties || {};
        var skinExports = this.getSkinExports();
        var styleData = typeof skinPartName === 'string' ? {
            skin: skinExports[skinPartName].skin,
            styleId: this.props.styleId + skinPartName
        } : skinPartName;
        var props = {
            rootId: this.props.rootId,
            rootNavigationInfo: this.props.rootNavigationInfo,
            compProp: _.omit(this.props.compProp, 'isHidden'),
            compData: itemData,
            refInParent: _.get(itemData, 'id', ''),
            skin: styleData.skin,
            styleId: styleData.styleId
        };

        if (!itemData && !extraProperties.id) {
            throw new Error('Unable to set child comp id - no data item\\custom id were passed');
        }
        props.id = extraProperties.id || this.props.id + itemData.id;

        if (!itemData && !extraProperties.ref) {
            throw new Error('Unable to set child comp ref - no data item\\custom ref were passed');
        }
        props.ref = extraProperties.ref || itemData.id;

        // partial structure to be used by QA renderer plugin
        props.structure = _.assign({
            componentType: className,
            styleId: this.props.structure ? this.props.structure.styleId : "",
            skinPart: extraProperties.skinPart || props.ref
        }, extraProperties.structure);

        var childSantaTypesProps = {};

        if (santaProps.propsSelectorsFactory.isSantaTypedComponentReactElement(this)) {
            var childCompSantaTypes = propsSelectorsFactory.getPropTypesForChildComponent(className);
            childSantaTypesProps = _.pick(this.props, _.keys(childCompSantaTypes));
        } else {
            childSantaTypesProps = createSantaTypesProps(className, _.assign(_.pick(this.props, ['siteAPI', 'siteData', 'loadedStyles']), props));
        }

        return _.assign(childSantaTypesProps, props, _.omit(extraProperties, 'structure'));
    }

    /**
     * @class core.skinBasedComp
     * @extends {core.baseCompMixin}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     * @property {function(): string} getDefaultSkinName
     * @property {function(): object} getSkinProperties
     */
    var skinBasedComp = {
        mixins: [baseCompMixin.baseComp],

        propTypes: {
            isTouchDevice: SantaTypes.Device.isTouchDevice,
            isMobileView: SantaTypes.isMobileView,
            isMobileDevice: SantaTypes.Device.isMobileDevice,
            isDebugMode: SantaTypes.isDebugMode,
            structure: SantaTypes.Component.structure,
            id: SantaTypes.Component.id,
            key: SantaTypes.Component.key,
            ref: SantaTypes.Component.ref,
            refInParent: SantaTypes.Component.refInParent,
            rootId: SantaTypes.Component.rootId,
            rootNavigationInfo: SantaTypes.Component.rootNavigationInfo,
            currentUrlPageId: SantaTypes.Component.currentUrlPageId,
            styleId: SantaTypes.Component.styleId,
            skin: SantaTypes.Component.skin,
            style: SantaTypes.Component.style,
            compProp: SantaTypes.Component.compProp,
            compData: SantaTypes.Component.compData,
            compActions: SantaTypes.Component.compActions,
            compTheme: SantaTypes.Component.theme,
            renderFlags: SantaTypes.renderFlags,
            getActiveModes: SantaTypes.Modes.getActiveModes,
            activateModeById: SantaTypes.Modes.activateModeById,
            deactivateModeById: SantaTypes.Modes.deactivateModeById,
            switchModesByIds: SantaTypes.Modes.switchModesByIds,
            windowScrollEventAspect: SantaTypes.SiteAspects.windowScrollEvent.isRequired,
            transformSkinProperties: React.PropTypes.func
        },

        renderHelper: function () {
            var skin = getSkin(this);

            if (!skin) {
                var componentType = (this.props.structure && this.props.structure.componentType) || '';
                utils.log.error("Skin [" + this.props.skin + "] not found for comp [" + componentType + "]");
                return React.DOM.div();
            }

            var refData = getRefData.call(this, skin);

            if (this.props.isTouchDevice) {
                var touchy = new Touchy();
                _.forEach(refData, function (ref) {
                    touchy.registerTouchEvents(ref);
                });
            }

            return skinsRenderer.renderSkinHTML.call(this, skin.react, refData, this.props.styleId, this.props.id, this.props.structure, this.props, this.state);
        },

        getComponentPreviewState: function () {
            return _.get(this, ['props', 'renderFlags', 'componentPreviewStates', this.props.id]);
        },

        render: function () {
            try {
                return this.renderHelper();
            } catch (e) {
                if (this.props.isDebugMode) {
                    throw e;
                }
                utils.log.error('Cannot render component', this.constructor.displayName, this.props.id, e);
                var deadRefData = {
                    "": {
                        style: this.props.style,
                        "data-dead-comp": true
                    }
                };

                return skinsRenderer.renderSkinHTML.call(this, skins['skins.viewer.deadcomp.DeadCompPublicSkin'].react, deadRefData, 'deadComp', this.props.id, this.props.structure, this.props, this.state);
            }
        },
        getSkinExports: function () {
            var skin = getSkin(this);
            return skin && skin.exports;
        },
        classSet: function (classesMap) {
            return utils.classNames(_.reduce(classesMap, function (result, value, className) {
                result[this.styleId + '_' + className] = value;
                return result;
            }, {}, this.props));
        },

        componentWillUpdate: function () {
            if (this.props.onComponentWillUpdate) {
                this.props.onComponentWillUpdate();
            }
        },

        getStyleProperty: getStyleProperty,

        /**
         *
         * @param {Object} itemData
         * @param {string} className
         * @param {(string|{skin: string, styleId: string})} skinPartName the skinPart name that is used in skin exports.
         * pass and object if you need to pass custom styleId and skin name
         * @param {Object} extraProperties
         * @returns {ReactCompositeComponent}
         */
        createChildComponent: function createChildComponent(itemData, className, skinPartName, extraProperties) {
            var compClass = utils.compFactory.getCompClass(className);

            if (!compClass) {
                return null;
            }

            if (santaProps.propsSelectorsFactory.isSantaTypedComponentByName(className)) {
                return compClass(createRRChildProps.call(this, itemData, className, skinPartName, extraProperties));
            }

            return compClass(createOldChildProps.call(this, itemData, className, skinPartName, extraProperties));
        }
    };

    return skinBasedComp;
});
