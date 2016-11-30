W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name dialogs.factory:dialogWindows
     *
     * @description
     *
     * @method open
     * @method close
     */
    angular.module('newSavePublish')
        .factory('dialogWindows', function ($compile, $document, $rootScope, StackedMap, dialogConsts) {
            var $ = jQuery;

            var BASE_DIALOG_TEMPLATE = '' +
                '<div class="wix-modal-dialog-wrapper">' +
                '<dialog-window ng-class="{\'wix-dialog-window-hidden\' : hideDialog}"></dialog-window>' +
                '</div>';

            var DIALOG_BLOCK_LAYER = '<dialog-block-layer></dialog-block-layer>';

            var IGNORE_BACKDROP_CLICK_DIALOGS = ['PromoteSite'];

            var _dialogsContainer;
            var openedDialogs = new StackedMap();
            $document.on('keydown', onKeyDown);

            function onKeyDown(event) {
                var topDialog = openedDialogs.top();
                if (!topDialog || topDialog.value.options.modalType === dialogConsts.TYPES.NON_MODAL) {
                    return;
                }

                var result, reason;
                switch (event.keyCode) {
                    case 27:
                        result = false;
                        reason = dialogConsts.CLOSING_REASON.ESC_PRESSED;
                        break;
                    case 13:
                        result = true;
                        reason = dialogConsts.CLOSING_REASON.ENTER_PRESSED;
                        break;
                    default:
                        return;
                }

                close(topDialog.key, result, reason);
            }

            function _getContainerNode(container) {
                if (container) {
                    return $(container);
                }

                if (!_dialogsContainer) {
                    _dialogsContainer = $("#ngDialogs");
                }

                return _dialogsContainer;
            }

            function closeDialogByTypeId(dlgTypeId, result, reason) {
                var dialog = openedDialogs.getByValueProperty('dlgTypeId', dlgTypeId);

                if (dialog) {
                    close(dialog.key, result, reason);
                }
            }

            function createDialogElement(dialogInstanceData) {
                var angularDomEl = angular.element(BASE_DIALOG_TEMPLATE);

                var directiveAttributes = createDialogWindowDirectiveAttributes(dialogInstanceData);
                angularDomEl.find('dialog-window').attr(directiveAttributes);
                setBackdropType(angularDomEl, dialogInstanceData);

                return angularDomEl;
            }

            function createDialogWindowDirectiveAttributes(dialogInstanceData) {
                var dialogOptions = dialogInstanceData.options;
                var attrs = {
                    'dialog-template-url': dialogOptions.dialogTemplateUrl,
                    'level': dialogOptions.level,
                    'draggable': dialogOptions.draggable,
                    'drag-handle-class': dialogOptions.dragHandleClass
                };

                var dialogPosition = {
                    x: +dialogOptions.positionLeft || 0,
                    y: +dialogOptions.positionTop || 0
                };

                if (dialogOptions.position === dialogConsts.POSITION.ELEMENT) {
                    attrs['position-type'] = dialogConsts.POSITION.ABSOLUTE;
                    if (dialogOptions.element) {
                        var elementBoundingRect = dialogOptions.element[0].getBoundingClientRect();
                        dialogPosition.x += elementBoundingRect.left;
                        dialogPosition.y += elementBoundingRect.top;
                    }
                } else {
                    attrs['position-type'] = dialogOptions.position;
                }

                attrs['position-left'] = dialogPosition.x;
                attrs['position-top'] = dialogPosition.y;

                if (dialogInstanceData.options.width) {
                    attrs['dialog-width'] = dialogInstanceData.options.width;
                }

                if (dialogInstanceData.options.height) {
                    attrs['dialog-height'] = dialogInstanceData.options.height;
                }

                return attrs;
            }

            function setBackdropType(angularDomEl, dialogInstanceData) {
                if (dialogInstanceData.options.modalType !== dialogConsts.TYPES.NON_MODAL) {
                    var backdropEl = angular.element(DIALOG_BLOCK_LAYER).attr('backdrop', dialogInstanceData.options.backdrop);
                    angularDomEl.prepend(backdropEl);
                }
            }

            function isCoordinateInsideDialogWindow(dialogElm, x, y) {
                var coords = dialogElm.find('dialog-window')[0].getBoundingClientRect();

                if (x >= coords.left && x <= coords.right && y >= coords.top && y <= coords.bottom) {
                    return true;
                }

                return false;
            }


            function close(dialogInstance, result, closeReason) {
                var dialogInstanceData = openedDialogs.get(dialogInstance).value;
                dialogInstanceData.options.onCloseCallback && dialogInstanceData.options.onCloseCallback({
                    result: result,
                    closeReason: closeReason,
                    context: dialogInstanceData.scope.context
                });

                openedDialogs.remove(dialogInstance);
                dialogInstanceData.dialogEl.remove();
                dialogInstanceData.scope.$destroy();
            }

            /**
             * @typedef {Object<string>} DialogInstanceData
             * @property {Scope} scope
             * @property {DialogOptions} options
             * @property {string} dialogId
             * @property {DOMElement} dialogEl
             */

            /**
             *
             * @param {DialogInstance} dialogInstance
             * @param {DialogInstanceData} dialogInstanceData
             */
            function open(dialogInstance, dialogInstanceData, container) {

                if (dialogInstanceData.options.singleInstance) {
                    closeDialogByTypeId(dialogInstanceData.dlgTypeId, false, dialogConsts.CLOSING_REASON.SINGLE_INSTANCE);
                }

                var dialogEl = $compile(createDialogElement(dialogInstanceData))(dialogInstanceData.scope);
                dialogInstanceData.dialogEl = dialogEl;

                openedDialogs.add(dialogInstance, dialogInstanceData);

                _getContainerNode(container).append(dialogEl);
            }

            function onBackdropClicked(x, y) {
                // get the top dialog's modal type
                var dialog = openedDialogs.top();
                if (!dialog) {
                    return;
                }

                var modalType = dialog.value.options.modalType;

                if (modalType === dialogConsts.TYPES.MODAL && !_.contains(IGNORE_BACKDROP_CLICK_DIALOGS, dialog.value.dlgTypeId)) {
                    close(dialog.key, false, dialogConsts.CLOSING_REASON.BACKDROP_CLICKED);
                } else if (modalType === dialogConsts.TYPES.SEMI_MODAL) {
                    if (isCoordinateInsideDialogWindow(dialog.value.dialogEl, x, y)) {
                        return;
                    }

                    close(dialog.key, false, dialogConsts.CLOSING_REASON.BACKDROP_CLICKED);
                    onBackdropClicked(x, y);
                }
            }

            /**
             * @class dialogs.dialogWindows
             * @type {{open: open, close: close, onBackdropClicked: onBackdropClicked, __openedDialogs: StackedMap}}
             */
            var dialogWindows = {
                open: open,
                close: close,
                onBackdropClicked: onBackdropClicked,
                __openedDialogs: openedDialogs // allow privileged access for legacyDialogs service
            };

            return dialogWindows;
        });
});