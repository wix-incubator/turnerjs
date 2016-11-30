define(['utils/svgFilters/svgFiltersTemplates', 'utils/svgFilters/svgFiltersGetters'], function (filters, getters) {
    'use strict';

    return {
        getFilter: getters.getFilter.bind(null, filters),
        getFilterNames: getters.getFilterNames.bind(null, filters),
        getFilterDefaults: getters.getFilterDefaults.bind(null, filters),
        isFilterExists: getters.isFilterExists.bind(null, filters)
    };

});
