define(['lodash', 'core/components/uniquePageIdProviders/uniquePageIdProviders'], function(_, uniquePageIdProviders) {
   'use strict';

    /**
     * Checks, if component should be rendered on all pages
     *
     * @param {object} siteData
     * @param {string} componentId
     * @returns {boolean}
     */
    function isComponentInMasterPage(siteData, componentId) {
        return _(siteData.pagesData.masterPage.structure.children)
            .map(function(item) {
                return _.isArray(item.components) ? item.components : item;
            })
            .flattenDeep()
            .some({id: componentId});
    }

    /**
     * @class core.uniquePageIdMixin
     */
    return {

        /**
         * Uses site url to home page for components, displayed for all pages
         * Uses corresponding uniquePageIdProvider if one exists in registry
         * Uses full page url for all other cases
         *
         * @returns {string} SHA 256 hash or url
         */
        getUniquePageId: function getUniquePageId() {
            var provider;

            if (isComponentInMasterPage(this.props.siteData, this.props.id)) {
                return this.props.siteData.getExternalBaseUrl();
            }

            provider = _.find(uniquePageIdProviders, function(p) {
                var rootId = this.props.rootId;
                var pageData = this.props.siteData.pagesData[rootId];
                return p.isMatched(pageData);
            }, this);
            if (!_.isUndefined(provider)) {
                return provider.getUniquePageId(this.props.siteData, this.props.rootId);
            }

            return this.props.siteData.currentUrl.full;
        }
    };
});
