define(['lodash', 'utils', 'documentServices/tpa/utils/ProvisionUrlBuilder'], function (_, utils, ProvisionUrlBuilder) {
    'use strict';
    var PermissionsUrlBuilder = function (baseUrl) {
        ProvisionUrlBuilder.call(this, baseUrl);
    };

    PermissionsUrlBuilder.prototype = _.assign(new ProvisionUrlBuilder(), {
        addApplicationIds: function (appIds) {
            _.forEach(appIds, function (appId) {
                this.addQueryParam('applicationId', appId.toString());
            }, this);

            return this;
        }
    });

    return PermissionsUrlBuilder;
});
