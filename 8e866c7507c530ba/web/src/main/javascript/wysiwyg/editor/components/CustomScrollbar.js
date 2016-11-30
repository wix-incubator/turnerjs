define.component('wysiwyg.editor.components.CustomScrollbar', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        scrollBar : {type: 'htmlElement'},
        handle    : {type: 'htmlElement'}

    });

    def.states({dragState: ['dragging', 'notDragging']});

    def.resources(['W.Preview']);

    def.binds(['_handleMouseUp', '_handleMouseMove', '_handleMouseWheel', '_handleKeyDown', '_handleMouseDown', '_resetScrollSizeAndPosition']);

    def.fields({
        _scrollSpeedConstant: 500
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._scrollingElement = args.scrollingElement || null;
            this._scrollTop = 0;
        },

        /**
         * Initialize scrollbar and it's source element
         * @param {node} element the element to scroll
         * @param {number} [elementScrollHeight] the height of the document to scroll
         * @param {number} [elementHeight] the visible height of the scroll 'window'
         * @returns {boolean}
         */
        setScrollingElement: function(element, elementScrollHeight, elementHeight){
           
            if (this._scrollingElement){
                this.removeScrollEvents();
            }

            // Support window elements
            if (element.document){
                this._scrollingElement = element.document.body;
            } else {
                this._scrollingElement = element;
            }

            this.setScrollHandleHeightFromElement(elementScrollHeight, elementHeight);
            this.setScrollHandlePosition();
            this.addScrollEvents();

            this.setState('notDragging', 'dragState');
        },

        /**
         * Set extra styling on the scrollbar
         * @param {Object} [scrollBarStyleOverrides] extra styling rules for the scrollbar
         * @param {Object} [handleStyleOverrides] extra styling rules for the scrollbar handle
         */

        setStyleOverrides: function(scrollBarStyleOverrides, handleStyleOverrides){
            if (scrollBarStyleOverrides){
                this._skinParts.scrollBar.setStyles(scrollBarStyleOverrides);
            }

            if (handleStyleOverrides){
                this._skinParts.handle.setStyles(handleStyleOverrides);
            }

            this.setScrollHandleHeightFromElement();
        },

        /**
         * Set the handle height from the relative height of the visible/scrollable areas of the scrolled element
         * @param {number} elementScrollHeight [Optional] the height of the document to scroll
         * @param {number} elementHeight [Optional] the visible height of the scroll 'window'
         */
        setScrollHandleHeightFromElement: function(elementScrollHeight, elementHeight){
            this._elementHeight = elementHeight || this._scrollingElement.offsetHeight;
            this._scrollHeight = elementScrollHeight || this._scrollingElement.scrollHeight;
            this._scrollVsVisibleRatio = this._scrollHeight / this._elementHeight;
            this._scrollBarHeight = this._skinParts.scrollBar.offsetHeight;
            this._elementVsBarRatio = this._scrollHeight / this._scrollBarHeight;

            if (this._scrollVsVisibleRatio <= 1){
                this._skinParts.handle.collapse();
            } else{
                this._skinParts.handle.uncollapse();
                this.setScrollHandleHeight(Math.floor(this._skinParts.scrollBar.offsetHeight / this._scrollVsVisibleRatio));
            }
        },

        /**
         * set the handle height
         * @param {number} height
         */
        setScrollHandleHeight: function(height){
            if(parseInt(height, 10) === height){
                height = height + 'px';
            }
            this._skinParts.handle.style.height = height;
        },

        /**
         * set the handle position
         * @param {number} top
         */
        setScrollHandlePosition: function(top){
            this._scrollTop = (_.isNumber(top))? top : this._scrollingElement.scrollTop;
            this._scrollAll(this._scrollTop);
        },

        /**
         * add extra elements that using mouse wheel over them scrolls the element
         * Each call to this function removes the old elements and creates a new list
         * use this function with no parameters to remove all extra wheel sources
         * @param {node[]|undefined} elementsList an array of htmlElement objects
         */
        setExtraWheelSources: function(elementsList){
            if (this._extraElementsList){
                _.forEach(this._extraElementsList, function(element){
                    element.removeEvent('mousewheel', this._handleMouseWheel);
                }, this);
            }

            if (elementsList){
                this._extraElementsList = elementsList;
                _.forEach(this._extraElementsList, function(element){
                    element.addEvent('mousewheel', this._handleMouseWheel);
                }, this);
            }
        },

        _resetScrollSizeAndPosition: function(params){
            params = params || {};
            this.setScrollHandleHeightFromElement(params.height);
            this.setScrollHandlePosition(params.top);
        },
        
        addScrollEvents: function(){
            var previewCommands = this.resources.W.Preview.getPreviewManagers().Commands;

            this._scrollingElement.addEvent('mousewheel', this._handleMouseWheel);
            this._scrollingElement.addEvent('keydown', this._handleKeyDown);
            this._view.addEvent('mousewheel', this._handleMouseWheel);
            this._view.addEvent('keydown', this._handleKeyDown);
            this._view.addEvent('mousedown', this._handleMouseDown);

            previewCommands.registerCommandAndListener('WPreviewCommands.resetCustomScrollbar', this, this._resetScrollSizeAndPosition);
        },

        removeScrollEvents: function(){
            var previewCommands = this.resources.W.Preview.getPreviewManagers().Commands;

            this._scrollingElement.removeEvent('mousewheel', this._handleMouseWheel);
            this._scrollingElement.removeEvent('keydown', this._handleKeyDown);

            this._view.removeEvent('mousewheel', this._handleMouseWheel);
            this._view.removeEvent('keydown', this._handleKeyDown);
            this._view.removeEvent('mousedown', this._handleMouseDown);

            window.removeEvent('mousemove', this._handleMouseMove);
            window.removeEvent('mouseup', this._handleMouseUp);
            window.removeEvent('mousein', this._handleMouseUp);
            window.removeEvent('click', this._handleMouseUp);

            window.detachEvent && window.detachEvent('onselectstart', this._ieOnSelectStart);

            previewCommands.getCommand('WPreviewCommands.resetCustomScrollbar').unregisterListener(this);

        },

        _handleMouseWheel: function (event) {
            var newScrollTop = this._scrollTop - event.wheel * (10 + Math.ceil(this._scrollHeight / this._scrollSpeedConstant));
            this._scrollAll(newScrollTop);
            event.preventDefault();
        },

        _handleKeyDown: function (event) {
            if (event.key == 'up') {
                var newScrollTop = this._scrollTop - 50;
            } else if (event.key == 'down') {
                var newScrollTop = this._scrollTop + 50;
            } else {
                return;
            }
            this._scrollAll(newScrollTop);
            event.preventDefault();
        },

        _scrollAll: function (newScrollTop) {
            newScrollTop = Math.round(Math.min(Math.max(newScrollTop, 0), this._scrollHeight - this._elementHeight));
            var scrollLeft = this._scrollingElement.scrollLeft;
            this._scrollingElement.scrollTo(scrollLeft, newScrollTop);
            this._scrollTop = newScrollTop;
            this._skinParts.handle.style.top = Math.max((newScrollTop / this._elementVsBarRatio), 0) + 'px';
        },

        _handleMouseDown: function (event) {
            window.addEvent('mousemove', this._handleMouseMove);
            window.addEvent('mouseup', this._handleMouseUp);

            window.attachEvent && window.attachEvent('onselectstart', this._ieOnSelectStart);
            this.setState('dragging', 'dragState');

            document.body.addClass('dragging');

            if (event.target === this._skinParts.handle) {
                this._mouseOffset = (event.page.y - this._skinParts.handle.getPosition().y);
                return;
            }

            var clickPoint = event.page.y - this._skinParts.scrollBar.getPosition().y;
            var newScrollTop = clickPoint * this._elementVsBarRatio;
            this._scrollAll(newScrollTop);
            event.preventDefault();
        },

        _handleMouseMove: function (event) {
            window.addEvent('mousein', this._handleMouseUp);
            window.addEvent('click', this._handleMouseUp);
            var clickPoint = (event.page.y - this._skinParts.scrollBar.getPosition().y) - this._mouseOffset;
            var newScrollTop = clickPoint * this._elementVsBarRatio;

            this._scrollAll(newScrollTop);
            event.preventDefault();
        },

        _handleMouseUp: function (event) {
            document.body.removeClass('dragging');
            this.setState('notDragging', 'dragState');

            window.removeEvent('mousemove', this._handleMouseMove);
            window.removeEvent('mouseup', this._handleMouseUp);
            window.removeEvent('mousein', this._handleMouseUp);
            window.removeEvent('click', this._handleMouseUp);

            window.detachEvent && window.detachEvent('onselectstart', this._ieOnSelectStart);

        },

        _ieOnSelectStart: function(){
            return false;
        }
        
        
    });

});
