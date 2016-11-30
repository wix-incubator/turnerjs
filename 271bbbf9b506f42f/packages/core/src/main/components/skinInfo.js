define(['lodash', 'skins', 'santaProps'], function (_, skinPackage, santaProps) {
    'use strict';

    /**
     * @class core.skinInfo
     */
    return {

        propTypes: {
            skin: santaProps.Types.Component.skin,
            structure: santaProps.Types.Component.structure,
            theme: santaProps.Types.Component.theme,
            allTheme: santaProps.Types.Theme.all,
            themeColor: santaProps.Types.Theme.colors
        },

        getParams: function (paramNames, skinName) {
            var params = {};

            _.forEach(paramNames, function (paramName) {
                params[paramName] = this.getParamFromDefaultSkin(paramName, skinName);
            }, this);

            return params;
        },

        getParamFromDefaultSkin: function (paramName, skinName) {
            return this.getParamFromSkin(paramName, skinName || this.props.skin);
        },

        getParamFromSkin: function (paramName, skinName) {
            var styleData = _.get(this.props.theme, 'style.properties') || {};
            var skinData = skinPackage.skins[skinName];
            var val = styleData[paramName] || (skinData.paramsDefaults && skinData.paramsDefaults[paramName]);

            if (_.isArray(val) && val.length > 1) {
                styleData = _.clone(styleData);
                styleData[paramName] = this.getSumParamValue(paramName, skinName);
            }
            return skinPackage.params.renderParam(paramName, skinData, styleData, this.props.themeColor);
        },

        getSumParamValue: function (paramName, skinName) {
            var skinExports = this.getSkinExports();
            var paramsDefaults = skinPackage.skins[skinName].paramsDefaults;
            var val = paramsDefaults && paramsDefaults[paramName];
            if (!val) {
                var exportsVal = skinExports[paramName];
                return (exportsVal ? (Math.abs(parseInt(exportsVal, 10)) || 0) : 0);
            }
            if (Array.isArray(val)) {
                return _.sum(val, function (item) {
                    return Math.abs(parseInt(this.getParamFromSkin(item, skinName).value, 10));
                }, this);
            }
            return (Math.abs(parseInt(val, 10)) || 0);
        },

        getFromExports: function (paramName) {
            var exports = this.getSkinExports();
            return (exports && exports[paramName]) || 0;
        },

        getStyleData: function (styleIdToGet, props) {
            props = props || this.props;
            var styleId = styleIdToGet || props.structure.styleId;
            if (styleId) {
                styleId = styleId.replace('#', '');
            }
            var styleFromTheme = props.allTheme[styleId];
            return _.get(styleFromTheme, 'style.properties') || {};
        }
    };
});
