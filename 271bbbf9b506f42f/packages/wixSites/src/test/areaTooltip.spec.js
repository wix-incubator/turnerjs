/**
 * Tests the core logic of the AreaTooltip component.
 * @author yevhenp (Yevhen Pavliuk)
 */
define([
    'testUtils',
    'utils',
    'react',
    'wixSites/components/areaTooltip/areaTooltip',
    'reactDOM'
], function(testUtils, utils, React, areaTooltipComp, ReactDOM) {
    'use strict';
    describe('AreaTooltip component', function () {
        var areaTooltip, createAndRenderAreaTooltip, makeAreaTooltipClassName;

        beforeEach(function () {
            /**
             * Makes an instance of the component.
             * @param {string=} text
             * @param {string=} position
             */
            createAndRenderAreaTooltip = function(text, position) {
                var props = testUtils.mockFactory.mockProps()
                    .setCompData({tooltipText: text})
                    .setCompProp({tooltipPosition: position})
                    .setSkin('wysiwyg.common.components.areatooltip.viewer.skins.AreaTooltipSkin');
                props.structure.componentType = 'wysiwyg.common.components.areatooltip.viewer.AreaTooltip';

                spyOn(props.siteAPI, 'registerReLayoutPending');

                areaTooltip = testUtils.getComponentFromDefinition(areaTooltipComp, props);
            };

            /**
             * Makes a class name for the instance of the component.
             * The name is a concatenation of the component's style ID and the given class name.
             * @param {string} className
             * @returns {string}
             */
            makeAreaTooltipClassName = function(/*className*/) {
                return utils.cssUtils.concatenateStyleIdToClassName(
                    areaTooltip.props.styleId, areaTooltip.props.compProp.tooltipPosition);
            };
        });

        it('should have isTooltipShown false in the initial state', function() {
            createAndRenderAreaTooltip();
            expect(areaTooltip.state).toEqual(jasmine.objectContaining({
                isTooltipShown: false
            }));
        });

        it('should give the expected skin properties for a top-positioned hidden tooltip', function() {
            createAndRenderAreaTooltip('Top-positioned hidden tooltip', 'top');
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('top')
                },
                content: {
                    className: '',
                    children: 'Top-positioned hidden tooltip'
                },
                tooltip: {
                    style: {
                        display: 'none'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        it('should give the expected skin properties for a top-positioned shown tooltip', function() {
            createAndRenderAreaTooltip('Top-positioned shown tooltip', 'top');
            areaTooltip.setState({
                isTooltipShown: true
            });
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('top')
                },
                content: {
                    className: '',
                    children: 'Top-positioned shown tooltip'
                },
                tooltip: {
                    style: {
                        display: 'block'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        it('should give the expected skin properties for a right-positioned hidden tooltip', function() {
            createAndRenderAreaTooltip('Right-positioned hidden tooltip', 'right');
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('right')
                },
                content: {
                    className: '',
                    children: 'Right-positioned hidden tooltip'
                },
                tooltip: {
                    style: {
                        display: 'none'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        xit('should give the expected skin properties for a right-positioned shown tooltip', function(done) {
            createAndRenderAreaTooltip('Right-positioned shown tooltip', 'right');
            areaTooltip.setState({
                isTooltipShown: true
            }, function(){
                expect(areaTooltip.getSkinProperties()).toEqual({
                    arrow: {
                        className: makeAreaTooltipClassName('right')
                    },
                    content: {
                        className: '',
                        children: 'Right-positioned shown tooltip'
                    },
                    tooltip: {
                        style: {
                            display: 'block'
                        }
                    },
                    tooltipArea: {
                        onMouseOver: jasmine.any(Function),
                        onMouseOut: jasmine.any(Function)
                    }
                });
                done();
            });

        });

        it('should give the expected skin properties for a bottom-positioned hidden tooltip', function() {
            createAndRenderAreaTooltip('Bottom-positioned hidden tooltip', 'bottom');
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('bottom')
                },
                content: {
                    className: '',
                    children: 'Bottom-positioned hidden tooltip'
                },
                tooltip: {
                    style: {
                        display: 'none'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        it('should give the expected skin properties for a bottom-positioned shown tooltip', function() {
            createAndRenderAreaTooltip('Bottom-positioned shown tooltip', 'bottom');
            areaTooltip.setState({
                isTooltipShown: true
            });
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('bottom')
                },
                content: {
                    className: '',
                    children: 'Bottom-positioned shown tooltip'
                },
                tooltip: {
                    style: {
                        display: 'block'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        it('should give the expected skin properties for a left-positioned hidden tooltip', function() {
            createAndRenderAreaTooltip('Left-positioned hidden tooltip', 'left');
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('left')
                },
                content: {
                    className: makeAreaTooltipClassName('left'),
                    children: 'Left-positioned hidden tooltip'
                },
                tooltip: {
                    style: {
                        display: 'none'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        it('should give the expected skin properties for a left-positioned shown tooltip', function() {
            createAndRenderAreaTooltip('Left-positioned shown tooltip', 'left');
            areaTooltip.setState({
                isTooltipShown: true
            });
            expect(areaTooltip.getSkinProperties()).toEqual({
                arrow: {
                    className: makeAreaTooltipClassName('left')
                },
                content: {
                    className: makeAreaTooltipClassName('left'),
                    children: 'Left-positioned shown tooltip'
                },
                tooltip: {
                    style: {
                        display: 'block'
                    }
                },
                tooltipArea: {
                    onMouseOver: jasmine.any(Function),
                    onMouseOut: jasmine.any(Function)
                }
            });
        });

        describe('user interaction', function() {
            var mouseOutOnTooltipArea, mouseOverOnTooltipArea;

            beforeEach(function() {
                createAndRenderAreaTooltip();

                mouseOverOnTooltipArea = function() {
                    React.addons.TestUtils.Simulate.mouseOver(ReactDOM.findDOMNode(areaTooltip.refs.tooltipArea));
                };

                mouseOutOnTooltipArea = function() {
                    React.addons.TestUtils.Simulate.mouseOut(ReactDOM.findDOMNode(areaTooltip.refs.tooltipArea));
                };
            });

            it('should change the component\'s state to show the tooltip on mouse over on the tooltip area ', function() {
                mouseOverOnTooltipArea();
                expect(areaTooltip.state).toEqual(jasmine.objectContaining({
                    isTooltipShown: true
                }));
            });

            it('should change the component\'s state to hide the tooltip on mouse out on the tooltip area ', function() {
                mouseOverOnTooltipArea();
                mouseOutOnTooltipArea();
                expect(areaTooltip.state).toEqual(jasmine.objectContaining({
                    isTooltipShown: false
                }));
            });

             it('should register a re-layout each time when a tooltip is shown', function() {
                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(0);
                mouseOverOnTooltipArea();
                expect(areaTooltip.props.siteAPI.registerReLayoutPending).toHaveBeenCalled();
                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(1);
                mouseOutOnTooltipArea();

                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(1);
                mouseOverOnTooltipArea();
                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(2);
                mouseOutOnTooltipArea();

                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(2);
                mouseOverOnTooltipArea();
                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(3);
                mouseOutOnTooltipArea();
                expect(areaTooltip.props.siteAPI.registerReLayoutPending.calls.count()).toBe(3);
             });
        });
    });
});
