W.AngularManager.executeExperiment('ngpromotedialog', function () {
    'use strict';

    angular.module('newSavePublish')
        .directive('dialogWindow', function dialogWindowDirective($document, $timeout, editorResources, dialogConsts, ngIncludeUtils) {
            var $ = jQuery;

            var DEFAULT_DIALOG_WINDOW_TEMPLATE = 'dialogs/ui/DefaultDialogWindowTemplate.html';
            var DEFAULT_DIALOG_DESCRIPTION_TEMPLATE = editorResources.getAngularPartialPath('dialogs/ui/DefaultDialogDescriptionTemplate.html');

            /**
             * Sets up the dragging of the dialog.
             * @param scope the scope of the directive
             * @param element the element reachable from the linking phase.
             */
            function setupDialogDrag(scope, element) {
                var DRAG_MARGIN = 40;
                var draggableElement;
                var initialMousePosition = {x: 0, y: 0};
                var initialPanelPosition = {left: 0, top: 0};
                var dragLimits;

                scope.onMouseMove = function onMouseMove(e) {
                    var verticalDelta = e.pageY - initialMousePosition.y;
                    var horizontalDelta = e.pageX - initialMousePosition.x;
                    var topRes = initialPanelPosition.top + verticalDelta;
                    var leftRes = initialPanelPosition.left + horizontalDelta;
                    topRes = Math.max(topRes, dragLimits.top);
                    topRes = Math.min(topRes, dragLimits.bottom);
                    leftRes = Math.max(leftRes, dragLimits.left);
                    leftRes = Math.min(leftRes, dragLimits.right);

                    draggableElement.css({
                        top: topRes + 'px',
                        left: leftRes + 'px'
                    });
                };

                scope.makeDraggable = function(draggableElm, handle) {
                    draggableElement = draggableElm;
                    handle.on('mousedown', function (e) {
                        initialMousePosition = {
                            x: e.pageX,
                            y: e.pageY
                        };
                        initialPanelPosition = {
                            top: parseInt(draggableElement.css('top'), 10),
                            left: parseInt(draggableElement.css('left'), 10)
                        };
                        scope.updateDragLimits(handle);
                        document.addEventListener('mousemove', scope.onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                    });

                    function onMouseUp() {
                        document.removeEventListener('mousemove', scope.onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }
                };

                scope.setDialogWindowDrag = function setDialogWindowDrag(dragHandleClass) {
                    var dragHandle = element[0].querySelector('.' + dragHandleClass); // todo jquerify
                    var handle = angular.element(dragHandle);
                    handle.addClass('wix-draggable');

                    scope.makeDraggable(element, handle);
                };

                scope.updateDragLimits = function(handle) {
                    dragLimits = scope.calculateDragLimits(handle, DRAG_MARGIN);
                };

                scope.calculateDragLimits = function(handle, margin) {
                    var left = 10;
                    var top = Math.max(0, margin);
                    var right = $(window).width() - margin;
                    var bottom = $(window).height() - Math.max(margin, handle.height());
                    return {left: left, top: top, right: right, bottom: bottom};
                };
            }

            return {
                restrict: 'E',
                templateUrl: function (tElement, tAttrs) {
                    return editorResources.getAngularPartialPath(tAttrs.dialogTemplateUrl || DEFAULT_DIALOG_WINDOW_TEMPLATE);
                },
                link: {
                    pre: function (scope, element, attrs) {
                        scope._options.descriptionTemplateUrl = scope._options.descriptionTemplateUrl || DEFAULT_DIALOG_DESCRIPTION_TEMPLATE;
                    },
                    post: function (scope, element, attrs) {
                        element.attr('draggable', false);

                        setupDialogDrag(scope, element);

                        if (attrs.draggable === 'true') {
                            scope.setDialogWindowDrag(attrs.dragHandleClass);
                        }

                        var innerWrapperEl = element.children();

                        if (attrs.dialogWidth) {
                            innerWrapperEl.css('width', attrs.dialogWidth + 'px');
                        }

                        if (attrs.dialogHeight) {
                            innerWrapperEl.css('height', attrs.dialogHeight + 'px');
                        }

                        setDialogWindowPosition();

                        function setDialogWindowPosition() {
                            switch (attrs.positionType) {
                                case dialogConsts.POSITION.TOP:
                                    element.addClass('wix-dialog-top');
                                    break;
                                case dialogConsts.POSITION.ABSOLUTE:
                                    setAbsolutePosition(attrs.positionLeft, attrs.positionTop);
                                    break;
                                case dialogConsts.POSITION.SIDE:
                                    setPositionToScreenSides(attrs.positionLeft, attrs.level);
                                    break;
                                default: // dialogConsts.POSITION.CENTER
                                    element.addClass('wix-dialog-center');
                            }
                        }

                        function setAbsolutePosition(positionLeft, positionTop) {
                            var stopListening;

                            element.css({
                                left: positionLeft + 'px',
                                top: positionTop + 'px'
                            });

                            scope.hideDialog = true;

                            if (element.html().test(/wix-fit-content-to-window/)) {
                                stopListening = scope.$on('fitContentToWindowDone', adjustPositionAndShowDialog);
                            } else {
                                ngIncludeUtils.listenForAllIncludeLoaded(element, scope, adjustPositionAndShowDialog);
                            }

                            function adjustPositionAndShowDialog() {
                                stopListening && stopListening();
                                adjustDialogPositionToWindow();
                                scope.hideDialog = false;
                            }
                        }

                        /**
                         * Set the dialog position to the top left (or right) corner and offset according to the dialog level
                         * If the source left point passed to the function is on the right side of the screen the panels will open
                         * on the top right corner of the screen.
                         * @param sourceLeft
                         * @param level
                         */
                        function setPositionToScreenSides(sourceLeft, level) {
                            sourceLeft = sourceLeft || 0;
                            level = level || 0;

                            var origin = dialogConsts.POSITION.ORIGIN;
                            var offset = dialogConsts.POSITION.OFFSET;

                            var windowWidth = $document[0].body.clientWidth;
                            var dialogWidth = element.width();

                            var flipToRight = (sourceLeft > windowWidth / 2);

                            var top = origin.y;
                            var left = origin.x + (level * offset.x);

                            if (flipToRight) {
                                left = windowWidth - dialogWidth - left;
                            }

                            element.css({
                                left: left + 'px',
                                top: top + 'px'
                            });
                        }


                        function adjustDialogPositionToWindow() {
                            var dialogBoundingRect = element[0].getBoundingClientRect();
                            var windowWidth = $document[0].documentElement.clientWidth;
                            var windowHeight = $document[0].documentElement.clientHeight;
                            var topPosition = dialogBoundingRect.top;
                            var leftPosition = dialogBoundingRect.left;
                            var overflow = {
                                bottom: dialogBoundingRect.bottom - windowHeight,
                                right: dialogBoundingRect.right - windowWidth
                            };
                            if (overflow.bottom > 0) {
                                // TODO GuyR 9/29/2014 2:04 PM - check if fixing bottom won't push the top out of the screen
                                topPosition -= overflow.bottom;
                            }

                            if (overflow.right > 0) {
                                leftPosition -= overflow.right;
                            }

                            element.css({
                                left: leftPosition + 'px',
                                top: topPosition + 'px'
                            });
                        }
                    }
                }
            };
        });
});