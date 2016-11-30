define([
    'lodash',
    'svgShape/util/svgShapeDataRequirementsChecker'
], function (_, svgShapeDataRequirementsChecker) {
    'use strict';

    describe('svgShapeDataRequirementsChecker', function () {
        var requirementChecker = svgShapeDataRequirementsChecker.requirementChecker;

        it('should return an empty array if the shape skin is the default skin', function () {
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, ['skins.viewer.svgshape.SvgShapeDefaultSkin']);
            expect(actual).toEqual([]);
        });

        it('should return an empty array if the shape skin was previously loaded', function () {
            var fakeLoadedShapes = {};
            var fakeShapeSkinName = 'previouslyLoadedShapeSkin';
            fakeLoadedShapes[fakeShapeSkinName] = '<svg></svg>';
            var actual = requirementChecker('www.mock.mediaRootUrl', fakeLoadedShapes, [fakeShapeSkinName]);
            expect(actual).toEqual([]);
        });

        it('should return a data requirement checker when a skin name is passed', function () {
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, ['mock.skin.name']);
            expect(actual).toBeInstanceOf(Array);
            expect(actual.length).toBe(1);
        });

        it('should return a data requirement checker for each skin that needs to be loaded', function () {
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, ['mock.skin.name', 'mock.skin.name2', 'skins.viewer.svgshape.SvgShapeDefaultSkin']);
            expect(actual).toBeInstanceOf(Array);
            expect(actual.length).toBe(2);
        });

        it('should return a data requirement checker with necessary fields in it', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].destination).toBeDefined();
            expect(actual[0].url).toBeDefined();
            expect(actual[0].dataType).toBeDefined();
            expect(actual[0].error).toBeDefined();
        });

        it('should return a data requirement with destination of type array of size 2', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].destination).toBeInstanceOf(Array);
            expect(actual[0].destination.length).toBe(2);
        });

        it('should return a data requirement with destination containing the svg root', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].destination[0]).toBe(svgShapeDataRequirementsChecker.SVG_ROOT);
        });

        it('should return a data requirement with destination containing the skin name', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].destination[1]).toBe(mockSkinName);
        });

        it('should return a data requirement with dataType html', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].dataType).toBe('html');
        });

        it('should return a data requirement with an error function', function () {
            var mockSkinName = 'mock.skin.name';
            var actual = requirementChecker('www.mock.mediaRootUrl', {}, [mockSkinName]);

            expect(actual[0].error).toBeOfType('function');
        });

        it('should return a data requirement with default shape, if the error function is called', function () {
            var mockSkinName = 'mock.skin.name';
            var loadedShapes = {};

            var actual = requirementChecker('www.mock.mediaRootUrl', loadedShapes, [mockSkinName]);
            actual[0].error();

            expect(loadedShapes[mockSkinName]).toBe(svgShapeDataRequirementsChecker.DEFAULT_SHAPE);
        });

        it('should return a data requirement with a url prefixed with mediaRoot', function () {
            var mockSkinName = 'mock.skin.name';
            var mockMediaRoot = 'mock.media.root';
            var actual = requirementChecker(mockMediaRoot, {}, [mockSkinName]);

            expect(actual[0].url).toStartWith(mockMediaRoot);
        });

        it('should return a url which ends with .svg', function () {
            var mockSkinName = 'mock.skin.name';
            var mockMediaRoot = 'mock.media.root';
            var actual = requirementChecker(mockMediaRoot, {}, [mockSkinName]);

            expect(actual[0].url).toEndWith('.svg');
        });

        it('V1 shapes should have a url containing the hash, version (v1) and shape name', function () {
            var mockSkinName = 'svgshape.v1.svg_longhashvalue.TheShapeName';
            var mockMediaRoot = 'mock.media.root/';
            var expectedSvgUrl = mockMediaRoot + 'shapes/longhashvalue_svgshape.v1.TheShapeName.svg';
            var actual = requirementChecker(mockMediaRoot, {}, [mockSkinName]);

            expect(actual[0].url).toBe(expectedSvgUrl);

            //skin name: "svgshape.v1.svg_8463f60718194af748c49dddbe45b668.HollowCircle"
            //shape url: "http://static.wixstatic.com/shapes/8463f60718194af748c49dddbe45b668_svgshape.v1.HollowCircle.svg"
        });

        it('V2 shapes should have a url containing the hash only', function () {
            var mockSkinName = 'svgshape.v2.Svg_longhashvalue';
            var mockMediaRoot = 'mock.media.root/';
            var expectedSvgUrl = mockMediaRoot + 'shapes/longhashvalue.svg';
            var actual = requirementChecker(mockMediaRoot, {}, [mockSkinName]);

            expect(actual[0].url).toBe(expectedSvgUrl);

            //skin name: "svgshape.v2.Svg_9c643faa9dbb4b2dbb98121267e2adf8"
            //shape url: "http://static.wixstatic.com/shapes/9c643faa9dbb4b2dbb98121267e2adf8.svg"
        });
    });
});
