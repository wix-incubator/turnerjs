describe('StringUtils', function(){
    "use strict";

    testRequire().resources('W.Utils');

    var utils;
    beforeEach(function() {
        utils = this.W.Utils.StringUtils;
    });

    describe('pad', function() {
        it('should pad numbers correctly', function() {
            expect(utils.pad(2, 2)).toBe('02');
            expect(utils.pad(12, 2)).toBe('12');
            expect(utils.pad(12, 4)).toBe('0012');
        });

        it('should pad strings to the right correctly', function() {
            expect(utils.pad('a', 3, ' ', false)).toBe('  a');
            expect(utils.pad('a', 3, ' ', true)).toBe('a  ');
        });
    });

    describe('printTable', function() {
        it('should print columns correctly', function() {
            expect(utils.printTable([
                ['a',   'bb',  'c'],
                ['aaa', 'b',   'cc'],
                ['a',   'bbb', 'cc']
            ])).toBe(
                    'a   bb  c \n' +
                    'aaa b   cc\n' +
                    'a   bbb cc');
        })
    });
});