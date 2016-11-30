define(['lodash', 'previewExtensionsCore', 'wixappsClassics'],
    function (_, previewExtensionsCore) {
        'use strict';

        var compType = 'wixapps.integration.components.AppPart';

        function saveMutatingData() {
            this.viewName_ = this.props.compData.viewName;
            this.customizationsCount_ = this.props.compData.appLogicCustomizations.length;
            this.appLogicCustomizations_ = this.props.compData.appLogicCustomizations;
        }

        var extension = {
            componentDidUpdate: function () {
                saveMutatingData.call(this);
            },
            componentDidMount: function () {
                saveMutatingData.call(this);
            },
            isChanged: function (nextProps) {
                return this.viewName_ !== nextProps.compData.viewName ||
                    this.props.compProp.direction !== nextProps.compProp.direction ||
                    this.customizationsCount_ !== nextProps.compData.appLogicCustomizations.length ||
                    !_.isEqual(this.appLogicCustomizations_, nextProps.compData.appLogicCustomizations);

            },
            componentSpecificShouldUpdatePreview: function () {
                return true;
            }
        };

        previewExtensionsCore.registrar.registerCompExtension(compType, extension);
    });
