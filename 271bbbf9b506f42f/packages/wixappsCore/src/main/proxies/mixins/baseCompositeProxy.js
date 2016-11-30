define(["react", "lodash", "wixappsCore/proxies/mixins/baseProxy", "wixappsCore/core/proxyFactory", "wixappsCore/core/styleTranslator"], function (React, _, baseProxy, /** wixappsCore.proxyFactory */proxyFactory, /** wixappsCore.styleTranslator */styleTranslator) {
    'use strict';

    var spacerCompSizeProp = {
        HSpacer: "width",
        VSpacer: "min-height"
    };

    var SPACER_COMP_NAMES = ["HSpacer", "VSpacer"];

    function isSpacer(componentName) {
        return _.includes(SPACER_COMP_NAMES, componentName);
    }

    function getSpacerStyle(spacerViewDef, props) {
        var spacerStyle = this.getStyleDef(spacerViewDef, props);
        spacerStyle.boxSizing = 'border-box';
        var size = this.getCompProp("size", spacerViewDef);
        if (size === "*") {
            spacerStyle["box-flex"] = 1;
        } else {
            var compName = this.getCompProp("name", spacerViewDef);
            spacerStyle[spacerCompSizeProp[compName]] = size;
        }
        return styleTranslator.translate(spacerStyle, props.orientation);
    }

    function getSpacerElement(spacerViewDef, props) {
        if (this.getCompProp("hidden", spacerViewDef)) {
            return null;
        }
        props.style = getSpacerStyle.call(this, spacerViewDef, props);
        return React.DOM.div(props);
    }


    /**
     * @class proxies.mixins.baseComposite
     * @extends proxies.mixins.baseProxy
     * @property {proxy.properties} props
     */
    return {
        mixins: [baseProxy],

        renderChildProxy: function (childDef, key, childProxyStyle, props) {
            props = props || this.getChildProxyProps(childDef);
            key = String(key || "0");
            props.key = key;
            props.ref = key;
            props.refInParent = key;
            props.proxyLayout = childProxyStyle;

            if (this.getChildrenOrientation) {
                props.orientation = this.getChildrenOrientation();
            }

            var childCompName = this.getCompProp("name", childDef);

            if (isSpacer(childCompName)) {
                return getSpacerElement.call(this, childDef, props);
            }

            return proxyFactory.getProxyClass(childCompName)(props);
        }
    };
});
