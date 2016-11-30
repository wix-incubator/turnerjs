define([
    'lodash',
    'wixappsCore/core/proxyFactory',
    'wixappsCore/core/ViewContextMap',
    'wixappsCore/core/expressions/functionLibrary',
    'animations',
    'reactDOM',
    'zepto'
], function (
    _,
    /** wixappsCore.proxyFactory */ proxyFactory,
    /** wixappsCore.ViewContextMap */ ViewContextMap,
    /** wixappsCore.FunctionLibrary */ FunctionLibrary,
    animations,
    ReactDOM,
    $
) {
    'use strict';

    function isDataChanged(nextProps) {
        return !_.isEqual(this.rootDataItemRef, this.getRootDataItemRef()) ||
            (this.isChanged && this.isChanged(nextProps));
    }

    /**
     * @class wixappsCore.viewsRenderer
     *
     * @abstract {function(string, string, string): object} getViewDef
     * @abstract {function(string): object} getViewDataById
     * @abstract {function(): object} getLocalizationBundle Function that return the map from keys to translated text of the current language.
     * @abstract {function(): string} getPackageName get the application package name.
     */
    return {
        componentWillMount: function () {
            this.isViewContextMapDirty = false;
            this.viewContextMap = new ViewContextMap(this.handleViewContextMapUpdate);
            this.functionLibrary = new FunctionLibrary(this.props.siteData);
        },
        handleViewContextMapUpdate: function () {
            this.isViewContextMapDirty = true;
        },
        getDataAspect: function () {
            return this.props.siteAPI.getSiteAspect('wixappsDataAspect');
        },

        getAppService: function () {
            return this.props.siteData.getClientSpecMapEntry(this.props.compData.appInnerID);
        },

        getPackageName: function (siteData) {
            var appService = this.getAppService(siteData || this.props.siteData);
            return appService && (appService.packageName || appService.type);
        },

        getAppDescriptor: function () {
            var dataAspect = this.getDataAspect();
            var packageName = this.getPackageName();
            return dataAspect.getDescriptor(packageName);
        },

        getFormatName: function () {
            return this.props.siteData.isMobileView() ? 'Mobile' : '';
        },

        getNormalizedDataPath: function (contextPath, path) {
            if (contextPath === null) {
                return path;
            }
            return this.viewContextMap.resolvePath(contextPath, path);
        },

        getDataByPath: function (contextPath, path) {
            if (contextPath === null) {
                return this.getDataByFullPath(path);
            }

            var packageName = this.getPackageName();
            var dataAspect = this.getDataAspect();

            var normalizedPath = this.getNormalizedDataPath(contextPath, path);

            return dataAspect.getDataByPath(packageName, normalizedPath);
        },

        getDataByFullPath: function (path) {
            var packageName = this.getPackageName();
            var dataAspect = this.getDataAspect();

            function splitAndFlatten (arr) {
                return _.flattenDeep(_.map(arr, function(part){
                    if (_.isString(part)) {
                        return part.split('.');
                    }
                    return part;
                }));
            }

            var normalizedPath = [];
            if (_.every(path, _.isArray)) {
                normalizedPath = _.map(path, function (part) {
                    var ret = splitAndFlatten(part);
                    return _.without(ret, 'this');
                });
            } else {
                normalizedPath = splitAndFlatten(path);
                normalizedPath = _.without(normalizedPath, 'this');
            }

            return dataAspect.getDataByPath(packageName, normalizedPath);
        },

        setDataByPath: function (contextPath, path, value) {
            var packageName = this.getPackageName();
            var dataAspect = this.getDataAspect();

            var normalizedPath = this.getNormalizedDataPath(contextPath, path);

            return dataAspect.setDataByPath(packageName, normalizedPath, value);
        },

        setVar: function (contextPath, path, value, silent) {
            this.viewContextMap.setVar(contextPath, path, value);
            if (!silent) {
                // sababaaaaaaaaaaaaaaaa
                this.registerReLayout();
                this.forceUpdate();
            }
        },

        getCompExtraData: function () {
            var dataAspect = this.getDataAspect();
            return dataAspect.getExtraDataByCompId(this.getPackageName(), this.props.compData.id);
        },

        componentWillUpdate: function (nextProps) {
            if (this.state.$displayMode === 'content' && isDataChanged.call(this, nextProps)) {
                this.viewContextMap.resetContext();
            }
        },
        componentDidUpdate: function () {
            this.isViewContextMapDirty = false;
        },

        renderView: function (allowHeightResize) {
            var packageName = this.getPackageName();
            var props = {
                viewProps: {
                    getPartData: this.getPartData,
                    getPartDefinition: this.getPartDefinition,
                    resolveImageData: this.resolveImageData,
                    getNormalizedDataPath: this.getNormalizedDataPath,
                    getDataByPath: this.getDataByPath,
                    setDataByPath: this.setDataByPath,
                    getDataByFullPath: this.getDataByFullPath,
                    getViewDef: this.getViewDef,
                    getLocalizationBundle: this.getLocalizationBundle,
                    classSet: this.classSet,
                    setVar: this.setVar,
                    siteAPI: this.props.siteAPI,
                    siteData: this.props.siteData,
                    compProp: this.props.compProp,
                    loadedStyles: this.props.loadedStyles,
                    compId: this.props.id,
                    packageName: packageName,
                    rootId: this.props.rootId,
                    rootNavigationInfo: this.props.rootNavigationInfo
                },
                functionLibrary: this.functionLibrary,
                viewContextMap: this.viewContextMap,
                //structure: this.props.structure,

                viewName: this.getViewName(),
                formatName: this.props.formatName || this.getFormatName(),
                parentId: this.props.id,
                ref: 'rootProxy',
                parentContextPath: null
            };

            var defaultVars = {
                viewName: props.viewName,
                partDirection: this.props.compProp.direction || 'ltr'
            };

            if (this.props.style && this.props.style.width) {
                defaultVars.compWidth = this.props.style.width;
            }

            if (this.logic) {
                props.logic = this.logic;
                if (this.logic.getViewVars) {
                    defaultVars = _.defaults(this.logic.getViewVars(this.getCompExtraData()), defaultVars);
                }
            }

            this.rootDataItemRef = this.getRootDataItemRef();
            props.contextProps = {
                path: this.rootDataItemRef,
                vars: {
                    view: defaultVars,
                    proxy: {}
                },
                events: {
                    scrollToView: _.bind(scrollToView, this)
                },
                functionLibrary: {}
            };
            //props.proxyData = this.getDataByFullPath(this.rootDataItemRef);
            props.proxyLayout = {
                direction: defaultVars.partDirection
            };

            if (allowHeightResize) {
                props.proxyLayout.height = '100%';
            }

            var viewClass = proxyFactory.getProxyClass('View');
            return viewClass(props);
        }
    };

    function scrollToView() {
        var DURATION = 1;
        var DELAY = 0;
        var domNode = ReactDOM.findDOMNode(this);
        var y = $(domNode).offset().top;
        animations.animate('BaseScroll', window, DURATION, DELAY, {y: y, ease: 'Sine.easeInOut'});
    }
});
