define(['react', 'reactDOM', 'utils'], function(React, ReactDOM, utils) {
    'use strict';

    /**
     * Adopted from:
     * "Web font loading detection, without timers"
     * [http://smnh.me/web-font-loading-detection-without-timers/]
     * A blog post by Simon Hanukaev [https://github.com/smnh]
     */
    function hasArea(elem) {
        return elem && elem.offsetWidth && elem.offsetHeight;
    }

    function areaChanged(area1, area2) {
        return area1.offsetWidth !== area2.offsetWidth || area1.offsetHeight !== area2.offsetHeight;
    }

    function cloneArea(elem) {
        return elem && {
            offsetWidth: elem.offsetWidth,
            offsetHeight: elem.offsetHeight
        };
    }

    var FontRuler = React.createClass({
        displayName: 'FontRuler',

        handleFontResize: function () {
            if (!this.isMounted()) {
                return;
            }

            if (this.triggeredResize) {
                return;
            }

            var trigger = this.trigger;
            if (!trigger) {
                trigger = hasArea(this.contentNodeOrigSize);
                if (trigger) {
                    var contentNode = ReactDOM.findDOMNode(this.refs.content);
                    if (!contentNode) {
                        return;
                    }
                    trigger = areaChanged(contentNode, this.contentNodeOrigSize);
                }
            }

            if (trigger) {
                if (this.rafID) {
                    utils.animationFrame.cancel(this.rafID);
                    this.rafID = 0;
                }
                this.triggeredResize = true;
                this.props.onLoadCallback(this.props.fontFamily);
            } else if (!this.rafID) {
                this.rafID = utils.animationFrame.request(this.updateCurrentSize);
            }
        },

        updateCurrentSize: function() {
            this.rafID = 0;

            var wrapperNode = ReactDOM.findDOMNode(this.refs.wrapper);
            if (!wrapperNode) {
                return;
            }
            var contentNode = ReactDOM.findDOMNode(this.refs.content);
            var innerContentNode = ReactDOM.findDOMNode(this.refs.innerContent);
            var innerWrapperNode = ReactDOM.findDOMNode(this.refs.innerWrapper);

            var origSize = cloneArea(wrapperNode);

            // Resize wrapper and scroll its content to the bottom right corner
            wrapperNode.style.width = (origSize.offsetWidth - 1) + "px";
            wrapperNode.style.height = (origSize.offsetHeight - 1) + "px";
            wrapperNode.scrollLeft = wrapperNode.scrollWidth - wrapperNode.clientWidth;
            wrapperNode.scrollTop = wrapperNode.scrollHeight - wrapperNode.clientHeight;

            // Resize inner content and scroll inner wrapper to the bottom right corner
            innerContentNode.style.width = (origSize.offsetWidth + 1) + "px";
            innerContentNode.style.height = (origSize.offsetHeight + 1) + "px";
            innerWrapperNode.scrollLeft = innerWrapperNode.scrollWidth - innerWrapperNode.clientWidth;
            innerWrapperNode.scrollTop = innerWrapperNode.scrollHeight - innerWrapperNode.clientHeight;

            if (hasArea(contentNode)) {
                if (this.contentNodeOrigSize) {
                    this.trigger = areaChanged(contentNode, this.contentNodeOrigSize);
                } else {
                    this.contentNodeOrigSize = cloneArea(contentNode);
                }
                contentNode.style.fontFamily = this.props.fontFamily + ", serif";
            }
        },

        componentDidMount: function () {
            this.trigger = false;
            this.triggeredResize = false;
            this.updateCurrentSize();
        },

        componentWillUnmount: function () {
            if (this.rafID) {
                utils.animationFrame.cancel(this.rafID);
                this.rafID = 0;
            }
        },

        render: function () {
            var innerContent = React.DOM.div({
                ref: 'innerContent',
                refInParent: 'innerContent'
            });
            var innerWrapper = React.DOM.div({
                ref: 'innerWrapper',
                refInParent: 'innerWrapper',
                onScroll: this.handleFontResize,
                style: {
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                }
            }, innerContent);
            var content = React.DOM.div({
                style: {
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    fontFamily: 'serif'
                }
            }, innerWrapper, React.DOM.span({ref:'content', className:'font-ruler-content'}) /* characters that are likely to change in size between fonts */);
            var wrapper = React.DOM.div({
                ref: 'wrapper',
                refInParent: 'wrapper',
                onScroll: this.handleFontResize,
                style: {
                    position: 'absolute',
                    overflow: 'hidden',
                    fontSize: 1200,
                    left: -2000,
                    visibility: 'hidden'
                }
            }, content);
            return wrapper;
        }
    });

    return FontRuler;
});
