W.AngularManager.executeExperiment('NGDialogManagement', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name dialogs.factory:legacyDialogs
     *
     * @description
     * Todo description
     *
     */
    angular.module('dialogs')
        .factory('legacyDialogs', function legacyDialogs($rootScope, /** @type dialogs.dialogWindows */ dialogWindows, /** todo - remove */ dialogService, editorResources) {
            var DialogManager = W.EditorDialogs;

            var legacyDialogId = 0;

            function createLegacyDialogPlaceholder(dlgTypeId, modalType) {
                var dialog = {
                    'key': legacyDialogId++, // we only need the key to be unique, its content doesn't really matter since it's not a real dialogInstance object
                    'value': {
                        options: {
                            modalType: modalType
                        },
                        isLegacyDialog: true,
                        dlgTypeId: dlgTypeId
                    }
                };

                return dialog;
            }

            /***************************************************
             * Events fired by the angular dialogWindows service
             **************************************************/

            $rootScope.$on('closeDialogOnKeyDown', function(event, args) {
                DialogManager.closeDialogByTypeId(args.dialogResult, args.dlgTypeId);
            });

            $rootScope.$on('blockLayerClickReachedLegacyDialog', function(event, args) {
                W.EditorDialogs.closeDialogIfOutsideClick(args.dlgTypeId, args.x, args.y);
            });

            // todo YotamB 28/08/14 REMOVE
            var level = 0;

            /**
             * @class dialogs.legacyDialogs
             */
            return {
                /*********************************
                 * Methods called by DialogManager
                 ********************************/


                /**
                 * @ngdoc method
                 * @name dialogs.factory:legacyDialogs#registerLegacyDialog
                 * @methodOf dialogs.factory:legacyDialogs
                 * @description
                 * Register a legacy dialog in the dialogWindows service's openedDialogs stack
                 *
                 * @param {string} dlgTypeId - The dialog's type ID
                 * @param {string} modalType - modal\semiModal\nonModal
                 */
                registerLegacyDialog: function registerLegacyDialog(dlgTypeId, modalType) {
                    var legacyDialogPlaceholder = createLegacyDialogPlaceholder(dlgTypeId, modalType);
                    dialogWindows.__openedDialogs.add(legacyDialogPlaceholder.key, legacyDialogPlaceholder.value);
                },

                removeLegacyDialog: function removeLegacyDialog(dlgTypeId) {
                    var dialog = dialogWindows.__openedDialogs.getByValueProperty('dlgTypeId', dlgTypeId);
                    if (dialog) {
                        dialogWindows.__openedDialogs.remove(dialog.key);
                    }
                },

                handleOutsideClick: function handleOutsideClick(x, y) {
                    dialogWindows.onBackdropClicked(x, y);
                },


                /*****************************
                 * FOR TEST PURPOSES
                 *****************************/

                openLegacyDialog: /* istanbul ignore next */ function openLegacyDialog () {
                    W.EditorDialogs.openNGTestDialog({
                        position: dialogService.CONSTS.POSITION.SIDE,
                        positionLeft: 0,
                        level: (level++)
                    });
                },

                openTestDialog: /* istanbul ignore next */ function openTestDialog() {
                    var self = this;
                    var dialogInstance = dialogService.open('TestDialog', {
                        title: 'Some title',
                        helpId: '/node/21351',
                        descriptionText: 'Some Description',
                        helplet: 'LINK_DIALOG',
                        singleInstance: false,
                        buttonsSet: dialogService.CONSTS.BUTTONS_SET.DELETE_CANCEL,
                        position: dialogService.CONSTS.POSITION.SIDE,
                        positionLeft: 200,
                        level: (level++),
                        contentUrl: editorResources.getAngularPartialPath('dialogs/TestDialogTemplate.html'),
                        modalType: dialogService.CONSTS.TYPES.SEMI_MODAL,
                        width: 600,
                        //height: 600,
                        draggable: true,
                        onCloseCallback: function (res) {
                            console.log('Dialog closed:', res);
                        },
                        context: {
                            key: 'val',
                            openDialog: self.openTestDialog.bind(self),
                            openLegacyDialog: self.openLegacyDialog.bind(self)
                        }
                    });
                }
            };
        });
});