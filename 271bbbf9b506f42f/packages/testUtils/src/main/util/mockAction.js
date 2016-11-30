define([], function () {
    "use strict";

    /**
     * @lends SiteDataMockData
     */
    var actionMocks = {
        comp: function (name, sourceId) {
            var actionObj = {
                type: 'comp',
                name: name
            };
            if (sourceId) {
                actionObj.sourceId = sourceId;
            }
            return actionObj;
        }
    };

    return actionMocks;
});
