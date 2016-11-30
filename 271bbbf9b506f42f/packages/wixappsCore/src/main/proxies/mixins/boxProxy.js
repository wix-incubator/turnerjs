define(["lodash", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (_, baseCompositeProxy) {
    'use strict';

    var spacerTypesMap = {
        vertical: "VSpacer",
        horizontal: "HSpacer"
    };
    var spacerPropsMap = {
        both: "spacer",
        before: "spacerBefore",
        after: "spacerAfter"
    };

    function createSpacer(type, id) {
        return {
            id: id,
            comp: {
                name: type,
                size: "*"
            }
        };
    }

    function renderFlexSpacer(childDef, orientation, position, i) {
        orientation = orientation || 'vertical';
        var style = childDef.layout || {};

        if (style[spacerPropsMap[position]] === "*" || style[spacerPropsMap.both] === "*") {
            var spacerType = spacerTypesMap[orientation];
            var spacerId = childDef.id + "_spacer_" + position;
            var spacerViewDef = createSpacer(spacerType, spacerId);

            var key = 'spacer_' + position + '_' + i;

            return this.renderChildProxy(spacerViewDef, key);
        }

        return null;
    }

    function renderFlexSpacerBefore(childDef, orientation, i) {
        return renderFlexSpacer.call(this, childDef, orientation, "before", i);
    }

    function renderFlexSpacerAfter(childDef, orientation, i) {
        return renderFlexSpacer.call(this, childDef, orientation, "after", i);
    }

    function isFlexy(value) {
      return !(value === "none" || value === "0" || value === 0 || value === "" || value === null || _.isUndefined(value));
    }

    function hasAnyFlexy(childrenDefinitions) {
        return _.some(childrenDefinitions, function (childDef) {
            var style = this.getStyleDef(childDef);
            if (style[spacerPropsMap.before] === "*" ||
              style[spacerPropsMap.after] === "*" ||
              style[spacerPropsMap.both] === "*" ||
              isFlexy(style['box-flex']) ||
              isFlexy(style.flex) ||
              (childDef.comp && childDef.comp.size === "*")) {
                return true;
            }
          }, this);
    }

    /**
     *
     * @param {string} pack
     * @param {string} direction
     * @param {string} orientation
     * @returns {string}
     */
    function fixPackByDirection(pack, direction, orientation) {
        if (direction === "rtl" && orientation === "horizontal") {
            var flipPack = {
                start: "end",
                end: "start"
            };
            pack = flipPack[pack] || pack;
        }
        return pack;
    }

    /**
     * @class proxies.mixins.boxProxy
     * @extends proxies.mixins.baseCompositeProxy
     * @property {proxy.properties} props
     * @property {function: ReactComponent} getReactClass
     * @property {function: string} getChildrenOrientation
     */
    return {
        mixins: [baseCompositeProxy],

        getCustomStyle: function () {
            var childrenDefinitions = this.getCompProp("items");
            var flexy = hasAnyFlexy.call(this, childrenDefinitions);
            var pack = this.getCompProp("pack");
            var boxAlign = this.getCompProp("box-align");
            var childOrientation = this.getChildrenOrientation();
            var isHorizontal = childOrientation === "horizontal";
            var isDisplayFlex = flexy || pack || boxAlign || isHorizontal;
            var style = {
                position: "relative",
                display: isDisplayFlex ? "box" : "block",
                "box-orient": childOrientation
            };

            if (boxAlign) {
                style["box-align"] = boxAlign;
            }

            if (pack) {
                style["justify-content"] = fixPackByDirection(pack, this.getVar("partDirection"), childOrientation);
            }

            return style;
        },

        renderProxy: function () {
            var childrenDefinitions = this.getCompProp("items");
            var childOrientation = this.getChildrenOrientation();

            var children = _.map(childrenDefinitions, function (childDef, i) {
                var spacerBefore = renderFlexSpacerBefore.call(this, childDef, childOrientation, i);
                var childProxy = this.renderChildProxy(childDef, i);
                var spacerAfter = renderFlexSpacerAfter.call(this, childDef, childOrientation, i);

                return _.compact([spacerBefore, childProxy, spacerAfter]);
            }, this);

            children = _.flattenDeep(children);

            var componentName = this.getComponentName && this.getComponentName();
            var props = this.getChildCompProps(componentName, this.transformSkinProperties);
            if (childOrientation === 'vertical') {
                props.className = props.className || "";
                props.className += ' flex_vbox';
            }

            if (this.getCustomProps) {
                props = _.assign(props, this.getCustomProps());
            }

            var itemScope = this.getCompProp("item-scope");
            if (itemScope) {
                props.itemScope = itemScope;
            }
            var itemType = this.getCompProp("item-type");
            if (itemType) {
                props.itemType = itemType;
            }


            var reactFactory = this.getReactClass();
            return reactFactory(props, children);
        }
    };
});
