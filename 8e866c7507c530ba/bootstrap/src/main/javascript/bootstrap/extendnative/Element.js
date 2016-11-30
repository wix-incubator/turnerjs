define.bootstrapClass('bootstrap.extendnative.Element', function () {

    Element.implement({

        /**
         * Clean up event handlers left on the parent node
         */
        cleanup: function () {
            var daddy = document.id(this.parentNode);
            if (daddy) {
                daddy.removeEvents(Constants.DisplayEvents.ADDED_TO_DOM);
            }
        },

        /**
         * Insert a component's view into a view node
         * @param compView The component's view
         * @param parentView The designated parent or sibling of the view (depends on the where parameter)
         * @param mode an optional parameter that follows the mootools grab calling convention
         * @param displayEvent an optional param which states the cause of the event (defaults to ADDED_TO_DOM, but could also be MOVED_IN_DOM)
         */
        insertInto: function (parentView, mode, displayEvent) {
            if (!parentView) {
                LOG.reportError(wixErrors.CM_NULL_PARENT, "Element", "insertInto");
                return this;
            }

            if (!mode && this.getParent() === parentView) {
                return this;
            }

            var $p = document.id(parentView);

            $p.grab(this, mode); // supports the various insert methods of mootools
            if ('before' == mode || 'after' == mode) {
                parentView = parentView.parentNode;
                if (null === parentView) {
                    LOG.reportError(wixErrors.CM_NULL_PARENT, "Element", "insertInto");
                    return this;
                }
            }
            var defaultEvent = null;
            if (this.$logic && this.$logic.getIsDisplayed()) {
                defaultEvent = Constants.DisplayEvents.MOVED_IN_DOM;
            } else {
                defaultEvent = Constants.DisplayEvents.ADDED_TO_DOM;
            }
            displayEvent = displayEvent || defaultEvent;
            if (this.isNodeDisplayed()) {
                this.fireEventRecursively(Constants.DisplayEvents.ADDED_TO_DOM, displayEvent);
            }
            return this;
        },

        fireEventRecursively: function (type, args, delay) {
//            setTimeout(function() {
            this.fireEvent(type, args, delay);
            var children = this.getChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.fireEventRecursively) {
                    child.fireEventRecursively(type, args, delay);
                }
            }
//            }.bind(this),1) ;
        },

        /**
         * remove this element from the DOM, notify all its subtree
         */
        removeFromDOM: function () {
            // disconnect from our parent, disengage event
            var wasConnected = this.isNodeDisplayed();
            if (this.parentNode) {
                var eParent = document.id(this.parentNode);
                // parent may be a document fragment, which is un-mooable
                if (eParent) {
                    eParent.removeEvent(Constants.DisplayEvents.ADDED_TO_DOM, this._insertedToDOMCB);
                }
                this.dispose(); // mootools dispose, just disconnects from DOM
            }
            if (wasConnected) {
                this._onDisplayChangedEvent(Constants.DisplayEvents.REMOVED_FROM_DOM, 0);
            }
        },

        setCollapsed: function (collapse) {
            if (collapse) {
                this.collapse();
            }
            else {
                this.uncollapse();
            }
        },

        toggleCollapsed: function () {
            if (this.hasClass(Constants.CoreClasses.HIDDEN)) {
                this.uncollapse();
            }
            else {
                this.collapse();
            }
            return this;
        },

        collapse: function () {
            if (false === this.hasClass(Constants.CoreClasses.HIDDEN)) {
                this.addClass(Constants.CoreClasses.HIDDEN);
                this._onDisplayChangedEvent(Constants.DisplayEvents.COLLAPSED, 0);
            }
            return this;
        },

        uncollapse: function (displayClass) {
            if (this.hasClass(Constants.CoreClasses.HIDDEN)) {
                this.removeClass(Constants.CoreClasses.HIDDEN);
                if (displayClass) {
                    this.addClass(displayClass);
                }
                this._onDisplayChangedEvent(Constants.DisplayEvents.DISPLAYED, 0);
            }
            return this;
        },


        triggerDisplayChanged: function () {
            this._onDisplayChangedEvent(Constants.DisplayEvents.DISPLAY_CHANGED, 0);
        },

        isConnectedToDOM: function () {
            var element = this;
            var topDocElement = document.documentElement;
            while (element) {
                if (element.documentElement == topDocElement) {
                    return true;
                }
                element = element.parentNode;
            }
            return false;
        },

        /**
         * Checks if an element or any of its DOM ancestors are collapsed. This function does <b>not</b> check whether or not
         * the element is connected to the DOM.
         * @return true if any element in the input element's path to the root has its display set to 'none'
         */
        isCollapsed: function () {
            var topDocElement = document.documentElement;
            var element = this;
            while (element) {
                if (topDocElement == element.documentElement) {
                    return false;
                }
                var style = element.style;
                var display = element.getStyle('display');
                if ('none' == display || element.hasClass('hidden')) {
                    return true;
                }
                element = element.parentNode;
            }
            // got to the top, no collapsed element found
            return false;

        },

        /**
         * Checks if an element is set to be displayed. This function tests both inclusion in the DOM and
         * the value of the display property in the style on the path to the display root.
         * @param element a DOM element
         * @return true if the element is in the DOM and no element in the path to the DOM root has its display
         * set to none.
         */
        isNodeDisplayed: function () {
            var element = this;
            var topDocElement = document.documentElement;
            while (element) {
                // if we're at the document root, return true
                if (typeOf(element) == 'document') {
                    return true;
                }
                var e = document.id(element);
                if (!e) { // element can't be mooooooed, may be a doc fragment
                    return false;
                }
                if (e.hasClass('hidden')) {
                    return false;
                }
                var display = e.getStyle('display');
                if ('none' == display) {
                    return false;
                }
                element = element.parentNode;
            }
            // got to the top, doc element not found
            return false;
        },

        /**
         * handles the notification of this element's listeners on the removedFromDOM event
         * @param event The event name to be dispatched
         */
        _onDisplayChangedEvent: function (event) {
            var elements, i, el, len;
            if (this.getElementsByTagName) {
                elements = this.getElementsByTagName('*') || [];
                if (Browser.ie) {
                    if (Array.slice) {
                        elements = Array.slice(elements);
                    }
                    else {
                        el = [];
                        for (i = elements.length - 1; i >= 0; --i) {
                            el[i] = elements[i];
                        }
                        elements = el;
                    }
                }
                else {
                    elements = Array.prototype.slice.call(elements);
                }
            }
            else {
                elements = this.getElements('*') || [];
            }

            for (i = 0, len = elements.length; i < len; ++i) {
                try {
                    el = elements[i];
                    if (el.fireEvent) {
                        el.fireEvent(event, event);
                    }
                } catch (e) {
                    this._reportUnknownError(e);
                }
            }

            // notify the children before the top node, hopefully some of them will get rendered before
            // their containing component. This would be solved with DFS recursion but unfortunately IE
            // barfs on such an approach when the call stack exceeds 13 (yes, thirteen).
            try {
                this.fireEvent(event, event);
            }
            catch (ee) {
                this._reportUnknownError(ee);
            }
        },

        _reportUnknownError: function (exceptionObj) {
            var componentClassName = this && this.getLogic && this.getLogic() && this.getLogic()._editedComponent && this.getLogic()._editedComponent.$className || "no component name";
            var description = exceptionObj && exceptionObj.message || "no message";
            //temporarily remove all of these notifications, since this looks like a lot of garbage at this stage. look at this later...
            var err = wixErrors.UNKNOWN_ERROR;
            err.ignore = true;
            LOG.reportError(err, "Element.js", componentClassName, description);
        },

        _insertedToDOM: function (event) {
            this.fireEvent(Constants.DisplayEvents.ADDED_TO_DOM, event);
        },

        /**
         * Calculates the boundaries covered by the Element, including the boundaries
         * of all its visible and displayed children.
         *
         * @param {HTMLElement} coordSpace      The coordinate space to which the coordinates are related.
         *                                      If not specified, the global (body) coordinates are used.
         *
         */
        getContentRect: function (coordSpace) {
            coordSpace = coordSpace || $$('body')[0];
            var domTreeCoords = this.getCoordinates(coordSpace);
            this.getElements('div').forEach(function (childElement) {
                if (childElement.isVisible() === true && childElement.isDisplayed() === true) {
                    var coord = childElement.getCoordinates(coordSpace);
                    if (coord.left < domTreeCoords.left) {
                        domTreeCoords.left = coord.left;
                    }
                    if (coord.right > domTreeCoords.right) {
                        domTreeCoords.right = coord.right;
                    }
                    if (coord.top < domTreeCoords.top) {
                        domTreeCoords.top = coord.top;
                    }
                    if (coord.bottom > domTreeCoords.bottom) {
                        domTreeCoords.bottom = coord.bottom;
                    }
                }
            });
            domTreeCoords.width = domTreeCoords.right - domTreeCoords.left;
            domTreeCoords.height = domTreeCoords.bottom - domTreeCoords.top;
            return domTreeCoords;
        },

        _insertedToDOMCB: null
    });

    Element.NativeEvents['cut'] = 2;
    Element.NativeEvents['paste'] = 2;
    //TODO: remove this when upgrading to mootools 1.4.1 and up
    Element.NativeEvents['input'] = 2;

    Element.Events.paste = {
        base: 'paste',
        condition: function (e) {
            this.fireEvent(Constants.CoreEvents.PASTE, e, 1);
            return false;
        }
    };

    Element.Events.cut = {
        base: 'cut',
        condition: function (e) {
            this.fireEvent(Constants.CoreEvents.CUT, e, 1);
            return false;
        }
    };

    return Element;
});