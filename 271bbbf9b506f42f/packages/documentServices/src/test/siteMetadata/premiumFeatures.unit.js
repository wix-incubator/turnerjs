define(['lodash', 'definition!documentServices/siteMetadata/premiumFeatures', 'fake!documentServices/siteMetadata/dataManipulation'], function (_, PremiumFeaturesModuleDef, fakeDataManipulation) {
    'use strict';
    describe('social sub module', function() {
        beforeEach(function() {
            fakeDataManipulation.PROPERTY_NAMES = {
                PREMIUM_FEATURES: 'premium_features_path'
            };

            this.premiumFeatures = new PremiumFeaturesModuleDef(fakeDataManipulation);
            this.value = [];

            spyOn(fakeDataManipulation, 'getProperty').and.returnValue(this.value);
            spyOn(fakeDataManipulation, 'setProperty');
        });

        it('getting the premium features of the site', function() {
            expect(this.premiumFeatures.getFeatures(null)).toEqual(this.value);
            expect(fakeDataManipulation.getProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.PREMIUM_FEATURES);
        });

        it('setting the premium features of the site', function() {
            var features = ['feature1'];
            this.premiumFeatures.setFeatures(null, features);
            expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.PREMIUM_FEATURES, features);
        });
    });
});
