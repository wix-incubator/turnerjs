define(['core',
        'tpa/mixins/tpaCompBaseMixin',
        'tpa/mixins/tpaUrlBuilderMixin',
        'tpa/mixins/tpaCompApiMixin',
        'tpa/mixins/tpaWidgetMixin',
        'tpa/mixins/tpaResizeWindowMixin'

    ], function(core, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaWidgetMixin, tpaResizeWindowMixin) {
    'use strict';

	var compRegistrar = core.compRegistrar;
	var mixins = core.compMixins;

    /**
     * @class components.TPAPreloader
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     */
    var tpaGluedWidget = {
        displayName: "TPAGluedWidget",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaWidgetMixin, tpaResizeWindowMixin],
        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.width = this.state.initialWidth;

            return queryParamsObj;
        }
    };

    compRegistrar.register('wysiwyg.viewer.components.tpapps.TPAGluedWidget', tpaGluedWidget);
});
