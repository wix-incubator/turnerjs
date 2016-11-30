define(['lodash',
    'testUtils',
    'siteUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/validation/utils/validationErrors',
    'documentServices/validation/validators/siteJsonValidator'], function (_, testUtils, siteUtils, privateServicesHelper, validationErrors, siteJsonValidator) {
    'use strict';

    describe('siteJsonValidator', function(){

        var DESKTOP = siteUtils.constants.VIEW_MODES.DESKTOP;
        // var MOBILE = siteUtils.constants.VIEW_MODES.MOBILE;

        function pagePointer(ps, id, viewMode){
            return ps.pointers.components.getPage(id || ps.siteAPI.getCurrentUrlPageId(), viewMode || DESKTOP);
        }

        function addCompStructure(comp, currentPage){
            this.ps.dal.addDesktopComps([comp], currentPage);
        }

        beforeEach(function(){
            testUtils.experimentHelper.openExperiments('connectionsData'); //this is so that the mockDefaultJsons returns a json with connections_data map initialized
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
            this.addCompStructure = addCompStructure;
        });

        describe('desktop', function(){
            it('should throw if the data is not in the document_data of the same scope', function(){
                var currentPagePointer = pagePointer(this.ps);
                var compStructure = {
                    id: 'mock-comp',
                    dataQuery: '#mock-data'
                };

                var mockData = {
                    id: 'mock-data',
                    someKey: 'someVal'
                };

                this.addCompStructure(compStructure, currentPagePointer);
                this.ps.dal.addData(mockData, 'masterPage');

                var compPointer = this.ps.pointers.components.getComponent('mock-comp', currentPagePointer);

                var expectedError = new validationErrors.DataPathError({compId: 'mock-comp', pageId: currentPagePointer.id, query: 'mock-data', type: 'document_data'});
                expect(siteJsonValidator.validateCompJSONpaths.bind(siteJsonValidator, this.ps, compPointer)).toThrow(expectedError);
            });

            it('should throw if the properties object is not in the component_properties of the same scope', function(){
                var currentPagePointer = pagePointer(this.ps);
                var compStructure = {
                    id: 'mock-comp',
                    propertyQuery: 'mock-props'
                };

                var mockProperties = {
                    id: 'mock-props',
                    someKey: 'someVal'
                };

                this.addCompStructure(compStructure, currentPagePointer);
                this.ps.dal.addProperties(mockProperties, 'masterPage');

                var compPointer = this.ps.pointers.components.getComponent('mock-comp', currentPagePointer);
                var expectedError = new validationErrors.DataPathError({compId: 'mock-comp', pageId: currentPagePointer.id, query: 'mock-props', type: 'component_properties'});
                expect(siteJsonValidator.validateCompJSONpaths.bind(siteJsonValidator, this.ps, compPointer)).toThrow(expectedError);

            });

            it('should throw if the designData is not in the design_data of the same scope', function(){
                var currentPagePointer = pagePointer(this.ps);
                var compStructure = {
                    id: 'mock-comp',
                    designQuery: '#mock-design'
                };

                var mockData = {
                    id: 'mock-design',
                    someKey: 'someVal'
                };

                this.addCompStructure(compStructure, currentPagePointer);
                this.ps.dal.addDesignItem(mockData, 'masterPage');

                var compPointer = this.ps.pointers.components.getComponent('mock-comp', currentPagePointer);

                var expectedError = new validationErrors.DataPathError({compId: 'mock-comp', pageId: currentPagePointer.id, query: 'mock-design', type: 'design_data'});
                expect(siteJsonValidator.validateCompJSONpaths.bind(siteJsonValidator, this.ps, compPointer)).toThrow(expectedError);
            });

            it('should throw if the connections item is not in the same scope', function(){
                var currentPagePointer = pagePointer(this.ps);
                var compStructure = {
                    id: 'mock-comp',
                    connectionQuery: 'mock-connection'
                };

                var mockConnections = {
                    id: 'mock-connection',
                    someKey: 'someVal'
                };

                this.addCompStructure(compStructure, currentPagePointer);
                this.ps.dal.addConnections(mockConnections, 'masterPage');

                var compPointer = this.ps.pointers.components.getComponent('mock-comp', currentPagePointer);

                var expectedError = new validationErrors.DataPathError({compId: 'mock-comp', pageId: currentPagePointer.id, query: 'mock-connection', type: 'connections_data'});
                expect(siteJsonValidator.validateCompJSONpaths.bind(siteJsonValidator, this.ps, compPointer)).toThrow(expectedError);
            });

        });

        xdescribe('mobile', function(){
            it('should throw if the data is not in the document_data of the same scope', function(){
                expect(false).toBe(true);
            });
            it('should throw if the properties object is not in the component_properties of the same scope', function(){
                expect(false).toBe(true);
            });
            it('should throw if the designData is not in the design_data of the same scope', function(){
                expect(false).toBe(true);
            });
        });
    });
});
