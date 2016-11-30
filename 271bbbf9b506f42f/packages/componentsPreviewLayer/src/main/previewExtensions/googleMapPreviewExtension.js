define(['lodash', 'react', 'santaProps', 'previewExtensionsCore'], function (_, React, santaProps, previewExtensionsCore) {
    'use strict';

    var extension = {
        propTypes: {
            shouldBlockGoogleMapInteraction: santaProps.Types.RenderFlags.shouldBlockGoogleMapInteraction
        },
        transformRefDataTemp: function(refData) {
            if (this.props.shouldBlockGoogleMapInteraction) {
                var blockLayerProps = {
                    style: {
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer'
                    },
                    className: 'blockLayer'
                };

                blockLayerProps.onClick = _.noop;
                var blockLayer = React.DOM.div(blockLayerProps);

                refData[''] = refData[''] || {};
                refData[''].addChildren = refData[''].addChildren || [];
                refData[''].addChildren.push(blockLayer);
            }
        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.viewer.components.GoogleMap', extension);
});
