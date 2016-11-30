define(['lodash', 'wixappsClassics/util/viewCacheUtils'], function (_, wixappsCacheUtils) {
    'use strict';

    describe('view cache utils', function () {

        var compId = 'barvaz';
        var view = 'view';
        var type = 'type';
        var format = 'format';
        var viewDef = {barvaz: 'oger'};

        beforeEach(function () {
            wixappsCacheUtils.removeComponentViewDefs(compId);
        });

        it('should return undefined if wasnt cached', function () {
            var actual = wixappsCacheUtils.getComponentViewDef(compId, view, type, format);
            expect(actual).toBeUndefined();
        });

        it('should return the viewDef if was cached', function () {
            wixappsCacheUtils.setComponentViewDef(compId, view, type, format, viewDef);
            var actual = wixappsCacheUtils.getComponentViewDef(compId, view, type, format);
            expect(actual).toBe(viewDef);
        });

        it('should return undefined if was cached and removed', function () {
            wixappsCacheUtils.setComponentViewDef(compId, view, type, format, viewDef);
            wixappsCacheUtils.removeComponentViewDefs(compId);
            var actual = wixappsCacheUtils.getComponentViewDef(compId, view, type, format);
            expect(actual).toBeUndefined();
        });
    });
});
