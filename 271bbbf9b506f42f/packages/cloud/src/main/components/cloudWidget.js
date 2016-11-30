define(['lodash', 'core', 'tpa', 'cloud/mixins/cloudBaseUrlMixin'], function(_, core, tpa, cloudBaseUrlMixin) {

    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    /**
     * @class components.CloudWidget
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaCompApi}
     * @extends {cloud.mixins.cloudUrlBuilder}
     * @extends {cloud.mixins.cloudBaseUrl}
     */
    var CloudWidget = {
        displayName: 'CloudWidget',

        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpa.tpaMixins.tpaCompBase, tpa.tpaMixins.tpaUrlBuilder, tpa.tpaMixins.tpaCompApi, cloudBaseUrlMixin],

        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.width = this.props.style.width;

            return queryParamsObj;
        }
    };

    compRegistrar.register('wysiwyg.viewer.components.cloud.CloudWidget', CloudWidget);
    return CloudWidget;
});