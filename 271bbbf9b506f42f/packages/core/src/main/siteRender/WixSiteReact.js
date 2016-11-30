define(['zepto', 'lodash', 'react', 'reactDOM',
    'santaProps',
    'core/siteRender/styleCollector',
    'core/siteRender/WixThemeReact',
    'core/siteRender/WixPageReact',
    'core/siteRender/wixBackgroundInstantiator',
    'layout',
    'utils',
    'core/siteRender/SiteAPI',
    'core/siteRender/siteAspectsMixin',
    'animations',
    'core/siteRender/siteAspectsDomContainer',
    'core/siteRender/extraSiteHeight',
    'core/siteRender/blockingLayer',
    'core/siteRender/wixAdsInstatiator',
    'core/siteRender/mobileAppBannerInstantiator',
    'mousetrap',
    'core/core/siteBI',
    'core/components/renderDoneMixin',
    'core/siteRender/WixPopupRoot',
    'core/siteRender/siteClickHandler',
    'core/siteRender/siteTraversalMixin',
    'core/components/selectionSharer/selectionSharer',
    'experiment'], function
    ($, _, React, ReactDOM,
     santaProps,
     /**core.styleCollector */ styleCollector,
     wixThemeReactClass,
     wixPageReactClass,
     wixBackgroundInstantiator,
     layout,
     /** utils */ utils,
     SiteAPI,
     siteAspectsMixin,
     animations,
     siteAspectsDomContainerClass,
     extraSiteHeightClass,
     blockingLayerClass,
     wixAdsInstatiator,
     mobileAppBannerInstantiator,
     mousetrap,
     siteBI,
     renderDoneMixin,
     WixPopupRootClass,
     siteClickHandler,
     siteTraversalMixin,
     selectionSharer,
     experiment) {
    'use strict';

    var componentPropsBuilder = santaProps.componentPropsBuilder;

    var DOM_ONLY_LAYOUTS = {
        'components.layout.update': true,
        'renderPlugins.setCompsToShowOnTop': true,
        'components.layout.updateAndAdjustLayout': true,
        'siteSegments.layout.update': true,
        'components.layout.updateDock': true,
        'components.layout.setDock': true,
        'components.layout.unDock': true
    };
    var domOnlyLayouts = DOM_ONLY_LAYOUTS.hasOwnProperty.bind(DOM_ONLY_LAYOUTS);

    var COMPONENTS_TO_UPDATE_GRAND_CHILDREN_WITH_DOM_ONLY = {
        'wysiwyg.viewer.components.BoxSlideShow': true,
        'wysiwyg.viewer.components.StripContainerSlideShow': true,
        'wysiwyg.viewer.components.StripColumnsContainer': true
    };
    var COMPONENTS_TO_UPDATE_PARENT_WITH_DOM_ONLY = {
        'wysiwyg.viewer.components.Column': isDesktopMode
    };
    var COMPONENTS_TO_UPDATE_SIBLINGS_WITH_DOM_ONLY = {
        'wysiwyg.viewer.components.Column': isDesktopMode
    };

    var MAX_Z_INDEX = utils.style.MAX_Z_INDEX;

    var wixThemeReact = React.createFactory(wixThemeReactClass);
    var wixPageReact = React.createFactory(wixPageReactClass);
    var wixPopupRootConstructor = React.createFactory(WixPopupRootClass);
    var siteAspectsDomContainer = React.createFactory(siteAspectsDomContainerClass);
    var extraSiteHeight = React.createFactory(extraSiteHeightClass);
    var blockingLayer = React.createFactory(blockingLayerClass);
    var dataUtils = utils.dataUtils;

    function isDesktopMode(siteAPI) {
        return !siteAPI.getSiteData().isMobileView();
    }

    function resolveDynamicValue(val, siteAPI) {
        return _.isFunction(val) ? val(siteAPI) : val;
    }

    function shouldUpdateParentWithDOMOnly(compType, siteAPI, parentComponentType) {
        return isGroup(parentComponentType) ||
            resolveDynamicValue(COMPONENTS_TO_UPDATE_PARENT_WITH_DOM_ONLY[compType], siteAPI);
    }

    function shouldUpdateSiblingsWithDOMOnly(compType, siteAPI) {
        return resolveDynamicValue(COMPONENTS_TO_UPDATE_SIBLINGS_WITH_DOM_ONLY[compType], siteAPI);
    }

    function shouldUpdateGrandChildrenWithDOMOnly(compType, siteAPI) {
        return resolveDynamicValue(COMPONENTS_TO_UPDATE_GRAND_CHILDREN_WITH_DOM_ONLY[compType], siteAPI);
    }

    function isGroup(compType) {
        return compType === 'wysiwyg.viewer.components.Group';
    }

    function getComponentsToApplyDOMStyle(structureHierarchy, siteAPI) {
        var siteData = siteAPI.getSiteData();
        var compStructure = _.last(structureHierarchy);
        var compChildren = dataUtils.getChildrenData(compStructure, siteData.isMobileView());
        var compsToApplyDOMStyle = [compStructure].concat(compChildren);

        if (structureHierarchy.length > 1) {
            var structureParent = structureHierarchy[structureHierarchy.length - 2];

            if (shouldUpdateParentWithDOMOnly(compStructure.componentType, siteAPI, structureParent.componentType)) {
                compsToApplyDOMStyle.push(structureParent);
            }

            if (shouldUpdateSiblingsWithDOMOnly(compStructure.componentType, siteAPI)) {
                var compSiblings = dataUtils.getChildrenData(structureParent, siteData.isMobileView());
                compsToApplyDOMStyle = compsToApplyDOMStyle.concat(compSiblings);
            }

            if (shouldUpdateGrandChildrenWithDOMOnly(compStructure.componentType, siteAPI)) {
                _.forEach(compChildren, function (childStructure) {
                    var grandChildren = dataUtils.getChildrenData(childStructure, siteData.isMobileView());
                    compsToApplyDOMStyle = compsToApplyDOMStyle.concat(grandChildren);
                });
            }
        }

        return compsToApplyDOMStyle;
    }

    /**
     * finds a node in a react component, if it is a react ref
     * @this {ReactComponent}
     * @returns {Element|undefined}
     */
    var reactPageFind = function (ref, a, b, c, d, e, f) {
        ref = ref && a ? ref.refs[a] : ref;
        ref = ref && b ? ref.refs[b] : ref;
        ref = ref && c ? ref.refs[c] : ref;
        ref = ref && d ? ref.refs[d] : ref;
        ref = ref && e ? ref.refs[e] : ref;
        ref = ref && f ? ref.refs[f] : ref;
        return ref && ReactDOM.findDOMNode(ref);
    };

    var scrollToAnchorDurationByDistance = {
        desktop: utils.math.interpolateSegmentsFunction([
            [0, 0.6], [360, 0.8], [720, 1], [1440, 1.2], [7200, 2.8], [9600, 3], [10000, 3]
        ]),
        mobile: utils.math.interpolateSegmentsFunction([
            [0, 0.5], [360, 0.7], [720, 0.9], [1440, 1.1], [7200, 2.7], [9600, 2.9], [10000, 2.9]
        ])
    };

    function getRootProps(siteAPI, loadedStyles) {
        var measureMap = this.deletedMeasureMap || this.props.siteData.measureMap;
        var props = componentPropsBuilder.getRootProps(this.props.rootId, siteAPI, this.props.viewerPrivateServices, loadedStyles, measureMap);

        props.structure = _.merge({}, props.structure, {layout: {position: this.props.siteRootPosition}}); //this is needed so that the SITE_ROOT, which is relative, gets it's height in a landing page
        props.ref = this.props.rootId;
        props.refInParent = props.ref;
        props.className = "SITE_ROOT";
        props.firstPage = true;
        delete props.id;
        props.style = {width: this.props.siteData.getSiteWidth()}; //this is correct for page, since it overrides it's default width
        props.key = (siteAPI.getSiteData().isMobileView() ? 'mobile_' : 'desktop_') + 'siteRoot';

        return props;
    }

    function getResizeHandler() {
        var self = this;
        return _.throttle(function () {
            if (!self.dead && self.getMasterPage()) {
                self.props.siteData.updateScreenSize();
                self.forceUpdate();
                //self.reLayout();
            }
        }, 500, {
            leading: false,
            trailing: true
        });
    }

    function activeExperimentsNotifier() {
        if (window.rendererModel) {
            var activeExperiments = _(window.rendererModel.runningExperiments)
                .pick(function (value) {
                    return value === 'new';
                })
                .keys().value();

            mousetrap.bind('ctrl+alt+shift+e', function () {
                window.alert('Active Experiments:\n' + activeExperiments).join('\n'); //eslint-disable-line no-alert
            });
        }
    }

    function reactVersionNotifier() {
        var siteData = this.props.siteData;
        var version = siteData.baseVersion || 'could not retrieve version!';

        mousetrap.bind('ctrl+alt+shift+v', function () {
            window.alert('You are running React!\nVersion: ' + version); //eslint-disable-line no-alert
        });
        var alertVersion = _.find(siteData.currentUrl.query, function (paramValue, paramKey) {
            return paramKey.toLowerCase() === 'alertversion';
        });
        if (alertVersion && (siteData.isMobileDevice() || siteData.isTabletDevice())) {
            window.alert('You are running React!\nVersion: ' + version); //eslint-disable-line no-alert
        }
    }

    function notifyComponentDidLayoutRecursive(comp) {
        if (comp.componentDidLayout) {
            comp.componentDidLayout.call(comp);
        }
        if (comp.componentDidLayoutAnimations) { //this is temp, should be more generic
            comp.componentDidLayoutAnimations.call(comp);
        }
        _.forOwn(comp.refs, notifyComponentDidLayoutRecursive);
    }

    function notifyComponentDidLayout(topLevelComps) {
        _.forEach(topLevelComps, notifyComponentDidLayoutRecursive);
    }

    function getMasterpageStructureForLandingPage(siteData) {
        var masterPageStructure = _.clone(siteData.getMasterPageData().structure);
        ['children', 'mobileComponents'].forEach(function (property) {
            var pagesContainer = _.chain(masterPageStructure[property]).find({id: "PAGES_CONTAINER"}).cloneDeep().value();
            pagesContainer.layout.y = 0;
            alterPagesContainerAnchorsForLandingPage(pagesContainer);
            masterPageStructure[property] = [pagesContainer];
        });
        return masterPageStructure;
    }

    function alterPagesContainerAnchorsForLandingPage(pagesContainer) {
        if (pagesContainer.layout.anchors) {
            // This is relevant for sites that were not saved in the editor since we moved the anchors from json to dynamic (removeJsonAnchors experiment)
            var siteAnchor = {
                distance: 0,
                locked: true,
                originalValue: pagesContainer.layout.height,
                targetComponent: 'masterPage',
                topToTop: pagesContainer.layout.height,
                type: "BOTTOM_PARENT"
            };

            while (pagesContainer.layout.anchors.length) {
                pagesContainer.layout.anchors.pop();
            }
            pagesContainer.layout.anchors.push(siteAnchor);
        }
    }

    function getStructuresDescription(shouldRenderPage) {
        var aspectStructures = this.getAspectsComponentStructures();
        var siteData = this.props.siteData;

        var structuresDesc = _.transform(aspectStructures, function (result, structure) {
            result[structure.id] = {
                structure: structure,
                getDomNodeFunc: reactPageFind.bind(null, this.refs.siteAspectsContainer)
            };
        }, {}, this);

        var currentRenderedPageId = this.state.currentUrlPageId;

        if (!shouldRenderPage) {
            return structuresDesc;
        }

        structuresDesc.inner = {
            structure: siteData.pagesData[currentRenderedPageId].structure,
            pageId: currentRenderedPageId,
            getDomNodeFunc: reactPageFind.bind(null, this.getPageById(currentRenderedPageId))
        };

        structuresDesc.outer = {
            structure: siteData.getMasterPageData().structure,
            getDomNodeFunc: reactPageFind.bind(null, this.refs[this.props.rootId])
        };
        var masterPageAnchors;
        var viewMode = siteData.getViewMode();
        if (siteData.isPageLandingPage(currentRenderedPageId)) {
            structuresDesc.outer.structure = getMasterpageStructureForLandingPage(siteData);
            masterPageAnchors = _.get(siteData, ['anchorsMap', 'landingPageMasterPage', viewMode]);
        } else {
            masterPageAnchors = _.get(siteData, ['anchorsMap', 'defaultMasterPage', viewMode]);
        }

        if (masterPageAnchors) {
            _.set(siteData, ['anchorsMap', siteData.getMasterPageData().structure.id, viewMode], masterPageAnchors);
        }

        structuresDesc.siteBackground = {
            structure: wixBackgroundInstantiator.getWixBgStructure(),
            getDomNodeFunc: reactPageFind.bind(null, this)
        };

        var currentPopupId = this.state.currentPopupId;

        if (currentPopupId) {
            structuresDesc[currentPopupId] = {
                structure: siteData.getPageData(currentPopupId).structure,
                getDomNodeFunc: reactPageFind.bind(null, this.refs.popupRoot, currentPopupId),
                pageId: currentPopupId
            };
        }

        if (siteData.shouldShowWixAds()) {
            var wixAdsStructure = wixAdsInstatiator.getStructure(siteData);
            structuresDesc.wixAds = {
                structure: wixAdsStructure,
                getDomNodeFunc: reactPageFind.bind(null, this)
            };
        }

        return structuresDesc;
    }

    function removeServerGeneratedClassesForHTMLembeds(siteData) {
        var elementsHiddenByServer = $('.hiddenTillReady');
        if (siteData.isMobileDevice()) {
            $('.wix-menu-enabled').removeClass('wix-menu-enabled'); //remove server class from the menu so it doesn't mess with our site placement... they have top:60px!important
            elementsHiddenByServer.css({display: 'none'}); //the server sets the opacity to 0, we want display:none in mobile so it doesn't take up space in DOM
        } else {
            elementsHiddenByServer.removeClass('hiddenTillReady'); //we want it to be visible after site is rendered in client.
        }
    }

    function getCurrentScroll(siteContainer) {
        return {
            x: siteContainer.pageXOffset || siteContainer.scrollX || 0,
            y: siteContainer.pageYOffset || siteContainer.scrollY || 0
        };
    }

    function calcScrollDuration(currentY, targetY, isMobileView) {
        var delta = Math.abs(targetY - currentY);
        var duration = isMobileView ? scrollToAnchorDurationByDistance.mobile(delta) : scrollToAnchorDurationByDistance.desktop(delta);
        return duration;
    }

    function applyCompDOMStyle(comp, style) {
        if (!comp) {
            return;
        }
        var styleToApply = _.assign({}, style);

        var prefixedTransform = utils.style.getPrefixedTransform();
        var zeptoCompatiblePrefixedTransform = getZeptoCompatibleStylePrefix(prefixedTransform);
        styleToApply[zeptoCompatiblePrefixedTransform] = style[prefixedTransform];
        if (prefixedTransform !== zeptoCompatiblePrefixedTransform) {
            styleToApply[prefixedTransform] = '';
        }

        if (comp.hasOwnProperty('getRootStyle')) {
            _.assign(styleToApply, comp.getRootStyle(styleToApply));
        }

        $(ReactDOM.findDOMNode(comp)).css(styleToApply);
    }

    function getZeptoCompatibleStylePrefix(prefix) {
        return prefix.replace(/[A-Z]/g, function (l) {
            return '-' + l.toLowerCase();
        });
    }

    function isPageAllowed(siteAPI, navigationInfo) {
        return siteAPI.getSiteAspect('siteMembers').isPageAllowed(navigationInfo);
    }

    function didActiveModesChange(prevActiveModes, nextActiveModes) {
        var pageIds = _.keys(nextActiveModes);

        var didPageActiveModesChange = function (rootId) {
            return _.isEmpty(getModeChanges(prevActiveModes, nextActiveModes, rootId));
        };

        return !_.every(pageIds, didPageActiveModesChange);
    }

    function getModeChanges(prevActiveModes, nextActiveModes, rootId) {
        var prevRootActiveModes = _.get(prevActiveModes, rootId, {});
        var nextRootActiveModes = _.get(nextActiveModes, rootId, {});
        return utils.modes.getModeChanges(prevRootActiveModes, nextRootActiveModes);
    }

    function loadPlatformApps(siteAPI, pageInfo) {
        var siteData = siteAPI.getSiteData();
        var didFocusedPageChanged = siteData.getFocusedRootId() !== pageInfo.pageId;
        var isFocusedPageAPopup = siteData.getFocusedRootId() === siteAPI.getCurrentPopupId();
        if (experiment.isOpen('sv_platform1') && didFocusedPageChanged && !isFocusedPageAPopup) {
            siteAPI.getSiteAspect('WidgetAspect').loadApps([pageInfo.pageId]);
        }
    }

    function getCompsToReLayout(siteData, lockedCompsMap, pendingReLayoutCompsMap) {
        if (!experiment.isOpen('sv_partialReLayout')) {
            return null;
        }

        if (!siteData.measureMap || (_.isEmpty(lockedCompsMap) && _.isEmpty(pendingReLayoutCompsMap))) {
            return null;
        }

        return _.assign({}, pendingReLayoutCompsMap, lockedCompsMap);
    }

    return React.createClass({
        displayName: "WixSite",
        mixins: [siteAspectsMixin, renderDoneMixin, siteClickHandler, siteTraversalMixin],

        propTypes: {
            wixCodeAppApi: React.PropTypes.shape({
                init: React.PropTypes.func,
                sendMessage: React.PropTypes.func,
                registerMessageHandler: React.PropTypes.func,
                registerMessageModifier: React.PropTypes.func
            })
        },

        getDefaultProps: function () {
            return {
                siteRootPosition: 'static',
                scopedRoot: null,
                rootId: 'masterPage',
                wixCodeAppApi: {
                    init: _.noop,
                    sendMessage: _.noop,
                    registerMessageHandler: _.noop,
                    registerMessageModifier: _.noop
                }
            };
        },

        getPrimaryPage: function () {
            var page = this.refs[this.props.rootId];
            if (this.props.rootId === "masterPage" && page) {
                var primaryPageId = this.props.siteData.getPrimaryPageId();
                page = page.refs.SITE_PAGES.refs[primaryPageId];
            }
            return page;
        },

        getCurrentPopup: function () {
            var popupId = this.props.siteData.getCurrentPopupId();

            if (popupId) {
                return utils.reactComponentUtils.getRef(this, 'popupRoot', popupId);
            }

            return null;
        },

        getMasterPage: function () {
            var page = this.refs[this.props.rootId];
            return page;
        },

        getPageById: function (pageId) {
            var masterPage = this.getMasterPage();
            if (pageId === this.props.rootId) {
                return masterPage;
            }
            if (masterPage && masterPage.refs.SITE_PAGES.refs[pageId]) {
                return masterPage.refs.SITE_PAGES.refs[pageId];
            }
            return utils.reactComponentUtils.getRef(this, 'popupRoot', pageId);
        },

        isDomOnly: function (comp, structure, newProps, methodNames) {
            return _.every(methodNames, domOnlyLayouts) && // DOM only methods
                newProps.style.position === comp.props.style.position && // same position
                (!_.has(comp, 'lastScale') || structure.layout.scale === comp.lastScale) && // same scale
                _.isEqual(newProps.compProp, comp.props.compProp) && // same props
                newProps.style.transform === comp.props.style.transform; // same transform
        },
        isDomOnlyByMethodNamesAndCompId: function (methodNames, compId) {
            var pageComp = this.getPageOfComp(compId);
            var pageId = pageComp.props.rootId;
            var comp = pageComp.refs[compId];
            var structureHierarchy = dataUtils.findHierarchyInStructure(compId, this.props.siteData.isMobileView(), this.props.siteData.pagesData[pageId].structure);
            var structure = _.last(structureHierarchy);
            var newProps = componentPropsBuilder.getCompProps(structure, this.siteAPI, pageId, this.loadedStyles);

            return this.isDomOnly(comp, structure, newProps, methodNames);
        },
        updateMultipleComps: function (compIds, noEnforceAnchors) {
            this.tempMeasureMap = this.props.siteData.measureMap;
            var compIdsToReLayout = [];

            function addRelatedCompIds(relatedCompIds) {
                compIdsToReLayout.push(relatedCompIds);
                if (compIdsToReLayout.length === compIds.length) {
                    this.lockedCompIds = _.flatten(compIdsToReLayout);
                    this.reLayout();
                }
            }

            this.noEnforceAnchors = noEnforceAnchors;

            _.forEach(compIds, this.updateDOMOnlySingleComp.bind(this, addRelatedCompIds.bind(this)));
        },

        updateDOMOnlySingleComp: function (idsCollectorCallback, compId) {
            var pageComp = this.getPageOfComp(compId);
            var pageId = pageComp.props.rootId;
            var comp = pageComp.refs[compId];
            var structureHierarchy = dataUtils.findHierarchyInStructure(compId, this.props.siteData.isMobileView(), this.props.siteData.pagesData[pageId].structure);
            var compStructure = _.last(structureHierarchy);
            var newProps = componentPropsBuilder.getCompProps(compStructure, this.siteAPI, pageId, this.loadedStyles);

            var compsToApplyDOMStyle = getComponentsToApplyDOMStyle(structureHierarchy, this.siteAPI);
            var compIdsToReLayout = _.pluck(compsToApplyDOMStyle, 'id');

            applyCompDOMStyle(comp, newProps.style);
            var compsToApplyDOMStyleExcludingComp = _.reject(compsToApplyDOMStyle, compStructure);

            var style = this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId] || _.clone(comp.props.style);
            this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId] = style;
            if (newProps.style.zIndex === MAX_Z_INDEX && (!style || !style.hasOwnProperty('zIndex'))) {
                this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId] = _.assign(style, {zIndex: ''});
            }

            _.forEach(compsToApplyDOMStyleExcludingComp, function (child) {
                applyCompDOMStyle(pageComp.refs[child.id], santaProps.propsBuilderUtil.getStyle(child.layout, this.siteAPI, child.id));
            }, this);

            idsCollectorCallback(compIdsToReLayout);
        },

        getPageOfComp: function (compId) {
            var rootOfCompId = _.find(this.siteAPI.getAllRenderedRootIds(), function (rootId) {
                var root = this.getPageById(rootId);
                if (!root) {
                    return false;
                }
                var comps = root.refs;
                return !!comps[compId];
            }, this);

            return this.getPageById(rootOfCompId);
        },

        updateSingleComp: function (compId, noEnforceAnchors, methodNames) {
            var siteData = this.props.siteData;
            siteData.dataResolver.setReadingFromCache(false);
            this.tempMeasureMap = siteData.measureMap;
            this.deletedMeasureMap = siteData.measureMap;
            delete siteData.measureMap;
            var pageComp = this.getPageOfComp(compId);
            var pageId = pageComp.props.rootId;
            var comp = pageComp.refs[compId];
            var structureHierarchy = dataUtils.findHierarchyInStructure(compId, siteData.isMobileView(), siteData.pagesData[pageId].structure);
            var structure = _.clone(_.last(structureHierarchy));
            structure.layout = _.clone(structure.layout);
            var newProps = componentPropsBuilder.getCompProps(structure, this.siteAPI, pageId, this.loadedStyles);
            siteData.dataResolver.setReadingFromCache(true);
            var prefixedTransform = utils.style.getPrefixedTransform();
            var zeptoCompatiblePrefixedTransform = getZeptoCompatibleStylePrefix(prefixedTransform);
            newProps.style[zeptoCompatiblePrefixedTransform] = newProps.style[prefixedTransform];

            this.markInvokedMethodNames(methodNames);
            var externalCallbacks = [];
            var origComponentWillUpdate = null;
            var origComponentDidUpdate = null;

            function compUpdatedCallback() {
                if (origComponentWillUpdate) {
                    comp.componentWillUpdate = origComponentWillUpdate;
                }
                if (origComponentDidUpdate) {
                    comp.componentDidUpdate = origComponentDidUpdate;
                }
                this.noEnforceAnchors = noEnforceAnchors;
                _.forEach(externalCallbacks, function (callback) {
                    callback();
                });

                this.lockedCompIds = _.pluck(getComponentsToApplyDOMStyle(structureHierarchy, this.siteAPI), 'id');
                this.reLayout();
            }

            if (this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId]) {
                applyCompDOMStyle(comp, this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId]);
                delete this.componentsUpdatedBySingleCompUpdateBehindReactsBack[compId];
            }
            var externalState = {};
            if (comp.componentWillReceiveProps) {
                var origSetState = comp.setState;
                comp.setState = function (newState, callback) {
                    _.assign(externalState, newState);
                    if (callback) {
                        externalCallbacks.push(callback);
                    }
                };
                comp.componentWillReceiveProps(newProps, comp.state);
                comp.setState = origSetState;
            }
            if (comp.componentWillUpdate) {
                origComponentWillUpdate = comp.componentWillUpdate;
                comp.componentWillUpdate = function (fakeProps, newState) {
                    origComponentWillUpdate.call(comp, newProps, newState);
                };
            }

            var propKeys = ['compProp', 'compData', 'style', 'compDesign'];

            if (comp.componentDidUpdate) {
                origComponentDidUpdate = comp.componentDidUpdate;
                var oldProps = _.clone(comp.props);
                _.forEach(propKeys, function (propName) {
                    oldProps[propName] = _.clone(oldProps[propName]);
                });
                comp.componentDidUpdate = function (fakeProps, oldState) {
                    origComponentDidUpdate.call(comp, oldProps, oldState);
                };
            }
            _.forEach(propKeys, function (propName) {
                if (_.has(comp.props, propName)) {
                    _.assign(comp.props[propName] || {}, newProps[propName]);
                }
            });
            comp.setState(externalState, compUpdatedCallback.bind(this));
        },

        scrollToAnchor: function (scroll, progressCallback) {
            var siteContainer = this.props.getSiteContainer();
            var isMobileView = this.props.siteData.isMobileView();
            var duration = calcScrollDuration(getCurrentScroll(siteContainer).y, scroll.y, isMobileView);
            var easingName = isMobileView ? 'Quint.easeOut' : 'Sine.easeInOut';
            animations.animate('BaseScroll', siteContainer, duration, 0, {
                y: scroll.y,
                ease: easingName,
                callbacks: {onUpdate: progressCallback}
            });
        },

        scrollToTop: function () {
            this.scrollToAnchor({y: 0});
        },

        getInitialState: function () {
            this.loadedStyles = this.loadedStyles || {};
            this.reLayoutPending = false;
            this.pendingReLayoutCompsMap = {};
            /** @type core.SiteAPI */
            this.siteAPI = new SiteAPI(this);
            this.isBusy = true;
            this.isChangingUrlPage = true;
            this.noEnforceAnchors = false;
            this.siteAPI.reportBeatEvent(7, this.props.siteData.getPrimaryPageId());
            this.componentsUpdatedBySingleCompUpdateBehindReactsBack = {};
            this.prevActiveModes = utils.objectUtils.cloneDeep(this.props.siteData.activeModes);

            return {};
        },

        componentWillMount: function () {
            var siteData = this.props.siteData;
            var urlPageId = siteData.getCurrentUrlPageId();
            var urlRootInfo = siteData.getExistingRootNavigationInfo(urlPageId);

            //TODO: Alissa this is here for animations, remove after the animations don't use this anymore
            var currentUrlPageId = isPageAllowed(this.siteAPI, urlRootInfo) ? urlPageId : null;
            this.setState({
                currentUrlPageId: currentUrlPageId,
                currentPopupId: null
            });
        },

        _addSiteStylesToLoaded: function (siteData, shouldRenderPage) {
            var themeData = siteData.getAllTheme();
            var structures = this.getAspectsComponentStructures();

            if (shouldRenderPage) {
                var allRootIds = siteData.getAllPossiblyRenderedRoots(); //nothing is rendered here, so we cannot use siteAPI //TODO: check if should use willBeRendered
                structures = _.reduce(allRootIds, function (result, rootId) {
                    result.push(siteData.pagesData[rootId].structure);
                    return result;
                }, structures);
            } else {
                structures.push(siteData.getMasterPageData().structure);
            }

            _.forEach(structures, function (structure) {
                var pageId = siteData.pagesData[structure.id] ? structure.id : siteData.MASTER_PAGE_ID;
                styleCollector.collectStyleIdsFromStructure(structure, themeData, siteData, this.loadedStyles, pageId, siteData.isMobileView());
            }, this);
        },

        markInvokedMethodNames: function (methodNames) {
            this.invokedMethodNames = _.union(this.invokedMethodNames || [], methodNames);
        },

        componentWillUpdate: function (nextProps, nextState) {
            this.isBusy = true;
            this.isChangingUrlPage = nextState.currentUrlPageId !== this.state.currentUrlPageId;

            _.forEach(this.componentsUpdatedBySingleCompUpdateBehindReactsBack, function (originalStyle, compId) {
                var comp = this._aspectsSiteAPI.getComponentById(compId);
                if (comp) {
                    applyCompDOMStyle(comp, originalStyle);
                }
            }, this);
            this.componentsUpdatedBySingleCompUpdateBehindReactsBack = {};
            if (nextState.noEnforceAnchors && nextState.noEnforceAnchors !== this.state.noEnforceAnchors) {
                this.noEnforceAnchors = true;
            }
            if (nextState.forceUpdateIndex !== this.state.forceUpdateIndex) {
                this.props.siteData.clearCache();
                this.tempMeasureMap = this.props.siteData.measureMap;
                this.deletedMeasureMap = this.props.siteData.measureMap;
                delete this.props.siteData.measureMap;
            } else {
                this.markInvokedMethodNames(['*']);
            }

            if (didActiveModesChange(this.prevActiveModes, nextProps.siteData.activeModes)) {
                this.deletedMeasureMap = this.props.siteData.measureMap;
                delete this.props.siteData.measureMap;
            }
        },

        render: function () {
            var siteData = this.props.siteData;
            var urlPageNavigationInfo = siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId());
            var shouldRenderPage = isPageAllowed(this.siteAPI, urlPageNavigationInfo);

            var siteChildren = [
                wixThemeReact({
                    themeData: siteData.getAllTheme(),
                    siteData: siteData,
                    masterPage: siteData.getMasterPageData(),
                    loadedStyles: this.loadedStyles,
                    styleRoot: this.props.scopedRoot ?
                    "#" + this.props.scopedRoot :
                        null,
                    ref: 'theme',
                    shouldRenderPage: shouldRenderPage,
                    siteAPI: this.siteAPI
                }),

                // mobile app download banner (WIX TOUCH)
                // returns undefined if component should not be rendered (shouldShowMobileAppBanner runs in the instantiator)
                mobileAppBannerInstantiator.getMobileAppBannerComponent(this.siteAPI),

                siteData.shouldShowWixAds() ? wixAdsInstatiator.getWixAdsComponent(this.siteAPI) : undefined,

                siteAspectsDomContainer({
                    ref: 'siteAspectsContainer',
                    key: 'siteAspectsContainer',
                    siteWidth: this.props.siteData.getSiteWidth(),
                    isMobileView: this.props.siteData.isMobileView(),
                    aspectsCompsFunc: this.getAspectsReactComponents
                }),


                React.createElement(selectionSharer, {
                    ref: 'selectionSharer',
                    siteBasePath: siteData.santaBase,
                    siteAPI: this.siteAPI
                })

            ];

            if (siteData.renderFlags.extraSiteHeight > 0 && !siteData.isMobileView()) {
                siteChildren.push(extraSiteHeight({
                    siteData: siteData
                }));
            }

            if (siteData.renderFlags.blockingLayer) {
                siteChildren.push(blockingLayer({
                    siteData: siteData
                }));
            }

            if (shouldRenderPage) {
                var rootProps = getRootProps.call(this, this.siteAPI, this.loadedStyles);
                var wixBg = wixBackgroundInstantiator.getWixBgComponent(this.siteAPI);
                var rootStyle = this.getRootStyle();
                siteChildren.splice(3, 0, wixBg, React.DOM.div({
                    className: "SITE_ROOT",
                    key: "SITE_ROOT",
                    id: this.props.scopedRoot ? null : "SITE_ROOT",
                    style: rootStyle
                }, wixPageReact(rootProps)));

                siteChildren.splice(5, 0,
                    wixPopupRootConstructor({
                        currentPopupId: this.state.currentPopupId,
                        viewerPrivateServices: this.props.viewerPrivateServices,
                        siteAPI: this.siteAPI,
                        siteData: siteData,
                        loadedStyles: this.loadedStyles,
                        ref: 'popupRoot',
                        siteRootStyle: rootStyle,
                        blockingPopupLayer: siteData.renderFlags.blockingPopupLayer,
                        measureMap: this.deletedMeasureMap
                    })
                );

            } else {
                this.siteAPI.getSiteAspect('siteMembers').showDialogOnNextRender(urlPageNavigationInfo);
            }

            this._addSiteStylesToLoaded(siteData, shouldRenderPage);

            return React.DOM.div(_.assign({
                className: this.props.className,
                id: this.props.scopedRoot ? this.props.scopedRoot : null,
                onClick: this.clickHandler,
                children: siteChildren
            }, this.props.extraEventsHandlers));
        },

        getRootStyle: function () {
            var style = {};
            style.width = this.props.siteData.getSiteWidth();
            style.paddingBottom = this.props.siteData.getPageBottomMargin();
            if (this.state.siteRootHidden) {
                style.height = 0;
                style.overflowY = 'hidden';
            }
            return style;
        },

        onPopState: function () {
            // this is called as a result of the browser navigation buttons (back, forward)
            // therefore, the way to get the popped state is to use the location.href
            // property. Please note that the siteData.currentUrl is only set the new url
            // as a result of this call
            var url = window.location.href;
            var urlData = utils.wixUrlParser.parseUrl(this.props.siteData, url);
            if (urlData) {
                this.tryToNavigate(urlData, true);
            }
        },

        onHashChange: function () {
            // This is called whenever the hash is changed. Like onPopState, the has not reliably
            // been changed yet in siteData
            var urlData = utils.wixUrlParser.parseUrl(this.props.siteData, window.location.href);
            if (urlData && this.props.siteData.isUsingUrlFormat('slash')) {
                this.tryToNavigate(urlData);
            }
        },

        isPageExists: function (pageId) {
            return _.includes(this.props.siteData.getAllPageIds(), pageId);
        },

        updateUrlIfNeeded: function(navigationInfo) {
            var siteData = this.siteAPI.getSiteData();
            this.props.updateUrlIfNeededMethod(siteData, navigationInfo);
        },

        navigateIfPossible: function (pageInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory) {

            var siteDataAPI = _.get(this.props, 'viewerPrivateServices.siteDataAPI');
            var siteData = this.siteAPI.getSiteData();

            if (this.isPageExists(pageInfo.pageId)) {
                if (isPageAllowed(this.siteAPI, pageInfo)) {


                    var pageData = siteData.getDataByQuery(pageInfo.pageId);
                    if (!pageData) {
                        return;
                    }
                    if (!pageData.isPopup) {
                        this.siteAPI.getSiteAspect('siteMembers').forceCloseDialog();
                    }
                    var pageInfoToPass = _.clone(pageInfo);
                    pageInfoToPass.title = pageInfo.title || pageData.pageUriSEO;

                    var url = utils.wixUrlParser.getUrl(siteData, pageInfoToPass);
                    var shouldSkipHistory = siteData.isPopupPage(pageInfo.pageId) || skipHistory;

                    this.siteAPI.startingPageTransition(pageInfoToPass);
                    this.props.navigateMethod(this, siteDataAPI, url, pageInfoToPass, !shouldSkipHistory, leaveOtherRootsAsIs, shouldReplaceHistory);
                } else {
                    this.siteAPI.getSiteAspect('siteMembers').showDialogOnNextRender(pageInfo);
                    this.forceUpdate();
                }
            }
        },

        tryToNavigate: function (pageInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory) {

            loadPlatformApps(this.siteAPI, pageInfo);

            var siteData = this.siteAPI.getSiteData();

            if (experiment.isOpen('sv_dpages') && pageInfo.routerDefinition && !pageInfo.pageId) {
                this.props.getDynamicPageRealPage(siteData, pageInfo, function (additionalNavInfo) {
                    _.assign(pageInfo, additionalNavInfo);

                    var isPreviewMode = !!siteData.documentServicesModel;
                    if (isPreviewMode && utils.errorPages.isErrorPage(pageInfo.pageId)) {
                        return;
                    }

                    if (siteData.getPrimaryPageId() === pageInfo.pageId) { //if navigation is to the same page need to reload worker event if navigation doesn't really occur
                        this.siteAPI.getSiteAspect('WidgetAspect').stopApps([pageInfo.pageId]);
                        this.siteAPI.getSiteAspect('WidgetAspect').loadApps([pageInfo.pageId]);
                        this.handleSamePageAnchorNavigation(pageInfo);
                    }

                    this.navigateIfPossible(pageInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory);
                }.bind(this));
                return;
            }
            this.navigateIfPossible(pageInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory);
        },
        handleSamePageAnchorNavigation:function(navInfo){
            var siteAPI = this.siteAPI;
            var siteData = this.props.siteData;
            if (navInfo.anchorData) {
                var scrollProgressCallback = function (tweenMax) {
                    var scrollEnded = tweenMax.ratio === 1;
                    if (scrollEnded) {
                        siteAPI.getSiteAspect('anchorChangeEvent').setSelectedAnchorAsync(siteData, navInfo.anchorData, navInfo.pageId, utils.constants.ACTIVE_ANCHOR.DELAY_TO_END_SCROLL);
                    }
                };
                siteAPI.scrollToAnchor(navInfo.anchorData, scrollProgressCallback.bind(this));
            } else if (!siteData.isImageZoom(navInfo)) {
                this.scrollToTop();
            }
        },
        handleNavigation: function (navInfo, linkUrl, changeUrl, keepRoots) {
            var siteData = this.props.siteData;
            if (navInfo.pageId === siteData.getPrimaryPageId()) {
                if (linkUrl !== '#') { //used for zoom
                    var siteDataAPI = _.get(this.props, 'viewerPrivateServices.siteDataAPI');
                    this.props.navigateMethod(this, siteDataAPI, linkUrl, navInfo, changeUrl, keepRoots);
                }
                this.handleSamePageAnchorNavigation(navInfo);
            } else {
                this.tryToNavigate(navInfo, !changeUrl);
            }
        },

        renderCompsAfterLayout: function (componentsToRender) {
            // collect all components that needs render
            this.props.siteData.componentsToRender = _.union(this.props.siteData.componentsToRender, componentsToRender);
            if (!_.isEmpty(componentsToRender)) {
                this.forceUpdate(function () {
                    // and clear the list when the forceUpdate is over
                    this.props.siteData.componentsToRender = [];
                });
            }
        },

        reLayout: function () {
	        if (this.siteAPI.getSiteAspect('WidgetAspect').allContextsReady()) {
                var lockedCompsMap = this.lockedCompIds && utils.arrayUtils.toTrueObj(this.lockedCompIds);
                var siteData = this.props.siteData;
                var urlPageNavigationInfo = siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId());
                var shouldRenderPage = isPageAllowed(this.siteAPI, urlPageNavigationInfo);

                this.updateBodyNodeStyle(siteData);
                var structuresDesc = getStructuresDescription.call(this, shouldRenderPage);

                var compsToReLayoutMap = getCompsToReLayout(siteData, lockedCompsMap, this.pendingReLayoutCompsMap);

                var reLayoutResult = layout.reLayout(structuresDesc, this.siteAPI, this.noEnforceAnchors, lockedCompsMap, compsToReLayoutMap);

                siteData.measureMap = reLayoutResult.measureMap;
                siteData.reLayoutedCompsMap = reLayoutResult.reLayoutedCompsMap;

                delete this.tempMeasureMap;
                delete this.lockedCompIds;

                if (shouldRenderPage) {
                        this.pendingReLayoutCompsMap = {};
                        this.reLayoutPending = false;
                        this.noEnforceAnchors = false;
                        this.renderCompsAfterLayout(reLayoutResult.componentsToRender);
                        this.isBusy = false;
                        var masterPage = this.getMasterPage();
                        var hasDoneLayout = [masterPage, this.getPrimaryPage(), this.refs.siteAspectsContainer];
                        var currentPopup = this.getCurrentPopup();
                        if (currentPopup) {
                            hasDoneLayout.push(currentPopup);
                        }

                        notifyComponentDidLayout(hasDoneLayout);
                    } else {
                        this.siteAPI.getSiteAspect('siteMembers').showDialogOnNextRender(urlPageNavigationInfo);
                        notifyComponentDidLayout([this.refs.siteAspectsContainer]);
                    }
                this.isBusy = false; //this needs to always be set to false, even if this.state.shouldRenderPage is false
                var methodNames = this.invokedMethodNames || [];
                this.invokedMethodNames = [];
                this.notifyAspects('didLayout', methodNames);
                // Set siteIsReady flag on the window
                if (!this.siteIsReady) {
                        this.siteIsReady = true;
                        if (this.siteAPI && this.siteAPI.setBiMarker) {
				            this.siteAPI.setBiMarker('lastTimeStamp');
			            }
			            this.notifyAspects('siteReady');
		            }
            }
        },

        registerReLayoutPending: function (compId) {
            this.pendingReLayoutCompsMap[compId] = true;
            this.reLayoutPending = true;
        },

        reLayoutIfPending: function () {
            if (this.reLayoutPending) {
                this.reLayoutPending = false;
                this.refs.theme.initWaitForStylesReady();
            }
        },

        updateBodyNodeStyle: function (siteData) {
            var $body = $('body');
            var $html = $('html');

            if (this.props.siteData.isQaMode()){
                $body.addClass("qa-mode");
            }

            if (this.props.siteData.isMobileView()) {
                // Fix overflow-x for some mobile devices
                $body.addClass("device-mobile-optimized");
                $html.addClass("device-mobile-optimized");
            } else if (siteData.isMobileDevice() || siteData.isTabletDevice()) {
                $body.addClass("device-mobile-non-optimized");
            } else {
                $body
                    .removeClass("device-mobile-optimized")
                    .removeClass("device-mobile-non-optimized");

                $html.removeClass("device-mobile-optimized");
            }

            if (this.props.siteData.isMobileDevice()) {
                var browserSettings = _.assign({}, this.props.siteData.os, this.props.siteData.browser);
                var mobileClass = _(browserSettings).keys().filter(function (key) {
                    return browserSettings[key] === true;
                }).map(function (value) {
                    return 'device-' + value;
                }).join(' ');
                $html.addClass(mobileClass);
            }

            var currentOverflow = $body.css('overflow');
            var newOverflow = siteData.renderFlags.allowSiteOverflow ? null : 'hidden';
            if (currentOverflow !== newOverflow) {
                $body.css('overflow', newOverflow);
            }
        },

        componentDidMount: function () {
            if (this.props.siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
                this.siteAPI.reportCurrentPageEvent();
            } else {
                this.siteAPI.reportPageEvent(this.props.siteData.currentUrl.full);
            }
            this.siteAPI.initFacebookRemarketing();
            this.siteAPI.initGoogleRemarketing();
            this.siteAPI.initYandexMetrika();
            this.siteAPI.setBiMarker('renderEnd');

            this.registerAspectToEvent('siteReady', function () {
                this.siteAPI.reportBeatFinish(this.props.siteData.getCurrentUrlPageId());
                siteBI.send(this.siteAPI.getSiteData());
                //unfortunately, this hack is needed:
                removeServerGeneratedClassesForHTMLembeds(this.props.siteData);
            }.bind(this));
            this.registerAspectToEvent('resize', getResizeHandler.call(this));
            activeExperimentsNotifier.call(this);
            reactVersionNotifier.call(this);
            this.updateTitleAndMetaTags();
            this.refs.theme.registerStylesReadyCallback(this.reLayout);
            this.siteAPI.reportBeatEvent(8, this.props.siteData.getPrimaryPageId());
            this.refs.theme.initWaitForStylesReady();

            if (experiment.isOpen('fontsTrackingInViewer')) {
                var currentPageId = this.props.siteData.getCurrentUrlPageId();
                var urlPageNavigationInfo = this.props.siteData.getExistingRootNavigationInfo(currentPageId);

                if (isPageAllowed(this.siteAPI, urlPageNavigationInfo)) {
                    siteBI.trackFontsIfNeeded(this.props.siteData, currentPageId);
                }
            }
        },

        componentDidUpdate: function () {
            this.prevActiveModes = utils.objectUtils.cloneDeep(this.props.siteData.activeModes);
            if (this.tempMeasureMap && !this.props.siteData.measureMap) {
                this.props.siteData.measureMap = this.tempMeasureMap;
                delete this.deletedMeasureMap;
                delete this.tempMeasureMap;
            }
            if (this.isChangingUrlPage) {
                this.siteAPI.setBiMarker('renderEnd');
                var currentPageId = this.props.siteData.getCurrentUrlPageId();
                this.siteAPI.reportBeatFinish(currentPageId);
                if (!this.props.siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
                    this.siteAPI.reportPageEvent(this.props.siteData.currentUrl.full);
                }
                this.siteAPI.fireGoogleRemarketing();
                this.siteAPI.reportYandexPageHit(this.props.siteData.currentUrl.full);

                if (experiment.isOpen('fontsTrackingInViewer')) {
                    siteBI.trackFontsIfNeeded(this.props.siteData, currentPageId);
                }
            }
            this.refs.theme.initWaitForStylesReady();
        },

        updateTitleAndMetaTags: function () {
            if (this.props.updateHeadMethod) {
                this.props.updateHeadMethod(this.props.siteData, this.props.rootId);
            }
        },

        componentWillUnmount: function () {
            this.dead = true;
            this.siteAPI.onSiteUnmount();
        }

    });
});
