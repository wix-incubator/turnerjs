define([
    'react',
    'lodash',
    'santaProps',
    'componentsPreviewLayer/visibilityPlugins/appControllerPlugin',
    'previewExtensionsCore'],
    function (React, _, santaProps, appControllerPlugin, previewExtensionsCore) {
        'use strict';

        var compType = 'platform.components.AppController';
        var previewExtensionsRegistrar = previewExtensionsCore.registrar;
        var SantaTypes = santaProps.Types;

        var extension = {
            propTypes: {
                showControllers: SantaTypes.RenderFlags.showControllers,
                applicativeUIData: SantaTypes.AppController.applicativeUIData(React.PropTypes.shape({
                    icon: React.PropTypes.string.isRequired
                }))
            },
            transformRefData: function transformRefData(refData) {
                var shouldShowAppController = appControllerPlugin({
                    renderFlags: {
                        showControllers: this.props.showControllers
                    },
                    compType: compType
                });
                if (shouldShowAppController) {
                    refData[""] = refData[""] || {};

                    refData[""].children = [React.DOM.img({
                        src: this.props.applicativeUIData.icon
                    })];
                }
            }
        };

        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    });
