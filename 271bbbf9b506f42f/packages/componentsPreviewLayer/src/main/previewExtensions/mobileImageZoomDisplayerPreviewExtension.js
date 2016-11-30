define(['lodash', 'previewExtensionsCore'],

function (_, previewExtensionsCore) {
    'use strict';

    function transformRefDataPosition(refData, skinPartName, position){
        refData[skinPartName] = refData[skinPartName] || {};
        refData[skinPartName].style = _.assign({}, refData[skinPartName].style, {
            position: position
        });
    }

    var compType = 'wysiwyg.components.MobileImageZoomDisplayer';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        transformRefData: function transformRefData(refData) {
            if (!this.props.siteData.renderFlags.renderFixedPositionContainers) {
                return;
            }

            transformRefDataPosition(refData, '', 'initial');
            transformRefDataPosition(refData, 'panel', 'absolute');
            transformRefDataPosition(refData, 'gradient', 'absolute');
        }
    };

    previewExtensionsRegistrar.registerCompExtension(compType, extension);
});
