define([
    'lodash',
    'core',
    'wixappsCore',
    'wixappsBuilder/core/appRepo',
    'wixappsBuilder/util/appbuilderUrlUtils',
    'wixappsBuilder/logics/appPart2Presenter'
], function (
    _,
    core,
    wixappsCore,
    appRepo,
    appsUrlUtils,
    AppPart2Presenter
) {
    'use strict';

    var wixappsLogger = wixappsCore.wixappsLogger;

    function reportToBI(isError, siteData, reportDef, params) {
        if (this.oneTimerIndicator) {
            this.oneTimerIndicator = false;
            if (isError) {
                wixappsLogger.reportError(siteData, reportDef, params);
            } else {
                wixappsLogger.reportEvent(siteData, reportDef, params);
            }
        } //otherwise we don't want to send to BI again
    }

    function isRepoValid() {
        var repo = this.getRepo();
        var appPartDefinition = appRepo.getAppPartDefinition(repo, this.props.compData.appPartName);
        var appService = this.props.siteData.getClientSpecMapEntry(this.props.compData.appInnerID);
        var dataSelector = appRepo.getDataSelector(repo, this.props.compData.appPartName, this.props.siteData, appService, repo.applicationInstanceVersion);

        if (!appPartDefinition || !dataSelector) {
            reportToBI.call(this, true, this.props.siteData, wixappsLogger.errors.APP_PART2_FAILED_TO_LOAD);
            return false;
        }

        return true;
    }

    function getDataSelector() {
        var compData = this.props.compData;
        var appService = this.props.siteData.getClientSpecMapEntry(compData.appInnerID);
        var dataAspect = this.getDataAspect();
        var repo = dataAspect.getDescriptor(this.getPackageName());

        return appRepo.getDataSelector(this.getRepo(), compData.appPartName, this.props.siteData, appService, repo.applicationInstanceVersion);
    }

    function getCompMetadata() {
        var compData = this.props.compData;
        var appService = this.props.siteData.getClientSpecMapEntry(compData.appInnerID);
        var dataAspect = this.getDataAspect();
        return dataAspect.getMetadata(appService.type, compData.appPartName);
    }

    function getCssState() {
        var metadata = getCompMetadata.call(this);
        if (metadata.loading) {
            return {$displayMode: 'loading'};
        } else if (metadata.error) {
            return {$displayMode: 'error'};
        }

        var cssState = {
            $displayMode: 'content',
            itsDeadJim: !isRepoValid.call(this)
        };

        if (this.state && this.state.$displayMode && (cssState.$displayMode !== this.state.$displayMode)) {
            this.registerReLayout();
        }

        return cssState;
    }

    function updatePageTitleIfNeeded() {
        var dataSelectorDefinition = appRepo.getDataSelectorDefinition(this.getRepo(), this.props.compData.appPartName);
        if (_.get(dataSelectorDefinition, 'logicalTypeName') === 'IB.PageSelectedItem') {
            var appPartDefinition = this.getAppPartDefinition();
            var item = this.getDataByFullPath(this.getRootDataItemRef());
            var title = (item && item.title || '') + ' | ' + appPartDefinition.displayName;
            this.props.siteAPI.setPageTitle(_.unescape(title), title);
        }
    }

    /**
     * @class components.AppPart2
     * @extends {core.skinBasedComp}
     * @extends {wixapps.viewsRenderer}
     */
    return {
        displayName: "AppPart2",
        mixins: [wixappsCore.viewsRenderer, core.compMixins.skinBasedComp],

        getInitialState: function () {
            this.oneTimerIndicator = true;
            var cssState = getCssState.call(this);
            if (cssState.$displayMode === 'content' && !cssState.itsDeadJim && !this.dataSelector) {
                this.dataSelector = getDataSelector.call(this);
                updatePageTitleIfNeeded.call(this);
            }

            return cssState;
        },

        componentWillReceiveProps: function () {
            if (this.state.itsDeadJim) {
                return;
            }

            var cssState = getCssState.call(this);
            if (cssState.$displayMode === 'content' && !cssState.itsDeadJim) {
                this.dataSelector = getDataSelector.call(this);
                updatePageTitleIfNeeded.call(this);
            }
            this.registerReLayout();
            if (!_.isEqual(this.state, cssState)) {
                this.setState(cssState);
            }
        },

        componentWillMount: function () {
            this.logic = new AppPart2Presenter(this.getPartApi());
        },

        getPartApi: function () {
            return {
                getAppPartDefinition: this.getAppPartDefinition,
                getRepo: this.getRepo,
                getPartData: this.getRootDataItemRef,
                getDataAspect: this.getDataAspect,
                getLocalizationBundle: this.getLocalizationBundle,
                getDataSelector: function () {
                    return this.dataSelector;
                }.bind(this),
                registerReLayout: this.registerReLayout,
                siteData: this.props.siteData,
                setCssState: this.setCssState
            };
        },

        setCssState: function (state) {
            if (this.state.$displayMode !== state) {
                this.registerReLayout();
            }
            this.setState({$displayMode: state});
        },

        getViewDef: function (viewName, typeName, formatName) {
            var dataAspect = this.getDataAspect();
            var repo = dataAspect.getDescriptor(this.getPackageName());
            return appRepo.getViewDef(repo, viewName, typeName, formatName);
        },

        getLocalizationBundle: function () {
            // No need for localization bundle because the views doesn't use localized strings.
            return {
                'FILTER_DIALOG_All_Tags': 'All'
            };
        },

        /**
         * Gets the Application Repository Definition.
         * @returns {AppRepoDefinition}
         */
        getRepo: function () {
            var dataAspect = this.getDataAspect();
            return dataAspect.getDescriptor(this.getPackageName());
        },

        /**
         * Get the application definition from the repo.
         * @returns {AppPartDefinition}
         */
        getAppPartDefinition: function () {
            // TODO: remove this method and use getPartDefinition instead as in classic AppPart
            return this.getPartDefinition();
        },

        /**
         * Get the application definition from the repo.
         * @returns {AppPartDefinition}
         */
        getPartDefinition: function () {
            return appRepo.getAppPartDefinition(this.getRepo(), this.props.compData.appPartName);
        },

        /**
         * Gets the name of the root view of the AppPart.
         * @returns {string}
         */
        getViewName: function () {
            return this.getAppPartDefinition().viewName;
        },

        resolveImageData: appsUrlUtils.resolveImageData,

        getRootDataItemRef: function () {
            return this.dataSelector && this.dataSelector.getData();
        },

        getSkinProperties: function () {
            if (this.state.itsDeadJim) {
                throw "AppPart data is not valid.";
            }

            if (this.state.$displayMode === 'content') {
                var content = this.renderView();
                var styleWithoutHeight = _.clone(this.props.style || {});
                styleWithoutHeight.height = "auto";

                reportToBI.call(this, false, this.props.siteData, wixappsLogger.events.APP_BUILDER_PART_LOADED, {
                    appPartName: this.props.compData.appPartName,
                    userId: this.props.siteData.rendererModel && this.props.siteData.rendererModel.userId
                });

                return {
                    "": {
                        style: styleWithoutHeight,
                        'data-dynamic-height': true
                    },
                    inlineContent: {
                        children: content,
                        style: {
                            height: 'auto'
                        }
                    }
                };
            }

            return {};
        }
    };
});
