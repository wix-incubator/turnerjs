define(['lodash', 'utils', 'tpa/utils/tpaUtils', 'tpa/common/TPAUrlBuilder'], function(_, utils, tpaUtils, TPAUrlBuilder){
    'use strict';

    var getIframeQueryParams = function (comp, queryParamsObj) {
        if (comp.mutateIframeUrlQueryParam) {
            queryParamsObj = comp.mutateIframeUrlQueryParam(queryParamsObj);
        }

        return queryParamsObj;
    };

    /**
     * @class tpa.mixins.tpaUrlBuilder
     */
    return {
        getInitialState: function() {
            this.viewMode = this.getViewMode();
        },

        getViewMode: function() {
            return this.props.siteData.isViewerMode() ? 'site' : this.props.siteData.renderFlags.componentViewMode;
        },

        buildUrl: function (baseUrl, whiteList) {

            var params = this.state.queryParams || {};
            params = _.merge(params, getIframeQueryParams(this, params));
            if (this.getEcomParams && this.getEcomParams()) {
                params['ecom-tpa-params'] = this.getEcomParams();
            }

            var urlObj = new TPAUrlBuilder(baseUrl)
                .addCompId(this.props.id)
                .addDeviceType(this.getDeviceType(this))
                .addInstance(this.getAppData(this).instance)
                .addLocale(this.props.siteData.rendererModel.languageCode)
                .addViewMode(this.viewMode)
                .addCacheKiller(tpaUtils.getCacheKiller())
                .addExternalId(this.props.compData.referenceId)
                .filterQueryParams(whiteList)
                .addMultipleQueryParams(params);


            if (this.mutateIframeSrc) {
                urlObj.mutateIframeSrc(this.mutateIframeSrc);
            }

            return urlObj.build();
        }
    };
});

