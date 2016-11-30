define(['lodash', 'core', 'siteUtils', 'tpa', 'cloud/mixins/cloudBaseUrlMixin'
], function (_, core, siteUtils, tpa, cloudBaseUrlMixin) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.cloud.CloudGluedWidget
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaCompApi}
     * @extends {cloud.mixins.cloudUrlBuilder}
     * @extends {cloud.mixins.cloudBaseUrl}
     */
    var CloudGluedWidget = {
        displayName: 'CloudGluedWidget',
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpa.tpaMixins.tpaCompBase, tpa.tpaMixins.tpaUrlBuilder, tpa.tpaMixins.tpaCompApi, cloudBaseUrlMixin],

        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.width = this.props.style.width;

            return queryParamsObj;
        },

        mutateSkinProperties: function (skinProperties) {
            var style = skinProperties[''].style;

            style.zIndex = 2;

            if (this.state && this.state.width) {
                style.width = this.state.width;
            }

            if (this.state && this.state.height) {
                style.height = this.state.height;
            }

            return skinProperties;
        }
    };

    siteUtils.compFactory.register('wysiwyg.viewer.components.cloud.CloudGluedWidget', CloudGluedWidget);

    return CloudGluedWidget;
});
