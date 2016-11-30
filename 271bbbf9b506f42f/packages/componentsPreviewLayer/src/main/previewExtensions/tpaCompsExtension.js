define(['lodash',
        'previewExtensionsCore',
        'utils'],
function (_, previewExtensionsCore, utils) {
    'use strict';

    var compTypes = ['wysiwyg.viewer.components.tpapps.TPAWidget',
        'wysiwyg.viewer.components.tpapps.TPASection',
        'wysiwyg.viewer.components.tpapps.TPAGluedWidget',
        'wysiwyg.viewer.components.tpapps.TPAMultiSection'];
    var previewExtensionsRegistrar = previewExtensionsCore.registrar;

    var extension = {
        setOverlayState: function () {
            var underMobileAndNotSupported = this.isUnderMobileView() && this.isMobileReady && !this.isMobileReady();
            var overlay = underMobileAndNotSupported ? 'unavailableInMobile' : 'preloader';
            if (!this.state.isAlive && (!this.state.overlay || this.state.overlay !== 'unresponsive')) {
                this.setState({
                    overlay: overlay
                });
            }
        },
        resize: function (nextProps) {
            var style = {};
            if (this.state && nextProps.style.height === this.state.height && this.state.height) {
                style.height = undefined;
            }

            if (this.state && nextProps.style.width === this.state.width && this.state.width) {
                style.width = undefined;
            }

            if (!_.isEmpty(style)) {
                this.setState(style);
            }
        },

        isInMobileDevMode: function() {
            var editorUrl = utils.urlUtils.parseUrl(this.getEditorUrl());
            var isUnderMobileView = this.isUnderMobileView();
            var appDefIdQueryParams = editorUrl.query.appDefinitionId;
            var appData = this.getAppData();

            return isUnderMobileView && appDefIdQueryParams && _.includes(appDefIdQueryParams, appData.appDefinitionId);
        },

        getEditorUrl: function() {
            return window.parent.location.href;
        }
    };

    _.forEach(compTypes, function (compType) {
        previewExtensionsRegistrar.registerCompExtension(compType, extension);
    });
});
