define(['lodash', 'core',
    'tpa/mixins/tpaCompBaseMixin', 'tpa/mixins/tpaUrlBuilderMixin', 'tpa/mixins/tpaCompApiMixin', 'tpa/mixins/tpaSectionMixin', 'tpa/mixins/tpaResizeWindowMixin'
], function (_, core, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaSectionMixin, tpaResizeWindowMixin) {

    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    /**
     * @class components.TPAMultiSection
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompAPI}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    var TPAMultiSection = {
        displayName: "TPAMultiSection",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaSectionMixin, tpaResizeWindowMixin],
        getBaseUrl: function () {
            var appData = this.getAppData();
            var sectionUrl = appData.sectionUrl;

            var widget = appData.widgets[this.props.compData.widgetId];
            var sectionDefaultPage = appData.sectionDefaultPage;

            if (widget) {
                if (this.isUnderMobileView() && this.isMobileReady()) {
                    sectionUrl = widget.mobileUrl;
                } else {
                    sectionUrl = widget.widgetUrl;
                }

                sectionDefaultPage = widget.appPage.defaultPage;
            }

            if (sectionDefaultPage && !_.isEmpty(sectionDefaultPage)) {
                if (sectionUrl.slice(-1) !== '/') {
                    sectionUrl += '/';
                }

                sectionUrl += sectionDefaultPage;
            }


            return sectionUrl;
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAMultiSection", TPAMultiSection);
    return TPAMultiSection;
});
