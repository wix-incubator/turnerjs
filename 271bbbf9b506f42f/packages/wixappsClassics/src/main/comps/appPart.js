define([
    'lodash',
    'utils',
    'core',
    'wixappsCore',
    'wixappsClassics/util/appPartCommonDataManager',
    'wixappsClassics/util/wixappsUrlUtils',
    'wixappsClassics/util/viewCacheUtils',
    'wixappsClassics/util/descriptorUtils',
    'experiment'
], function (
  _,
  /** utils */ utils,
  /** core */ core,
  /** wixappsCore */ wixapps,
  appPartCommonDataManager,
  appsUrlUtils,
  viewCacheUtils,
  descriptorUtils,
  experiment
) {
    'use strict';

    var wixappsClassicsLogger = utils.wixappsClassicsLogger;
    var viewsCustomizer = wixapps.viewsCustomizer;
    var mixins = core.compMixins;
    var logicFactory = wixapps.logicFactory;
    var localizer = wixapps.localizer;
    var startTime;

    function reportToBI(lastBIEventForComp, isError, siteData, reportDef, params) {
        if (!this.lastBIEvent) {
            if (isError) {
                wixappsClassicsLogger.reportError(siteData, reportDef, params);
            } else {
                wixappsClassicsLogger.reportEvent(siteData, reportDef, params);
            }
        } //otherwise we don't want to send to BI again
        this.lastBIEvent = this.lastBIEvent || lastBIEventForComp;
    }

    function getTypeData(types, typeName) {
        return _.find(types, {_iid: typeName});
    }

    /**
     * Runs recursively and returns an array of the type, and all type it inherits from
     * @param types
     * @param typeName
     * @returns {Array} an array of type names I.E [MediaPost, Post]
     */
    function getTypesFallbacks(types, typeName) {
        var typeData = getTypeData(types, typeName);
        if (!typeData) {
            return [typeName];
        }
        var baseTypes = _.flattenDeep(_.map(typeData.baseTypes, function (baseTypeName) {
            return getTypesFallbacks(types, baseTypeName);
        }));
        return [typeName].concat(baseTypes);
    }

    function getCompMetadata() {
        var compData = this.props.compData;
        var appService = this.getAppService();
        var dataAspect = this.getDataAspect();
        return appService ? dataAspect.getMetadata(appService.packageName, compData.id) : {};
    }

    function getPackageMetadata() {
        var appService = this.getAppService();
        var dataAspect = this.getDataAspect();
        return appService ? dataAspect.getMetadata(appService.packageName) : {};
    }

    /**
     * @class components.AppPart
     * @extends {core.skinBasedComp}
     * @extends {wixapps.viewsRenderer}
     */
    return {
        displayName: "AppPart",
        mixins: [wixapps.viewsRenderer, mixins.skinBasedComp],
        getInitialState: function () {
            var LogicClass = logicFactory.getLogicClass(this.props.compData.appPartName);
            if (LogicClass) {
                this.logic = new LogicClass(this.getPartApi());
            }

            return this.getState();
        },

        componentWillMount: function () {
            reportToBI.call(this, false, false, this.props.siteData, wixappsClassicsLogger.events.APP_PART_BEFORE_LOAD, {
                component_id: this.props.compData.appPartName,
                visitor_id: this.props.siteData.rendererModel && this.props.siteData.rendererModel.userId
            });
            startTime = _.now();
        },

        componentWillReceiveProps: function (newProps) {
            if (newProps.compData.appLogicCustomizations !== this.props.compData.appLogicCustomizations) {
                viewCacheUtils.removeComponentViewDefs(this.props.id);
            }
            var state = this.getState();
            if (state.$displayMode !== this.state.$displayMode) {
                this.setState(state);
            }
        },

        getState: function () {
            var packageMetadata = getPackageMetadata.call(this);
            if (packageMetadata.removed) {
                return {$displayMode: 'error', error: true};
            }

            var metadata = getCompMetadata.call(this);
            if (metadata.hasError) {
                reportToBI.call(this, true, true, this.props.siteData, wixappsClassicsLogger.errors.APP_PART_FAILED_TO_LOAD);
                return {$displayMode: 'error', error: true};
            }

            var logicHasIsReadyFunc = (this.logic && this.logic.isReady);
            var isReady = !logicHasIsReadyFunc || this.logic.isReady(this.props.siteData, this.props.siteAPI);
            var loading = metadata.loading || metadata.videos > 0 || !this.getRootDataItemRef();
            var state = {
                $displayMode: loading || !isReady ? 'loading' : 'content',
                loading: loading
            };
            if (this.state && this.state.$displayMode && (state.$displayMode !== this.state.$displayMode)) {
                this.registerReLayout();
            }

            return state;
        },

        getViewDef: function (viewName, typeName, formatName) {
            var descriptor = this.getAppDescriptor();
            formatName = formatName || "";
            var types = getTypesFallbacks(descriptor.types, typeName);

            var componentId = this.props.id;

            var viewDef = viewCacheUtils.getComponentViewDef(componentId, viewName, typeName, formatName);
            if (viewDef) {
                return viewDef;
            }

            var view;
            while (!view && types.length) {
                view = wixapps[experiment.isOpen('wixappsViewsCaching') ? 'memoizedViewsUtils' : 'viewsUtils'].findViewInDescriptorByNameTypeAndFormat(descriptor, viewName, types.shift(), formatName);
            }

            if (!view) {
                return null;
            }

            viewDef = _.cloneDeep(view);

            viewDef.name = viewName;

            if (formatName && // The only truthy value is "Mobile".
                utils.appPartMediaInnerViewNameUtils.isMediaInnerViewName(viewName)) {
                // For an inner view set mobile format explicitly.
                // Otherwise, mobile customizations aren't applied if format is undefined.
                // See the commit description for more details.
                viewDef.format = formatName;
            }

            viewDef = viewsCustomizer.customizeView(viewDef, this.getAppCustomizations(), this.getUserCustomizations());

            viewCacheUtils.setComponentViewDef(componentId, viewName, typeName, formatName, viewDef);

            return viewDef;
        },

        componentWillUnmount: function () {
            var componentId = this.props.id;
            //var logicHasBeforeCloseFunc = (this.logic && this.logic.beforeClose);
            if (this.logic && this.logic.beforeClose) {
                this.logic.beforeClose();
            }
            viewCacheUtils.removeComponentViewDefs(componentId);
            appPartCommonDataManager.removeAppPartCommonData(this.props.compData.id);
        },

        getPartDefinition: function () {
            var descriptor = this.getAppDescriptor();
            return _.find(descriptor.parts, {id: this.props.compData.appPartName});
        },

        getViewName: function () {
            return wixapps.proxyFactory.isValidProxyName(this.props.compData.viewName) ? this.props.compData.viewName + 'View' : this.props.compData.viewName;
        },

        getUserCustomizations: function () {
            var customizations;
            if (this.logic && this.logic.getUserCustomizations) {
                customizations = this.logic.getUserCustomizations(this.props.compData.appLogicCustomizations);
            } else {
                customizations = this.props.compData.appLogicCustomizations;
            }
            return customizations;
        },

        getAppCustomizations: function () {
            return this.getAppDescriptor().customizations;
        },

        getLocalizationBundle: function () {
            return localizer.getLocalizationBundleForPackage(this.getDataAspect(), this.getPackageName(), this.props.siteData);
        },

        getLayoutRootProxy: function () {
            return this.refs.rootProxy && this.refs.rootProxy.refs.child;
        },

        getPartApi: function () {
            /**
             * @class wixappsClassics.appPartApi
             */
            return {
                getCompId: this.getCompId,
                getPrivetServices: this.getPrivetServices,
                getFormatName: this.getFormatName,
                getPartData: this.getPartData,
                getSiteApi: this.getSiteApi,
                getSiteData: this.getSiteData,
                getSiteDataApi: _.bind(getSiteDataApi, this),
                getDataAspect: this.getDataAspect,
                getPartDefinition: this.getPartDefinition,
                getLocalizationBundle: this.getLocalizationBundle,
                getPackageName: this.getPackageName,
                refreshPart: _.bind(refreshPart, this),
                getRootDataItemRef: this.getRootDataItemRef,
                resolveImageData: this.resolveImageData,
                getAppService: this.getAppService,
                setVar: function (name, value) {
                    this.setVar(this.refs.rootProxy.contextPath, name, value);
                }.bind(this),
                setVarOfLayoutRootProxy: function (name, value) {
                    this.getLayoutRootProxy().setVar(name, value);
                }.bind(this),
                setCssState: function (state) {
                    this.setState({$displayMode: state});
                }.bind(this)
            };
        },

        getCompId: function () {
            return this.props.id;
        },

        getPrivetServices: function () {
            return this.props.viewerPrivateServices;
        },

        getPartData: function () {
            return this.props.compData;
        },

        getSiteData: function () {
            return this.props.siteData;
        },

        getSiteApi: function () {
            return this.props.siteAPI;
        },

        resolveImageData: appsUrlUtils.resolveImageData,

        getRootDataItemRef: function () {
            var dataAspect = this.getDataAspect();
            return dataAspect.getDataByCompId(this.getPackageName(), this.props.compData.id);
        },

        isHeightResizable: function () {
            var isExperimentEnabled = experiment.isOpen('sv_blogRelatedPosts') || experiment.isOpen('sv_blogHeroImage');
            if (isExperimentEnabled && this.logic && this.logic.isHeightResizable) {
                return this.logic.isHeightResizable();
            }

            return descriptorUtils.doesAllowHeightResize(this.getPartDefinition(), this.getViewName(), this.getFormatName());
        },

        getSkinProperties: function () {
            if (this.state.loading || this.state.error) {
                return {
                    "": {
                        style: this.props.style
                    }
                };
            }

            var allowHeightResize = this.isHeightResizable();

            var content = [
                this.renderView(allowHeightResize)
            ];

            var style = _.clone(this.props.style || {});
            if (!allowHeightResize) {
                style.height = "auto";
            }

            reportToBI.call(this, true, false, this.props.siteData, wixappsClassicsLogger.events.APP_PART_AFTER_LOAD, {
                component_id: this.props.compData.appPartName,
                visitor_id: this.props.siteData.rendererModel && this.props.siteData.rendererModel.userId,
                loading_time: _.now() - startTime
            });

            return {
                "": {
                    style: style,
                    'data-dynamic-height': !allowHeightResize
                },
                inlineContent: {
                    children: content,
                    style: {
                        height: allowHeightResize ? '100%' : style.height,
                        width: '100%'
                    }
                }
            };
        },
        componentSpecificShouldUpdate: function (nextProps, nextState) {
            if (_.isFunction(this.componentSpecificShouldUpdatePreview)) {
                return this.componentSpecificShouldUpdatePreview(nextProps, nextState);
            }

            return this.getPackageName() !== 'blog' ||
                this.isViewContextMapDirty ||
                !_.isEqual(this.rootDataItemRef, this.getRootDataItemRef()) ||
                !_.isEqual(this.state, nextState);
        }
    };

    function getSiteDataApi() {
        return this.props.viewerPrivateServices.siteDataAPI;
    }

    function refreshPart() {
        this.registerReLayout();
        this.forceUpdate();
    }
});
