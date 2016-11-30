define(['lodash', 'previewExtensionsCore'],

function (_, previewExtensionsCore) {
    'use strict';

    function transformRefDataPosition(refData, skinPartName){
        refData[skinPartName].style = _.assign({}, refData[skinPartName].style, {
            position: 'absolute'
        });
    }

    var compType = 'wysiwyg.viewer.components.MobileMediaZoom';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        transformRefData: function transformRefData(refData) {
            if (!this.props.siteData.renderFlags.renderFixedPositionContainers) {
                return;
            }
            var siteStructureWidth = this.props.siteData.getSiteWidth();

            refData.blockingLayer = refData.blockingLayer || {};
            refData.blockingLayer.style = _.assign({}, refData.blockingLayer.style, {
                width: siteStructureWidth,
                height: '100vh',
                marginLeft: "calc(50% - " + (siteStructureWidth / 2) + "px)"
            });

            transformRefDataPosition(refData, 'xButton');
            transformRefDataPosition(refData, 'buttonPrev');
            transformRefDataPosition(refData, 'buttonNext');
        }
    };

    previewExtensionsRegistrar.registerCompExtension(compType, extension);
});
