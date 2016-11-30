/**
 * Created by alexandergonchar on 8/28/14.
 */
define(['lodash', 'Squire', 'layout/specificComponents/svgShape/svgScaler'],
    function (_, Squire, scaler) {
        'use strict';

        function Elem(childNodeName) {
            var groupElem = {
                setAttribute: jasmine.createSpy(),
                childNodes: [
                    {
                        nodeName: childNodeName,
                        setAttribute: jasmine.createSpy()
                    }
                ]
            };
            this.style = { };


            this.getAttribute = function () {
            };
            this.setAttribute = jasmine.createSpy();
            this.getElementsByTagName = function () {
                return [groupElem];
            };
            this.hasAttribute = function () {
                return true;
            };
            this.getFirstChildNode = function () {
                return this.getElementsByTagName()[0].childNodes[0];
            };
            this.getGroupElem = function () {
                return groupElem;
            };
        }

        function expectNothingWasSet(elem) {
            expect(elem.getGroupElem().setAttribute.calls.count()).toEqual(0);
            expect(elem.getGroupElem().style).toBeUndefined();
            expect(elem.style).toEqual({});
            expect(elem.getFirstChildNode().style).toBeUndefined({});
            expect(elem.getFirstChildNode().setAttribute.calls.count()).toEqual(0);
        }

        describe('svgScaler', function () {

            describe('scale', function () {
                it('should not change sizes when requested size is the same as current', function () {
                    var elem = new Elem(),
                        requested = {
                            width: 100,
                            height: 50
                        },
                        current = requested;

                    // act
                    scaler.scale(elem, requested, current, 1, true);

                    // aasert
                    expectNothingWasSet(elem);
                });

                it('should not change sizes when requested size delta is less than one', function () {
                    var elem = new Elem(),
                        current = {
                            width: 100,
                            height: 50
                        },
                        requested = {
                            width: 99.5,
                            height: 50.5
                        };

                    // act
                    scaler.scale(elem, requested, current, 1, true);

                    // aasert
                    expect(elem.style).toEqual({});
                });
            });

            describe('scale', function () {
                var injector,
                    polygonScalerMock, lineScalerMock, pathScalerMock, rectScalerMock, circleScalerMock, ellipseScalerMock,
                    polylineScalerMock,
                    theScaler;

                function shouldCallScaler(name, scalerMock) {
                    var elem = new Elem(name),
                        requested = {width: 50, height: 100},
                        current = {width: 100, height: 50};

                    theScaler.scale(elem, requested, current, 1, true);

                    expect(scalerMock.scale).toHaveBeenCalledWith(elem.getFirstChildNode(), 0.5, 0.5);
                    expect(elem.getFirstChildNode().style).toBeUndefined({}); // must be empty because we mock scale call
                    expect(elem.getFirstChildNode().setAttribute.calls.count()).toEqual(0); // must be empty because we mock scale call
                }

                beforeEach(function (done) {
                    pathScalerMock = {scale: jasmine.createSpy('path scale')};
                    polygonScalerMock = {scale: jasmine.createSpy('polygon scale')};
                    rectScalerMock = {scale: jasmine.createSpy('rect scale')};
                    circleScalerMock = {scale: jasmine.createSpy('circle scale')};
                    ellipseScalerMock = {scale: jasmine.createSpy('ellipse scale')};
                    polylineScalerMock = {scale: jasmine.createSpy('polyline scale')};
                    lineScalerMock = {scale: jasmine.createSpy('line scale')};


                    injector = new Squire();
                    injector.mock('layout/specificComponents/svgShape/svgPathScaler', pathScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgPolygonScaler', polygonScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgRectScaler', rectScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgCircleScaler', circleScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgEllipseScaler', ellipseScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgPolylineScaler', polylineScalerMock);
                    injector.mock('layout/specificComponents/svgShape/svgLineScaler', lineScalerMock);
                    injector.require(['layout/specificComponents/svgShape/svgScaler'], function (svgScaler) {
                        theScaler = svgScaler;
                        done();
                    });
                });

                it('should call the path scaler', function () {
                    shouldCallScaler('path', pathScalerMock);
                });

                it('should call the polygon scaler', function () {
                    shouldCallScaler('polygon', polygonScalerMock);
                });

                it('should call the rect scaler', function () {
                    shouldCallScaler('rect', rectScalerMock);
                });

                it('should call the circle scaler', function () {
                    shouldCallScaler('circle', circleScalerMock);
                });

                it('should call the ellipse scaler', function () {
                    shouldCallScaler('ellipse', ellipseScalerMock);
                });

                it('should call the polyline scaler', function () {
                    shouldCallScaler('polyline', polylineScalerMock);
                });

                it('should call the line scaler', function () {
                    shouldCallScaler('line', lineScalerMock);
                });

            });

            describe('scale', function () {
                var injector,
                    polygonScalerMock,
                    theScaler;

                beforeEach(function (done) {
                    polygonScalerMock = {scale: jasmine.createSpy('polygon scale')};

                    injector = new Squire();
                    injector.mock('layout/specificComponents/svgShape/svgPolygonScaler', polygonScalerMock);
                    injector.require(['layout/specificComponents/svgShape/svgScaler'], function (svgScaler) {
                        theScaler = svgScaler;
                        done();
                    });
                });

                it('should set translate with aspect ration', function () {
                    var elem = new Elem('polygon'),
                        requested = {width: 50, height: 100},
                        currentBox = {width: 100, height: 50, x: 10, y: 20};

                    // act
                    theScaler.scale(elem, requested, currentBox, 1, true);

                    // assert
                    expect(elem.getGroupElem().setAttribute).toHaveBeenCalledWith('transform', 'translate(-4.5,-9.5)');
                    expect(elem.getGroupElem().style).toBeUndefined(); // must be empty because we mock scale call
                });

                it('should set translate with no aspect ration', function () {
                    var elem = new Elem('polygon'),
                        requested = {width: 50, height: 100},
                        currentBox = {width: 100, height: 50, x: 10, y: 20};

                    // act
                    theScaler.scale(elem, requested, currentBox, 1, false);

                    // assert
                    expect(elem.getGroupElem().setAttribute).toHaveBeenCalledWith('transform', 'translate(-4.5,-39.5)');
                    expect(elem.getGroupElem().style).toBeUndefined(); // must be empty because we mock scale call
                });

                it('should set sizes to svgElement with aspect ration when growing in width', function () {
                    var elem = new Elem('polygon'),
                        currentBox = {width: 100, height: 50, x: 10, y: 20},
                        requested = {width: 200, height: 60};


                    // act
                    theScaler.scale(elem, requested, currentBox, 1, true);

                    // assert
                    expect(elem.style.width).toBe('121px');
                    expect(elem.style.height).toBe('61px');
                    expect(polygonScalerMock.scale).toHaveBeenCalledWith(elem.getFirstChildNode(), 1.2, 1.2);
                });

                it('should set sizes to svgElement with aspect ration when growing in height', function () {
                    var elem = new Elem('polygon'),
                        currentBox = {width: 100, height: 50, x: 10, y: 20},
                        requested = {width: 100, height: 100};


                    // act
                    theScaler.scale(elem, requested, currentBox, 1, true);

                    // assert
                    expect(elem.style.width).toBe('101px');
                    expect(elem.style.height).toBe('51px');
                    expect(polygonScalerMock.scale).toHaveBeenCalledWith(elem.getFirstChildNode(), 1, 1);
                });

                it('should set sizes to svgElement with no aspect ration when growing in width', function () {
                    var elem = new Elem('polygon'),
                        currentBox = {width: 100, height: 50, x: 10, y: 20},
                        requested = {width: 200, height: 60};


                    // act
                    theScaler.scale(elem, requested, currentBox, 1, false);

                    // assert
                    expect(elem.style.width).toBe('201px');
                    expect(elem.style.height).toBe('61px');
                    expect(polygonScalerMock.scale).toHaveBeenCalledWith(elem.getFirstChildNode(), 2, 1.2);
                });

                it('should set sizes to svgElement with no aspect ration when growing in height', function () {
                    var elem = new Elem('polygon'),
                        currentBox = {width: 100, height: 50, x: 10, y: 20},
                        requested = {width: 100, height: 100};


                    // act
                    theScaler.scale(elem, requested, currentBox, 1, false);

                    // assert
                    expect(elem.style.width).toBe('101px');
                    expect(elem.style.height).toBe('101px');
                    expect(polygonScalerMock.scale).toHaveBeenCalledWith(elem.getFirstChildNode(), 1, 2);
                });

                it('should set sizes to svgElement including strokeWidth', function () {
                    var elem = new Elem('polygon'),
                        currentBox = {width: 100, height: 50, x: 10, y: 20},
                        requested = {width: 100, height: 100};


                    // act
                    theScaler.scale(elem, requested, currentBox, 5, false);

                    // assert
                    expect(elem.style.width).toBe('105px');
                    expect(elem.style.height).toBe('105px');
                });

            });

        });
    });
