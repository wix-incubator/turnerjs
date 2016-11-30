/**@class  wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler*/
define.experiment.Class('wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler.SiteNavigationRefactor', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.inherits('core.events.EventDispatcher');

    def.binds(['onItemDrag', '_onItemDrop', '_scrollUp', '_scrollDown', 'setItemLevel']);

    /**@lends wysiwyg.editor.components.panels.navigation.TreeStructureDragHandler*/
    def.methods({

        /**
         * @override
         * @param dragContainer
         */
        setDragContainer: function (dragContainer) {
            this._dragContainer = dragContainer;
            this._dragContainerPosition = dragContainer.getPosition();
            this._dragContainerPosition.y -= window.pageYOffset;
            this._dragContainerWidth = this._dragContainer.getWidth();
        },

        _changeState: strategy.remove(),

        /**
         * @override
         * @private
         */
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
                wrapper.adopt(this._createTempDragParts(this._subItems[i], i, this._sourceItem.getItemLevel()));
            }
            $$('body')[0].appendChild(wrapper);

            this._draggedItemSize = wrapper.getSize();
            this._draggedItem = wrapper;
        },

        /**
         * @override
         * @param item
         * @param index
         * @returns {*}
         * @private
         */
        _createTempDragParts: function (item, index, baseLevel) {
            var viewNode = item.getViewNode();
            var size = viewNode.getSize();
            var el = viewNode.clone();
            var position = {};
            var borderTop;
            if (typeof index === 'number') {
                var indent = (item.getItemLevel() - baseLevel) * this.INDENT;
                position.x = indent;
                position.y = index * size.y;
                borderTop = "";
            } else {
                position = {x: 0, y: 0};
                borderTop = "2px solid #0099ff";
            }

            el.set('styles', {width: 'auto', opacity: '0.25', 'margin-left': String(position.x) + "px", top: "0px", border: "2px solid #0099ff", 'border-top': borderTop, position: 'relative'});
            viewNode.set('styles', {opacity: '0.6'});
            return el;
        },

        /**
         * @override
         *
         * @param event
         * @private
         */
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

            this._moveItemIfNeeded();
            this._handleSubItem();
        },

        /**
         * @override
         */
        _moveItemIfNeeded: function () {
            var scrollDelta = this._scrollContainer.scrollTop - this._initialScrollPosition;
            var relativeDraggedItemY = this._draggedItemPosition.y - window.pageYOffset + scrollDelta;
            if (this._sourceItemPosition.y - relativeDraggedItemY > this._sourceItemHeight / 2) {
                this._sourceItemPosition.y = this._sourceItemPosition.y - this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex - 1;
                this.trigger('TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});
            } else if (this._subItems.length === 0 &&
                (relativeDraggedItemY - this._sourceItemPosition.y > this._sourceItemHeight / 2)) {
                this._sourceItemPosition.y = this._sourceItemPosition.y + this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex + 1;
                this.trigger('TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});
            }
            else if (this._subItems.length > 0 &&
                (relativeDraggedItemY - (this._sourceItemPosition.y + this._draggedItemSize.y)) > this._sourceItemHeight / 2) {
                this._sourceItemPosition.y = this._sourceItemPosition.y + this._sourceItemHeight;
                this._sourceItemIndex = this._sourceItemIndex + 1;
                this.trigger('TreeItemMoved', {sourceItem: this._sourceItem, newIndex: this._sourceItemIndex});

            }
        },

        /**
         * @override
         */
        _onItemDrop: function () {
            this._setItemsOpacity();
            this._duringDrag = false;
            this._draggedItem.dispose();
            var body = $$('body');
            body.removeEvents(Constants.CoreEvents.MOUSE_MOVE);
            body.removeEvents(Constants.CoreEvents.MOUSE_UP);
            this.trigger('TreeItemDrop', {sourceItem: this._sourceItem});
            this._dragSubItem = false;
        },

        /**
         * @override
         */
        _handleSubItem: function () {
            var dragXPosition = this._dragX - this._dragContainerPosition.x;
            var itemXPosition = this._draggedItem.getPosition().x - this._dragContainerPosition.x;

            var dragLevel = this._getLevelByPosition(dragXPosition);
            var itemLevel = this._getLevelByPosition(itemXPosition);

            if (dragLevel !== itemLevel) {
                this._requestItemLevelChange(dragLevel);
            }
        },

        _getLevelByPosition: function(posX) {
            return Math.max(Math.floor(posX / this.INDENT), 0); // TODO - set max level
        },

        _requestItemLevelChange: function(level) {
            if (level === this._sourceItem.getItemLevel()) {
                return;
            }

            this.trigger('TreeItemLevelChangeRequest', {
                sourceItem: this._sourceItem,
                requestedLevel: level,
                callback: this.setItemLevel
            });
        },

        setItemLevel: function(level) {
            if (level === this._sourceItem.getItemLevel()) {
                return;
            }

            var indent = level * this.INDENT;
            this._draggedItemPosition.x = this._dragContainerPosition.x + indent;
            this._draggedItemSize.x = this._dragContainerWidth - indent;

            var parentItem = this._draggedItem.children[0];
            this._draggedItem.setStyles({left: String(this._draggedItemPosition.x) + "px", width: String(this._draggedItemSize.x) + "px"});
            parentItem.setStyles({width: String(this._draggedItemSize.x) + "px"});

            this.trigger('TreeItemLevelChanged', {sourceItem: this._sourceItem, itemLevel: level});
        },

        onItemDrag: function (mouseEvent, sourceItem, sourceItemIndex, subItems, itemsCount) {
            var filteredEvent = this._filterDragEvent(mouseEvent.event, itemsCount);
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

        _filterDragEvent: function (event, itemsCount) {
            if (!event.which && event.button) {
                if (event.button & 1) { // Left
                    event.which = 1;
                } else if (event.button & 4) {  // Middle
                    event.which = 2;
                } else if (event.button & 2) { // Right
                    event.which = 3;
                }
            }

            if (event.which != 1 || itemsCount == 1) { // if not left click, or last page in the site, ignore
                return null;
            } else {
                return event;
            }
        }
    });
});


