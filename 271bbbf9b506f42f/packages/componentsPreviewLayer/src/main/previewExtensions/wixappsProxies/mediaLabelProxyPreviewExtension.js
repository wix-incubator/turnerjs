define(['lodash', 'previewExtensionsCore'], function (_, previewExtensionsCore) {

    'use strict';


    previewExtensionsCore.registrar.registerProxyExtension('MediaLabel', {

        /**
         * @param {!Object} nextProps
         * @returns {boolean}
         */
        isViewDefCompChangedInNextProps: function (nextProps) {
            return !_.isEqual(this.props.viewDef.comp, nextProps.viewDef.comp);
        }

    });

});