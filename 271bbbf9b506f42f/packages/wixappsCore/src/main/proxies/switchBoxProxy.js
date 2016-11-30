define(["lodash", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (_, baseCompositeProxy) {
    'use strict';

    /**
     * @class proxies.SwitchBox
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy],
        renderProxy: function () {
            var cases = this.getCompProp("cases");
            var data = _.has(cases, this.proxyData) ? this.proxyData : 'default';
            var itemsDefinitions = cases[data];
            if (!itemsDefinitions || itemsDefinitions.length === 0) {
                return null;
            }

            var orientation = this.getCompProp("orientation") || "vertical";
            var childViewDef = _.cloneDeep(_.omit(this.props.viewDef, ["comp.cases"]));

            // cleanup
            delete childViewDef.data;
            delete childViewDef.name;
            delete childViewDef.forType;
            delete childViewDef.comp.cases;

            // build
            childViewDef.id = childViewDef.id + "_" + data;
            childViewDef.comp.name = orientation === "vertical" ? "VBox" : "HBox";
            childViewDef.comp.items = itemsDefinitions;

            return this.renderChildProxy(childViewDef, childViewDef.id, this.getProxyStyle());
        }
    };
});
