/**@class  wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler*/
define.Class('wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.resources(['W.Commands']);
    def.binds(['onItemDrag', '_onItemDrop', '_scrollUp', '_scrollDown' ]);

    def.statics({INDENT: 20});

    /**@lends wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler*/
    def.methods({
        initialize: function () {
            this._duringDrag = false;
            this._deltaY = 0;
        },

        setDragContainer: function (dragContainer) {
            this._dragContainer = dragContainer;
            this._dragContainerPosition = dragContainer.getPosition();
            this._dragContainerPosition.y -= window.pageYOffset;
        },

        setScrollContainer: function (scrollContainer) {
            this._scrollContainer = scrollContainer;
            this._scrollContainerPosition = scrollContainer.getPosition();
            this._scrollContainerPosition.y -= window.pageYOffset;
        },

        onItemDrag: function (mouseEvent, sourceItem, sourceItemIndex, subItems) {
            var filteredEvent = this._filterDragEvent(mouseEvent.event);
            if (!filteredEvent) {
                return;
            }
            if (this._duringDrag) {
                return;
            }

            this._sourceItem = sourceItem;
            this._sourceItemIndex = sourceItemIndex;
            this._subItems = subItems;

            this._dragContainerSize = this._dragContainer.getSize();
            this._sourceItemPosition = this._sourceItem.getViewNode().getPosition();
            this._sourceItemPosition.y -= window.pageYOffset;
            this._sourceItemHeight = this._sourceItem.getViewNode().getSize().y;
            var mouseLocation = mouseEvent.client;
            this._deltaY = mouseLocation.y - this._sourceItemPosition.y;

            if (this._sourceItem.isSubItem()) {
                this._dragSubItem = true;
            }

            this._createTempDragItem();
            this._duringDrag = true;
            this._initialScrollPosition = this._scrollContainer.scrollTop;

            var body = $$('body');
            body.addEvent(Constants.CoreEvents.MOUSE_MOVE, function (e) {
                this._followMouseOnDrag(e, this._sourceItem);
            }.bind(this));
            body.addEvent(Constants.CoreEvents.MOUSE_UP, this._onItemDrop);
            this.disableSelection(this._scrollContainer);
        },

        setSourceItemIndex: function (index) {
            this._sourceItemIndex = index;
        },

        _filterDragEvent: function (event) {
            if (!event.which && event.button) {
                if (event.button & 1) { // Left
                    event.which = 1;
                } else if (event.button & 4) {  // Middle
                    event.which = 2;
                } else if (event.button & 2) { // Right
                    event.which = 3;
                }
            }

            if (event.which != 1 || this.injects().Editor.getPageCount() == 1) { // if not left click, or last page in the site, ignore
                return null;
            } else {
                return event;
            }
        },

        _createTempDragItem: function () {
            var viewNode = this._sourceItem.getViewNode();
            var size = viewNode.getSize();
            this._draggedItemPosition = Object.clone(this._sourceItemPosition);
            this._draggedItemPosition.y += window.pageYOffset;

            var wrapper = new Element('div',
                {styles: {left: String(this._draggedItemPosition.x) + "px", top: String(this._draggedItemPosition.y) + "px",
                    width: size.x + "px", 'margin-left': "0px", position: 'absolute'}});
            wrapper.addClass('z-topLayer');

            wrapper.adopt(this._createTempDragParts(this._sourceItem));
            for (var i = 0; i < this._subItems.length; i++) {
                wrapper.adopt(this._createTempDragParts(this._subItems[i], i));
            }
            $$('body')[0].appendChild(wrapper);

            this._draggedItemSize = wrapper.getSize();
            this._draggedItem = wrapper;
        },


        _createTempDragParts: function (item, index) {
            var viewNode = item.getViewNode();
            var size = viewNode.getSize();
            var el = viewNode.clone();
            var position = {};
            var borderTop;
            if (typeof index === 'number') {
                position.x = this.INDENT;
                position.y = index * size.y;
                borderTop = "";
            } else {
                position = {x: 0, y: 0};
                borderTop = "2px solid #0099ff";
            }

            el.set('styles', {opacity: '0.25', left: String(position.x) + "px", top: "0px", 'margin-left': "0px",
                width: size.x + "px", border: "2px solid #0099ff", 'border-top': borderTop, position: 'relative'});
            viewNode.set('styles', {opacity: '0.6'});
            return el;
        },

        _followMouseOnDrag: function (event) {
            this._dragX = event.client.x;
            this._dragY = event.client.y;
            //            console.log("mouseY: " + this._dragY);
            //            console.log("this._deltaY: " + this._deltaY);
            var newYPosition = this._dragY - this._deltaY;

            if (!this._isInDragBoundaries(newYPosition)) {
                return;
            }
            this._draggedItemPosition.y = newYPosition + window.pageYOffset;
            this._draggedItem.setStyle('top', this._draggedItemPosition.y);

            this._handleSubItem();
            this._moveItemIfNeeded();
        },

        _handleSubItem: function () {
            var xPosition = this._dragX - this._dragContainerPosition.x;
            if (!this._dragSubItem && xPosition > this.INDENT && this._canBeSubItem()) {
                this._changeState(true);
            } else if (this._dragSubItem && xPosition < this.INDENT && this._canBeParentItem()) {
                this._changeState(false);

            }
        },

        _changeState: function (setToSubItem) {
            var indent;
            if (setToSubItem) {
                indent = this.INDENT;
                this._dragSubItem = true;
            } else {
                indent = (-1) * this.INDENT;
                this._dragSubItem = false;
            }
            this._draggedItemPosition.x = this._draggedItemPosition.x + indent;
            this._draggedItemSize.x = this._draggedItemSize.x - indent;

            var parentItem = this._draggedItem.children[0];
            this._draggedItem.setStyles({left: String(this._draggedItemPosition.x) + "px", width: String(this._draggedItemSize.x) + "px"});
            parentItem.setStyles({width: String(this._draggedItemSize.x) + "px"});
            this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemStateChanged', {sourceItem: this._sourceItem, isSubItem: this._dragSubItem});
        },

        setAsSubItem: function (force) {
            this._changeState(true);
            this.forceToBeSubItem(force);
        },

        setAsParentItem: function () {
            this._changeState(false);
        },

        forceToBeSubItem: function (force) {
            this._forceAsSubItem = force;
        },

        _canBeParentItem: function () {
            return !this._forceAsSubItem;
        },

        _canBeSubItem: function () {
            if (this._subItems && this._subItems.length > 0) {
                return false;
            }
            if (this._dragSubItem) {
                return false;
            }
            var isFirst = this._sourceItemIndex == 0;
            if (isFirst) {
                return false;
            }
            return true;
        },

        _moveItemIfNeeded: function () {
            var scrollDelta = this._scrollContainer.scrollTop - this._initialScrollPosition;
            var relativeDraggedItemY = this._draggedItemPosition.y - window.pageYOffset + scrollDelta;
            if (this._sourceItemPosition.y - relativeDraggedItemY > this._sourceItemHeight / 2) {
                this._sourceItemPosition.y = this._sourceItemPosition.y - this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex - 1;
                this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});
            } else if (this._subItems.length == 0 &&
                (relativeDraggedItemY - this._sourceItemPosition.y > this._sourceItemHeight / 2)) {
                this._sourceItemPosition.y = this._sourceItemPosition.y + this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex + 1;
                this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});
            }
            else if (this._subItems.length > 0 &&
                (relativeDraggedItemY - (this._sourceItemPosition.y + this._draggedItemSize.y)) > this._sourceItemHeight / 2) {
                this._sourceItemPosition.y = this._sourceItemPosition.y + this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex + 1;
                this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});

            }
        },

        _isInDragBoundaries: function (newYAbsolutePosition) {
            var containerHeight = Math.min(this._dragContainerSize.y, this._scrollContainer.clientHeight);
            var relativeYPosition = newYAbsolutePosition - this._scrollContainerPosition.y; //- this._scrollContainer.scrollTop //- window.pageYOffset;

            if (relativeYPosition < 0) {
                if (this._isInScroll()) {
                    this._scrollUp();
                }
                return false;
            }
            if (relativeYPosition > containerHeight) {
                if (this._isInScroll()) {
                    this._scrollDown();
                }
                return false;
            }
            clearTimeout(this._scrolldelay);
            return true;
        },

        _scrollUp: function () {
            if (this._scrollContainer.scrollTop > 0) {
                this._scrollContainer.scrollTop -= 10;
                this._scrolldelay = setTimeout(this._scrollUp, 500);
            }
            else {
                clearTimeout(this._scrolldelay);
            }
        },

        _scrollDown: function () {
            if (this._scrollContainer.scrollTop + this._scrollContainer.clientHeight < this._dragContainerSize.y) {
                this._scrollContainer.scrollTop += 10;
                this._scrolldelay = setTimeout(this._scrollDown, 500);
            }
            else {
                clearTimeout(this._scrolldelay);
            }
        },

        _isInScroll: function () {
            if (this._scrollContainer.clientHeight - parseInt(this._scrollContainer.getStyle('padding-bottom')) == this._dragContainerSize.y) {
                return false;
            }
            return true;
        },

        _onItemDrop: function () {
            this._setItemsOpacity();
            this._duringDrag = false;
            this._draggedItem.dispose();
            var body = $$('body');
            body.removeEvents(Constants.CoreEvents.MOUSE_MOVE);
            body.removeEvents(Constants.CoreEvents.MOUSE_UP);
            this.resources.W.Commands.executeCommand('W.EditorCommands.TreeItemDrop', {sourceItem: this._sourceItem});
            this._dragSubItem = false;
        },

        _setItemsOpacity: function () {
            this._sourceItem.getViewNode().set('styles', {opacity: '1'});
            for (var i = 0; i < this._subItems.length; i++) {
                this._subItems[i].getViewNode().set('styles', {opacity: '1'});
            }
        },

        disableSelection: function (target) {
            if (typeof target.onselectstart != "undefined") { //IE route
                target.onselectstart = function () {
                    return false;
                };
            } else if (typeof target.style.MozUserSelect != "undefined") { //Firefox route
                target.style.MozUserSelect = "none";
            }
        }
    });
});


