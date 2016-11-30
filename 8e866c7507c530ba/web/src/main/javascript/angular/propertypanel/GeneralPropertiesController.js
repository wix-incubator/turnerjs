W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';

    var app = angular.module('propertyPanel');

    app.controller('GeneralPropertiesController', function ($scope, editorComponent, componentLayout, configManager) {
        this.webThemeDir = configManager.webThemeDir;
        var ignoreUpdate = false;
        var self = this;
        this.layoutData = {};

        _onSelectedComponentChanged();

        this.applyProperties = function (event) {
            var value = parseInt(event.target.getProperty('value'), 10),
                editedComponent = editorComponent.getEditedComponent();
            if (isNaN(value)) {
                updatePanelFields();
                return;
            }
            var coordinates = getCalculatedPosSizeChanges(event, value);
            if (coordinates) {
                // TODO GuyR 6/23/14 5:15 PM - start and end transaction
                coordinates.updateLayout = true;
                coordinates.allowPageShrink = true;
                coordinates.warningIfOutOfGrid = true;
                ignoreUpdate = true;
                if (_.isUndefined(coordinates.rotationAngle)) {
                    componentLayout.setSelectedCompPositionSize(coordinates);
                    if (coordinates.width || coordinates.height) {
                        editedComponent.fireEvent("resizeEnd");
                        editedComponent.trigger('resizeEnd');
                    }
                } else {
                    if (!editedComponent._reportPanelRotation && coordinates.rotationAngle !== editedComponent.getAngle()) {
                        editedComponent._reportPanelRotation = true;
                        reportPanelRotation(coordinates.rotationAngle);
                    }
                    coordinates.updateControllers = true;
                    componentLayout.setSelectedCompRotationAngle(coordinates);
                }
                ignoreUpdate = false;
            }
        };

        function reportPanelRotation(angle) {
            // TODO GuyR 6/24/14 2:47 PM -  service for BI events and Service for ViewerManager
//            var params = {
//                c1: $scope.editedComponent.className,
//                c2: this.resources.W.Preview.getPreviewManagers().Viewer.getCurrentPageId(),
//                i1: angle
//            };
//            LOG.reportEvent(wixEvents.CHANGE_ANGLE_THROUGH_PANEL, params);
        }

        function updatePanelFields() {
            if (ignoreUpdate) {
                return;
            }

            self.layoutData = componentLayout.getSelectedCompLayoutData();
            $scope.safeApply();
        }


        function getCalculatedPosSizeChanges(event, value) {
            var coordinates = {},
                editedComponent = editorComponent.getEditedComponent(),
                sizeLimits = editedComponent && editedComponent.getSizeLimits(),
                isChange = false;

            switch (event.target.name) {
                case 'xInput':
                    value = editedComponent.getX() + (value - editedComponent.getBoundingX());
                    coordinates.x = Math.min(Math.max(value, editedComponent.MINIMUM_X_DEFAULT), editedComponent.MAXIMUM_X_DEFAULT);
                    if (coordinates.x != $scope.generalPropertiesController.layoutData.x) {
                        $scope.generalPropertiesController.layoutData.x = coordinates.x;
                        isChange = true;
                    }
                    break;
                case 'yInput':
                    value = editedComponent.getY() + (value - editedComponent.getBoundingY());
                    coordinates.y = Math.min(Math.max(value, editedComponent.MINIMUM_Y_DEFAULT), editedComponent.MAXIMUM_Y_DEFAULT);
                    if (coordinates.y != $scope.generalPropertiesController.layoutData.y) {
                        $scope.generalPropertiesController.layoutData.y = coordinates.y;
                        isChange = true;
                    }
                    break;
                case 'width':
                    if (editedComponent && editedComponent.isHorizResizable()) {
                        coordinates.width = Math.min(Math.max(value, sizeLimits.minW), sizeLimits.maxW);
                        if (coordinates.width != $scope.generalPropertiesController.layoutData.width) {
                            $scope.generalPropertiesController.layoutData.width = coordinates.width;
                            isChange = true;
                        }
                    }
                    break;
                case 'height':
                    if (editedComponent && editedComponent.isVertResizable()) {
                        coordinates.height = Math.min(Math.max(value, sizeLimits.minH), sizeLimits.maxH);
                        if (coordinates.height != $scope.generalPropertiesController.layoutData.height) {
                            $scope.generalPropertiesController.layoutData.height = coordinates.height;
                            isChange = true;
                        }
                    }
                    break;
                case 'angle':
                    if (editedComponent && editedComponent.isRotatable()) {
                        coordinates.rotationAngle = value;
                        if (coordinates.rotationAngle != $scope.generalPropertiesController.layoutData.angle) {
                            $scope.generalPropertiesController.layoutData.angle = coordinates.rotationAngle;
                            isChange = true;
                        }
                    }
                    break;
            }

            if (isChange) {
                return coordinates;
            }
        }

        function _onSelectedComponentChanged(scope, args) {
            var comp = args && args.comp || editorComponent.getEditedComponent();
            if (comp) {
                _setShowOnAllPages();
                updatePanelFields();
            }
        }

        function _setShowOnAllPages() {
            var currentEditMode = componentLayout.getComponentScope();
            self.showOnAllPages = (currentEditMode !== editorComponent.EDIT_MODE.CURRENT_PAGE);
        }


        //we specifically use ng-click to avoid data ping pong.
        //you want to use the model if possible.
        this._toggleComponentScope = function () {
            componentLayout.toggleComponentScope();
        };

        $scope.$on('onComponentLayoutChanged', updatePanelFields);
        $scope.$on('selectedComponentChanged', _onSelectedComponentChanged);

        this.onKeyup = function (event) {
            if (event.keyCode === 13) {
                $scope.generalPropertiesController.applyProperties(event);
            }
        };
    });
});