/**
 * Created by alexandergonchar on 8/28/14.
 */
define([
    'layout/specificComponents/svgShape/svgPathScaler',
    'layout/specificComponents/svgShape/svgPolygonScaler',
    'layout/specificComponents/svgShape/svgCircleScaler',
    'layout/specificComponents/svgShape/svgRectScaler',
    'layout/specificComponents/svgShape/svgEllipseScaler',
    'layout/specificComponents/svgShape/svgPolylineScaler',
    'layout/specificComponents/svgShape/svgLineScaler'], function (pathScaler, polygonScaler, circleScaler, rectScaler, ellipseScaler, polylineScaler, lineScaler) {
    'use strict';

    function Elem(points) {
        this.getAttribute = function () {
            return points;
        };
        this.setAttribute = jasmine.createSpy('setAttribute');
    }

    describe('svgPathScaler', function () {

        it('should scale simple integer values and commands', function () {
            var elem = new Elem('M10 10 H 90 V 90 H 10 L 10 10'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M20 30H180V270H20L20 30';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should handle empty array', function () {
            var elem = new Elem(''),
                scaleX = 2,
                scaleY = 3,
                expected = '';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should scale commands with case sensitivity', function () {
            var elem = new Elem('M10 10 H 90 v 90 h 10 L 10 10'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M20 30H180v270h20L20 30';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should scale commands with superfluous white space and separators omitted', function () {
            var elem = new Elem('M.1.1H 90 v90 h10 L10 10'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M0.2 0.3H180v270h20L20 30';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should scale commands with multiple arc values under a single function', function () {
            var elem = new Elem('M.1.1a25,25-30 0,1 50-25 25,50 -30 0,1 50,-25'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M0.2 0.3a50 75 -0.125 0 1 100 -75 50 150 -0.125 0 1 100 -75';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should not scale arc values when number of parameters are not 7', function () {
            var elem = new Elem('M.1.1a25,50 -30 0,1 50'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M0.2 0.3a25 50 -30 0 1 50';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });

        it('should scale commands with multiple horizontal line values under a single function', function () {
            var elem = new Elem('M.1.1h25 25-30'),
                scaleX = 2,
                scaleY = 3,
                expected = 'M0.2 0.3h50,50,-60';

            pathScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('d', expected);
        });



    });

    describe('svgPolygonScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3,
                expected = '2,6 6,12 10,18';

            polygonScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('points', expected);
        });

        it('should handle empty array', function () {
            var elem = new Elem(''),
                scaleX = 2,
                scaleY = 3,
                expected = '';

            polygonScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('points', expected);
        });

    });

    describe('svgCircleScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'cx': return 20;
                    case 'cy': return 30;
                    case 'r': return 40;
                }
            };

            circleScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('cx', 40);
            expect(elem.setAttribute).toHaveBeenCalledWith('cy', 60);
            expect(elem.setAttribute).toHaveBeenCalledWith('r', 80);
        });

        it('should handle undefined attributes', function () {
            var elem = new Elem(),
                scaleX = 2,
                scaleY = 3;

            circleScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(0);
        });

    });

    describe('svgRectScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'width': return 20;
                    case 'height': return 30;
                    case 'rx': return 50;
                    case 'ry': return 60;
                    case 'x': return 20;
                    case 'y': return 30;
                }
            };

            rectScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('width', 40);
            expect(elem.setAttribute).toHaveBeenCalledWith('height', 90);
            expect(elem.setAttribute).toHaveBeenCalledWith('rx', 100);
            expect(elem.setAttribute).toHaveBeenCalledWith('ry', 180);
            expect(elem.setAttribute).toHaveBeenCalledWith('x', 40);
            expect(elem.setAttribute).toHaveBeenCalledWith('y', 90);
        });

        it('should handle empty array', function () {
            var elem = new Elem(''),
                scaleX = 2,
                scaleY = 3;

            rectScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(0); // nothing to scale
        });

    });

    describe('svgEllipseScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'cx': return 20;
                    case 'cy': return 30;
                    case 'rx': return 40;
                    case 'ry': return 50;
                }
            };

            ellipseScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('cx', 40);
            expect(elem.setAttribute).toHaveBeenCalledWith('cy', 90);
            expect(elem.setAttribute).toHaveBeenCalledWith('rx', 80);
            expect(elem.setAttribute).toHaveBeenCalledWith('ry', 150);
        });

        it('should set attributes only for cx/rx pair', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'cx': return 20;
                    case 'rx': return 40;
                    case 'ry': return 50;
                }
            };

            ellipseScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(2);
        });

        it('should not set attributes when no (cx/rx | cy/ry) pair', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'rx': return 40;
                    case 'ry': return 50;
                }
            };

            ellipseScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(0);
        });

        it('should handle undefined attributes', function () {
            var elem = new Elem(),
                scaleX = 2,
                scaleY = 3;

            ellipseScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(0);
        });

    });

    describe('svgPolylineScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3,
                expected = '2,6 6,12 10,18';

            polylineScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('points', expected);
        });

        it('should handle empty array', function () {
            var elem = new Elem(''),
                scaleX = 2,
                scaleY = 3,
                expected = '';

            polylineScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('points', expected);
        });

    });

    describe('svgLineScaler', function () {

        it('should scale simple integer values', function () {
            var elem = new Elem('1,2 3,4 5,6'),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'x1': return 20;
                    case 'y1': return 30;
                    case 'x2': return 40;
                    case 'y2': return 50;
                }
            };

            lineScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute).toHaveBeenCalledWith('x1', 40);
            expect(elem.setAttribute).toHaveBeenCalledWith('y1', 90);
            expect(elem.setAttribute).toHaveBeenCalledWith('x2', 80);
            expect(elem.setAttribute).toHaveBeenCalledWith('y2', 150);

        });

        it('should not set attributes when at least one is not defined', function () {
            var elem = new Elem(''),
                scaleX = 2,
                scaleY = 3;

            elem.getAttribute = function (name) {
                switch (name) {
                    case 'x1': return 20;
                    case 'y1': return 30;
                    case 'y2': return 50;
                }
            };

            lineScaler.scale(elem, scaleX, scaleY);

            expect(elem.setAttribute.calls.count()).toEqual(0);
        });

    });

});
