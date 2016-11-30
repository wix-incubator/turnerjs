define(['lodash', 'core',
    'tpa/mixins/tpaCompBaseMixin',
    'tpa/mixins/tpaUrlBuilderMixin',
    'tpa/mixins/tpaCompApiMixin',
    'tpa/mixins/tpaWidgetMixin',
    'tpa/mixins/tpaResizeWindowMixin'
], function(
    _,
    core,
    tpaCompBaseMixin,
    tpaUrlBuilderMixin,
    tpaCompApiMixin,
    tpaWidgetMixin,
    tpaResizeWindowMixin
) {

	'use strict';

	var compRegistrar = core.compRegistrar;
	var mixins = core.compMixins;

    /**
     * @class components.TPAWidget
     * @extends {core.skinBasedComp}
     * @extends {tpa.mixins.tpaCompBase}
     * @extends {tpa.mixins.tpaCompApiMixin}
     * @extends {tpa.mixins.tpaUrlBuilder}
     */
    var TPAWidget = {
        displayName: "TPAWidget",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, tpaCompBaseMixin, tpaUrlBuilderMixin, tpaCompApiMixin, tpaWidgetMixin, tpaResizeWindowMixin],
        mutateIframeUrlQueryParam: function (queryParamsObj) {
            queryParamsObj.width = this.state.initialWidth;

            var originCompId = this.props.structure.originCompId;
            if (originCompId && !_.isEmpty(originCompId)) {
                queryParamsObj.originCompId = originCompId;
            }
            return queryParamsObj;
        }
    };

    compRegistrar.register("wysiwyg.viewer.components.tpapps.TPAWidget", TPAWidget);
    return TPAWidget;
});
