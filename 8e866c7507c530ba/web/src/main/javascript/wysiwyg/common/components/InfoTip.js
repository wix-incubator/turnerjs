//This file was auto generated when experiment ToolTip.New was promoted to feature (Mon Aug 20 19:30:01 IDT 2012)
define.component('wysiwyg.common.components.InfoTip', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.resources(['W.Utils']);

    def.states({hidden: ['hidden', 'visible']});
    def.binds(
        ['initialize', '_callTip', '_showTip', '_mouseOut', '_mouseIn', '_timerToClose', '_closeToolTipCmd', '_showToolTipCmd', '_stayInWindowBounds']
    );

    def.fields({
        _mouseInside: false,
        _onCallerMouseMoveWasCalled: false,
        _shouldShowTooltipAfterTimout: false,
        _tipToShow: '',
        _defaultShowTimer: 500,
        _showTimer: 500
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.tipNode = this.getViewNode();

            /* event delegation over all tip node */
            this.tipNode.addEvent('click', this._handleEvent);
            this.tipNode.addEvent('mouseleave', this._mouseOut);
            this.tipNode.addEvent('mouseenter', this._mouseIn);
            this.tipNode.addEvent('mousedown',this._mouseDown);
            document.addEvent('keyup', this._mouseOut);

            /* we have to take action and hide tip node at init because its not working from the skin. */
            this.setState("hidden");
        },

        _closeToolTipCmd: function () {

            this._tipToShow = '';
            this._hideToolTipTimeOut = setTimeout(function () {
                if (!this._mouseInside) {
                    this._closeTip();
                }

            }.bind(this), 150);

        },
        _showToolTipCmd: function (params, source) {
            this._shouldShowTooltipAfterTimout = true;
            this._tipToShow = params.id ? params.id : params.html;
            if (params.showTimer) {
                this._showTimer = params.showTimer;
            }
            clearTimeout(this._hideToolTipTimeOut);
            window.setTimeout(function () {
                var toshownow = params.id ? params.id : params.html;
                if (this._shouldShowTooltipAfterTimout && this._tipToShow === toshownow) {
                    this._callTip(params, source);
                }
            }.bind(this), this._showTimer);
        },

        _handleEvent: function (e) {
            var trg = e.target;
            /* if the target isnt a link (select box for example) we do want default behavior */
            if (trg.get('href')) {
                e.preventDefault();
            }
            var logic = this.getLogic();

            /* go to actions map, and execute the action attribute on this node
             * passing the "this" scope and the targeted node
             * if there is no action in the action map do nothing */
            var action = trg.get('action');
            if (action) {
                (logic[action].bind(logic))(trg);
            }
        },


        _setToolTipValues: function (content) {
            this._skinParts.content.set('html', content);
        },

        _getToolTipCallerNode: function (source) {

            if (typeOf(source.source) == 'element') {
                return source.source;
            }
            return source.source.getViewNode();
        },

        _callTip: function (params, source) {
            this._resetToolTip();
            this._setToolTipValues(params.content);
            this._showTip(this._getToolTipCallerNode(source));
        },
        _resetToolTip: function () {
            this._skinParts.content.empty();
        },

        _showTip: function (caller, positionOffsets) {
            var tipNode = this.getViewNode();
            /* get position */
            var posMap = this._getPosition(caller, tipNode);
            var styles = {top: posMap.y, left: posMap.x[0], right: posMap.x[1]};
            if(positionOffsets){
                _.forOwn(positionOffsets, function(val, key){
                    if (typeof styles[key] === 'number') {
                        styles[key] += val;
                    }
                });
            }
            tipNode.setStyles(styles);
            this.removeState("hidden", "hidden");
            this._activateTimerToClose(tipNode, caller);
        },

        _activateTimerToClose: function (tipNode, callerElement) {
            this._numOfTimerCalls++;
            this.resources.W.Utils.callLater(this._closeTipByTimeout, null, this, 3000);
        },

        _closeTipByTimeout: function () {
            this._numOfTimerCalls--;
            if (this._numOfTimerCalls === 0) {
                this._closeTip();
            }
        },

        /** deprecated - _activateTimerToClose is used instead*/
        _timerToClose: function (tipNode, callerElement) {
            var timer;
            this.onCallerMove = function () {
                this._onCallerMouseMoveWasCalled = true;
                $(document.body).removeEvent('mousemove', this.onCallerMove);
            }.bind(this);
            $(document.body).addEvent('mousemove', this.onCallerMove);
            this.checkIfOut = function () {
                if (this._mouseInside || !this._onCallerMouseMoveWasCalled) {
                    this.createTimer();
//                } else {
                    //this._closeTip();
                }
                //clearTimeout(timer);
            }.bind(this);
            this.createTimer = function () {
                timer = setTimeout(this.checkIfOut, 3000);
            };
            this.createTimer();
        },

        _getPosition: function (caller, tipNode) {
            var previewPos = {x:0, y:0};
            var scrollPos = {x:0, y:0};

            //For tooltips on Viewer components in preview
            if (W.Config.env.$isEditorFrame && document !== caller.ownerDocument){
                previewPos = W.Preview.getPreviewPosition();
                scrollPos = W.Preview.getPreviewSite().getScroll();
            }

            var callerPos = caller.getPosition();
            var callerH = caller.getHeight();
            var callerW = caller.getWidth();
            var callerPosY = callerPos.y + previewPos.y - scrollPos.y;
            var callerPosX = callerPos.x + previewPos.x - scrollPos.x;
            var tipH = tipNode.getHeight();
            var tipW = tipNode.getWidth();
            var verticalW = callerPosX - (tipW / 2);

            // Default: above
            this._top = callerPosY - tipH;
            // Default: center
            this._left = verticalW;
            this._right = 'auto';

            this._stayInWindowBounds(callerH, callerW, callerPosY, callerPosX, tipH);

            //in case info tip position is absolute (as tooltip on an element)
            var offsetTop = 0;
            var offsetLeft = 0;
            if (tipNode.offsetParent) {
                var tipPos = tipNode.offsetParent.getPosition();
                offsetTop = tipPos.y;
                offsetLeft = tipPos.x;
            }

            this._top = this._top - offsetTop;
            this._left = this._left - offsetLeft;
            this._right = this._right + offsetLeft; //what was removed from left adds up to right

            return {x: [this._left, this._right], y: this._top};
        },

        _stayInWindowBounds: function (callerH, callerW, callerPosY, callerPosX, tipH) {
            var viewPortWidth = window.innerWidth;
            var viewPortHeight = window.innerHeight;
            // If there is no room above, try below
            if (this._top - document.body.getScroll().y < 0) {
                //                var tmpTop = callerPosY + callerH;
                var tmpTop = callerPosY + tipH;
                // If there is no room below, use middle
                if (tmpTop > viewPortHeight + document.body.getScroll().y + tipH) {
                    if (callerPosY < 0) {
                        tmpTop = callerPosY;
                    } else {
                        /* if callerPosY is lower than scrolled page */
                        tmpTop = document.body.getScroll().y;
                    }
                }
                this._top = tmpTop > 0 ? tmpTop : 0;
            }
            // If there is no room from left, align to right
            if (this._left < 0) {
                this._left = callerPosX;
            }
            // else check that there is room to the right.
            else if (this._left > viewPortWidth) {
                this._left = 'auto';
                this._right = callerPosX + callerW;
            }
        },

        _setState: function (obj, str) {
            obj ? this.setState(str) : this.removeState(str);
        },

        _closeTip: function () {
            this._shouldShowTooltipAfterTimout = false;
            this._onCallerMouseMoveWasCalled = false;
            this.setState('hidden');

            this.getViewNode().setStyles({top: 0, left: 0});
        },
        _mouseOut: function (e) {
            this._mouseInside = false;
            this._closeTip();
        },
        _mouseIn: function (e) {
            this._mouseInside = true;
        },
        _mouseDown: function(e) {
            e.stopPropagation();
        },
        dispose: function(){
            this.tipNode.removeEvent('click', this._handleEvent);
            this.tipNode.removeEvent('mouseleave', this._mouseOut);
            this.tipNode.removeEvent('mouseenter', this._mouseIn);
            this.tipNode.removeEvent('mousedown',this._mouseDown);
            document.removeEvent('keyup', this._mouseOut);

            this.parent();
        }

    });
});