describe('Unit: dialogWindows service', function () {

    var dialogWindows;

    var uniqueDialogKey = 0;
    var rootScope;
    var dialogConsts;

    beforeEach(module('dialogs'));

    beforeEach(inject(function ($rootScope, _dialogWindows_, _dialogConsts_) {
        dialogWindows = _dialogWindows_;
        rootScope = $rootScope;
        dialogConsts = _dialogConsts_;
    }));

    describe('Click on backdrop layer of a dialog', function () {
        it('should close the dialog if it\'s modal, with closing reason BACKDROP_CLICKED', function () {
            var expectedRes = {
                result: false,
                closeReason: dialogConsts.CLOSING_REASON.BACKDROP_CLICKED,
                context: 'mock context'
            };
            var options = {
                modalType: 'modal',
                onCloseCallback: jasmine.createSpy()
            };
            var dialog = createDialog(false, 'someType', options);
            dialogWindows.__openedDialogs.add(dialog.key, dialog.value);

            dialogWindows.onBackdropClicked(10, 10);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
            expect(options.onCloseCallback).toHaveBeenCalledWith(expectedRes);
        });

        it('should close a semi-modal dialog if the coordinates are outside the dialog', function () {
            var expectedRes = {
                result: false,
                closeReason: dialogConsts.CLOSING_REASON.BACKDROP_CLICKED,
                context: 'mock context'
            };
            var options = {
                modalType: 'semiModal',
                onCloseCallback: jasmine.createSpy()
            };
            var dialog = createDialog(false, 'someType', options);
            dialogWindows.open(dialog.key, dialog.value);
            dialog.value.dialogEl = {
                find: function () {
                    var el = [
                        {
                            getBoundingClientRect: function () {
                                return {
                                    left: 100,
                                    right: 200,
                                    top: 100,
                                    bottom: 200
                                };
                            }
                        }
                    ];
                    return el;
                },
                remove: function () {
                }
            };

            dialogWindows.onBackdropClicked(10, 10);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
            expect(options.onCloseCallback).toHaveBeenCalledWith(expectedRes);
        });

        it('Should leave a semi-modal dialog if the coordinates are within the dialog', function () {
            var options = {
                modalType: 'semiModal',
                onCloseCallback: jasmine.createSpy()
            };
            var dialog = createDialog(false, 'someType', options);
            dialogWindows.open(dialog.key, dialog.value);
            dialog.value.dialogEl = {
                find: function () {
                    var el = [
                        {
                            getBoundingClientRect: function () {
                                return {
                                    left: 100,
                                    right: 200,
                                    top: 100,
                                    bottom: 200
                                };
                            }
                        }
                    ];
                    return el;
                },
                remove: function () {
                }
            };

            dialogWindows.onBackdropClicked(150, 150);

            expect(dialogWindows.__openedDialogs.length()).toEqual(1);
            expect(options.onCloseCallback).not.toHaveBeenCalled();
        });

        it('Should call itself recursively after closing a semiModal dialog', function () {
            var options = {
                modalType: 'semiModal'
            };
            var dialog = createDialog(false, 'someType', options);
            dialogWindows.open(dialog.key, dialog.value);
            dialogWindows.open(dialog.key, dialog.value);

            dialogWindows.onBackdropClicked(150, 150);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
        });

        it('Should do nothing if reach a dialog with modalType=nonModal', function () {
            var options = {
                modalType: 'nonModal'
            };
            var dialog = createDialog(false, 'someType', options);
            dialogWindows.open(dialog.key, dialog.value);

            dialogWindows.onBackdropClicked(150, 150);

            expect(dialogWindows.__openedDialogs.length()).toEqual(1);
        });

    });

    describe('respond to keyboard', function () {
        it('Should close top dialog on esc key with result false', inject(function ($document) {
            var expectedResult = {
                result: false,
                context: 'mock context',
                closeReason: dialogConsts.CLOSING_REASON.ESC_PRESSED
            };

            var closeResult = simulateKeyPressedOnDialog($document, 27);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
            expect(closeResult).toEqual(expectedResult);
        }));

        it('Should close top dialog on enter key with result true', inject(function ($document) {
            var expectedResult = {
                result: true,
                context: 'mock context',
                closeReason: dialogConsts.CLOSING_REASON.ENTER_PRESSED
            };

            var closeResult = simulateKeyPressedOnDialog($document, 13);

            expect(dialogWindows.__openedDialogs.length()).toEqual(0);
            expect(closeResult).toEqual(expectedResult);
        }));


        it('Shouldn\'t do anything when catching any keypress other than enter or esc', inject(function ($document) {
            simulateKeyPressedOnDialog($document, 99);

            expect(dialogWindows.__openedDialogs.length()).toEqual(1);
        }));

        it('shouldn\'t do anything on key press if top dialog is non-modal', inject(function ($document) {
            simulateKeyPressedOnDialog($document, 99, dialogConsts.TYPES.NON_MODAL);

            expect(dialogWindows.__openedDialogs.length()).toEqual(1);

        }));
    });

    describe('Close dialog ', function () {
        it('Should call the callback function with the result and close reason', function () {
            var dialog = createDialog(false, 'someType', {modalType: dialogConsts.TYPES.SEMI_MODAL});
            var expectedCloseObj = {
                result: true,
                closeReason: 'someReason',
                context: dialog.value.scope.context
            };
            dialog.value.options.onCloseCallback = jasmine.createSpy('closeCallback');
            dialogWindows.__openedDialogs.add(dialog.key, dialog.value);


            dialogWindows.close(dialog.key, expectedCloseObj.result, expectedCloseObj.closeReason);

            expect(dialog.value.options.onCloseCallback).toHaveBeenCalledWith(expectedCloseObj);
        });

        it('Should remove the dialog from the openedDialogs stack', function () {
            var dialog = createDialog(false, 'someType', dialogConsts.TYPES.SEMI_MODAL);
            dialogWindows.__openedDialogs.add(dialog.key, dialog.value);
            spyOn(dialogWindows.__openedDialogs, 'remove');

            dialogWindows.close(dialog.key);

            expect(dialogWindows.__openedDialogs.remove).toHaveBeenCalledWith(dialog.key);
        });

        it('Should remove the dialog element from DOM', function () {
            var dialog = createDialog(false, 'someType', {modalType: dialogConsts.TYPES.SEMI_MODAL});
            dialogWindows.__openedDialogs.add(dialog.key, dialog.value);
            spyOn(dialog.value.dialogEl, 'remove');

            dialogWindows.close(dialog.key);

            expect(dialog.value.dialogEl.remove).toHaveBeenCalled();
        });

        it('Should remove the dialog element from DOM', function () {
            var dialog = createDialog(false, 'someType', {modalType: dialogConsts.TYPES.SEMI_MODAL});
            dialogWindows.__openedDialogs.add(dialog.key, dialog.value);
            spyOn(dialog.value.scope, '$destroy');

            dialogWindows.close(dialog.key);

            expect(dialog.value.scope.$destroy).toHaveBeenCalled();
        });
    });

    describe('Open Method', function () {
        describe('options.singleInstance', function () {
            it('Should close an existing dialog if a dialog with the same dialog type is opened and singleInstance=true', function () {
                var dlgTypeId = 'someType1';
                var options = {
                    singleInstance: true
                };

                var dialog1 = createDialog(false, dlgTypeId, options);
                dialogWindows.open(dialog1.key, dialog1.value);

                expect(dialogWindows.__openedDialogs.length()).toEqual(1);

                var dialog2 = createDialog(false, dlgTypeId, options);
                dialogWindows.open(dialog2.key, dialog2.value);

                expect(dialogWindows.__openedDialogs.length()).toEqual(1);
            });

            it('Should open an additional dialog instance with the dialog type if singleInstance=false', function () {
                var dlgTypeId = 'someType1';
                var options = {
                    singleInstance: false
                };

                var dialog1 = createDialog(false, dlgTypeId, options);
                dialogWindows.__openedDialogs.add(dialog1.key, dialog1.value);

                expect(dialogWindows.__openedDialogs.length()).toEqual(1);

                var dialog2 = createDialog(false, dlgTypeId, options);
                dialogWindows.open(dialog2.key, dialog2.value);

                expect(dialogWindows.__openedDialogs.length()).toEqual(2);
            });
        });

        describe('dialog-window element attributes by options', function () {
            it('Should contain a dialog-template-url attribute if option.dialogTemplateUrl is supplied', function () {
                var options = {
                    dialogTemplateUrl: 'someTemplateUrl'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('dialog-template-url')).toEqual(options.dialogTemplateUrl);
            });

            it('Should contain a position-type attribute if option.position is supplied', function () {
                var options = {
                    position: 'somePosition'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('position-type')).toEqual(options.position);
            });

            it('Should contain a position-top attribute if option.positionTop is supplied', function () {
                var options = {
                    positionTop: '5'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('position-top')).toEqual(options.positionTop);
            });

            it('Should contain a position-left attribute if option.positionLeft is supplied', function () {
                var options = {
                    positionLeft: '5'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('position-left')).toEqual(options.positionLeft);
            });

            describe('Position of type "element"', function () {
                it('Should set position-type attr to absolute', function () {
                    var options = {
                        position: dialogConsts.POSITION.ELEMENT
                    };

                    var dialog = createDialog(false, 'someType', options);
                    dialogWindows.open(dialog.key, dialog.value);

                    var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                    expect(dialogWindowEl.attr('position-type')).toEqual(dialogConsts.POSITION.ABSOLUTE);
                });

                it('Should set position attrs to element position + position-left and position-top, if options.element is defined', function () {
                    var options = {
                        position: dialogConsts.POSITION.ELEMENT,
                        element: angular.element('<div></div>'),
                        positionLeft: 10,
                        positionTop: 20
                    };
                    spyOn(options.element[0], 'getBoundingClientRect').and.returnValue({
                        left: 100,
                        top: 50
                    });

                    var dialog = createDialog(false, 'someType', options);
                    dialogWindows.open(dialog.key, dialog.value);

                    var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                    expect(dialogWindowEl.attr('position-left')).toEqual('110');
                    expect(dialogWindowEl.attr('position-top')).toEqual('70');
                });

                it('Should use the element position values if no position values in options object', function () {
                    var options = {
                        position: dialogConsts.POSITION.ELEMENT,
                        element: angular.element('<div></div>')
                    };
                    spyOn(options.element[0], 'getBoundingClientRect').and.returnValue({
                        left: 100,
                        top: 50
                    });

                    var dialog = createDialog(false, 'someType', options);
                    dialogWindows.open(dialog.key, dialog.value);

                    var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                    expect(dialogWindowEl.attr('position-left')).toEqual('100');
                    expect(dialogWindowEl.attr('position-top')).toEqual('50');
                });
            });

            it('Should contain a level attribute if option.level is supplied', function () {
                var options = {
                    level: 'someLevel'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('level')).toEqual(options.level);
            });

            it('Should contain a draggable attribute if option.draggable is supplied', function () {
                var options = {
                    draggable: 'true'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('draggable')).toEqual(options.draggable);
            });

            it('Should contain a drag-handle-class attribute if option.dragHandleClass is supplied', function () {
                var options = {
                    dragHandleClass: 'someClass'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('drag-handle-class')).toEqual(options.dragHandleClass);
            });

            it('Should contain a dialog-width attribute if option.width is supplied', function () {
                var options = {
                    width: '100'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('dialog-width')).toEqual(options.width);
            });

            it('Should contain a dialog-height attribute if option.height is supplied', function () {
                var options = {
                    height: '100'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialogWindowEl.attr('dialog-height')).toEqual(options.height);
            });
        });

        describe('block-layer element', function () {
            it('should not be added to the dialog element if modalType=nonModal', function () {
                var options = {
                    modalType: 'nonModal'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                expect(dialog.value.dialogEl.find('dialog-block-layer').length).toEqual(0);
            });

            it('should be added to the dialog element if modalType !== nonModal', function () {
                var options = {
                    modalType: 'modal'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var dialogWindowEl = dialog.value.dialogEl.find('dialog-window');
                expect(dialog.value.dialogEl.find('dialog-block-layer').length).toEqual(1);
            });

            it('should contain a backdrop attribute with options.backdrop value', function () {
                var options = {
                    modalType: 'modal',
                    backdrop: 'someBackdrop'
                };
                var dialog = createDialog(false, 'someType', options);
                dialogWindows.open(dialog.key, dialog.value);

                var blockLayerEl = dialog.value.dialogEl.find('dialog-block-layer');
                expect(blockLayerEl.attr('backdrop')).toEqual(options.backdrop);
            });
        });

        describe('- Containing DOM node', function () {
            it('should be #ngDialogs if specific container isn\'t supplied', function () {
                spyOn(jQuery.fn, 'append');

                var dlgTypeId = 'someType1';

                var dialog = createDialog(false, dlgTypeId, {});
                dialogWindows.open(dialog.key, dialog.value);

                expect(jQuery.fn.append.calls.mostRecent().object.selector).toEqual('#ngDialogs');
            });

            it('should be #ngPanels if #ngPanels is supplied as a custom container', function () {
                spyOn(jQuery.fn, 'append');

                var dlgTypeId = 'someType1';

                var dialog = createDialog(false, dlgTypeId, {});
                dialogWindows.open(dialog.key, dialog.value, '#ngPanels');

                expect(jQuery.fn.append.calls.mostRecent().object.selector).toEqual('#ngPanels');
            });
        });
    });

    function createDialog(isLegacyDialog, dlgTypeId, options) {
        dlgTypeId = dlgTypeId || 'someType';
        options = options || {};

        var scope = rootScope.$new();
        scope.context = options.context || 'mock context';
        return {
            'key': uniqueDialogKey++,
            'value': {
                options: options,
                isLegacyDialog: isLegacyDialog,
                dlgTypeId: dlgTypeId,
                scope: scope,
                deferred: Q.defer(),
                dialogEl: {
                    remove: function () {
                    }
                }
            }
        };
    }

    function simulateKeyPressedOnDialog($document, keyCode, modalType) {
        var closeResult = '';
        modalType = modalType || dialogConsts.TYPES.SEMI_MODAL;
        var dialog = createDialog(false, 'someType', {modalType: modalType});

        dialogWindows.__openedDialogs.add(dialog.key, dialog.value);
        var event = jQuery.Event('keydown');
        event.keyCode = keyCode;
        dialog.value.options.onCloseCallback = function (closeArgs) {
            closeResult = closeArgs;
        };

        $document.trigger(event);

        return closeResult;
    }
});