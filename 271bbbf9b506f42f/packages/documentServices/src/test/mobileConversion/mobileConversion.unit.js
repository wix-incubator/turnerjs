/**
 * Created by noamr on 07/08/2016.
 */

define([
    'lodash',
    'fs',
    'path',
    'experiment',
    'testUtils',
    'documentServices/mobileConversion/modules/mobileConversion'
], function(_, fs, path, experiment, testUtils, mobileConversion) {
    'use strict';

    var STRATEGIES = {
        DEFAULT: 'default',
        ONBOARDING: 'onboarding'
    };

    function readJson(name) {
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/' + name + '.json'), 'utf8'));
    }

    function extractTestDataRecursive(parentY, comp) {
        var layout = _.pick(comp.layout, ['x', 'y', 'width', 'height', 'scale']);
        layout.y = layout.y ? layout.y + parentY : parentY;
        layout.scale = Math.floor(_.get(layout, 'scale', 1) * 100) / 100;

        if (layout.scale === 1 || isNaN(layout.scale)) {
            delete layout.scale;
        }

        var components = _(comp.children || comp.components).map(extractTestDataRecursive.bind(null, layout.y)).reduce(function(result, value, index) {
            result[value.id] = _(value).omit(['id']).assign({index: index}).value();
            return result;
        }, {});

        return _.assign({id: comp.id}, layout, _.size(components) ? {components: components} : null);
    }

    function testConversionDataFull(desktopPage, expectedMobilePage, heuristicStrategy) {
        expect(desktopPage).not.toBeNull();
        var convertedMobilePage = _.cloneDeep(desktopPage);
        expect(expectedMobilePage).not.toBeNull();
        var initialY = 0;
        var expectedData = extractTestDataRecursive(initialY, expectedMobilePage);
        mobileConversion.mobileConversion({heuristicStrategy: heuristicStrategy}).execConversion(convertedMobilePage);
        expect(desktopPage).not.toEqual(convertedMobilePage);
        var actualData = extractTestDataRecursive(initialY, convertedMobilePage);
        expect(actualData).toEqual(expectedData);
    }

    function testConversionDataFullForAllPages(conversionTestData, strategy) {
        strategy = strategy || STRATEGIES.DEFAULT;
        var expectedMobileSite = _.get(conversionTestData, ['mobile', strategy]);
        expect(expectedMobileSite).toBeDefined();
        expect(conversionTestData.desktop).not.toEqual({});
        _.forOwn(conversionTestData.desktop, function(page, pageId) {
            var desktopPage = conversionTestData.desktop[pageId];
            testConversionDataFull(desktopPage, expectedMobileSite[pageId], strategy);
        });
    }

    describe('Mobile Algorithm', function() {

        // This tests background groups, text-image groups, proportional groups, pattern groups, changing font sizes, nest overlaying components, social bar
        it('should correctly convert a mobile page with multiple groupings', function() {
            testConversionDataFullForAllPages(readJson('algo-features'));
        });

        it('should correctly handle container styles and borders', function() {
            testConversionDataFullForAllPages(readJson('container-style'));
        });

        it('should hide occluded background strips/columns', function() {
            testConversionDataFullForAllPages(readJson('occlude'));
        });

        it('should take results of measured text width into account', function() {
            testConversionDataFullForAllPages(readJson('text-measuring'));
        });

        it('should keep columns at a minimum height of 200 regardless of their child components', function() {
            testConversionDataFullForAllPages(readJson('min-height'));
        });

        it('should correctly apply new font scaling logic', function() {
            testUtils.experimentHelper.openExperiments('fontScaling');
            testConversionDataFullForAllPages(readJson('newFontScaling'));
        });
    });
});
