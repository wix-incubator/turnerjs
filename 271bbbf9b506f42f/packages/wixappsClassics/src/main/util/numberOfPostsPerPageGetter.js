define(['lodash'], function (_) {
    'use strict';

    return {
        getNumberOfPostsPerPage: function (compData, format, defaultPageSize) {
            var predicate = {
                fieldId: 'vars',
                key: 'itemsPerPage',
                view: compData.viewName
            };

            if (!_.isUndefined(format)) {
                predicate.format = format;
            }

            return _.result(_.find(compData.appLogicCustomizations, predicate), 'value', defaultPageSize || 10);
        }
    };
});
