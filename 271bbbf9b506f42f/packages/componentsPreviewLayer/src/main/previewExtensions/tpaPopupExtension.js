define([
    'lodash',
    'previewExtensionsCore'
], function (_, previewExtensionsCore) {
    'use strict';

    var compType = 'wysiwyg.viewer.components.tpapps.TPAPopup';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        transformRefData: function transformRefData(refData) {
            if (this.props.compData.width === '0%' ||
                this.props.compData.height === '0%' ||
                this.props.compData.width === '0' ||
                this.props.compData.height === '0' ||
                this.state.$displayDevice !== 'mobile') {
                return;
            }
            var refDataChanges = {
                "": {
                    style: {
                        position: 'absolute',
                        width: 319,
                        height: 512,
                        marginLeft: 0,
                        marginTop: 0,
                        boxShadow: 'none',
                        left: 0,
                        top: 0
                    }
                }
            };
            _.merge(refData, refDataChanges);
        }
    };

    previewExtensionsRegistrar.registerCompExtension(compType, extension);
});
