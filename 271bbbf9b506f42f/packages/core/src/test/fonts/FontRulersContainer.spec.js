define(['lodash', 'react', 'core/fonts/FontRulersContainer', 'core/fonts/FontRuler'
], function (_, React, FontRulersContainer, FontRuler) {
    'use strict';

    describe('FontRulersContainer', function () {

        beforeEach(function() {
            this.loadCallBack = jasmine.createSpy();
            this.fontRulersContainer = React.addons.TestUtils.renderIntoDocument(React.createElement(FontRulersContainer, {
                fontsList: ['font_a', 'font_b', 'font_c'],
                siteData: {
                    browser: {
                        firefox: false
                    },
                    os: {
                        ios: false
                    }
                },
                onLoadCallback: this.loadCallBack
            }));
        });

        it('should render rulers iff the corresponding fontFamily is not in the loadedFonts list', function(){
            this.fontRulersContainer.setState({'loadedFonts': ['font_b']});
            var children = React.addons.TestUtils.scryRenderedComponentsWithType(this.fontRulersContainer, FontRuler);
            var renderdFontLoaders = _.map(children, 'props.fontFamily');
            expect(renderdFontLoaders).toContain("font_a");
            expect(renderdFontLoaders).toContain("font_c");
            expect(renderdFontLoaders).not.toContain("font_b");
        });
    });
});
