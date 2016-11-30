define(['core', 'tpa/mixins/tpaCompBaseMixin', 'tpa/mixins/tpaUrlBuilderMixin', 'tpa/mixins/tpaCompApiMixin'], function(core, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin) {
    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    /**
     * @class components.TPAWidget
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompApiMixin}
     */
    var TPAWorker = {
        displayName: "TPAWorker",
        mixins: [mixins.skinBasedComp, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin],

        getBaseUrl: function () {
            var appData = this.getAppData();

            return appData.appWorkerUrl;
        },

        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.endpointType = 'worker';
            return queryParamsObj;
        },

        mutateSkinProperties: function (skinProps) {
            if (skinProps.iframe && skinProps.iframe.style) {
                skinProps.iframe.style.display = 'none';
            }

            return skinProps;
        },

        isTPAWorker: function () {
            return true;
        }
    };

    compRegistrar.register('tpa.viewer.classes.TPAWorker', TPAWorker);
});
