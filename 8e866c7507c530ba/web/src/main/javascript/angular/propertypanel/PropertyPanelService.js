W.AngularManager.executeExperiment('NGPanels', function () {
    'use strict';
    /**
     * @ngdoc service
     * @name propertyPanel.service:propertyPanel
     * @description
     * Handles opening of the component property panel
     *
     */
    angular.module('propertyPanel').factory('propertyPanel', function ($rootScope, $document, /** dialogService */ dialogService, editorCommands, editorResources, editorComponent, propertyPanelNavigation) {
        var forceHide = false;

        var propertyPanelInstance;
        var context = {};

        function init() {
            editorCommands.listenToCommand('EditorUI.OpenPropertyPanel', $rootScope, onOpenPropertyPanelCommand);
            editorCommands.listenToCommand('WPreviewCommands.WEditModeChanged', $rootScope, closePropertyPanel);
            editorCommands.listenToCommand('WPreviewCommands.ViewerStateChanged', $rootScope, closePropertyPanel);

            $rootScope.$on('selectedComponentChanged', onSelectedComponentChanged);
        }

        function onSelectedComponentChanged() {
            if (forceHide) {
                return;
            }

            updateDataAndCreatePanelIfNeeded();
        }

        function onOpenPropertyPanelCommand(cmd, cmdParam) {
            var fromFpp = !!(cmdParam && cmdParam.src === 'fpp');
            if (forceHide && !fromFpp) {
                return;
            }

            forceHide = false;

            updateDataAndCreatePanelIfNeeded();
        }

        function updateDataAndCreatePanelIfNeeded() {
            var comp = editorComponent.getEditedComponent();
            if (!comp || editorResources.isPreview()) {
                return;
            }

            updatePanelData(comp);
            if (!propertyPanelInstance) {
                createPropertyPanel();
            }
        }

        function closePropertyPanel(event) {
            propertyPanelInstance && dialogService.close(propertyPanelInstance, false, event.name);
        }

        function updatePanelData(comp) {
            _.assign(context, getComponentData(comp));
            _.assign(context, getInnerPanelViewUrl(comp));

            $rootScope.$broadcast('propertyPanelDataChanged');
        }

        function getComponentData(comp) {
            var data = {
                // contains .data and .properties
                compData: editorComponent.getComponentData()
            };


            var componentProperties = comp.getComponentProperties();
            if (componentProperties) {
                data.compPropertiesSchema = componentProperties._schema;
            }

            return data;
        }

        function getInnerPanelViewUrl(comp) {
            var view;

            if (comp && comp.$className) {
                var panelToShow = propertyPanelNavigation.getPanelPath(comp.$className);

                view = {
                    panelViewUrl: panelToShow.url,
                    isLegacyPanel: panelToShow.isLegacy
                };
            } else {
                view = {
                    panelViewUrl: '',
                    isLegacyPanel: false
                };
            }

            return view;
        }

        function createPropertyPanel() {
            propertyPanelInstance = dialogService.open('propertyPanel', {
                title: '',
                descriptionText: '',
                helpId: '',
                largeDescription: true,
                contentUrl: editorResources.getAngularPartialPath('/propertypanel/PropertyPanelView.html'),
                footerUrl: editorResources.getAngularPartialPath('/propertypanel/PropertyPanelFooter.html'),
                contentPadding: '11px 11px 25px',
                modalType: dialogService.CONSTS.TYPES.NON_MODAL,
                position: dialogService.CONSTS.POSITION.ABSOLUTE,
                positionLeft: $document.width() - 400,
                positionTop: 70,
                width: 300,
                draggable: true,
                enforceMaxContentHeight: true,
                context: context,
                onCloseCallback: onCloseCallback
            }, '#ngPanels');
        }

        function onCloseCallback(res) {
            if (res.closeReason === 'dismiss') {
                forceHide = true;
            }
            propertyPanelInstance = null;
        }

        /**
         * @class propertyPanel
         */
        var propertyPanelService = {
            init: init
        };

        return propertyPanelService;
    }).run(function (propertyPanel) {
        propertyPanel.init();
    });
});