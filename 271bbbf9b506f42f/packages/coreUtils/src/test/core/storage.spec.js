/**
 * Created by Dan_Shappir on 11/3/14.
 */
define(['coreUtils/core/storage'], function (storage) {
    'use strict';

    describe('storage', function () {
        it('should be built-in storage when possible', function () {
            if (typeof window !== 'undefined') {
                var s = storage(window);
                expect(s.local).toBe(window.localStorage);
                expect(s.session).toBe(window.sessionStorage);
            }
        });

        function test(store, builtIn) {
            expect(store).not.toBe(builtIn);

            expect(store).toBeDefined();
            expect(store.getItem).toEqual(jasmine.any(Function));
            expect(store.setItem).toEqual(jasmine.any(Function));
            expect(store.removeItem).toEqual(jasmine.any(Function));
            expect(store.clear).toEqual(jasmine.any(Function));

            store.setItem('mockStorageKey', 'mockStorageValue');
            store.setItem('mockStorageKey2', 'mockStorageValue2');
            var value = store.getItem('mockStorageKey');
            expect(value).toEqual('mockStorageValue');

            store.removeItem('mockStorageKey');
            value = store.getItem('mockStorageKey');
            expect(value).toBeNull();

            store.setItem('mockStorageKey', 'mockStorageValue');
            store.clear();
            value = store.getItem('mockStorageKey');
            expect(value).toBeNull();
        }

        it('should generate working local storage', function () {
            var s = storage(); // force our own implementation
            test(s.local, typeof window !== 'undefined' ? window.localStorage : null);
        });

        it('should generate working session storage', function () {
            var s = storage(); // force our own implementation
            test(s.session, typeof window !== 'undefined' ? window.sessionStorage : null);
        });
    });
});

