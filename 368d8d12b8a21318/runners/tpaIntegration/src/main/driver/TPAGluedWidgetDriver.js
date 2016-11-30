define(['zepto', 'lodash', 'reactDOM'], function($, _, ReactDOM) {
    'use strict';

    function TPAGluedWidgetDriver(compId) {
        this.comp = window.rendered.refs.masterPage.refs[compId];
    }

    TPAGluedWidgetDriver.prototype.getWidgetTop = function () {
        var node = ReactDOM.findDOMNode(this.comp);
        var top = $(node).css('top').replace('px', '');
        var topMargin = $(node).css('margin-top').replace('px', '');

        topMargin = parseInt(topMargin, 10);
        top = Math.floor(top);

        return top + topMargin;
    };

    TPAGluedWidgetDriver.prototype.getWidgetLeft = function () {
        var node = ReactDOM.findDOMNode(this.comp);
        var left = $(node).css('left').replace('px', '');
        var leftMargin = $(node).css('margin-left').replace('px', '');

        leftMargin = parseInt(leftMargin, 10);
        left = Math.floor(left);

        return left + leftMargin;
    };

    TPAGluedWidgetDriver.prototype.getWidgetRight = function () {
        var node = ReactDOM.findDOMNode(this.comp);
        var right = $(node).css('right').replace('px', '');
        var rightMargin = $(node).css('margin-right').replace('px', '');

        rightMargin = parseInt(rightMargin, 10);
        right = Math.floor(right);

        return right + rightMargin;
    };

    TPAGluedWidgetDriver.prototype.getWidgetBottom = function () {
        var node = ReactDOM.findDOMNode(this.comp);
        var bottom = $(node).css('bottom').replace('px', '');
        var bottomMargin = $(node).css('margin-bottom').replace('px', '');

        bottomMargin = parseInt(bottomMargin, 10);
        bottom = Math.floor(bottom);

        return bottom + bottomMargin;
    };

    TPAGluedWidgetDriver.prototype.getWidgetPosition = function () {
        var node = ReactDOM.findDOMNode(this.comp);

        return node.style.position;
    };

    TPAGluedWidgetDriver.prototype.getWidgetWidth = function () {
        var node = ReactDOM.findDOMNode(this.comp);

        return node.style.width;
    };

    TPAGluedWidgetDriver.prototype.changePlacement = function (layout) {
        var siteData = this.comp.props.siteData;

        var properties = siteData.pagesData.masterPage.data.component_properties[this.comp.props.id];

        _.assign(properties, layout);
        this.comp.props.siteAPI.reLayout();
    };

    return TPAGluedWidgetDriver;
});
