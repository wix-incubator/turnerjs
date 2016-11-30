define(['react', 'reactDOM', 'qaAutomation/api/domSelectors', 'lodash'], function (React, ReactDOM, getDomSelectors, _) {
    'use strict';

    var domSelectors = getDomSelectors(React, ReactDOM);

    describe('domSelectors', function () {
        var testUtils = React.addons.TestUtils;
        var root, rootComp, headerComp, headerCompProps, wrapperComp, bodyComp, innerComp;

        function createCompProps(comp) {
            return {
                id: comp.displayName + 'Id',
                compData: comp.displayName + 'Data',
                siteData: {pages: [0]},
                siteAPI: {siteAPI: 'siteAPI'},
                children: [],
                parent: ['a', 'b', 'c'],
                a: {b: {documentServices: {a: 'b'}}},
                c: {d: _.noop},
                e: {f: ['g']},
                h: {_isReactElement: _.noop},
                i: [_.noop]
            };
        }

        function createComp(compName, elementType, compChildren) {
            return React.createClass({
                displayName: compName + 'Comp',
                render: function () {
                    return React.createElement(elementType || 'div', this.props, compChildren || this.props.children);
                }
            });
        }

        beforeEach(function () {
            innerComp = createComp('inner');
            wrapperComp = createComp('wrapper', innerComp, React.DOM.div({}));
            headerComp = createComp('header', 'div', React.createElement(innerComp));
            headerCompProps = createCompProps(headerComp);
            bodyComp = createComp('body', 'div', React.createElement(wrapperComp));
            rootComp = React.createClass({
                displayName: 'root',
                render: function () {
                    return React.createElement('div', {},
                        [React.createElement(headerComp, _.merge({ref: 'header', key: 'header'}, headerCompProps)),
                        React.createElement(bodyComp, {ref: 'body', key: 'body'})]);
                }
            });
            root = testUtils.renderIntoDocument(React.createElement(rootComp, {}));
            domSelectors.setSearchRoot(root);
        });

        describe('getElementsByDisplayNameAndProps', function () {

            it('should return array of matched elements', function () {
                var result = domSelectors.getElementsByDisplayNameAndProps(root, 'headerComp', headerCompProps);
                expect(result).toEqual([ReactDOM.findDOMNode(root.refs.header)]);
            });

            it('should return an empty array if root is not set', function () {
                domSelectors.setSearchRoot(null);
                expect(domSelectors.getElementsByDisplayNameAndProps(root, 'headerComp', headerCompProps)).toEqual([]);
            });

            it('should return an empty array if no elements found', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(root, 'nonExisting', headerCompProps)).toEqual([]);
            });

            it('should perform case insensitive search', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(root, 'hEaderCoMp')).toEqual([ReactDOM.findDOMNode(root.refs.header)]);
            });

            it('should perform search ignoring non set optional parameters', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps().length).toBe(12);
                expect(domSelectors.getElementsByDisplayNameAndProps(root.refs.header).length).toBe(4);
                expect(domSelectors.getElementsByDisplayNameAndProps(null, 'headerComp').length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(null, '', headerCompProps).length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(null, 'headerComp', headerCompProps).length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(root, '', headerCompProps).length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(root, 'headerComp').length).toBe(1);
            });

            it('should perform search by tagName if presents when displayName given', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(headerComp, 'div').length).toEqual(6);
            });

            it('should perform search under containing element if given as rendered component', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(root, 'innerComp').length).toBe(2);
                expect(domSelectors.getElementsByDisplayNameAndProps(root.refs.header, 'innerComp').length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(root.refs.body, 'innerComp').length).toBe(1);
            });

            it('should perform search under containing element if given as DOM node', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(ReactDOM.findDOMNode(root), 'innerComp').length).toBe(2);
                expect(domSelectors.getElementsByDisplayNameAndProps(ReactDOM.findDOMNode(root.refs.header), 'innerComp').length).toBe(1);
                expect(domSelectors.getElementsByDisplayNameAndProps(ReactDOM.findDOMNode(root.refs.body), 'innerComp').length).toBe(1);
            });

            it('should ignore containing element if it has invalid type', function () {
                var expectedResult = [ReactDOM.findDOMNode(root.refs.header)];
                expect(domSelectors.getElementsByDisplayNameAndProps('headerComp', 'headerComp', headerCompProps)).toEqual(expectedResult);
                expect(domSelectors.getElementsByDisplayNameAndProps({}, 'headerComp', headerCompProps)).toEqual(expectedResult);
            });
        });

        describe('getComponentsByDisplayNameAndProps', function () {

            it('should return array of matched components', function () {
                var result = domSelectors.getComponentsByDisplayNameAndProps(root, 'headerComp', headerCompProps);
                expect(result).toEqual([root.refs.header]);
            });

            it('should return an empty array if root is not set', function () {
                domSelectors.setSearchRoot(null);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, 'headerComp', headerCompProps)).toEqual([]);
            });

            it('should return an empty array if no elements found', function () {
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, 'nonExisting', headerCompProps)).toEqual([]);
            });

            it('should perform case insensitive search', function () {
                var result = domSelectors.getComponentsByDisplayNameAndProps(root, 'hEaderCoMp', headerCompProps);
                expect(result).toEqual([root.refs.header]);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, 'hEaderCoMp')).toEqual([root.refs.header]);
            });

            it('should perform search ignoring non set optional parameters', function () {
                expect(domSelectors.getComponentsByDisplayNameAndProps().length).toBe(12);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root.refs.header).length).toBe(4);
                expect(domSelectors.getComponentsByDisplayNameAndProps(null, 'headerComp').length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(null, '', headerCompProps).length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(null, 'headerComp', headerCompProps).length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, '', headerCompProps).length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, 'headerComp').length).toBe(1);
            });

            it('should perform search by tagName if presents when displayName given', function () {
                expect(domSelectors.getElementsByDisplayNameAndProps(headerComp, 'div').length).toEqual(6);
            });

            it('should perform search under containing element if given as rendered component', function () {
                expect(domSelectors.getComponentsByDisplayNameAndProps(root, 'innerComp').length).toBe(2);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root.refs.header, 'innerComp').length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(root.refs.body, 'innerComp').length).toBe(1);
            });

            it('should perform search under containing element if given as DOM node', function () {
                expect(domSelectors.getComponentsByDisplayNameAndProps(ReactDOM.findDOMNode(root), 'innerComp').length).toBe(2);
                expect(domSelectors.getComponentsByDisplayNameAndProps(ReactDOM.findDOMNode(root.refs.header), 'innerComp').length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(ReactDOM.findDOMNode(root.refs.body), 'innerComp').length).toBe(1);
            });

            it('should ignore containing element if it has invalid type', function () {
                var expectedResult = [root.refs.header];
                expect(domSelectors.getComponentsByDisplayNameAndProps('headerComp', 'headerComp', headerCompProps)).toEqual(expectedResult);
                expect(domSelectors.getComponentsByDisplayNameAndProps({}, 'headerComp', headerCompProps)).toEqual(expectedResult);
            });

            it('should compare props with attributes for dom nodes', function(){
                var comp = React.createClass({
                    displayName: 'someComp',
                    render: function () {
                        return React.createElement('div', {},
                            [
                                React.createElement('span', {className: 'span-class', key: 'span'}),
                                React.createElement('textArea', {className: 'textArea-class', "data-skinpart": 'someSkinPart', key: 'textArea'})
                            ]);
                    }
                });

                root = testUtils.renderIntoDocument(React.createElement(comp, {}));
                var rootDOMNode = ReactDOM.findDOMNode(root);
                domSelectors.setSearchRoot(root);

                expect(domSelectors.getComponentsByDisplayNameAndProps(rootDOMNode, 'textArea').length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(rootDOMNode, 'textArea', {className: 'textArea-class'}).length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(rootDOMNode, 'textArea', {"data-skinpart": 'someSkinPart'}).length).toBe(1);
                expect(domSelectors.getComponentsByDisplayNameAndProps(rootDOMNode, 'textArea', {"data-skinpart": 'someSkinPart', "className": 'span-class'}).length).toBe(0);
            });

            it('should check innerText when prop is children and elm is dom element', function(){
                var comp = React.createClass({
                    displayName: 'someComp',
                    render: function () {
                        return React.createElement('div', {},
                            React.createElement('span', {className: 'span-class'}, 'Hello'));
                    }
                });

                root = testUtils.renderIntoDocument(React.createElement(comp, {}));
                var rootDOMNode = ReactDOM.findDOMNode(root);
                domSelectors.setSearchRoot(root);

                expect(domSelectors.getComponentsByDisplayNameAndProps(rootDOMNode, 'span', {children: 'Hello'}).length).toBe(1);
            });
        });

        describe('getComponentPropsByHtmlElement', function () {

            it('should return null if root is not set', function () {
                domSelectors.setSearchRoot(null);
                expect(domSelectors.getComponentPropsByHtmlElement(ReactDOM.findDOMNode(root))).toEqual(null);
            });

            it('should return stringified props of matched component without siteApi, siteData, documentServices, functions and values with _isReactElement property', function () {
                var expectedProps = {
                    id: 'headerCompId',
                    compData: 'headerCompData',
                    siteData: {},
                    siteAPI: {},
                    children: [],
                    parent: ['a', 'b', 'c'],
                    a: {b: {documentServices: {}}},
                    c: {d: {}},
                    e: {f: ['g']},
                    h: {_isReactElement: {}},
                    i: [{}]
                };
                expect(domSelectors.getComponentPropsByHtmlElement(ReactDOM.findDOMNode(root.refs.header))).toEqual(JSON.stringify(expectedProps));
                expect(domSelectors.getComponentPropsByHtmlElement(ReactDOM.findDOMNode(root.refs.header, 'headerComp'))).toEqual(JSON.stringify(expectedProps));
                expect(domSelectors.getComponentPropsByHtmlElement(ReactDOM.findDOMNode(null, 'headerComp'))).toEqual(null);
            });

            it('should return null if no component matched', function () {
                expect(domSelectors.getComponentPropsByHtmlElement(React.createElement('svg'))).toBe(null);
            });

        });

        describe('addAllDisplayNamesToDom', function(){
            it('should add all the displayNames to the dom', function(){
                domSelectors.addAllDisplayNamesToDom(root);
                expect(ReactDOM.findDOMNode(root.refs.header).getAttribute('data-displayname')).toBe('headerComp');
                expect(ReactDOM.findDOMNode(root.refs.body).getAttribute('data-displayname')).toBe('bodyComp');

            });
            it('should add multiple space separated displayNames to a dom node if several displayNames lead to the same dom node', function(){
                domSelectors.addAllDisplayNamesToDom(root);
                var innerComps = testUtils.findAllInRenderedTree(root, function (node) {
                    return _.get(node, 'constructor.displayName') === 'innerComp';
                });
                var innerCompDisplayNames = _.map(innerComps, function (comp) {
                    return ReactDOM.findDOMNode(comp).getAttribute('data-displayname');
                });
                expect(innerCompDisplayNames).toEqual(['innerComp', 'wrapperComp innerComp']);
            });
        });

    });

});
