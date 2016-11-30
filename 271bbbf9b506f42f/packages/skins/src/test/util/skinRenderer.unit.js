/**
 * Created by eitanr on 06/03/2016.
 */
define(['skins/util/skinsRenderer', 'lodash', 'testUtils'], function (skinsRenderer, _, testUtils) {
    'use strict';

    describe('skin css spec', function () {
        it('should render skin css', function () {
            var selector = '.selector';
            var css = 'color: red; background: blue;';
            var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                .addCss(selector, css)
                .build();

            var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

            expect(rendered).toBe('.s1_selector {' + css + '}');
        });

        describe('params of type FONT_FAMILY', function () {
            it('should process a parameter of type FONT_FAMILY correctly and add fall backs to it', function () {
                var selector = '.selector';
                var css = '[param1]';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', 'arial black', 'FONT_FAMILY')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe(".s1_selector {font-family:'arial black',arial-w01-black,arial-w02-black,'arial-w10 black',sans-serif;}");
            });
        });

        describe('params of type SIZE', function () {

            it('should process a parameter of type SIZE without units, as pixels', function () {
                var selector = '.selector';
                var css = 'width: [param1];';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '14', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {width: 14px;}');
            });

            it('should process a parameter of type SIZE without units, as pixels, when its specified as Number', function () {
                var selector = '.selector';
                var css = 'width: calc([param1] - [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', 14, 'SIZE')
                    .addParam('param2', 20, 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {width: calc(14px - 20px);}');
            });

            it('should process a parameter of type SIZE and preserve units', function () {
                var selector = '.selector';
                var css = 'width: [param1];';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '14cm', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {width: 14cm;}');
            });
        });

        describe('params inside calc() expression', function () {
            it('should process parameters inside calc() expression, both parameters single values', function () {
                var selector = '.selector';
                var css = 'width: calc([param1] * [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '30px', 'SIZE')
                    .addParam('param2', '101px', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {width: calc(30px * 101px);}');
            });

            it('should process parameters inside calc() expression, first parameter is multi-value', function () {
                var selector = '.selector';
                var css = 'border-radius: calc([param1] + [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '30px 40px 50px 60px', 'SIZE')
                    .addParam('param2', '10cm', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {border-radius: calc(30px + 10cm) calc(40px + 10cm) calc(50px + 10cm) calc(60px + 10cm);}');
            });

            it('should process parameters inside calc() expression, second parameter is multi-value', function () {
                var selector = '.selector';
                var css = 'border-radius: calc([param1] + [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '10cm', 'SIZE')
                    .addParam('param2', '30px 40px 50px 60px', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {border-radius: calc(10cm + 30px) calc(10cm + 40px) calc(10cm + 50px) calc(10cm + 60px);}');
            });

            it('should process parameters inside calc() expression, both parameters are multi-value', function () {
                var selector = '.selector';
                var css = 'border-radius: calc([param1] + [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '10cm 20cm 30cm 40cm', 'SIZE')
                    .addParam('param2', '30px 40px 50px 60px', 'SIZE')
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {border-radius: calc(10cm + 30px) calc(20cm + 40px) calc(30cm + 50px) calc(40cm + 60px);}');
            });

            it('should process parameters inside calc() expression, both parameters are multi-value, not same length, should default to the first value of the shorter param', function () {
                var selector = '.selector';
                var css = 'border-radius: calc([param1] + [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '10cm 20cm', 'SIZE') //param with two values
                    .addParam('param2', '30px 40px 50px 60px', 'SIZE')  //param with four values
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {border-radius: calc(10cm + 30px) calc(20cm + 40px) calc(10cm + 50px) calc(10cm + 60px);}');
            });

            it('should process parameters inside calc() expression, should add px units where missing', function () {
                var selector = '.selector';
                var css = 'border-radius: calc([param1] + [param2]);';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addParam('param1', '10 11cm', 'SIZE')
                    .addParam('param2', '30px', 'SIZE')  //param with four values
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {border-radius: calc(10px + 30px) calc(11cm + 30px);}');
            });

            it('should correctly replace animation names', function () {
                var selector = '.selector';
                var css = 'animation: someName 100ms';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {animation: s1_someName 100ms}');
            });

            it('should correctly replace animation names with -webkit-prefix', function () {
                var selector = '.selector';
                var css = 'color: red; -webkit-animation-name: someName';

                var skinData = testUtils.mockFactory.dataMocks.skins.skinBuilder()
                    .addCss(selector, css)
                    .build();

                var rendered = skinsRenderer.createSkinCss(skinData, {}, {}, 's1', {});

                expect(rendered).toBe('.s1_selector {color: red; -webkit-animation-name: s1_someName}');
            });
        });
    });
});
