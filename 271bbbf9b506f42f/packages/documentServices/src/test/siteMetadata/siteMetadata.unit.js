define(['lodash', 'definition!documentServices/siteMetadata/siteMetadata',
    'documentServices/siteMetadata/dataManipulation',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'utils'], function (_, SiteMetaDataDef, dataManipulation, privateServicesHelper, utils) {
    'use strict';

    var fakePrivateServices;

    var SiteMetaData;

    describe('siteMetadata manager', function () {
        var realPropName = 'SITE_META_DATA';

        beforeEach(function() {
            SiteMetaData = SiteMetaData || new SiteMetaDataDef(_, dataManipulation);
            fakePrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(null, {siteData: [{path: ['documentServicesModel'], optional: true}]});
        });

        describe("test siteMetadata's general property handling functionality", function() {

            it('get a meta site property', function() {
                fakePrivateServices.dal.set(fakePrivateServices.pointers.metadata.getSiteMetaDataPointer(realPropName), 'exampleValue1');

                var value = SiteMetaData.getProperty(fakePrivateServices, SiteMetaData.PROPERTY_NAMES[realPropName]);

                expect(value).toEqual('exampleValue1');
            });

            it('set a valid meta site property', function () {
                fakePrivateServices.dal.set(fakePrivateServices.pointers.metadata.getSiteMetaDataPointer(realPropName), 'exampleValue1');

                SiteMetaData.setProperty(fakePrivateServices, SiteMetaData.PROPERTY_NAMES[realPropName], 'newValue1');
                var value = SiteMetaData.getProperty(fakePrivateServices, SiteMetaData.PROPERTY_NAMES[realPropName]);

                expect(value).toEqual('newValue1');
            });

            it('trying to get a meta property with an invalid prop should fail', function () {
                spyOn(utils.log, 'error');
                fakePrivateServices.dal.set(fakePrivateServices.pointers.metadata.getSiteMetaDataPointer(realPropName), 'exampleValue1');

                var value = SiteMetaData.getProperty(fakePrivateServices, 'sdf');

                expect(value).toBeNull();
                expect(utils.log.error).toHaveBeenCalled();
            });

            it('trying to set a meta property with an invalid prop should fail', function () {
                spyOn(utils.log, 'error');

                SiteMetaData.setProperty(fakePrivateServices, 'asd', 'newValue1');

                expect(utils.log.error).toHaveBeenCalled();
            });
        });

        describe("test exposed siteMetadata namespaces functionality", function() {

        });
    });
});
