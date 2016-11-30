define([
    'lodash',
    'utils',
    'core',
    'components/components/infoTip/infoTipUtils',
    'reactDOM'
], function(_, utils, /** core */core, infoTipUtils, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;
    var assignStyle = utils.style.assignStyle;

    var closeTipTimeout = 150,
        showTimer = 500,
        closeByTimeoutTimer = 3000;


    function closeTipByTimeout() {
        closeTip.call(this);
    }

    function startCloseByTimeoutTimer() {
        this.setTimeoutNamed('closeTipByTimeout', closeTipByTimeout.bind(this), closeByTimeoutTimer);
    }

    function callTip(params, source) {
        showTip.call(this, ReactDOM.findDOMNode(source.source));
    }

    function closeTip() {
        this.clearTimeoutNamed('openTip');
        this.setState({
            $hidden: 'hidden',
            runTimer: true
        });
    }

    function showTip(caller) {
        this.setState({
            $hidden: '',
            isShown: true,
            caller: caller
        });
        startCloseByTimeoutTimer.call(this);
    }

    function updateDOMPositionIfNeeded() {
        var tipNode,
            pos;

        if (this.state.isShown) {
            tipNode = ReactDOM.findDOMNode(this);
            pos = infoTipUtils.getPosition(this.state.caller, tipNode);
            assignStyle(tipNode, _.pick(pos, ['top', 'left', 'right']));
        }
    }

    function isEmptyTip(sourceCompData){
        return sourceCompData && _.isEmpty(sourceCompData.description);
    }


    /**
     * @class components.infoTip
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "InfoTip",
        mixins: [mixins.skinBasedComp, mixins.timeoutsMixin],


        onMouseEnter: function () {
            this._isMouseInside = true;
        },

        onMouseLeave: function () {
            this._isMouseInside = false;
            closeTip.call(this);
        },

        showToolTip: function (params, source) {
            if (isEmptyTip(source.source.props.compData)){
                return;
            }
            this.clearTimeoutNamed('hideTipByClose');
            this.setTimeoutNamed('openTip', function () {
                callTip.call(this, params, source);
            }.bind(this), showTimer);
        },

        closeToolTip: function () {
            this.setTimeoutNamed('hideTipByClose', function () {
                if (!this._isMouseInside) {
                    closeTip.call(this);
                }
            }.bind(this), closeTipTimeout);
        },

        getSkinProperties: function () {
            return {
                content: {
                    children: [this.props.compData.content]
                }
            };
        },

        componentDidUpdate: function () {
            // we call updateDOMPositionIfNeeded only in componentDidUpdate because position will be updated only by
            // mouse events so no sense to handle componentDidMount
            updateDOMPositionIfNeeded.call(this);
        },

        getInitialState: function () {
            return {
                '$hidden': "hidden",
                isMouseInside: false
            };
        }
    };
});
