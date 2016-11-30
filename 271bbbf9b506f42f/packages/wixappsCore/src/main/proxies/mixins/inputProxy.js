define(["utils", "wixappsCore/proxies/mixins/baseProxy"],
    function (/** utils */utils, baseProxy) {
        'use strict';

        function isVar(dataPath) {
            return utils.stringUtils.startsWith(dataPath, '$');
        }

        /**
         * @class proxies.mixins.inputProxy
         * @extends {proxies.mixins.baseProxy}
         */
        return {
            mixins: [baseProxy],
            setData: function (value, propertyPath) {
                var dataPath = this.getViewDefProp("data") || "this";
                if (propertyPath) {
                    dataPath += '.' + propertyPath;
                }
                var setFunc = isVar(dataPath) ? this.props.viewProps.setVar : this.props.viewProps.setDataByPath;
                setFunc(this.contextPath, dataPath, value);
            }
        };
    });