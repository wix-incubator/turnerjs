/**
 * Created with IntelliJ IDEA.
 * User: avim
 * Date: 6/9/14
 * Time: 3:48 PM
 * To change this template use File | Settings | File Templates.
 */

define([
    'lodash',
    'react',
    'reactDOM',
    'santaProps',
    'utils',
    'core/components/baseCompMixin',
    'core/components/animationsMixin',
    'core/components/actionsAspectActions/triggerTypesConsts',
    'experiment'], function
    (_,
     React,
     ReactDOM,
     santaProps,
     utils,
     baseCompMixin,
     animationsMixin,
     triggerTypesConsts,
     experiment) {
    'use strict';

    /** core.componentPropsBuilder */
    var componentPropsBuilder = santaProps.componentPropsBuilder;

    var COMPONENTS_TO_KEEP_IN_STUB = [
        "wysiwyg.viewer.components.tpapps.TPAGluedWidget",
        "wysiwyg.viewer.components.tpapps.TPASection",
        "wysiwyg.viewer.components.tpapps.TPAMultiSection",
        "wysiwyg.viewer.components.tpapps.TPAWidget"
    ];
    var COMPONENTS_TO_DISPLAY_IN_LANDING_PAGE = [
        "wysiwyg.viewer.components.PageGroup",
        "wysiwyg.viewer.components.PagesContainer"
    ];

    var Animations = {
        ENTER: utils.siteConstants.Animations.Modes.AnimationType.ENTER,
        LEAVE: utils.siteConstants.Animations.Modes.AnimationType.LEAVE,
        TRANSITION: utils.siteConstants.Animations.Modes.AnimationType.TRANSITION
    };

    function fetchStaticBehaviors(siteData, structure, pageId) {
        return _.get(siteData.getDataByQuery(structure.behaviorQuery, pageId, siteData.dataTypes.BEHAVIORS), 'items', []);
    }

    /**
     * Recursive function to register all page elements with behaviors to their actions
     * @param {SiteData} siteData
     * @param {object} structure
     */
    function getStaticBehaviors(isMobileView, structure, siteAPI) {
        var siteData = siteAPI.getSiteData();
        var behaviorsObj = fetchStaticBehaviors(siteData, structure);
        var myBehaviors = {};

        var isComponentVisible = !_.get(siteAPI.getRuntimeDal().getCompProps(structure.id), 'isHidden');
        if (isComponentVisible) {
            myBehaviors[structure.id] = behaviorsObj || [];
        }
        myBehaviors[structure.id] = behaviorsObj || [];
        var children = utils.dataUtils.getChildrenData(structure, isMobileView);

        return _.transform(children, function (acc, childStructure) {
            _.assign(acc, getStaticBehaviors(isMobileView, childStructure, siteAPI));
        }, myBehaviors);
    }

    function getPageBehaviorsFromRuntimeDal(isMobileView, structure, runtimeDal) {
        return _.transform(utils.dataUtils.getAllCompsInStructure(structure, isMobileView), function (acc, childStructure) {
            var myBehaviors = _.set({}, childStructure.id, runtimeDal.getActionsAndBehaviors(childStructure.id));
            _.assign(acc, myBehaviors);
        }, {});
    }

    function convertBehaviors(behaviors, compId) {
        return _.map(behaviors, function (behaviorObj) {
            if (behaviorObj.behavior && behaviorObj.action) {
                return behaviorObj;
            }
            var action = {name: behaviorObj.action, sourceId: behaviorObj.sourceId || compId, type: 'comp'};
            var behavior = _.omit(behaviorObj, ['action', 'sourceId', 'pageId', 'duration', 'delay']);
            behavior.targetId = behavior.targetId || compId;
            _.assign(behavior.params, _.pick(behaviorObj, ['duration', 'delay']));

            return {
                action: action,
                behavior: behavior
            };
        });
    }

    function registerAllBehaviors(props) {
        var isHoverBoxExpOpen = experiment.isOpen('sv_hoverBox');
        props = isHoverBoxExpOpen ? props : this.props;

        var behaviorAspect = props.siteAPI.getSiteAspect('behaviorsAspect');
        var isMobileView = props.siteData.isMobileView();
        var runtimeDal = props.siteAPI.getRuntimeDal();
        var pageBehaviors = getPageBehaviorsFromRuntimeDal(isMobileView, props.structure, runtimeDal);
        var actionsAndBehaviors = _.mapValues(pageBehaviors, convertBehaviors);

        actionsAndBehaviors = _(actionsAndBehaviors).reject(_.isEmpty).flatten().value();
        behaviorAspect.setBehaviorsForActions(actionsAndBehaviors, props.rootId);
    }

    function registerStaticBehaviors(props) {
        var actionsAspect = props.siteAPI.getSiteAspect('actionsAspect');
        var pageBehaviors = getStaticBehaviors(props.siteData.isMobileView(), props.structure, props.siteAPI);
        _.forEach(pageBehaviors, function (behaviors, compId) {
            actionsAspect.registerBehaviors(compId, props.rootId, behaviors);
        }, this);
    }

    function buildSetObjectFromIdsArray(arr) {
        return _.zipObject(arr, _.times(arr.length, _.constant(true)));
    }

    function setDimensionsAndPixelSizesForDockedComponents(props, structure, dimensionsMap) {
        if (dimensionsMap[structure.id] && _.get(structure, 'layout.docked')) {
            props.dimentions = dimensionsMap[structure.id];
            if (props.style.width) {
                props.style.width = dimensionsMap[structure.id].width;
            }
            if (props.style.height) {
                props.style.height = dimensionsMap[structure.id].height;
            }
        }
    }

    function isSitePagesComponent(structureId) {
        return structureId === 'SITE_PAGES';
    }

    function createPage(pageId, isFirstPage, parentPageProps) {
        var pageProps = componentPropsBuilder.getRootProps(pageId, parentPageProps.siteAPI, parentPageProps.viewerPrivateServices, parentPageProps.loadedStyles, parentPageProps.measureMap);

        pageProps.firstPage = isFirstPage;

        return React.createElement(wixPageReact, pageProps);
    }

    function getPropsForSitePages(parentPageProps) {
        var props = {
            createPage: function(pageId, isFirstPage) {
                return createPage(pageId, isFirstPage, parentPageProps);
            },
            skin: 'skins.core.InlineSkin'
        };

        if (experiment.isOpen('sv_hoverBox')) {
            props.activeModes = parentPageProps.activeModes;
            props.measureMap = parentPageProps.measureMap;
        }

        return props;
    }

    function isPageComponent(structureType) {
        return _.includes(["Page", "Document"], structureType);
    }

    function getPropsForPageComponent(isPageStub, siteWidth, activeModes, measureMap) {
        var pageCompProps = {
            pageStub: isPageStub,
            style: {
                width: siteWidth
            }
        };

        if (isPageStub) {
            pageCompProps.style.display = 'none';
        }

        if (experiment.isOpen('sv_hoverBox')) {
            pageCompProps.activeModes = activeModes;
            pageCompProps.measureMap = measureMap;
        }

        return pageCompProps;
    }

    function buildComponentProps(pageProps, dimensionsMap, isPageStub, structure, isAffectedByModeChanges, isTransitioning) {
        var styleOverrides = getComponentStyleOverrides(structure, pageProps.rootId, pageProps.structure.id, pageProps.siteData);
        var compProps = componentPropsBuilder.getCompProps(structure, pageProps.siteAPI, pageProps.rootId, pageProps.loadedStyles, pageProps.viewerPrivateServices);

        if (styleOverrides) {
            compProps.style = _.merge(compProps.style || {}, styleOverrides);
        }
        if (isPageComponent(structure.type)) {
            _.merge(compProps, getPropsForPageComponent(isPageStub, pageProps.siteData.getSiteWidth(), pageProps.activeModes, pageProps.measureMap));
        }
        setDimensionsAndPixelSizesForDockedComponents(compProps, structure, dimensionsMap);
        if (isSitePagesComponent(structure.id)) {
            _.merge(compProps, getPropsForSitePages(pageProps));
        }

        if (experiment.isOpen('sv_hoverBox')) {
            compProps.isAffectedByModeChanges = isAffectedByModeChanges;
            if (isTransitioning) {
                compProps.className = (compProps.className || '') + ' transitioning-comp';
            }
        }

        return compProps;
    }

    function getComponentStyleOverrides(compStructure, rootId, pageCompId, siteData) {
        if (compStructure.id === pageCompId) {
            return {visibility: 'hidden'};
        }

        var styleOverrides;

        var isLandingPage = siteData.isPageLandingPage(siteData.getPrimaryPageId()) && rootId === "masterPage";
        var shouldComponentRender = _.includes(COMPONENTS_TO_DISPLAY_IN_LANDING_PAGE, compStructure.componentType);
        if (isLandingPage) {
            if (!shouldComponentRender) {
                styleOverrides = {display: "none"};
            } else if (experiment.isOpen('sv_partialReLayout')) {
                styleOverrides = {top: 0};
            }
        }

        return styleOverrides;
    }

    function anyChangeInActiveModesOfComponent (compStructure, modeChangesInPage) {
        var changesInActiveModesOfComponent = [];

        var compModeDefinitions = _.get(compStructure, 'modes.definitions');
        if (compModeDefinitions && compModeDefinitions.length) {
            var compModeDefinitionIds = _.map(compModeDefinitions, 'modeId');
            var idsOfModesThatChangedActiveStatus = _.keys(modeChangesInPage);
            changesInActiveModesOfComponent = _.intersection(idsOfModesThatChangedActiveStatus, compModeDefinitionIds);
        }

        return !_.isEmpty(changesInActiveModesOfComponent);
    }

    function getRootModeChanges(prevProps, nextProps){
        var prevRootActiveModes = _.get(prevProps, ['activeModes', nextProps.rootId]);
        var nextRootActiveModes = _.get(nextProps, ['activeModes', nextProps.rootId]);
        return utils.modes.getModeChanges(prevRootActiveModes, nextRootActiveModes);
    }

    function getCompPropsMapFromProps(rootStructure, pageProps, prevPageProps, isPageStub, prevCompPropsMapFromProps, currentlyAnimatingComponents) {
        var compPropsMap = {};
        var buildComponentInfo = function(anyChangeInParentActiveModes, structure) {
            return {structure: structure, anyChangeInParentActiveModes: anyChangeInParentActiveModes};
        };

        var siteData = pageProps.siteData;
        var dimensionsMap = utils.structureDimensions.createDimensionsMap(pageProps.structure, siteData.getScreenSize(), siteData.getSiteWidth(), siteData.isMobileView());
        var componentsInfoQue = [{structure: rootStructure, anyChangeInParentActiveModes: false}];
        var modeChangesInPage = getRootModeChanges(prevPageProps, pageProps);
        var didModesChange = !_.isEmpty(modeChangesInPage);
        while (componentsInfoQue.length) {
            var compInfo = componentsInfoQue.shift();
            var compStructure = compInfo.structure;
            var anyChangeInCompActiveModes = didModesChange && anyChangeInActiveModesOfComponent(compStructure, modeChangesInPage);
            var isAffectedByModeChanges = compInfo.anyChangeInParentActiveModes || anyChangeInCompActiveModes;
            var isStartingTransition = isAffectedByModeChanges && !!prevCompPropsMapFromProps[compStructure.id];
            var isAlreadyTransitioning = currentlyAnimatingComponents[compStructure.id] === Animations.TRANSITION;
            var isTransitioning = isAlreadyTransitioning || isStartingTransition;
            var displayedChildrenStructures = getCompDisplayedChildren(compStructure, siteData.isMobileView(), isPageStub);
            var displayedChildrenComponentInfo = _.map(displayedChildrenStructures, _.partial(buildComponentInfo, isAffectedByModeChanges));

            var compProps = buildComponentProps(pageProps, dimensionsMap, isPageStub, compStructure, isAffectedByModeChanges, isTransitioning);
            compProps.childrenSet = buildSetObjectFromIdsArray(_.map(displayedChildrenStructures, 'id'));
            compPropsMap[compStructure.id] = compProps;

            componentsInfoQue.push.apply(componentsInfoQue, displayedChildrenComponentInfo);
        }

        return compPropsMap;
    }

    function containsChildrenToKeepIfStub(isMobileView, structure) {
        var childrenData;

        if (_.includes(COMPONENTS_TO_KEEP_IN_STUB, structure.componentType)) {
            return true;
        }

        childrenData = utils.dataUtils.getChildrenData(structure, isMobileView);

        return _.some(childrenData, containsChildrenToKeepIfStub.bind(null, isMobileView));
    }

    function getCompDisplayedChildren(structure, isMobileView, isPageStub) {
        var childrenStructure = utils.dataUtils.getChildrenData(structure, isMobileView);

        if (isPageStub) {
            childrenStructure = _.filter(childrenStructure, containsChildrenToKeepIfStub.bind(null, isMobileView));
        }

        return childrenStructure;
    }

    function getTransitionValueOfComponent (compId, prevCompPropsMap, nextCompPropsMap, renderedCompPropsMap) {
        if (nextCompPropsMap[compId]) {
            return nextCompPropsMap[compId];
        }
        if (prevCompPropsMap[compId]) {
            return prevCompPropsMap[compId];
        }
        return renderedCompPropsMap[compId];
    }

    /**
     * returns playing comps and comps that have playing descendants
     * @param rootCompId
     * @param renderedCompPropsMap
     * @param currentlyPlayingCompAnimations
     * @return {{}}
     */
    function getCompPropsMapOfComponentsWithPlayingAnimationsOrPlayingDescendants (rootCompId, renderedCompPropsMap, currentlyPlayingCompAnimations) {
        var resultCompPropsMap = {};
        var isInResultMap = _.partial(_.has, resultCompPropsMap);
        fillMapWithComponentsThatHavePlayingAnimationsOrPlayingDescendants(rootCompId);

        function fillMapWithComponentsThatHavePlayingAnimationsOrPlayingDescendants(compId) {
            var compProps = renderedCompPropsMap[compId];
            var childrenIds = _.keys(compProps.childrenSet);

            for (var i = 0; i < childrenIds.length; i++) {
                fillMapWithComponentsThatHavePlayingAnimationsOrPlayingDescendants(childrenIds[i]);
            }

            var idsOfChildrenAlreadyInResultMap = _.filter(childrenIds, isInResultMap);
            var shouldAddCompToMap = currentlyPlayingCompAnimations[compId] || idsOfChildrenAlreadyInResultMap.length;

            if (shouldAddCompToMap) {
                resultCompPropsMap[compId] = _.clone(compProps);
                resultCompPropsMap[compId].childrenSet = buildSetObjectFromIdsArray(idsOfChildrenAlreadyInResultMap);
            }
        }

        return resultCompPropsMap;
    }

    function getComponentsHierarchyDuringModeChangeMap (prevCompPropsMap, nextCompPropsMap, renderedCompPropsMap, rootCompId, currentlyPlayingCompAnimations) {
        var compPropsMapOfComponentsRequiredToRenderBecauseOfPlayingAnimations = getCompPropsMapOfComponentsWithPlayingAnimationsOrPlayingDescendants(rootCompId, renderedCompPropsMap, currentlyPlayingCompAnimations);

        var prevStructureHierarchyMap = _.mapValues(prevCompPropsMap, function (compProps) {
            return _.pick(compProps, 'id', 'childrenSet');
        });
        var nextStructureHierarchyMap = _.mapValues(nextCompPropsMap, function (compProps) {
            return _.pick(compProps, 'id', 'childrenSet');
        });
        var requiredToRenderCompsHierarchyMap = _.mapValues(compPropsMapOfComponentsRequiredToRenderBecauseOfPlayingAnimations, function (compProps) {
            return _.pick(compProps, 'id', 'childrenSet');
        });

        return _.merge(prevStructureHierarchyMap, nextStructureHierarchyMap, requiredToRenderCompsHierarchyMap); //todo Shimi_Liderman 07/03/2016 20:08 performance - replace with own implementation if needed (no checks for circularity)
    }

    function getCompPropsMapDuringModeChange (rootCompId, prevCompPropsMap, nextCompPropsMap, renderedCompPropsMap, currentlyPlayingCompAnimations) {
        var componentsHierarchyMap = getComponentsHierarchyDuringModeChangeMap(prevCompPropsMap, nextCompPropsMap, renderedCompPropsMap, rootCompId, currentlyPlayingCompAnimations);
        var propsMapDuringModeChange = {};

        var compIdsQueue = [rootCompId];
        while (compIdsQueue.length) {
            var compId = compIdsQueue.shift();
            var childrenSetDuringModeChange = componentsHierarchyMap[compId].childrenSet;

            propsMapDuringModeChange[compId] = _.clone(getTransitionValueOfComponent(compId, prevCompPropsMap, nextCompPropsMap, renderedCompPropsMap));
            propsMapDuringModeChange[compId].childrenSet = childrenSetDuringModeChange;

            compIdsQueue.push.apply(compIdsQueue, _.keys(childrenSetDuringModeChange));
        }

        return propsMapDuringModeChange;
    }

    function getCompPropsWithoutMetaData(compProps) {
        return _.omit(compProps, ['childrenSet', 'isAffectedByModeChanges']);
    }

    function buildCompPropsTreeFromFlatMap(flatComponentPropsMap, rootCompId) {
        var compPropsWithMetaData = flatComponentPropsMap[rootCompId];
        var childrenIds = _.keys(compPropsWithMetaData.childrenSet);

        var compProps = getCompPropsWithoutMetaData(compPropsWithMetaData);
        compProps.children = _.map(childrenIds, _.partial(buildCompPropsTreeFromFlatMap, flatComponentPropsMap));

        return compProps;
    }

    function createCompToAnimationTypeMap(prevCompPropsMap, nextCompPropsMap) {
        var childrenAnimations = {};

        _.forEach(nextCompPropsMap, function(comp, compId) {
            var hasPrev = prevCompPropsMap && prevCompPropsMap[compId];
            if (comp && !hasPrev) {
                childrenAnimations[compId] = Animations.ENTER;
            }
        });

        _.forEach(prevCompPropsMap, function(comp, compId) {
            var hasNext = nextCompPropsMap && nextCompPropsMap[compId];
            var hasPrev = prevCompPropsMap && prevCompPropsMap[compId];

            if (comp && !hasNext) {
                childrenAnimations[compId] = Animations.LEAVE;
            } else if (hasPrev && hasNext && nextCompPropsMap[compId].isAffectedByModeChanges) {
                childrenAnimations[compId] = Animations.TRANSITION;
            }
        });

        return childrenAnimations;
    }

    function getParentConstructor(componentType) {
        return (componentType && utils.compFactory.getCompClass(componentType)) || React.DOM.div;
    }

    function buildReactComponentsTreeFromCompPropsTree(propsNode) {
        var propsWithConstructedChildren = _.clone(propsNode);
        propsWithConstructedChildren.children = _.map(propsNode.children, buildReactComponentsTreeFromCompPropsTree);

        var reactConstructor = getParentConstructor(propsWithConstructedChildren.structure.componentType);
        return reactConstructor(propsWithConstructedChildren);
    }

    function triggerModeAnimationsInit(pageId, siteAPI, modeChanges, childrenAnimations, transitioningChildrenPrevLayout, onComplete) {
        var actionsAspect = siteAPI.getSiteAspect('actionsAspect');
        actionsAspect.executeAction('modeChange', triggerTypesConsts.MODE_CHANGED_INIT, {
            modeChanges: modeChanges,
            componentAnimations: childrenAnimations,
            transitioningComponentsPrevLayout: transitioningChildrenPrevLayout,
            pageId: pageId,
            onComplete: onComplete
        });
    }

    function triggerModeAnimationsExecute (siteAPI) {
        var actionsAspect = siteAPI.getSiteAspect('actionsAspect');
        actionsAspect.executeAction('modeChange', triggerTypesConsts.MODE_CHANGED_EXECUTE);
    }

    function areAnyAnimationsPlaying (currentlyPlayingComponentAnimations) {
        if (!experiment.isOpen('sv_hoverBox')) {
            return false;
        }

        return !_.isEmpty(currentlyPlayingComponentAnimations);
    }

    function getLayoutForTransitioningChildren(siteAPI, prevCompPropsMap, childrenAnimations, prevMeasureMap, siteData) {
        if (!prevMeasureMap) {
            return {};
        }

        var scrollAspect = siteAPI.getSiteAspect('windowScrollEvent');
        var scrollPosition = scrollAspect.getScrollPosition();
        var isTransitionAnimation = _.partial(_.eq, Animations.TRANSITION);
        return _(childrenAnimations)
            .pick(isTransitionAnimation)
            .mapValues(function(transitionType, compId) {
                return {
                    width: prevMeasureMap.width[compId],
                    height: prevMeasureMap.height[compId],
                    left: prevMeasureMap.absoluteLeft[compId] - siteData.getSiteX() - scrollPosition.x,
                    top: prevMeasureMap.absoluteTop[compId] - scrollPosition.y,
                    rotation: prevCompPropsMap[compId].structure.layout.rotationInDegrees
                };
            })
            .value();
    }

    function shouldPageBeStubByProps(pageProps){
        return !this.isComponentActive(pageProps);
    }

    var wixPageReact = React.createClass({
        displayName: "WixPageReact",

        propTypes: {
          pageStub: React.PropTypes.bool
        },

        mixins: [baseCompMixin.baseComp, animationsMixin],

        componentWillMount: function () {
            this.currentlyAnimatingComponents = {};
            this.childrenAnimations = {};
            this.transitioningChildrenPrevLayout = {};
            this.renderedCompPropsMap = {};
            this.prevCompPropsMap = {};

            if (this.props.siteAPI) {
                registerStaticBehaviors.call(this, this.props);
                registerAllBehaviors.call(this, this.props);
            }

            this.updateRenderedCompPropsMap(this.props, this.props);
        },

        shouldComponentUpdatePage: function (nextProps) {
            //TODO: refactor this so that the stub will render only once
            return this.isComponentActive(nextProps);
        },

        isStub: function () {
            return this.props.pageStub;
        },

        updateRenderedCompPropsMap: function(nextProps, prevProps) {
            var prevCompPropsMap = this.prevCompPropsMap;
            var currentlyAnimatingComponents = this.currentlyAnimatingComponents;
            var nextCompPropsMap = getCompPropsMapFromProps(nextProps.structure, nextProps, prevProps, shouldPageBeStubByProps.call(this, nextProps), prevCompPropsMap, currentlyAnimatingComponents);
            var isHoverBoxExpOpen = experiment.isOpen('sv_hoverBox');
            var modeChangesInPage = getRootModeChanges(prevProps, nextProps);
            var didModesChange = !_.isEmpty(modeChangesInPage);

            if (isHoverBoxExpOpen && didModesChange) {
                this.childrenAnimations = createCompToAnimationTypeMap(prevCompPropsMap, nextCompPropsMap);
                this.transitioningChildrenPrevLayout = getLayoutForTransitioningChildren(nextProps.siteAPI, prevCompPropsMap, this.childrenAnimations, nextProps.measureMap, nextProps.siteData);
                _.assign(currentlyAnimatingComponents, this.childrenAnimations);
                triggerModeAnimationsInit(nextProps.rootId, nextProps.siteAPI, modeChangesInPage, this.childrenAnimations, this.transitioningChildrenPrevLayout, this.handleModeChangeAnimationsFinished);
            }

            if (isHoverBoxExpOpen && areAnyAnimationsPlaying(currentlyAnimatingComponents)) {
                this.renderedCompPropsMap = getCompPropsMapDuringModeChange(nextProps.structure.id, prevCompPropsMap, nextCompPropsMap, this.renderedCompPropsMap, currentlyAnimatingComponents);
            } else {
                this.renderedCompPropsMap = nextCompPropsMap;
            }

            this.prevCompPropsMap = nextCompPropsMap;
        },

        componentWillUpdate: function(nextProps) {
            registerAllBehaviors.call(this, nextProps);
            if (experiment.isOpen('sv_hoverBox')) {
                registerStaticBehaviors.call(this, nextProps, this.props);
                if (shouldPageBeStubByProps.call(this, nextProps)) {
                    this.props.siteAPI.deactivateModesInPage(this.props.rootId);
                }
            }
            this.updateRenderedCompPropsMap(nextProps, this.props);
        },

        render: function () {
            var componentPropsTree = buildCompPropsTreeFromFlatMap(this.renderedCompPropsMap, this.props.structure.id);
            return buildReactComponentsTreeFromCompPropsTree(componentPropsTree);
        },

        updateVisibility: function () {
            var isContextReady = this.props.siteAPI.getSiteAspect('WidgetAspect').isContextReady(this.props.rootId); // TODO: should come from props

            if (isContextReady) {
                ReactDOM.findDOMNode(this).style.visibility = '';
            }
        },

        componentDidLayout: function () {
            this.updateVisibility();
        },

        componentDidUpdate: function () {
            var rootId = this.props.rootId;
            var siteAPI = this.props.siteAPI;

            if (experiment.isOpen('sv_hoverBox')) {
                registerStaticBehaviors.call(this, this.props);

                if (!_.isEmpty(this.childrenAnimations)) {
                    triggerModeAnimationsExecute(siteAPI);
                    this.childrenAnimations = {};
                    this.transitioningChildrenPrevLayout = {};
                }
            } else {
                var actionsAspect = siteAPI.getSiteAspect('actionsAspect');//eslint-disable-line react/no-did-mount-callbacks-from-props
                if (!actionsAspect.isPageRegistered(rootId)) {
                    actionsAspect.setPageAsRegistered(rootId);
                    registerStaticBehaviors.call(this, this.props);
                }
            }
        },

        handleModeChangeAnimationsFinished: function (finishedComponentAnimations) {
            this.currentlyAnimatingComponents = _.omit(this.currentlyAnimatingComponents, _.keys(finishedComponentAnimations));
            if (!areAnyAnimationsPlaying(this.currentlyAnimatingComponents)) {
                this.forceUpdate();
            }
        }
    });

    return wixPageReact;
});
