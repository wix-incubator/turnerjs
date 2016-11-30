define(["wixappsBuilder/proxies/mixins/baseFieldProxy", 'lodash'],
    function (baseFieldProxy, _) {
        'use strict';

        var typeEmptyCheckers = {
            "wix:Image": function (data) {
                return _.isEmpty(data.src) || data.src === "http://images/noimage.png";
            },
            "String": function (data) {
                return _.isEmpty(data);
            },
            "wix:Video": function (data) {
                return _.isEmpty(data.videoId) || (data.videoType === "YOUTUBE" && data.videoId === "xLk7JoPDx4Q");
            }
        };

        /**
         * @class proxies.field
         * @extends proxies.mixins.baseProxy
         * @property {proxy.properties} props
         */
        return {
            mixins: [baseFieldProxy],

            statics: {
                width: {type: 'compProp', defaultValue: 200},
                height: {type: 'compProp', defaultValue: 200}
            },

            shouldHide: function (data) {
                if (_.isUndefined(data)) {
                    return true;
                }
                var typeName = _.isString(data) ? "String" : data._type;
                var checker = typeEmptyCheckers[typeName];
                return checker && checker(data);
            },

            getItemLayout: function () {
                var width = this.getCompProp('width') || 100;
                var height = this.getCompProp('height') || 100;
                var minWidth = (this.getCompProp('layout') && this.getCompProp('layout')['min-width']) || 0;

                var heightMode = this.getCompProp('heightMode') || "manual";

                return {
                    minWidth: Math.max(minWidth, width),
                    height: heightMode === "manual" ? height : "auto"
                };
            }
        };
    });
