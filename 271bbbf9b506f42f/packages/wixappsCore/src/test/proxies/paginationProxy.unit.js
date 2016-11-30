define([
    'lodash',
    'react',
    'testUtils',
    'wixappsCore/core/proxyFactory',
    'wixappsCore/proxies/paginationProxy'
], function (
    _,
    React,
    testUtils,
    proxyFactory,
    paginationProxyDefinition
) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;

    describe('pagination proxy', function () {
        describe('if number of side items is 1', function () {
            beforeEach(function () {
                this.givenNumberOfSideItems(1);
            });

            it('should have appropriate pagination state for 1 page', function () {
                this.givenTotalNumberOfPages(1);
                this.givenCurrentPageNumber(1);

                this.expectPaginationState('[1]');
            });

            it('should have appropriate pagination state for each of 2 pages', function () {
                this.givenTotalNumberOfPages(2);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2]');
            });

            it('should have appropriate pagination state for each of 3 pages', function () {
                this.givenTotalNumberOfPages(3);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3]');
            });

            it('should have appropriate pagination state for each of 4 pages', function () {
                this.givenTotalNumberOfPages(4);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [4](4) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [4](4) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3] [4](4) [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [1](1) [2](2) [3](3) [4]');
            });

            it('should have appropriate pagination state for each of 5 pages', function () {
                this.givenTotalNumberOfPages(5);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [4](4) [5](5) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [4](4) [5](5) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3] [4](4) [5](5) [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [1](1) [2](2) [3](3) [4] [5](5) [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [1](1) [2](2) [3](3) [4](4) [5]');
            });

            it('should have appropriate pagination state for each of 6 pages', function () {
                this.givenTotalNumberOfPages(6);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [...] [6](6) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [...] [6](6) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3] [4](4) [5](5) [6](6) [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [1](1) [2](2) [3](3) [4] [5](5) [6](6) [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [1](1) [...] [4](4) [5] [6](6) [>](6)');

                this.givenCurrentPageNumber(6);
                this.expectPaginationState('[<](5) [1](1) [...] [4](4) [5](5) [6]');
            });

            it('should have appropriate pagination state for each of 7 pages', function () {
                this.givenTotalNumberOfPages(7);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [...] [7](7) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [...] [7](7) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3] [4](4) [...] [7](7) [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [1](1) [2](2) [3](3) [4] [5](5) [6](6) [7](7) [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [1](1) [...] [4](4) [5] [6](6) [7](7) [>](6)');

                this.givenCurrentPageNumber(6);
                this.expectPaginationState('[<](5) [1](1) [...] [5](5) [6] [7](7) [>](7)');

                this.givenCurrentPageNumber(7);
                this.expectPaginationState('[<](6) [1](1) [...] [5](5) [6](6) [7]');
            });
        });

        describe('if number of side items is 0', function () {
            beforeEach(function () {
                this.givenNumberOfSideItems(0);
            });

            it('should have appropriate pagination state for 1 page', function () {
                this.givenTotalNumberOfPages(1);
                this.givenCurrentPageNumber(1);

                this.expectPaginationState('[1]');
            });

            it('should have appropriate pagination state for each of 2 pages', function () {
                this.givenTotalNumberOfPages(2);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2]');
            });

            it('should have appropriate pagination state for each of 3 pages', function () {
                this.givenTotalNumberOfPages(3);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [2](2) [3](3) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [3](3) [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [1](1) [2](2) [3]');
            });

            it('should have appropriate pagination state for each of 4 pages', function () {
                this.givenTotalNumberOfPages(4);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [...] [4](4) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [...] [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [...] [3] [4](4) [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [1](1) [...] [4]');
            });

            it('should have appropriate pagination state for each of 5 pages', function () {
                this.givenTotalNumberOfPages(5);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [...] [5](5) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [...] [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [...] [3] [...] [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [...] [4] [5](5) [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [1](1) [...] [5]');
            });

            it('should have appropriate pagination state for each of 6 pages', function () {
                this.givenTotalNumberOfPages(6);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [...] [6](6) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [...] [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [...] [3] [...] [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [...] [4] [...] [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [...] [5] [6](6) [>](6)');

                this.givenCurrentPageNumber(6);
                this.expectPaginationState('[<](5) [1](1) [...] [6]');
            });

            it('should have appropriate pagination state for each of 7 pages', function () {
                this.givenTotalNumberOfPages(7);

                this.givenCurrentPageNumber(1);
                this.expectPaginationState('[1] [...] [7](7) [>](2)');

                this.givenCurrentPageNumber(2);
                this.expectPaginationState('[<](1) [1](1) [2] [...] [>](3)');

                this.givenCurrentPageNumber(3);
                this.expectPaginationState('[<](2) [...] [3] [...] [>](4)');

                this.givenCurrentPageNumber(4);
                this.expectPaginationState('[<](3) [...] [4] [...] [>](5)');

                this.givenCurrentPageNumber(5);
                this.expectPaginationState('[<](4) [...] [5] [...] [>](6)');

                this.givenCurrentPageNumber(6);
                this.expectPaginationState('[<](5) [...] [6] [7](7) [>](7)');

                this.givenCurrentPageNumber(7);
                this.expectPaginationState('[<](6) [1](1) [...] [7]');
            });
        });

        it('should use 1 if neither current page number nor total number of pages are given', function () {
            this.expectPaginationState('[1]');
        });

        it('should use 1 if no number of side items is given', function () {
            this.givenTotalNumberOfPages(9);
            this.givenCurrentPageNumber(5);

            this.expectPaginationState('[<](4) [1](1) [...] [4](4) [5] [6](6) [...] [9](9) [>](6)');
        });

        it('should flag the first item as first', function () {
            this.givenNumberOfSideItems(0);

            this.givenTotalNumberOfPages(1);
            this.givenCurrentPageNumber(1);
            this.expectPaginationFirstFlagState('[1](+)');

            this.givenTotalNumberOfPages(3);
            this.givenCurrentPageNumber(2);
            this.expectPaginationFirstFlagState('[<](+) [1](-) [2](-) [3](-) [>](-)');
        });

        it('should flag gaps and the item for the current page as disabled', function () {
            this.givenNumberOfSideItems(1);
            this.givenTotalNumberOfPages(9);
            this.givenCurrentPageNumber(5);

            this.expectPaginationDisabledFlagState('[<](-) [1](-) [...](+) [4](-) [5](+) [6](-) [...](+) [9](-) [>](-)');
        });

        it('should flag gap items as gap', function () {
            this.givenNumberOfSideItems(0);
            this.givenTotalNumberOfPages(5);
            this.givenCurrentPageNumber(3);

            this.expectPaginationGapFlagState('[<](-) [...](+) [3](-) [...](+) [>](-)');
        });

        it('should use given names for next and previous', function () {
            this.givenTotalNumberOfPages(3);
            this.givenCurrentPageNumber(2);

            this.givenNameForPrevious('Prev');
            this.givenNameForNext('Next');
            this.expectPaginationState('[< Prev](1) [1](1) [2] [3](3) [Next >](3)');

            this.givenNameForPrevious('Newer');
            this.givenNameForNext('Older');
            this.expectPaginationState('[< Newer](1) [1](1) [2] [3](3) [Older >](3)');
        });

        it('should assign an item a key based on its availablity', function () {
            this.givenTotalNumberOfPages(4);

            this.givenCurrentPageNumber(2);
            this.expectPaginationDisabledFlagState('[<](-) [1](-) [2](+) [3](-) [4](-) [>](-)');
            var keyOf2InDisabledState = this.getItemProxyKeyAt(2);

            this.givenCurrentPageNumber(3);
            this.expectPaginationDisabledFlagState('[<](-) [1](-) [2](-) [3](+) [4](-) [>](-)');
            var keyOf2InEnabledState = this.getItemProxyKeyAt(2);

            expect(keyOf2InDisabledState).not.toEqual(keyOf2InEnabledState);
        });

        it('should assign an item a key based on its name', function () {
            this.givenTotalNumberOfPages(10);

            this.givenCurrentPageNumber(5);
            this.expectPaginationState('[<](4) [1](1) [...] [4](4) [5] [6](6) [...] [10](10) [>](6)');
            var keyOf4 = this.getItemProxyKeyAt(3);

            this.givenCurrentPageNumber(6);
            this.expectPaginationState('[<](5) [1](1) [...] [5](5) [6] [7](7) [...] [10](10) [>](7)');
            var keyOf5 = this.getItemProxyKeyAt(3);

            expect(keyOf4).not.toEqual(keyOf5);
        });

        beforeEach(function () {
            var compProps = {};

            this.givenNumberOfSideItems = function (number) {
                compProps.numberOfSideItems = number.toString();
            };

            this.givenCurrentPageNumber = function (number) {
                compProps.currentPageNumber = number.toString();
            };

            this.givenTotalNumberOfPages = function (number) {
                compProps.totalNumberOfPages = number.toString();
            };

            this.givenNameForPrevious = function (name) {
                compProps.nameForPrevious = name;
            };

            this.givenNameForNext = function (name) {
                compProps.nameForNext = name;
            };

            this.expectPaginationState = function (state) {
                expect(getPaginationState()).toEqual(state);
            };

            function getPaginationState() {
                var itemStates = _.map(getItemProxies(), function (itemProxy) {
                    return '[' + itemProxy.getVar('paginationItemName') + ']' +
                        (itemProxy.getVar('paginationItemDisabled') ?
                            '' : '(' + itemProxy.getVar('paginationItemValue') + ')');
                });
                return itemStates.join(' ');
            }

            this.expectPaginationFirstFlagState = function (state) {
                expect(getPaginationFirstFlagState()).toEqual(state);
            };

            function getPaginationFirstFlagState() {
                var itemStates = _.map(getItemProxies(), function (itemProxy) {
                    return '[' + itemProxy.getVar('paginationItemName') + ']' +
                            '(' + (getFlagFirstOf(itemProxy) ? '+' : '-') + ')';
                });
                return itemStates.join(' ');
            }

            function getFlagFirstOf(itemProxy) {
                return itemProxy.getVar('paginationItemFirst');
            }

            this.expectPaginationDisabledFlagState = function (state) {
                expect(getPaginationDisabledFlagState()).toEqual(state);
            };

            this.getItemProxyKeyAt = function(index) {
                var itemProxy = getItemProxies()[index];
                return itemProxy.props.refInParent;
            };

            function getPaginationDisabledFlagState() {
                var itemStates = _.map(getItemProxies(), function (itemProxy) {
                    return '[' + itemProxy.getVar('paginationItemName') + ']' +
                            '(' + (getFlagDisabledOf(itemProxy) ? '+' : '-') + ')';
                });
                return itemStates.join(' ');
            }

            function getFlagDisabledOf(itemProxy) {
                return itemProxy.getVar('paginationItemDisabled');
            }

            this.expectPaginationGapFlagState = function (state) {
                    expect(getPaginationGapFlagState()).toEqual(state);
            };

            function getPaginationGapFlagState() {
                var itemStates = _.map(getItemProxies(), function (itemProxy) {
                    return '[' + itemProxy.getVar('paginationItemName') + ']' +
                            '(' + (getFlagGapOf(itemProxy) ? '+' : '-') + ')';
                });
                return itemStates.join(' ');
            }

            function getFlagGapOf(itemProxy) {
                return itemProxy.getVar('paginationItemGap');
            }

            function getProxy() {
                return testUtils.proxyBuilder(getProxyName(), getProxyProps());
            }

            function getProxyProps() {
                return testUtils.proxyPropsBuilder(getProxyViewDef());
            }

            function getProxyViewDef() {
                return {
                    comp: _.merge({
                        name: getProxyName(),
                        templates: {
                            item: {
                                comp: {
                                    name: getItemProxyName()
                                }
                            },
                            disabledItem: {
                                comp: {
                                    name: getDisabledItemProxyName()
                                }
                            }
                        }
                    }, compProps)
                };
            }

            function getItemProxies() {
                return withProxyClasses(function () {
                    return getItemProxiesFrom(getProxy());
                });
            }

            function getItemProxiesFrom(proxy) {
                return ReactTestUtils.findAllInRenderedTree(proxy, function (component) {
                    return componentIsItemProxy(component) || componentIsDisabledItemProxy(component);
                });
            }

            function componentIsItemProxy(component) {
                return ReactTestUtils.isCompositeComponentWithType(component, getItemProxyClass());
            }

            function getItemProxyClass() {
                return proxyFactory.getProxyClass(getItemProxyName(), true);
            }

            function componentIsDisabledItemProxy(component) {
                return ReactTestUtils.isCompositeComponentWithType(component, getDisabledItemProxyClass());
            }

            function getDisabledItemProxyClass() {
                return proxyFactory.getProxyClass(getDisabledItemProxyName(), true);
            }

            function withProxyClasses(callback) {
                defineProxyClasses();
                var returnValue = callback();
                undefineProxyClasses();
                return returnValue;
            }

            function defineProxyClasses() {
                defineProxyClass();
                defineItemProxyClass();
                defineDisabledProxyClass();
            }

            function defineProxyClass() {
                proxyFactory.register(getProxyName(), paginationProxyDefinition);
            }

            function defineItemProxyClass() {
                proxyFactory.register(getItemProxyName(), getItemProxyDefinition());
            }

            function defineDisabledProxyClass() {
                proxyFactory.register(getDisabledItemProxyName(), getItemProxyDefinition());
            }

            function undefineProxyClasses() {
                undefineProxyClass();
                undefineItemProxyClass();
                undefineDisabledItemProxy();
            }

            function undefineProxyClass() {
                proxyFactory.invalidate(getProxyName());
            }

            function undefineItemProxyClass() {
                proxyFactory.invalidate(getItemProxyName());
            }

            function undefineDisabledItemProxy() {
                proxyFactory.invalidate(getDisabledItemProxyName());
            }

            function getItemProxyDefinition() {
                return testUtils.stupidProxy;
            }

            function getItemProxyName() {
                return 'Item';
            }

            function getDisabledItemProxyName() {
                return 'DisabledItem';
            }

            function getProxyName() {
                return 'Pagination';
            }
        });
    });
});
