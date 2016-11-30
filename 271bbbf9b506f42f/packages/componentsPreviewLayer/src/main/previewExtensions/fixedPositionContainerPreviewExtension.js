define(['lodash', 'previewExtensionsCore', 'santaProps'],

function (_, previewExtensionsCore, santaProps) {
    'use strict';

    var footerCompType = 'wysiwyg.viewer.components.FooterContainer';
    var headerCompType = 'wysiwyg.viewer.components.HeaderContainer';
    var tinyMenuCompType = 'wysiwyg.viewer.components.mobile.TinyMenu';
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        propTypes: {
            renderFixedPositionContainers: santaProps.Types.RenderFlags.renderFixedPositionContainers.isRequired
        },

        getTransformedCssStates: function() {
            if (this.props.renderFixedPositionContainers) {
                return this.state;
            }

            return _.omit(this.state, '$fixed');  //return transformed state
        },

        getRootPosition: function(style){
            if (this.props.renderFixedPositionContainers) {
                return style.position;
            }

            return 'absolute';
        }
    };

    previewExtensionsRegistrar.registerCompExtension(footerCompType, extension);
    previewExtensionsRegistrar.registerCompExtension(headerCompType, extension);
    previewExtensionsRegistrar.registerCompExtension(tinyMenuCompType, extension);
});
