define(['previewExtensionsCore'], function (previewExtensionsCore) {
    'use strict';

    var comboBoxExtension = {
        statics: {
            behaviorExtensions: {
                setCurrentCompValue: {methodName: 'setCurrentCompValue', params: ['val']}
            }
        },

        setCurrentCompValue: function(val) {
            this.setState({
                value: val
            });
        }
    };

    previewExtensionsCore.registrar.registerCompExtension('wysiwyg.viewer.components.inputs.ComboBoxInput', comboBoxExtension);
});
