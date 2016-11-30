//#WOH-2715
/**
 * @class wysiwyg.deployment.JasmineEditorHelper
 */
define.Class("wysiwyg.deployment.JasmineEditorHelper", function (classDefinition) {
    /**
     * type
     */
    var def = classDefinition;

    /**
     * lends
     */
    def.fields({
        _mouseEventsEnum: {
            MOUSEDOWN: "mousedown",
            MOUSEUP: "mouseup",
            MOUSEOVER: "mouseover",
            MOUSEMOVE: "mousemove",
            MOUSEOUT: "mouseout"
        },
        componentEdges: {
            TOP: 'top',
            TOP_RIGHT: 'topRight',
            RIGHT: 'right',
            BOTTOM_RIGHT: 'bottomRight',
            BOTTOM: 'bottom',
            BOTTOM_LEFT: 'bottomLeft',
            LEFT: 'left',
            TOP_LEFT: 'topLeft'
        }
    });

    def.resources(['W.Data', 'W.CommandsNew', 'W.Commands', 'W.Preview', 'W.Skins', 'W.Editor']);

    /**
     * lends
     */
    def.methods({

//        initialize: function (compId, viewNode, args) {
//
//        },

        isReady: function () {
//            return true;
            return (this._getPrelaoderElement().className === 'ready'); //TODO: IntegrationSpecDeploy depends on this line, move it up.
        },

        //public:
        _resolvedPromise: function () {
            var dfd;
            dfd = Q.defer();
            dfd.resolve();
            return dfd.promise;
        },

        removeComponent: function (component) {
            if (!component) {
                return this._resolvedPromise();
            }
            this.touchComponent(component);
            setTimeout(function () {
                this.resources.W.CommandsNew.executeCommand('WEditorCommands.WDeleteSelectedComponent');
            }.bind(this), 3000);

            return this._waitOnComponentCount(component.getAttribute('comp'));
        },

        createComponent: function (command, componentType) {
            this.resources.W.CommandsNew.executeCommand('WEditorCommands.AddComponent', {compType: command});
            return this._waitOnComponentCount(componentType);
        },

        addComponent: function (componentType, compDomSearchName, callback) {
            //Obsolete. please use createComponent() instead, which returns a promise to wait on
            this.resources.W.CommandsNew.executeCommand('WEditorCommands.AddComponent', {compType: componentType});

            if (typeof callback === 'function') {
                setTimeout(function () {
                    callback(this._getComponent(compDomSearchName));
                }.bind(this), 500);
            }

            return this._getComponent(compDomSearchName);
        },

        isComponentReady: function (component) {
            if (!component || !component.$logic) {
                return false;
            }
            if (component.$logic.NEW_BASE_COMP) {
                return component.$logic.getComponentStatus() === 'ready';
            }

            return component.$logic.isReady && component.$logic.isReady();
        },

        setSkinForComponent: function (componentInstance, skinName) {
            var currentStyleId = this._getComponentCurrentStyleId(componentInstance);
            return this._setSkinForStyleId(currentStyleId, skinName);
        },

        _getComponentCurrentStyleId: function (component) {
            return component.getLogic().getStyle().getDataItem().get('id');
        },

        _setSkinForStyleId: function (styleId, skinName) {
            var dfd = Q.defer(),
                previewManager = this.resources.W.Preview.getPreviewManagers();

            previewManager.Skins.getSkin(skinName, function (skin) {
                var skinParamMapper = previewManager.Theme._styleCache[styleId];
                if (skinParamMapper) {
                    skinParamMapper.setSkin(skin);
                    setTimeout(function () {
                        dfd.resolve();
                    }, 300);
                } else {
                    dfd.reject('skinParam mapper is not defined for styleId=' + styleId);
                }
            });
            return dfd.promise;
        },

        addBlankPage: function (pageName, dontGoToPageUponCreation) {
            var pageData = Object.clone(this.resources.W.Data.getDataByQuery('#PAGE_TYPES')._data.items[2]);
            pageData.name = pageName || "Blank 2";
            this.resources.W.Commands.getCommand('WEditorCommands.AddPage').execute({page: pageData, dontGoToPageUponCreation: dontGoToPageUponCreation});
            return this._getComponent("core.components.Page");
        },

        goToPage: function(pageId){
           W.Commands.executeCommand("EditorCommands.gotoSitePage", pageId);
        },

        getElementPosition: function (element) {
            return this.resources.W.Preview.previewToEditorCoordinates(element.getPosition(), true);
        },

        _clickAndDrag: function (elementToHandle, startPosition, endPosition) {
            var dfd = Q.defer(),
                clickCatcher = this._isKnobElm(elementToHandle) ? elementToHandle : (this._isEditBoxOnElement(elementToHandle) ? this._getEditBox() : this._getMouseEventCatcherElement()),
                eventMouseDown = this._createMouseEvent(this._mouseEventsEnum.MOUSEDOWN, startPosition.x, startPosition.y, startPosition.x, startPosition.y),
                eventMouseMove = this._createMouseEvent(this._mouseEventsEnum.MOUSEMOVE, endPosition.x, endPosition.y, endPosition.x, endPosition.y),
                eventMouseUp = this._createMouseEvent(this._mouseEventsEnum.MOUSEUP, endPosition.x, endPosition.y, endPosition.x, endPosition.y);

            clickCatcher.dispatchEvent(eventMouseDown);
            clickCatcher.dispatchEvent(eventMouseMove);
            clickCatcher.dispatchEvent(eventMouseUp);

            setTimeout(function () {
                dfd.resolve();
            }, 200);
            return dfd.promise;
        },

        _getEditBoxKnobElm: function _getEditBoxKnobElm(resizeEdge) {
            var skinPartName = resizeEdge + 'Knob',
                editBox = this._getEditBox();

            return editBox.getElement('[skinpart="' + skinPartName + '"]');
        },

        _isKnobElm: function isKnobElm(elm) {
            return (elm && elm.nodeName === 'P' && elm.className && elm.className.indexOf('knob') > -1);
        },

        touchComponent: function (componentToTouch) {
            this.dragComponent(componentToTouch, {x: 0, y: 0});
        },

        dragComponent: function (elementToDrag, offset) {
            var elementPosition = this.getElementPosition(elementToDrag),
                elementSize = elementToDrag.getSize(),
                startX = elementPosition.x + (elementSize.x / 2),
                startY = elementPosition.y + (elementSize.y / 2),
                endX = startX + offset.x,
                endY = startY + offset.y;

            this._clickAndDrag(elementToDrag, {x: startX, y: startY}, {x: endX, y: endY});
        },

        _addOffsetToPosition: function (position, offset) {
            return {
                x: (position.x || 0) + (offset.x || 0),
                y: (position.y || 0) + (offset.y || 0)
            };
        },

        resizeComponent: function (elementToResize, offset, resizeEdge) {
            var elementPosition = this.getElementPosition(elementToResize),
                elementSize = elementToResize.getSize(),
                componentEditBoxMargin = 5,
                startPosition,
                endPosition,
                positions = {
                    x: {
                        left: elementPosition.x - componentEditBoxMargin,
                        center: elementPosition.x + Math.floor(elementSize.x / 2),
                        right: elementPosition.x + elementSize.x + componentEditBoxMargin
                    },
                    y: {
                        top: elementPosition.y - componentEditBoxMargin,
                        middle: elementPosition.y + Math.floor(elementSize.y / 2),
                        bottom: elementPosition.y + elementSize.y + componentEditBoxMargin
                    }
                },
                editBoxKnobElm;

            switch (resizeEdge) {
                case this.componentEdges.TOP:
                    startPosition = {x: positions.x.center, y: positions.y.top};
                    break;
                case this.componentEdges.TOP_RIGHT:
                    startPosition = {x: positions.x.right, y: positions.y.top};
                    break;
                case this.componentEdges.RIGHT:
                    startPosition = {x: positions.x.right, y: positions.y.middle};
                    break;
                case this.componentEdges.BOTTOM_RIGHT:
                    startPosition = {x: positions.x.right, y: positions.y.bottom};
                    break;
                case this.componentEdges.BOTTOM:
                    startPosition = {x: positions.x.center, y: positions.y.bottom};
                    break;
                case this.componentEdges.BOTTOM_LEFT:
                    startPosition = {x: positions.x.left, y: positions.y.bottom};
                    break;
                case this.componentEdges.LEFT:
                    startPosition = {x: positions.x.left, y: positions.y.middle};
                    break;
                case this.componentEdges.TOP_LEFT:
                    startPosition = {x: positions.x.left, y: positions.y.top};
                    break;
                default:

            }

            endPosition = this._addOffsetToPosition(startPosition, offset);
            editBoxKnobElm = this._getEditBoxKnobElm(resizeEdge);
            return this._clickAndDrag(editBoxKnobElm, startPosition, endPosition);
        },

        //Private:

        _getComponentCount: function (componentType) {
            var iframe = this._getIframe();
            return iframe.querySelectorAll('div[comp="' + componentType + '"]').length;
        },

        _waitOnComponentCount: function (componentType) {
            var dfd = Q.defer(),
                that = this,
                wait = function (count) {
                    setTimeout(function () {
                        var newCount = that._getComponentCount(componentType);
                        if (newCount && newCount === count) {
                            wait(newCount);
                        } else {
                            dfd.resolve(that._getComponent(componentType));
                        }
                    }, 600);
                }.bind(this);

            wait(this._getComponentCount(componentType));

            return dfd.promise;
        },

        getComponentNode: function (compType, parentNode, index) {
            var elements = parentNode.getElements('div[comp=' + compType + ']');
            var elementToReturn;

            if(_.isNumber(index)){
                elementToReturn = index;
            } else {
                elementToReturn = elements.length - 1;
            }

            return elements[elementToReturn];
        },

        getEditorComponentNode: function (compType, index) {
            return this.getComponentNode(compType, document, index);
        },

        _getComponent: function (compType, index) {
            return this.getComponentNode(compType, this._getIframe(), index);
        },

        _getPrelaoderElement: function () {
            this._preloader = this._preloader || document.getElementById('editor_preloader');
            return this._preloader;
        },

        _getMouseEventCatcherElement: function () {
            this.mouseEventCatcherElement = this.mouseEventCatcherElement || document.getElement("[skinpart='mouseEventCatcher']");
            return this.mouseEventCatcherElement;
        },

        _getEditBox: function () {
            this.editBox = this.editBox || document.getElement('[skinpart=componentEditBox]');
            return this.editBox;
        },

        _isEditBoxOnElement: function (element) {
            this._getEditBox();
            return (this.editBox.getLogic()._editedComponent && this.editBox.getLogic()._editedComponent.getViewNode() === element);
        },

        _getIframe: function () {
            this.iframe = this.iframe || document.getElement("iframe#live-preview-iframe").contentDocument;
            return this.iframe;
        },

        _createMouseEvent: function (eventType, elementXCenterPos, elementYCenterPos, mouseXPos, mouseYPos) {
            var event = document.createEvent("MouseEvents");
            event.initMouseEvent(
                eventType, //type
                true, //canBubble
                true, //cancelable
                window, //view
                1, //detail - indicates how many times the mouse has been clicked in the same location for this event. ???
                elementXCenterPos, //screenX
                elementYCenterPos, //screenY
                mouseXPos, //clientX
                mouseYPos, //clientY
                false, //ctrlKey
                false, //altKey
                false, //shiftKey
                false, //metaKey
                0, //button - 0 for standard "click". 1 for middle button. 2 for right button.
                null//relatedTarget - Identifies a secondary target for the event. such as: mouseout, mouseover
            );
            return event;
        },

        clickOn: function (elementToClickOn) {
            var elementPosition = this.resources.W.Preview.previewToEditorCoordinates(elementToClickOn.getPosition(), true),
                elementSize = elementToClickOn.getSize(),
                elementXCenterPos = elementPosition.x + (elementSize.x / 2),
                elementYCenterPos = elementPosition.y + (elementSize.y / 2),
                mouseEventCatcherElement = this._getMouseEventCatcherElement(),
                eventMouseDown,
                eventMouseUp;

            eventMouseDown = this._createMouseEvent(this._mouseEventsEnum.MOUSEDOWN, elementXCenterPos, elementYCenterPos, elementXCenterPos, elementYCenterPos);
            mouseEventCatcherElement.dispatchEvent(eventMouseDown);

            eventMouseUp = this._createMouseEvent(this._mouseEventsEnum.MOUSEUP, elementXCenterPos, elementYCenterPos, elementXCenterPos, elementYCenterPos);
            mouseEventCatcherElement.dispatchEvent(eventMouseUp);
        },

        getEditedComponent: function () {
            return this.resources.W.Editor.getEditedComponent();
//            var componentEditBox = document.getElement('div[skinpart=componentEditBox]');
//            return componentEditBox && componentEditBox.$logic && componentEditBox.$logic._editedComponent && componentEditBox.$logic._editedComponent.$view;
        },

        getPreview: function () {
            var node = this.resources.W.Preview.getSiteNode();
            return node;
        }





    });
});
