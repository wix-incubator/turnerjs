define(['lodash',
    'definition!documentServices/component/componentData',
    'documentServices/dataModel/dataModel',
    'fake!documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/componentsMetaData/componentsMetaData'],
    function (_, componentDataDefinition,
              dataModel, FakeDataAccessLayer, componentsDefinitionsMap, constants, privateServicesHelper, componentsMetaData) {
    'use strict';
    describe('Document Services - Components Data API', function () {
        var privateServices;
        var mobileComp, desktopComp;
        var componentData;
        beforeEach(function () {
            componentData = componentDataDefinition(_, dataModel, componentsMetaData, componentsDefinitionsMap, constants, componentsMetaData);
            mobileComp = {
                id: 'mobileId'
            };
            desktopComp = {
                id: 'mobileId'
            };

            var siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {}, page1: {components: [desktopComp], mobileComponents: [mobileComp]}});
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

        });

        function getMobileCompPointer(){
            var page = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.MOBILE);
            return privateServices.pointers.components.getComponent('mobileId', page);
        }

        function getDesktopCompPointer() {
            var page = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
            return privateServices.pointers.components.getComponent('mobileId', page);
        }

        it("should reset the mobile component properties data item, back to its desktop equivalent comp", function () {
            var desktopProps = 'desktop props';
            spyOn(dataModel, 'getPropertiesItem').and.returnValue(desktopProps);
            spyOn(dataModel, 'deletePropertiesItem');
            spyOn(dataModel, 'updatePropertiesItem');

            var pointer = getMobileCompPointer();
            componentData.resetMobileComponentProperties(privateServices, pointer);

            expect(dataModel.deletePropertiesItem).toHaveBeenCalledWith(privateServices, pointer);
            expect(dataModel.updatePropertiesItem).toHaveBeenCalledWith(privateServices, pointer, desktopProps);
        });

        describe('split mobile properties', function(){
            var desktopProps = {someProp: 'somePropValue'};
            beforeEach(function(){
                spyOn(dataModel, 'getPropertiesItem').and.returnValue(desktopProps);
                spyOn(dataModel, 'generateNewPropertiesItemId').and.returnValue("compSplitProp-ID");
                spyOn(dataModel, 'setPropertiesItem').and.callFake(function(ps, mobileCompPointer, clonedDesktopPropsItem, mobilePropsItemId){
                    var propsPointer = privateServices.pointers.data.getPropertyItem(mobilePropsItemId, 'page1');
                    privateServices.dal.set(propsPointer, clonedDesktopPropsItem);
                });
            });
            it("should be able to split a mobile component properties item from the desktop's component", function () {
                componentData.splitMobileComponentProperties(privateServices, getMobileCompPointer());

                var mobileProps = privateServices.dal.get(privateServices.pointers.data.getPropertyItem('compSplitProp-ID', 'page1'));

                expect(mobileProps).toEqual(desktopProps);
            });

            it('should change the mobile component propertyQuery value', function(){
                var pointer = getMobileCompPointer();
                componentData.splitMobileComponentProperties(privateServices, pointer);

                var props = privateServices.dal.get(privateServices.pointers.getInnerPointer(pointer, 'propertyQuery'));

                expect(props).toEqual("compSplitProp-ID");
            });

        });

        describe('when checking if component has split properties', function () {
            beforeEach(function() {
                this.mobileCompPropertyPointer = privateServices.pointers.getInnerPointer(getMobileCompPointer(), 'propertyQuery');
                this.desktopCompPropertyPointer = privateServices.pointers.getInnerPointer(getDesktopCompPointer(), 'propertyQuery');
            });
            it('Should return true if the mobile properties are different than the desktop properties', function () {
                privateServices.dal.set(this.mobileCompPropertyPointer, 'mobile properties');
                privateServices.dal.set(this.desktopCompPropertyPointer, 'desktop properties');
                //mobileComp.propertyQuery = 'mobile properties';
                //desktopComp.propertyQuery = 'desktop properties';

                var result = componentData.isMobileComponentPropertiesSplit(privateServices, getMobileCompPointer());

                expect(result).toBeTruthy();
            });

            it('Should return false if the mobile properties are the same as the desktop properties', function () {
                privateServices.dal.set(this.mobileCompPropertyPointer, 'desktop properties');
                privateServices.dal.set(this.desktopCompPropertyPointer, 'desktop properties');

                var result = componentData.isMobileComponentPropertiesSplit(privateServices, getMobileCompPointer());

                expect(result).toBeFalsy();
            });
        });
    });
});
