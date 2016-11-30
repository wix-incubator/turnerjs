define(["wixappsCore", "lodash", 'wixappsBuilder/util/fieldBoxProxyUtils'], function (/** wixappsCore */wixapps, _, fieldBoxProxyUtils) {
    'use strict';

    /**
     * @class proxies.fieldBox
     * @extends proxies.mixins.baseCompositeProxy
     * @property {proxy.properties} props
     */
    return {
        mixins: [wixapps.baseCompositeProxy],

        renderProxy: function () {
            var orientation = this.props.orientation;
            var fieldBoxDef = fieldBoxProxyUtils.getFieldBoxDef(this.getCompProp, orientation, this.props.viewDef);

            var childViewDef = _.cloneDeep(this.props.viewDef);
            childViewDef.comp.items = fieldBoxDef.comp.items;
            _.merge(childViewDef, fieldBoxDef);

            return this.renderChildProxy(childViewDef);
        }
    };
});
