W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    var app = angular.module('propertyPanel');

    app.config(function (propertyPanelNavigationProvider) {
        propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.WRichText', '/propertypanel/panels/wrichtext/WRichtextView.html');
    });

});