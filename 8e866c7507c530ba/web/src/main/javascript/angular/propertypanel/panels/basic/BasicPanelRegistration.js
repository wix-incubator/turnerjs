W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';
    angular.module('propertyPanel')
        .config(function (propertyPanelNavigationProvider) {
            var viewPath = '/propertyPanel/panels/basic/BasicPanelView.html';
            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.VerticalLine', viewPath);
            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.skins.line.SolidLine', viewPath);
            propertyPanelNavigationProvider.registerPropertyPanel('wysiwyg.viewer.components.FiveGridLine', viewPath);
            propertyPanelNavigationProvider.registerPropertyPanel('core.components.Container', viewPath);
        });
});