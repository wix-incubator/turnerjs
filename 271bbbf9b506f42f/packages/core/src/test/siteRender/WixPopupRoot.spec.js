define([
    'lodash',
    'react',
    'reactDOM',
    'santaProps',
    'testUtils',
    'definition!core/siteRender/WixPopupRoot',
    'core/siteRender/WixPageReact'
], function (_,
             React,
             reactDOM,
             santaProps,
             testUtils,
             wixPopupRootDef,
             WixPageReactClass) {
    'use strict';

    var reactTestUtils = React.addons.TestUtils;

    describe('WixPopup class', function () {
        function getWixPopupRootClass() {
            return wixPopupRootDef(_, React, reactDOM, santaProps, WixPageReactClass);
        }

        describe('render:', function () {
            var siteDataMock;
            var siteAPIMock;
            var WixPopupRootClass;
            var loadedStylesMock = {};

            function renderPopupRoot(sets) {
                var wixPopupRoot;

                siteAPIMock = testUtils.mockFactory.mockSiteAPI(siteDataMock);

                siteDataMock.getPageData.and.returnValue({structure: {}});
                var origGetRootProps = santaProps.componentPropsBuilder.getRootProps;
                santaProps.componentPropsBuilder.getRootProps = function() {
                    return _.assign(origGetRootProps.apply(this, arguments), {testProp: sets.testPropValue});
                };

                wixPopupRoot = reactTestUtils.renderIntoDocument(React.createElement(WixPopupRootClass, {
                    siteData: siteDataMock,
                    siteAPI: siteAPIMock,
                    loadedStyles: loadedStylesMock,
                    siteRootStyle: sets.siteRootStyle,
                    currentPopupId: sets.currentPopupId
                }));


                return wixPopupRoot.render();
            }

            beforeEach(function () {
                WixPopupRootClass = getWixPopupRootClass();
                siteDataMock = testUtils.mockFactory.mockSiteData();
                spyOn(siteDataMock, 'getCurrentPopupId');
                spyOn(siteDataMock, 'getPageData');
                spyOn(WixPageReactClass.prototype, 'componentDidMount');
                spyOn(WixPageReactClass.prototype, 'render').and.returnValue(React.DOM.div());
                spyOn(WixPageReactClass.prototype, 'componentWillMount');
            });

            it('should return an empty "null" if there is no popup', function () {
                expect(renderPopupRoot({currentPopupId: undefined})).toBe(null);
            });

            it('should render popup page if it exist to a "POPUPS_ROOT"', function () {
                var renderedPopupContainer = renderPopupRoot({
                    currentPopupId: 'testId',
                    testPropValue: 'testPropValue',

                    siteRootStyle: {
                        paddingBottom: 40,
                        width: 980,
                        height: 100
                    }
                });

                expect(renderedPopupContainer.key).toBe('POPUPS_ROOT');
                expect(renderedPopupContainer.props.id).toBe('POPUPS_ROOT');
                expect(renderedPopupContainer.props.className).toBe('POPUPS_ROOT');

                var wrapper = renderedPopupContainer.props.children[0];
                expect(wrapper.key).toBe('POPUPS_WRAPPER');

                var insertedChild = wrapper.props.children[0];
                expect(reactTestUtils.isElementOfType(insertedChild, WixPageReactClass)).toBe(true);
                expect(insertedChild.props.testProp).toBe('testPropValue');
            });
        });

        describe('componentDidMount:', function () {
            beforeEach(function () {
                this.WixPopupRootClass = getWixPopupRootClass();
                spyOn(WixPageReactClass.prototype, 'isComponentActive').and.returnValue(true);
            });

            it('should focus the component DOM node', function () {
                var DOMNode = {
                    focus: jasmine.createSpy('focus')
                };

                spyOn(reactDOM, 'findDOMNode').and.returnValue(DOMNode);

                this.WixPopupRootClass.prototype.componentDidMount();

                expect(reactDOM.findDOMNode).toHaveBeenCalledWith(this.WixPopupRootClass.prototype);
                expect(DOMNode.focus).toHaveBeenCalled();
            });
        });
    });
});
