define(['wixappsCore', 'lodash', 'react', 'utils', 'wixappsBuilder/util/fieldProxyUtils'],
    function (/** wixappsCore */wixapps, _, React, utils, fieldProxyUtils) {
    'use strict';

    function getLinkData() {
        // get the data links from the item
        var item = this.getCompProp('items')[0];
        if (item.link) {
            return item.link;
        }

        // this is the field in the data context, that will appear in the links map
        var fieldName = this.getViewDefProp('data', item) || this.getViewDefProp('data');

        return this.getDataByPath('links.' + fieldName);
    }

    function getChildViewDef() {
        var data = this.proxyData;
        var childViewDef = _.cloneDeep(this.props.viewDef);
        var childCompDef = childViewDef.comp;

        var items = this.getCompProp('items', childViewDef);

        if (!items || items.length !== 1) {
            throw "Field proxy accepts exactly one child";
        }

        var fieldOrientation = this.props.orientation;
        var isVertical = fieldOrientation === "vertical";

        if (this.adjustViewDefs) {
            this.adjustViewDefs(childViewDef, items[0]);
        }

        childCompDef.name = isVertical ? "VBox" : "HBox";
        childCompDef.hidden = this.shouldHide(data);

        // apply the item layout on the original item, if exists
        var itemLayout = this.getItemLayout();
        if (_.keys(itemLayout).length) {
            items[0].layout = _.merge(items[0].layout || {}, itemLayout);
        }

        var linkViewDef = fieldProxyUtils.getLinkViewDef(this.getCompProp('pageLink'), getLinkData.call(this));

        // wrap the single item with link proxy if has link
        if (linkViewDef) {
            linkViewDef.layout = _.cloneDeep(items[0].layout);
            //delete items[0].layout;
            // ugly code ahead
            linkViewDef.comp.items.push(items.pop());
            items.push(linkViewDef);
        }

        // apply the spacers on the link if exist or on the original item if wasn't switched
        var spacers = fieldProxyUtils.getSpacers(fieldOrientation, this.getCompProp("spacers"), this.getVar("partDirection"));

        childViewDef.layout = _.merge(childViewDef.layout || {}, spacers);

        return childViewDef;
    }

    /**
     * @class proxies.mixins.baseField
     * @extends proxies.mixins.baseComposite
     * @property {proxy.properties} props
     * @property {function(): object} getFieldCustomStyle
     */
    return {
        mixins: [wixapps.baseCompositeProxy],

        getCustomStyle: function () {
            var style = {};
            if (this.getCompProp("box-align")) {
                style["box-align"] = this.getCompProp("box-align");
            }

            return style;
        },

        renderProxy: function () {
            var childViewDef = getChildViewDef.call(this);
            var props = this.getChildCompProps();

            // We should use the opposite direction of the fieldBox
            if (this.props.orientation === 'horizontal') {
                var classes = {
                    flex_display: true,
                    flex_vbox: true
                };
                if (props.className) {
                    classes[props.className] = true;
                }
                props.className = utils.classNames(classes);
            }

            return React.DOM.div(props, this.renderChildProxy(childViewDef));
        }
    };
});
