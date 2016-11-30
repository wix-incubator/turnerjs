define(
    [
        'mediaContainer/utils/cssItem/property'
    ],
    function (Property) {
        'use strict';

        describe('compDesignMixin Property', function () {

            describe('keyvalue', function () {
                it('returns a style reducer that adds stringified item by key name', function () {
                    var reducer = Property.keyvalue('b', function () { return '*'; });
                    expect(reducer({a: 1}, {})).toEqual({a: 1, b: '*'});
                });
            });

            describe('map', function () {
                it('returns a style reducer that adds multiple stringified values from an item', function () {
                    var reducer = Property.map({
                        a: function () { return 'a'; },
                        b: function () { return 'b'; },
                        c: function () { return 'c'; }
                    });
                    expect(reducer({x: 1}, {})).toEqual({a: 'a', b: 'b', c:'c', x:1});
                });
            });

        });
    }
);
