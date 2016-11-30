W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('PagesBackgroundCustomizer')
        .controller('PagesBackgroundCustomizerCtrlr', ['$scope',
            function ($scope) {
                $scope.choose = function ($event, node) {
                    node.isSelected = !node.isSelected;
                    $scope.component._numberOfSelectedPages += node.isSelected ? 1 : -1;
                    $scope.areAllSelected = ($scope.component._totalNumOfPages === $scope.component._numberOfSelectedPages + 1);
                };

                $scope.chooseAll = function () {
                    $scope.areAllSelected = !$scope.areAllSelected;
                    $scope.component._numberOfSelectedPages = $scope.areAllSelected ? $scope.component._totalNumOfPages - 1 : 0;
                    var previewManagers = $scope.component.resources.W.Preview.getPreviewManagers();
                    var currentPageId = previewManagers.Viewer.getCurrentPageId() || null;
                    $scope.component._selectAll($scope.pages, $scope.areAllSelected, currentPageId);
                    $scope.component._pagesModel = $scope.pages;
                    $scope.component.reportBISelectAll($scope.areAllSelected);
                };

                $scope.pages = $scope.component._pagesModel;
                $scope.areAllSelected = false;
                $scope.selectAllTitle = $scope.component._getSelectAllTitle();
            }]);
});