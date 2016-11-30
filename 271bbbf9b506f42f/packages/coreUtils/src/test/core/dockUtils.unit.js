define(['lodash', 'coreUtils/core/dockUtils'], function (_, dockUtils) {
    'use strict';

    describe('dockCalcUtils', function() {

        beforeEach(function(){
            this.pageBottomMargin = 0;
            this.screenWidth = 1000;
            this.screenHeight = 1200;
            this.siteWidth = 980;
            this.siteX = -10;
        });

        it('should throw error for no docking structure', function () {
            var layout = {
                width: 100,
                height: 100
            };

            expect(function testApplyDockedStyle() {
                dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX);
            }.bind(this)).toThrow();
        });

        it('should return right value according to the component docked right value', function() {
            var layout = {
                docked: {
                    right: {
                        px: 100
                    }
                }
            };

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                right: '100px'
            });
        });

        it('should return left value according to the component docked left value', function() {
            var layout = {
                docked: {
                    left: {
                        px: 100
                    }
                }
            };

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                left: '100px'
            });
        });

        it('should return bottom value according to the component docked bottom value', function() {
            var layout = {
                docked: {
                    bottom: {
                        px: 100
                    }
                }
            };

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                bottom: '100px'
            });
        });

        it('should return bottom value without page bottom margin for a normal docked component', function() {
            var layout = {
                docked: {
                    bottom: {
                        px: 100
                    }
                }
            };
            this.pageBottomMargin = 40;

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                bottom: '100px'
            });
        });

        it('should return bottom value with page bottom margin for a fixed position docked component', function() {
            var layout = {
                fixedPosition: true,
                docked: {
                    bottom: {
                        px: 100
                    }
                }
            };
            this.pageBottomMargin = 40;

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                bottom: '140px'
            });
        });

        it('should return top value according to the component docked bottom value', function() {
            var layout = {
                docked: {
                    top: {
                        px: 100
                    }
                }
            };

            expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                top: '100px'
            });
        });

        describe('horizontal and vertical centering', function(){
            it('should return margin auto value if the component has docked hCenter value', function() {
                var layout = {
                    docked: {
                        hCenter: {
                            px: 10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                    margin: 'auto'
                });
            });

            it('should return margin auto value if the component has docked vCֹenter value', function() {
                var layout = {
                    docked: {
                        vCenter: {
                            px: 10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                    margin: 'auto'
                });
            });

            it('should double all the values for horizontal center', function() {
                var layout = {
                    docked: {
                        hCenter: {
                            px: 10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                    left: '20px',
                    margin: 'auto'
                });
            });

            it('should double all the values for vertical center', function() {
                var layout = {
                    docked: {
                        vCenter: {
                            px: 10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                    top: '20px',
                    margin: 'auto'
                });
            });
        });

        describe('style with calc', function () {
            it('should return only px when it has vh and px', function () {

                var layout = {
                    docked: {
                        top: {
                            vh: 100,
                            px: -10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {top: 10}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight)).toContain({
                    top: '1190px'
                });
            });


            it('should return style with % and px calc', function () {
                var layout = {
                    docked: {
                        top: {
                            'pct': 100,
                            px: -10
                        }
                    }
                };

                expect(dockUtils.applyDockedStyle(layout, {top: 10}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight)).toContain({
                    top: 'calc(100% + -10px)'
                });
            });
        });

        describe('relative to screen dock', function(){
            describe('dock vw from left and right', function(){
                it('should calc left and width according to dock data', function(){
                    var layout = {
                        docked: {
                            left: {
                                vw: 10
                            },
                            right: {
                                vw: 10
                            }
                        }
                    };

                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                        left: '90px' // 10% screenWidth, -10px of siteX
                    });
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                        width: '800px' // 80% screenWidth
                    });
                });

                it('should considering offset in pixels for left and width calculation', function(){
                    var layout = {
                        docked: {
                            left: {
                                vw: 10,
                                px: 20
                            },
                            right: {
                                vw: 10,
                                px: 20
                            }
                        }
                    };

                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                        left: '110px' // 10% screenWidth + 20px = 120, -10px siteX = 110
                    });
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                        width: '760px' // 80% screenWidth - 40px
                    });
                });

                it('should calculate the width and left from the site width if the screen width is smaller than the site width', function(){
                    this.screenWidth = 500;
                    this.siteWidth = 1000;
                    this.siteX = 0;

                    var layout = {
                        docked: {
                            left: {
                                vw: 10
                            },
                            right: {
                                vw: 10
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX)).toContain({
                        left: '100px',
                        width: '800px'
                    });

                });

                it('should give y from structure if the component is stretched to screen top and bottom vh', function(){
                    this.screenWidth = 500;
                    this.screenHeight = 1200;
                    this.siteWidth = 1000;
                    this.siteX = 0;

                    var layout = {
                        y: 100,
                        docked: {
                            top: {
                                vh: 0
                            },
                            bottom: {
                                vh: 10
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight)).toContain({
                        top: '100px'
                    });

                });
            });


            describe('vh stretch to screen', function(){
                it('should give y from structure if the component is stretched to screen top and bottom vh', function(){
                    this.screenWidth = 500;
                    this.screenHeight = 1200;
                    this.siteWidth = 1000;
                    this.siteX = 0;

                    var layout = {
                        y: 100,
                        docked: {
                            top: {
                                vh: 0
                            },
                            bottom: {
                                vh: 10
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight)).toContain({
                        top: '100px'
                    });

                });

                it('should return height based on screen height', function(){
                    this.screenWidth = 500;
                    this.screenHeight = 1200;
                    this.siteWidth = 1000;
                    this.siteX = 0;

                    var layout = {
                        docked: {
                            top: {
                                vh: 0
                            },
                            bottom: {
                                vh: 50
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight)).toContain({
                        height: '600px'
                    });

                });

                it('should have empty height if stretched vertically but not to screen (vh)', function() {
                    var layout = {
                        docked: {
                            top: {
                                px: 0
                            },
                            bottom: {
                                pct: 50
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight).height).toEqual('');
                });

                it('should add bottom margin if stretched to screen height and fixed position', function() {
                    this.pageBottomMargin = 150;
                    var layout = {
                        fixedPosition: true,
                        docked: {
                            top: {
                                vh: 0
                            },
                            bottom: {
                                vh: 0
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight).bottom).toBe('150px');
                });

                it('should not add bottom margin in case of stretched to screen height and not fixed position', function() {
                    this.pageBottomMargin = 150;
                    var layout = {
                        fixedPosition: false,
                        docked: {
                            top: {
                                vh: 0
                            },
                            bottom: {
                                vh: 0
                            }
                        }
                    };
                    expect(dockUtils.applyDockedStyle(layout, {}, this.pageBottomMargin, this.screenWidth, this.siteWidth, this.siteX, this.screenHeight).bottom).not.toBeDefined();
                });
            });
        });
    });
});
