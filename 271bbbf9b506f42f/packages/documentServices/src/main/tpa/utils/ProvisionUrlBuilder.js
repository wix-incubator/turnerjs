define(['lodash', 'utils', 'tpa'], function (_, utils, tpa) {
    'use strict';

    var TPABaseUrlBuilder = tpa.common.TPABaseUrlBuilder;

    var ProvisionUrlBuilder = function (baseUrl) {
        TPABaseUrlBuilder.call(this, baseUrl);
    };

    ProvisionUrlBuilder.prototype = _.assign(new TPABaseUrlBuilder(), {
        addMetaSiteId: function (metaSiteId) {
            return this.addQueryParam('metaSiteId', metaSiteId);
        },

        addEditorSessionId: function (editorSessionId) {
            return this.addQueryParam('editorSessionId', editorSessionId);
        },

        addAcceptJson: function () {
            return this.addQueryParam('accept', 'json');
        }
    });

    return ProvisionUrlBuilder;
});
