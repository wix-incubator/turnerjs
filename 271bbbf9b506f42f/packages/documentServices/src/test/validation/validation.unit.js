define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper', 'siteUtils'], function (_, testUtils, privateServicesHelper, siteUtils) {
    'use strict';

    //these are mainly contract tests, each validation has (or should have) its own unit tests
    describe('validation API', function () {
        var mockValidateLayout = jasmine.createSpy('validateLayout');
        var mockValidateStyle = jasmine.createSpy('validateComponentStyle');
        var mockValidateSkin = jasmine.createSpy('validateComponentSkin');
        var mockValidateProps = jasmine.createSpy('validateCompProps');
        var mockValidateData = jasmine.createSpy('validateCompData');
        var mockValidateCompJson = jasmine.createSpy('validateCompJSONpaths');

        var mocks = {
            'documentServices/structure/utils/layoutValidation': {validateLayout: mockValidateLayout},
            'documentServices/validation/validators/styleValidator': {validateComponentStyle: mockValidateStyle},
            'documentServices/validation/validators/skinValidator': {validateComponentSkin: mockValidateSkin},
            'documentServices/validation/validators/compPropValidator': {validateCompProps: mockValidateProps},
            'documentServices/validation/validators/compDataValidator': {validateCompData: mockValidateData},
            'documentServices/validation/validators/siteJsonValidator': {validateCompJSONpaths: mockValidateCompJson}
        };

        testUtils.requireWithMocks('documentServices/validation/validation', mocks, function (validation) {

            beforeEach(function () {
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                this.comp1 = {id: 'comp1'};
                this.comp2 = {id: 'comp2'};
                var currentPage = this.ps.pointers.components.getPage(this.ps.siteAPI.getCurrentUrlPageId(), siteUtils.constants.VIEW_MODES.DESKTOP);
                this.ps.dal.addDesktopComps([this.comp1, this.comp2], currentPage);

                this.comp1Pointer = this.ps.pointers.components.getComponent('comp1', currentPage);
                this.comp2Pointer = this.ps.pointers.components.getComponent('comp2', currentPage);
            });

            describe('validateComponentData', function () {
                it('should validate the data through compDataValidator', function () {
                    validation.validateComponentData(this.ps, this.comp1Pointer);
                    expect(mockValidateData).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                });
            });
            describe('validateComponentProperties', function () {
                it('should run property validations through compPropValidator.validateCompProps', function () {
                    validation.validateComponentProperties(this.ps, this.comp1Pointer);
                    expect(mockValidateProps).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                });
            });
            describe('validateComponentLayout', function () {
                it('should run the layout validations from layoutValidation', function () {
                    validation.validateComponentLayout(this.ps, this.comp1Pointer);
                    expect(mockValidateLayout).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                });
            });
            describe('validateComponentSkin', function () {
                it('should run the skin validations from the skinValidator', function () {
                    validation.validateComponentSkin(this.ps, this.comp1Pointer);
                    expect(mockValidateSkin).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                });
            });
            describe('validateStyle', function () {
                it('should run the style validations from validateStyle', function () {
                    validation.validateStyle(this.ps, this.comp1Pointer);
                    expect(mockValidateStyle).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                });
            });

            describe('validating components', function(){
                beforeEach(function () {
                    this.validators = [mockValidateLayout, mockValidateStyle, mockValidateSkin, mockValidateProps, mockValidateData, mockValidateCompJson];
                });
                describe('validateComponents', function () {

                    it('should run all the validations on the given comps', function () {
                        validation.validateComponents(this.ps, [this.comp1Pointer]);

                        _.forEach(this.validators, function (validator) {
                            expect(validator).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                        }, this);

                    });
                    it('should run all the validations on a single comp', function () {
                        validation.validateComponents(this.ps, [this.comp1Pointer, this.comp2Pointer]);

                        _.forEach(this.validators, function (validator) {
                            expect(validator).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                            expect(validator).toHaveBeenCalledWith(this.ps, this.comp2Pointer);
                        }, this);
                    });
                });

                describe('validateAllComponents', function () {
                    it('should run validation on all components in the site (excluding masterPage)', function () {
                        validation.validateAllComponents(this.ps);

                        var currentPage = this.ps.pointers.components.getPage(this.ps.siteAPI.getCurrentUrlPageId(), siteUtils.constants.VIEW_MODES.DESKTOP);
                        var masterPage = this.ps.pointers.components.getPage('masterPage', siteUtils.constants.VIEW_MODES.DESKTOP);
                        _.forEach(this.validators, function (validator) {
                            expect(validator).toHaveBeenCalledWith(this.ps, this.comp1Pointer);
                            expect(validator).toHaveBeenCalledWith(this.ps, this.comp2Pointer);
                            expect(validator).toHaveBeenCalledWith(this.ps, currentPage);
                            expect(validator).not.toHaveBeenCalledWith(this.ps, masterPage);
                        }, this);
                    });
                });
            });

        });
    });
});
