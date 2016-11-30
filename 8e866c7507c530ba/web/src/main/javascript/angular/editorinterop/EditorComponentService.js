W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name editorInterop.factory:editorComponent
     * @description
     * The editor component service takes a Wix component and builds a useful angular friendly data object that can be
     * used within the application.  The service retains the dataItem events and connections so there's usually no need
     * to establish additional links into the editor.
     */

    angular.module('editorInterop').factory('editorComponent', function ($rootScope, editorCommands, dataItemWrapper) {
        var EditorManager = W.Editor,
            editedComponent;

        function getComponentProperties(comp) {
            comp = comp || getEditedComponent();
            if (!comp || !comp.getComponentProperties) {
                return;
            }

            return comp.getComponentProperties();
        }

        function getEditedComponent() {
            return editedComponent || EditorManager.getEditedComponent();
        }

        function getDataItem(comp) {
            comp = comp || getEditedComponent();
            if (!comp || !comp.getDataItem) {
                return;
            }
            return comp.getDataItem();
        }

        var dataItemsHelper = {
            data: {
                getItem: getDataItem,
                currentItem: null,
                unwatchFn: null,
                TYPE: 'data'
            },
            properties: {
                getItem: getComponentProperties,
                currentItem: null,
                unwatchFn: null,
                TYPE: 'properties'
            }
        };


        function _onComponentChanged(scope, args) {
            if (args.comp) {
                editedComponent = args.comp;
            }
            $rootScope.$broadcast('selectedComponentChanged', args);
        }

        /**
         *
         * @param {String} itemType - data\properties
         * @param scope
         * @param component
         */
        function attachDataItem(itemType, compData, component) {
            var diHelper = dataItemsHelper[itemType];
            if (!diHelper) {
                return;
            }
            var dataItem = diHelper.getItem(component);
            if (diHelper.currentItem && diHelper.currentItem.destroy) {
                diHelper.currentItem.destroy();
            }
            diHelper.currentItem = dataItem;
            if (!dataItem) {
                delete compData[itemType];
                diHelper.currentItem = null;
            } else {
                var mDataItem = dataItemWrapper.wrapDataItem(dataItem);
                compData[itemType] = mDataItem;
                diHelper.currentItem = mDataItem;
            }
        }


        function _getComponentLabel(comp) {
            return comp && comp.getOriginalClassName() && comp.getOriginalClassName().split('.').getLast();
        }

        function _getHelpId(comp) {
            var helpId;

            if (comp.getHelpId) {
                helpId = comp.getHelpId();
            } else if (comp && comp.isTpa) {
                // If the selected comp is TPA, direct to its specific help page using app's ID
                var appId = comp.getAppData().appDefinitionId;
                helpId = '/app/' + appId;
            } else {
                var componentInformation = W.Preview.getPreviewManagers().Components.getComponentInformation(comp.$className);
                helpId = (componentInformation && componentInformation.get('helpIds') && componentInformation.get('helpIds').componentPanel) ||
                    'COMPONENT_PANEL_' + (comp.getOriginalClassName() && comp.getOriginalClassName().split('.').getLast());
            }

            return helpId;
        }

        editorCommands.listenToCommand('WEditorCommands.SelectedComponentChange', $rootScope, _onComponentChanged);

        return {
            /**
             * @ngdoc method
             * @name editorInterop.factory:editorComponent#getEditedComponent
             * @methodOf editorInterop.factory:editorComponent
             * @returns {object} the raw editor component object.
             * @description
             * Returns a raw editor component object.  Since the object contains DOM in the view property and since it may
             * be relatively large.  DO NOT put the component object on the DOM under threat of death.
             */
            getEditedComponent: getEditedComponent,
            /**
             * @ngdoc method
             * @name editorInterop.factory:editorComponent#getComponentData
             * @methodOf editorInterop.factory:editorComponent
             * @returns {object} A data object contains an Angular friendly agglomeration of useful data from the component
             * @description
             * This method is the heart of the service and it builds a data items that contains most of the useful state data of the component.
             * The resulting object contains 4 types of data:
             * * data - two-way binding - Contains the component's _data object in a two-way binding fashion.  Can be used as properties withing Angular
             * * properties - two-way binding - Contains the component's _properties object in a two-way binding fashion.  Can be used as properties withing Angular
             * * label - string - Provides the label for the component.
             *
             * Since data and properties create a link to the editor you must destroy the link if you don't need the object anymore.
             * They both provide a destroy method to do that.  In addition, the parent object provides a convenience destroy method as well.
             * When the selected component is changed, the service will this automatically for you.
             *
             */
            getComponentData: function () {
                var compData = {
                    destroy: function () {
                        _.forOwn(this, function (val, key) {
                            if (val.destroy) {
                                val.destroy();
                            }
                        });
                    }
                };
                var component = getEditedComponent();
                attachDataItem(dataItemsHelper.data.TYPE, compData, component);
                attachDataItem(dataItemsHelper.properties.TYPE, compData, component);
                compData.label = _getComponentLabel(component);
                compData.helpId = _getHelpId(component);
                return compData;
            },

            /**
             * @ngdoc method
             * @name editorInterop.factory:editorComponent#getLegacyPanel
             * @methodOf editorInterop.factory:editorComponent
             * @returns {object} The legacy panel to display
             * @description
             * This method creates a legacy panel for the currently edited component.
             * It is not attached automatically.
             */
            getLegacyPanel: function () {
                var panel;
                var comp = getEditedComponent();
                //no component so need to render a panel.
                if (!comp) {
                    return;
                }
                var dataItem = comp.getDataItem();
                var dataType = (dataItem) ? dataItem.getType() : '';
                var dataPanelParts = comp._panel_ || EditorManager.getDataPanel(dataType, comp.getOriginalClassName());
                if (dataPanelParts) {
                    panel = W.Components.createComponent(dataPanelParts.logic, dataPanelParts.skin, dataItem, {previewComponent: comp});
                }
                return panel;
            },
            /**
             * @ngdoc property
             * @name editorInterop.factory:editorComponent#EDIT_MODE
             * @propertyOf editorInterop.factory:editorComponent
             * @description
             * Gets the current EDIT_MODE of the editor.
             */
            EDIT_MODE: EditorManager.EDIT_MODE
        };
    });
});