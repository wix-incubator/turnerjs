define(['lodash',
    'utils',
    'tpa/common/TPABaseUrlBuilder'], function (_, utils, TPABaseUrlBuilder) {
    'use strict';

    var TpaUrlBuilder = function (baseUrl) {
        TPABaseUrlBuilder.call(this, baseUrl);
    };

    TpaUrlBuilder.prototype = _.assign(new TPABaseUrlBuilder(), {
        addCacheKiller: function (cacheKiller) {
            return this.addQueryParam('cacheKiller', cacheKiller);
        },

        addInstance: function (instance) {
            return this.addQueryParam('instance', instance);
        },

        addWidth: function (width) {
            return this.addQueryParam('width', width);
        },

        addLocale: function (locale) {
            return this.addQueryParam('locale', locale);
        },

        addViewMode: function (viewMode) {
            return this.addQueryParam('viewMode', viewMode);
        },

        addCompId: function (compId) {
            return this.addQueryParam('compId', compId);
        },

        addDeviceType: function (deviceType) {
            return this.addQueryParam('deviceType', deviceType);
        },

        addEndpointType: function (endpointType) {
            return this.addQueryParam('endpointType', endpointType);
        },

        addOrigCompId: function (origCompId) {
            return this.addQueryParam('origCompId', origCompId);
        },

        addExternalId: function (externalId) {
            return this.addQueryParam('externalId', externalId);
        },

        addOrigin: function (origin) {
            return this.addQueryParam('origin', origin);
        }
    });

    return TpaUrlBuilder;
});
