define(['lodash'], function (_) {
    'use strict';

    /**
     * @private
     * @param name
     * @returns {{}}
     */
    function findFilter(filters, name) {
        var filter = _.find(filters.templates, {name: name});
        return filter || {};
    }

    /**
     * Get an filter (SVG filter) string from filters list
     * @param {string} id
     * @param {string} name
     * @param {object} [overrides]
     * @returns {string} a compiled filter template
     */
    function getFilter(filters, id, name, overrides) {
        var filter = findFilter(filters, name);
        var params = {
            id: id,
            content: filter.template(_.assign({}, filter.defaults, overrides || {}))
        };
        return filters.masterTemplate(params);
    }

    /**
     * checks if filter key exists
     * @param effectName
     * @returns {boolean}
     */
    function isFilterExists(filters, effectName) {
        return !_.isEmpty(_.find(filters.templates, {name: effectName}));
    }


    /**
     * Get the list of supported filter names
     * @returns {Array}
     */
    function getFilterNames(filters) {
        return _.map(filters.templates, 'name');
    }

    /**
     * Get the defaults (== the dynamic values) of a filter
     * @param {string} name
     * @returns {{}}
     */
    function getFilterDefaults(filters, name) {
        return _.clone(findFilter(filters, name).defaults || {});
    }

    return {
        getFilter: getFilter,
        getFilterNames: getFilterNames,
        getFilterDefaults: getFilterDefaults,
        isFilterExists: isFilterExists
    };
});
