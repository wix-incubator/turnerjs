define.component('wysiwyg.editor.components.Popover', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Commands', 'W.Config']);

    def.binds(['_onCloseButtonClick']);

    def.statics({
        DISTANCE_FROM_ITEM: 5,
        POINTER_WIDTH: 5,
        DEFAULT_MAX_POPOVER_WIDTH: 500,
        DEFAULT_MAX_POPOVER_HEIGHT: 500
    });

    def.binds(['_onCloseButtonClick']);

    def.skinParts({
        text: {type: 'htmlElement'},
        closeButton: {type: 'htmlElement'}
    });

    def.states({
        close: ['hasClose', 'noClose']
    });

    def.methods({
        /**
         * Initializes a popover using given options.
         *
         * @param {Object} args Options for showing the popover.
         * @param {Object} args.item The item that the popover will be attached to.
         * @param {String} [args.content] The HTML content of the popover.
         * @param {Number} [args.width] Popover max width.
         * @param {Number} [args.height] Popover max height.
         * @param {Boolean} [args.fadeIn] Whether popover will be faded in or not.
         * @param {Boolean} [args.fadeOut] Whether popover will be faded out or not.
         * @param {Object} [args.link] Link properties inside the popover.
         * @param {String} [args.link.selector] The selector to select in order to mark the text as a link.
         * @param {Function} [args.link.onClick] Callback for clicking the link.
         * @param {Function} [args.onClose] Callback for clicking the close button, getting event object as param.
         */
        initialize: function (compId, viewNode, args) {
            this.opts = args;

            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.HidePopover', this, this.hidePopover);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.ShowPopover', this, this.showPopover);

            this.parent(compId, viewNode, args);
        },
        _onRender: function (renderEvent) {
            var inval = renderEvent.data.invalidations._invalidations;
            if(!inval.firstRender) {
                return;
            }
            this._setStates();

            this._skinParts.text.set('html', this.opts.content || '');

            if (this.opts.link && this.opts.link.onClick) {
                var links = this._skinParts.text.getElements(this.opts.link.selector || 'a');
                _.each(links, function registerOnClick(link) {
                    link.addEvent('click', this.opts.link.onClick);
                }.bind(this));
            }

            this.$view.setStyle('max-width', this.opts.width || this.DEFAULT_MAX_POPOVER_WIDTH);
            this.$view.setStyle('max-height', this.opts.height || this.DEFAULT_MAX_POPOVER_HEIGHT);

            // Calc popover position
            this._attachToElement(this.opts.item);

            this.showPopover();
        },
        _setStates: function() {
            if (this.opts.closeButton){
                this._skinParts.closeButton.addEvent('click', function onCloseButtonClick(event) {
                    this._onCloseButtonClick();

                    if (this.opts.onClose) {
                        this.opts.onClose(event);
                    }
                }.bind(this));
                this.setState('hasClose','close');
            } else {
                this.setState('noClose','close');
            }
        },
        showPopover: function () {
            if (this.opts.fadeIn) {
                this.$view.setStyle('opacity', '0');
                this.$view.fade('in');
            } else {
                this.$view.setStyle('opacity', '1');
            }
        },
        hidePopover: function () {
            var that = this;

            if (this.opts.fadeOut) {
                this.$view.setStyle('opacity', '1');
                this.$view.set('tween', {
                    onComplete: function(){
                        that.dispose();
                    }
                }).fade(0);
            } else {
                this.dispose();
            }
        },
        /**
         * Moves the popover to given place, described with x,y notation
         * @param x Popover's left border location
         * @param y Popover's top border location
         */
        moveTo: function (x, y) {
            var currX = this.getX();
            var currY = this.getY();

            this.setX(x || currX);
            this.setY(y || currY);
        },
        /*
         * Places the popover right to the given item.
         */
        _attachToElement: function (item) {
            // Calculate popover's location
            var offsets = item.getOffsets();
            var MIN_POINTER_TOP = 5;

            // Popover's top border is at the same location as item's one
            var windowScroll = window.getScroll() || { y: 0 };
            var tableScroll = item.getScrolls() || { y: 0 };
            var top = offsets.y - tableScroll.y - windowScroll.y;
            var itemLeft = offsets.x;
            var itemWidth = item.getWidth();

            // Popover's pointer (left border) location
            var left = itemLeft + itemWidth + this.DISTANCE_FROM_ITEM + this.POINTER_WIDTH;

            this.moveTo(left, top);

            // Align popover's pointer with the middle of the pointed element
            var itemMiddleTop = (item.getHeight() / 2).floor();
            itemMiddleTop -= parseInt(this.$view.getStyle('border-radius')) || 0;
            itemMiddleTop -= parseInt(this._skinParts.before.getStyle('border-width')) / 2 || 0;
            itemMiddleTop = itemMiddleTop < MIN_POINTER_TOP ? MIN_POINTER_TOP : itemMiddleTop;

            this._skinParts.before.setStyle('top', itemMiddleTop);
            this._skinParts.after.setStyle('top', itemMiddleTop);
        },
        _onCloseButtonClick: function () {
            this.hidePopover();
        },
        setWidth: function (width) {
            this.$view.setStyle('width', width);
        },
        setHeight: function (height) {
            this.$view.setStyle('height', height);
        }
    });
});
