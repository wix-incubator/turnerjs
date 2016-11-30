define(['coreUtils/core/math'], function(math) {
    'use strict';
    describe('math', function() {

        describe('math.parseDegrees', function() {

            var pairs = [
              [-720, 0], [-360, 0], [0, 0], [360, 0], [720, 0], // to zero
              [-390, 330], [-30, 330], [0.5, 0.5], [30, 30], [390, 30], //valid examples
              [Infinity, NaN], [-Infinity, NaN], [NaN, NaN], //infinities and NaN
              [[], NaN], [null, NaN], [undefined, NaN], [false, NaN], [true, NaN] //invalid values
            ];

            it('should return the correct values', function() {
                pairs.forEach(function(pair) {
                    expect(math.parseDegrees(pair[0])).toEqual(pair[1]);
                });
            });
        });

        describe('math.interpolateSegmentsFunction', function() {
            it('should return the correct values', function() {
                var myf = math.interpolateSegmentsFunction([[0, 0], [0.4, 0.2], [1, 0.4], [5, 2], [60, 3], [61, 3]]);
                expect(myf(-Infinity)).toEqual(-Infinity);
                expect(myf(-1)).toEqual(-0.5);
                expect(myf(0)).toEqual(0);
                expect(myf(0.4)).toEqual(0.2);
                expect(myf(5)).toEqual(2);
                expect(myf(59)).toEqual(2.981818181818182);
                expect(myf(60)).toEqual(3);
                expect(myf(61)).toEqual(3);
            });

            it('should return the correct values', function() {
                var myf = math.interpolateSegmentsFunction([[0, 0], [1, 1], [2, 1], [3, 0], [4, 0]]);
                expect(myf(-Infinity)).toEqual(-Infinity);
                expect(myf(-0.5)).toEqual(-0.5);
                expect(myf(0)).toEqual(0);
                expect(myf(0.5)).toEqual(0.5);
                expect(myf(1)).toEqual(1);
                expect(myf(1.5)).toEqual(1);
                expect(myf(2)).toEqual(1);
                expect(myf(2.5)).toEqual(0.5);
                expect(myf(3)).toEqual(0);
                expect(myf(3.5)).toEqual(0);
                expect(myf(4)).toEqual(0);
                expect(myf(4.5)).toEqual(0);
                expect(myf(1982)).toEqual(0);
            });
        });


    });
});
