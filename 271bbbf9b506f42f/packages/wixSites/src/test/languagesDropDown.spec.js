define(['testUtils', 'siteUtils', 'wixSites/components/languagesDropDown/languagesDropDown', 'utils'], function (testUtils, siteUtils, languagesDropDown, utils) {
    'use strict';

    siteUtils.compFactory.register('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', languagesDropDown);

    describe('LanguagesDropDown Component', function () {

        describe('Test that the selected language is displayed', function () {

            var langComp;

            beforeEach(function () {
                /**
                 * Makes an instance of the component.
                 * @param {string=} text
                 * @param {string=} position
                 */

                spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('en');

                var props = testUtils.mockFactory.mockProps().setSkin('wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin');
                props.structure.componentType = 'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown';

                langComp = testUtils.componentBuilder('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', props);
            });


            it('should display Deutsch if current language is de', function () {

                langComp.setState({
                    subDomain: 'de'
                });
                var expectedValue = 'Deutsch',
                    calculatedValue = langComp.getSkinProperties().select.children;

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should display English if current language is not defoined', function () {

                langComp.setState({
                    subDomain: ''
                });
                var expectedValue = 'English',
                    calculatedValue = langComp.getSkinProperties().select.children;

                expect(calculatedValue).toBe(expectedValue);
            });
        });

        describe('Test that the initial language is displayed', function () {

            var langComp;

            beforeEach(function () {
                /**
                 * Makes an instance of the component.
                 * @param {string=} text
                 * @param {string=} position
                 */

                spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('de');

                var props = testUtils.mockFactory.mockProps().setSkin('wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin');
                props.structure.componentType = 'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown';

                langComp = testUtils.componentBuilder('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', props);
            });


            it('should display Deutsch if current language is de', function () {

                var expectedValue = 'Deutsch',
                    calculatedValue = langComp.getSkinProperties().select.children;

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should set subDomain de in initial state when de is the current language', function () {

                var expectedValue = 'de', calculatedValue = langComp.getInitialState();

                expect(calculatedValue.subDomain).toBe(expectedValue);
            });
        });


        describe('Test that the selected language is displayed', function () {

            it('should set subDomain to default en in initial state when current language is not defined', function () {
                spyOn(utils.wixUserApi, 'getLanguage').and.returnValue(null);

                var props = testUtils.mockFactory.mockProps().setSkin('wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin');
                props.structure.componentType = 'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown';

                var langComp = testUtils.componentBuilder('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', props);

                var expectedValue = 'www', calculatedValue = langComp.getInitialState();

                expect(calculatedValue.subDomain).toBe(expectedValue);
            });

            it('should set subDomain to default en in initial state when current language is not in menu data', function () {
                spyOn(utils.wixUserApi, 'getLanguage').and.returnValue('tr');

                var props = testUtils.mockFactory.mockProps().setSkin('wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin');
                props.structure.componentType = 'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown';

                var langComp = testUtils.componentBuilder('wysiwyg.viewer.components.wixhomepage.LanguagesDropDown', props);

                var expectedValue = 'www', calculatedValue = langComp.getInitialState();

                expect(calculatedValue.subDomain).toBe(expectedValue);
            });
        });

    });
});
