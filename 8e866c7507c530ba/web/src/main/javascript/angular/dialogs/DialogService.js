W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name dialogs.factory:dialogService
     *
     * @description
     * Provides an API to open dialogs in the editor.
     */
    angular.module('newSavePublish')
        .factory('dialogService', function ($rootScope, $q, dialogConsts, /** dialogWindows */ dialogWindows) {
            var DEFAULT_OPTIONS = {
                singleInstance: true,
                contentPadding: "1px 11px 0",
                position: dialogConsts.POSITION.CENTER,
                level: 0,
                modalType: dialogConsts.TYPES.MODAL,
                draggable: true,
                dragHandleClass: 'wix-dialog-titlebar'
            };

            var dialogDontShowAgain = {};
            var dialogId = 0;

            function close(dialogInstance, result, reason) {
                dialogWindows.close(dialogInstance, result, reason);
            }

            /**
             * @typedef {Object.<string, (string|number|boolean|DialogButton|)>} DialogOptions
             * @property {?$sce.TrustedResource} dialogTemplateUrl - Replaces the default dialog template entirely
             * @property {?$sce.TrustedResource} descriptionTemplateUrl - Replaces the default description & learn more link template
             * @property {?$sce.TrustedResource} contentUrl - content to be displayed in the dialog
             * @property {?$sce.TrustedResource} footerUrl - footer to be displayed below the content
             * @property {?boolean} singleInstance - whether to allow only one dialog with the same dlgTypeId, defaults to `true`
             * @property {?string} title - the dialog's title
             * @property {?string} helpId - help button help id
             * @property {?string} descriptionText - The dialog's description
             * @property {?string} helplet - The dialog's Learn More link's ID
             * @property {?DialogButton[]} buttonsSet - Buttons to be displayed at the bottom of the dialog window
             * @property {?string} position - Dialog window's position type (dialogService.CONSTS.POSITION enum)
             * @property {?number} positionLeft
             * @property {?number} positionTop
             * @property {?JQuery} element - element reference for position top & left when position property is of type 'element'
             * @property {?number} level - used with position = dialogService.CONSTS.POSITION.SIDE
             * @property {?string} modalType - type of modal dialogService.CONSTS.TYPES
             * @property {?boolean} backdrop - false for no backdrop, true for backdrop, 'static' for backdrop that doesn't close the dialog on external click
             * @property {?number} width
             * @property {?number} height
             * @property {?Object} context - will be mounted on the dialog's scope as scope.context, can contain data\methods\what not
             * @property {?boolean} draggable - allows dragging the dialog, adds a drag cursor to the dragHandleClass element
             * @property {?string} dragHandleClass - used with draggable=true, this is the class that will trigger the dialog's dragging (default = 'wix-dialog-titlebar')
             * @property {?function} onCloseCallback - called when the dialog is closing, before the element is removed from the DOM
             */

            var dialogService = {

                /**
                 * Opens a dialog window
                 *
                 * @param {string} dlgTypeId a unique id for the dialog
                 * @param {DialogOptions} options
                 * @param {string=} containr - optional selector for a specific container that will hold the dialog
                 * @returns {DialogInstance | undefined}
                 */
                open: function open(dlgTypeId, options, container) {
                    if (!dlgTypeId || !angular.isString(dlgTypeId)) {
                        throw new Error('Parameter `dlgTypeId` must be a string');
                    }

                    if (dialogDontShowAgain[dlgTypeId]) {
                        return;
                    }

                    /**
                     * @typedef {Object.<string, Promise>} DialogInstance
                     * @property {Number} dialogId
                     */

                    /**
                     * @type DialogInstance
                     */
                    var dialogInstance = {
                        dialogId: dialogId++
                    };

                    options = _.assign({}, DEFAULT_OPTIONS, options);
                    if (typeof(options.backdrop) === 'undefined') {
                        if (options.modalType === dialogConsts.TYPES.MODAL) {
                            options.backdrop = true;
                        } else {
                            options.backdrop = false;
                        }
                    }
                    // TODO - validate mandatory dialog options

                    var dialogScope = $rootScope.$new();

                    // dialog api
                    dialogScope.dialog = {
                        close: function (result, closeReason) {
                            close(dialogInstance, result, closeReason);
                        },
                        setTitle: function (title) {
                            dialogScope.safeApply(function () {
                                dialogScope._options.title = title;
                            });
                        },
                        setDescription: function (desc) {
                            dialogScope.safeApply(function () {
                                dialogScope._options.descriptionText = desc;
                            });
                        },
                        setHelpId: function (helpId) {
                            dialogScope.safeApply(function () {
                                dialogScope._options.helpId = helpId;
                            });
                        },
                        dontShowAgain: function (value) {
                            dialogDontShowAgain[dlgTypeId] = value;
                        }
                    };

                    dialogScope._options = options;
                    dialogScope.context = options.context || {};

                    dialogWindows.open(dialogInstance, {
                        dlgTypeId: dlgTypeId,
                        scope: dialogScope,
                        options: options
                    }, container);

                    return dialogInstance;
                },
                close: close,
                CONSTS: dialogConsts
            };

            return dialogService;
        });
});