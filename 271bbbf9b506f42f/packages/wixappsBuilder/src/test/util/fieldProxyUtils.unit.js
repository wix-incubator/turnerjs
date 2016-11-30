define(['lodash', 'wixappsBuilder/util/fieldProxyUtils'], function (_, fieldProxyUtils) {
    'use strict';

    describe('getSpacers', function () {
        it('has no spacers', function () {
            var spacers = fieldProxyUtils.getSpacers('', {}, '');

            expect(spacers).toEqual({});
        });

        it('has spacers - vertical and rtl', function () {
            var spacers = fieldProxyUtils.getSpacers('vertical', {before: 1, after: 2, 'xax-before': 3, 'xax-after': 4}, 'rtl');

            expect(spacers).toEqual({'marginTop': 1, 'marginBottom': 2, 'paddingRight': 3, 'paddingLeft': 4});
        });

        it('has spacers - horizontal and rtl', function () {
            var spacers = fieldProxyUtils.getSpacers('horizontal', {before: 1, after: 2, 'xax-before': 3, 'xax-after': 4}, 'rtl');

            expect(spacers).toEqual({'paddingTop': 3, 'paddingBottom': 4, 'marginRight': 1, 'marginLeft': 2});
        });

        it('has spacers - vertical and ltr', function () {
            var spacers = fieldProxyUtils.getSpacers('vertical', {before: 1, after: 2, 'xax-before': 3, 'xax-after': 4}, 'ltr');

            expect(spacers).toEqual({'marginTop': 1, 'marginBottom': 2, 'paddingRight': 4, 'paddingLeft': 3});
        });

        it('has spacers - horizontal and ltr', function () {
            var spacers = fieldProxyUtils.getSpacers('horizontal', {before: 1, after: 2, 'xax-before': 3, 'xax-after': 4}, 'ltr');

            expect(spacers).toEqual({'paddingTop': 3, 'paddingBottom': 4, 'marginRight': 2, 'marginLeft': 1});
        });
    });

    describe('getLinkViewDef', function () {
        it('No links - undefined', function () {
            var linkViewDef = fieldProxyUtils.getLinkViewDef(undefined, undefined);

            expect(linkViewDef).toBeUndefined();
        });

        it('Link is LinkBase - single item inside the childViewDef is the original', function () {
            var linkViewDef = fieldProxyUtils.getLinkViewDef(undefined, {_type: "wix:LinkBase"});

            expect(linkViewDef).toBeUndefined();
        });

        it('Has page link on the comp - return app link', function () {
            var linkViewDef = fieldProxyUtils.getLinkViewDef('mega link');

            var expected = {
                comp: {
                    name: "AppLink",
                    pageId: 'mega link',
                    items: []
                }};

            expect(linkViewDef).toEqual(expected);
        });

        it('Has page link on the comp and link - return app link', function () {
            var linkViewDef = fieldProxyUtils.getLinkViewDef('mega link1', 'mega link2');

            var expected = {
                comp: {
                    name: "AppLink",
                    pageId: 'mega link1',
                    items: []
                }};

            expect(linkViewDef).toEqual(expected);
        });

        it('Has link on the single item', function () {
            var linkViewDef = fieldProxyUtils.getLinkViewDef(undefined, 'mega link');

            var expected = {
                value: 'mega link',
                comp: {
                    name: "Link",
                    items: []
                }};

            expect(linkViewDef).toEqual(expected);
        });
    });
});
