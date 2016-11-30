define(["wixappsBuilder/proxies/mixins/baseFieldProxy", "lodash"],
    function (baseFieldProxy, _) {
        'use strict';

        var defaultManualWidth = 150;
        var defaultManualHeight = 150;

        var typeEmptyCheckers = {
            "wix:RichText": function (data) {
                return !data.text;
            },
            "String": function (data) {
                return !data;
            },
            "wix:Date": function (data) {
                return !data.iso;
            }
        };

        function getHeightLayout() {
            var heightMode = this.getCompProp("height-mode") || "auto";
            var minHeight = this.getCompProp("min-height") || 100;
            var height = this.getCompProp('height');

            if (heightMode === "auto") {
                return {height: "auto"};
            } else if (heightMode === "max-chars") {
                return {"min-height": minHeight};
            } else if (heightMode === "fixed-height") {
                return {
                    "min-height": 0,
                    height: height || defaultManualHeight,
                    "overflow-y": "hidden"};
            } else if (heightMode === "pixels") {
                return {height: height || defaultManualHeight};
            }

            return {};
        }

        function getWidthLayout() {
            var isManualWidth = this.getCompProp("width-mode") === "manual";
            var width = this.getCompProp('width');
            var fieldOrientation = this.props.orientation;

            if (isManualWidth) {
                return {width: width || defaultManualWidth};
            } else if (fieldOrientation === 'vertical') {
                return {width: '100%'};
            }
            return {"box-flex": "1 1 auto"};
        }

        function adjustItemViewDef(itemViewDef) {
            var heightMode = this.getCompProp("height-mode") || "auto";
            var minLines = this.getCompProp("min-lines") || 0;
            var maxLines = this.getCompProp("max-lines") || 0;
            if (maxLines > 0 && maxLines < minLines) {
                maxLines = minLines;
            }

            var maxChars = this.getCompProp("max-chars") || 100;

            itemViewDef.comp.name = this.proxyData && this.proxyData._type === 'wix:Date' ? 'Date' : 'Label';
            if (heightMode === "auto") {
                itemViewDef.comp.singleLine = false;
            } else if (heightMode === "lines") {
                if (minLines === 0 && maxLines === 1 && _.isString(this.proxyData)) {
                    itemViewDef.comp.singleLine = true;
                } else if (maxLines > 0) {
                    itemViewDef.comp.name = "ClippedParagraph";
                    itemViewDef.comp.minLines = minLines;
                    itemViewDef.comp.maxLines = maxLines;
                }
            } else if (heightMode === "max-chars") {
                itemViewDef.comp.name = "ClippedParagraph2";
                itemViewDef.comp["max-chars"] = maxChars;
            } else if (heightMode === "pixels") {
                itemViewDef.comp.name = "ClippedParagraph";
                itemViewDef.comp.minLines = 0;
                itemViewDef.comp.maxLines = 0;
            }
        }

        function adjustViewDef(viewDef) {
            var fieldOrientation = this.props.orientation;

            if (fieldOrientation === "horizontal") {
                viewDef.layout = viewDef.layout || {};
                viewDef.layout["max-width"] = this.getCompProp("width") || defaultManualWidth;
            }
        }

        /**
         * @class proxies.textField
         * @extends proxies.mixins.baseField
         * @property {proxy.properties} props
         */
        return {
            mixins: [baseFieldProxy],

            shouldHide: function (data) {
                if (_.isUndefined(data)) {
                    return true;
                }
                var typeName = _.isString(data) ? "String" : data._type;
                var checker = typeEmptyCheckers[typeName];
                return checker && checker(data) && (this.getCompProp("min-lines") || 0) === 0;
            },

            adjustViewDefs: function (viewDef, itemViewDef) {
                adjustViewDef.call(this, viewDef);
                adjustItemViewDef.call(this, itemViewDef);
            },

            getItemLayout: function () {
                return _.merge(getWidthLayout.call(this), getHeightLayout.call(this));
            }
        };
    });
