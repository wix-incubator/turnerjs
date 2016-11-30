define([
    'react',
    'layout/wixappsLayout/proxyLayoutRegistrar',
    'lodash',
    'reactDOM',
    'core'
], function(React, proxyLayoutRegistrar, _, ReactDOM) {
    'use strict';

    function createProxyNode(children, cols, direction, horizGap, vertGap) {
        var div = window.document.createElement('div');
        window.document.body.appendChild(div);

        return ReactDOM.render(React.DOM.div({
            style: {width: 400, height: 400},
            'data-columns': cols,
            'data-direction': direction,
            'data-horizontal-gap': horizGap,
            'data-vertical-gap': vertGap
        }, children), div);
    }

    function createProxyChildren(heightsArray) {
        var children = [];
        for (var i = 0; i < heightsArray.length; i++) {
            children.push(React.DOM.div({style: {position: 'absolute', height: heightsArray[i], width: 10}, key: i}, ""));
        }
        return children;
    }

    describe('PaginatedColumnGalleryProxyLayout - measure and return css rules', function () {
        var measureFunction = proxyLayoutRegistrar.getProxiesToMeasure().PaginatedColumnGalleryProxy;

        it('should define a measure function to paginated column gallery proxy layout', function () {
            expect(measureFunction).toBeDefined();
            expect(measureFunction).toBeOfType('function');
        });

        it('should measure the children of the proxy and return an array of css rules to apply on it according to the masonry order result', function () {
            var children = createProxyChildren([50, 80, 41, 90, 13, 198, 112, 78, 100]);
            var proxyNode = ReactDOM.findDOMNode(createProxyNode(children, 3, "ltr", 20, 20));
            var result = measureFunction(proxyNode).domManipulations;
            var params = [
                {"position": "absolute", "top": "0px", "padding-right": "12px", "padding-left": "0px", "left": "0px"},
                {"position": "absolute", "top": "0px", "padding-right": "6px", "padding-left": "6px", "left": "133px"},
                {"position": "absolute", "top": "0px", "padding-right": "0px", "padding-left": "12px", "left": "266px"},
                {"position": "absolute", "top": "61px", "padding-right": "0px", "padding-left": "12px", "left": "266px"},
                {"position": "absolute", "top": "70px", "padding-right": "12px", "padding-left": "0px", "left": "0px"},
                {"position": "absolute", "top": "103px", "padding-right": "12px", "padding-left": "0px", "left": "0px"},
                {"position": "absolute", "top": "100px", "padding-right": "6px", "padding-left": "6px", "left": "133px"},
                {"position": "absolute", "top": "171px", "padding-right": "0px", "padding-left": "12px", "left": "266px"},
                {"position": "absolute", "top": "232px", "padding-right": "6px", "padding-left": "6px", "left": "133px"}
            ];

            for (var i = 0; i < result.length - 1; i++) {
                expect(result[i].node).toEqual(proxyNode.childNodes[i]);
                expect(result[i].funcName).toEqual("css");
                expect(result[i].params).toEqual(params[i]);
            }

            //proxyNode itself
            expect(_.last(result).node).toEqual(proxyNode);
            expect(_.last(result).funcName).toEqual("css");
            expect(_.last(result).params).toEqual({"height": "332px"});
        });

        it('should measure the children of the proxy and for rtl direction', function () {
            var children = createProxyChildren([10, 26, 33, 15, 25, 30, 15, 10, 22]);
            var proxyNode = ReactDOM.findDOMNode(createProxyNode(children, 4, "rtl", 15, 15));
            var result = measureFunction(proxyNode).domManipulations;
            var params = [
                {"position": "absolute", "top": "0px", "padding-right": "0px", "padding-left": "9px", "right": "0px"},
                {"position": "absolute", "top": "0px", "padding-right": "3px", "padding-left": "6px", "right": "100px"},
                {"position": "absolute", "top": "0px", "padding-right": "6px", "padding-left": "3px", "right": "200px"},
                {"position": "absolute", "top": "0px", "padding-right": "9px", "padding-left": "0px", "right": "300px"},
                {"position": "absolute", "top": "25px", "padding-right": "0px", "padding-left": "9px", "right": "0px"},
                {"position": "absolute", "top": "30px", "padding-right": "9px", "padding-left": "0px", "right": "300px"},
                {"position": "absolute", "top": "41px", "padding-right": "3px", "padding-left": "6px", "right": "100px"},
                {"position": "absolute", "top": "48px", "padding-right": "6px", "padding-left": "3px", "right": "200px"},
                {"position": "absolute", "top": "65px", "padding-right": "0px", "padding-left": "9px", "right": "0px"}
            ];

            for (var i = 0; i < result.length - 1; i++) {
                expect(result[i].node).toEqual(proxyNode.childNodes[i]);
                expect(result[i].funcName).toEqual("css");
                expect(result[i].params).toEqual(params[i]);
            }

            //proxyNode itself
            expect(_.last(result).node).toEqual(proxyNode);
            expect(_.last(result).funcName).toEqual("css");
            expect(_.last(result).params).toEqual({"height": "87px"});
        });
    });
});
