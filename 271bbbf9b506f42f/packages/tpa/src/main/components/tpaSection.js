define(['lodash', 'core',
    'tpa/mixins/tpaCompBaseMixin', 'tpa/mixins/tpaUrlBuilderMixin', 'tpa/mixins/tpaCompApiMixin', 'tpa/mixins/tpaSectionMixin', 'tpa/mixins/tpaResizeWindowMixin'
], function(_, core, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaSectionMixin, tpaResizeWindowMixin) {
    'use strict';

    var compRegistrar = core.compRegistrar;
    var mixins = core.compMixins;

    /**
     * @class components.TPASection
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompAPI}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    var TPASection = {
        displayName: "TPASection",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaSectionMixin, tpaResizeWindowMixin],
        getBaseUrl: function () {
            var appData = this.getAppData();
            var widgetId = this.props.compData.widgetId;
            var sectionUrl = appData.sectionUrl;
            var sectionDefaultPage = appData.sectionDefaultPage;

            var dataType = this.props.compData.type;
            var isMobileView = this.isUnderMobileView() && this.isMobileReady();

            if (dataType === 'TPAWidget' && widgetId) {
                var widget = _.find(appData.widgets, {widgetId: widgetId});

                if (widget) {
                    sectionDefaultPage = widget.appPage.defaultPage;
                    if (isMobileView) {
                        sectionUrl = widget.mobileUrl;
                    } else {
                        sectionUrl = widget.widgetUrl;
                    }
                }
            } else if (isMobileView) {
                sectionUrl = appData.sectionMobileUrl;
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

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPASection", TPASection);
    return TPASection;
});
