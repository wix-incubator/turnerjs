define(['lodash',
    'utils'], function (_, utils) {
    'use strict';

    var TpaBaseUrlBuilder = function (baseUrl) {
        this.url = utils.urlUtils.parseUrl(baseUrl);
        this.url.query = this.url.query || {};
        this.url.search = null;
    };

    TpaBaseUrlBuilder.prototype = {
        addQueryParam: function (param, value) {
            var query = this.url.query;

            if (value && !_.isEmpty(value)) {
                if (!query[param]) {
                    query[param] = value;
                } else if (_.isArray(query[param])) {
                    query[param].push(value);
                } else {
                    query[param] = [query[param], value];
                }
            }

            return this;
        },

        addMultipleQueryParams: function (queryParams) {
            if (queryParams && !_.isEmpty(queryParams)) {
                _.assign(this.url.query, queryParams);
            }
            return this;
        },

        mutateIframeSrc: function(mutateIframeSrc) {
            if (mutateIframeSrc) {
                this.url = mutateIframeSrc(this.url);
            }

            return this;
        },

        filterQueryParams: function(whiteList) {
            if (whiteList && !_.isEmpty(whiteList)) {
                this.url.query = _.pick(this.url.query, whiteList);
            }

            return this;
        },

        build: function () {
            return utils.urlUtils.buildFullUrl(this.url);
        }
    };

    return TpaBaseUrlBuilder;
});
