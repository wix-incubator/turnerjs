W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    var app = angular.module('propertyPanel');

    app.config(function (propertyPanelNavigationProvider) {
        propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.WPhoto', '/propertypanel/panels/wphoto/WPhotoPanelView.html');
    });

    app.controller("WPhotoPanelController", function ($scope) {
        this.imageScalingOptions = [
            { value: 'fill', label: 'Types.WPhotoProperties.displayMode.fill'},
            { value: 'full', label: 'Types.WPhotoProperties.displayMode.full'},
            { value: 'stretch', label: 'Types.WPhotoProperties.displayMode.stretch'},
            { value: 'fitWidth', label: 'Types.WPhotoProperties.displayMode.fitWidth'}
        ];

        this.onClickBehaviorOptions = [
            { value: 'disabled', label: 'Types.WPhotoProperties.displayMode.disabled'},
            { value: 'goToLink', label: 'Types.WPhotoProperties.displayMode.goToLink'},
            { value: 'zoomMode', label: 'Types.WPhotoProperties.displayMode.zoomMode'},
            { value: 'zoomAndPanMode', label: 'Types.WPhotoProperties.displayMode.zoomAndPanMode'}
        ];
    });
});