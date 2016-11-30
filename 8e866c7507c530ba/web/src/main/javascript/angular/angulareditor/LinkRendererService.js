W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('linkRenderer', function (wixImports, editorData) {


        var LinkRendererClass = wixImports.importClass('wysiwyg.common.utils.LinkRenderer');
        var linkRenderer = new LinkRendererClass();

        function renderLinkForPropertyPanel(dataQuery) {
            var linkDataItem = editorData.getDataByQuery(dataQuery, editorData.DATA_SOURCE.PREVIEW_DATA);

            return linkRenderer.renderLinkDataItemForPropertyPanel(linkDataItem);
        }

        return {
            renderLinkForPropertyPanel: renderLinkForPropertyPanel
        };
    });
});