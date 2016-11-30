define(['lodash', 'experiment'], function(_, experiment) {
    'use strict';

    /**
     * @exports utils/dataFixer/plugins/connectionsDataFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            if (experiment.isOpen('connectionsData')) {
                var pageData = _.get(pageJson, 'data');
                pageData.connections_data = pageData.connections_data || {};
            }
        }
    };

    return exports;
});
