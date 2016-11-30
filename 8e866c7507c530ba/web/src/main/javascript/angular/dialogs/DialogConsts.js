W.AngularManager.executeExperiment("ngpromotedialog", function () {
    angular.module('newSavePublish')
        .factory('dialogConsts', function () {
            var CLOSING_REASON = {
                BACKDROP_CLICKED: 'backdropClicked',
                SINGLE_INSTANCE: 'singleInstance',
                OK: 'ok',
                CANCEL: 'cancel',
                CLOSE_ALL: 'closeAllDialogs',
                DELETE: 'delete',
                BUTTON_CLICKED: 'button clicked',
                ESC_PRESSED: 'esc',
                ENTER_PRESSED: 'enter',
                DISMISS: 'dismiss'
            };

            var BUTTON_TYPES = {
                PRIMARY: 'primary',
                DEFAULT: 'default',
                DANGER: 'danger'
            };

            var BUTTON_ALIGNMENT = {
                LEFT: 'left',
                RIGHT: 'right'
            };

            var _dialogButtons = {
                'OK': {
                    type: BUTTON_TYPES.PRIMARY,
                    label: "OK_BUTTON",
                    align: BUTTON_ALIGNMENT.RIGHT,
                    closeReason: CLOSING_REASON.OK,
                    result: true
                },
                'CANCEL': {
                    type: BUTTON_TYPES.DEFAULT,
                    label: "CANCEL_BUTTON",
                    align: BUTTON_ALIGNMENT.LEFT,
                    closeReason: CLOSING_REASON.CANCEL,
                    result: false
                },
                'YES': "YES", // todo
                'NO': "NO", // todo
                'DONE': "DONE", // todo
                'DELETE': {
                    type: BUTTON_TYPES.DANGER,
                    label: "DELETE_BUTTON",
                    align: BUTTON_ALIGNMENT.RIGHT,
                    closeReason: CLOSING_REASON.DELETE,
                    result: true

                }
            };

            var BUTTONS_SET = {
                'OK': [_dialogButtons.OK],
                'DONE': [_dialogButtons.DONE],
                'OK_CANCEL': [_dialogButtons.OK, _dialogButtons.CANCEL],
                'DELETE_CANCEL': [_dialogButtons.DELETE, _dialogButtons.CANCEL],
                'YES_NO': [_dialogButtons.YES, _dialogButtons.NO]
            };

            var POSITION = {
                ABSOLUTE: 'absolute',
                CENTER: 'center',
                TOP: 'top',
                SIDE: 'side',
                ELEMENT: 'element',
                ORIGIN: {x: 92, y: 65},
                OFFSET: {x: 20, y: 20}
            };

            var TYPES = {
                MODAL: 'modal',
                SEMI_MODAL: 'semiModal',
                NON_MODAL: 'nonModal',
                TRANSPARENT_MODAL: 'transparentModal' // todo - looks like this is unused, remove it?
            };

            // todo deep freeze
            var consts = {
                BUTTON_TYPES: BUTTON_TYPES,
                BUTTON_ALIGNMENT: BUTTON_ALIGNMENT,
                BUTTONS_SET: BUTTONS_SET,
                POSITION: POSITION,
                TYPES: TYPES,
                CLOSING_REASON: CLOSING_REASON
            };

            return consts;
        });

});