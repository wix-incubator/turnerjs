describe("SecondaryViewDeletedComponentList", function(){
    testRequire()
        .classes(
            'wysiwyg.editor.managers.preview.SecondaryViewDeletedComponentList',
            'wysiwyg.editor.layoutalgorithms.LayoutAlgorithms'
        )
        .resources('W.Commands');
    beforeEach(function(){
        this.layoutAlgorithms = new this.LayoutAlgorithms();
        this._viewerName = 'MOBILE';
        this.classLogic = new this.SecondaryViewDeletedComponentList(this._viewerName, this.layoutAlgorithms);
        this.mockMap = {
            'page1': ['comp1', 'comp2'],
            'page2': ['comp5', 'comp6'],
            'masterPage': ['comp3', 'comp4']
        };
        this.classLogic._pageIdToDeletedCompsMap = this.mockMap;
        this.mainStructCompsMock = {
            'page1': ['comp1', 'comp2', 'comp7'],
            'page2': ['comp5', 'comp6', 'comp8'],
            'masterPage': ['comp3', 'comp4']
        };
        this.secondaryStructCompsMock = {
            'page1': ['comp7'],
            'page2': ['comp8'],
            'masterPage': []
        };
        this.HiddenMobileOnlyMock = {};
        this.desktopStructureMock = {
            'masterPage': {children: [{id: 'comp3'},{id: 'comp4'}]},
            'pages':{
                'page1': {components: [{id: 'comp1'}, {id: 'comp2'}, {id: 'comp7'}]},
                'page2': {components: [{id: 'comp5'}, {id: 'comp6'}, {id: 'comp8'}]}
            }
        };
        this.mobileStructureMock = {
            'masterPage': {children: [{id: 'comp3'},{id: 'comp4'}]},
            'pages':{
                'page1': {components: [{id: 'comp7'}]},
                'page2': {components: [{id: 'comp8'}]}
            }
        };    });

    describe('setMap', function(){
        beforeEach(function(){
            this.newMap = {'masterPage': []};
        });
        it('should change current saved map to be the new one', function(){
            this.classLogic.setMap(this.newMap);

            expect(this.classLogic.getMap()).toBeEquivalentTo(this.newMap);
        });
        it('should notify once about map change', function(){
            this.commandListener = jasmine.createSpy('commandListener');
            this.W.Commands.registerCommandAndListener('WEditorCommands.DeletedComponentsListUpdated', this, this.commandListener);

            this.classLogic.setMap(this.newMap);

            expect(this.commandListener).toHaveBeenCalledXTimes(1);
        });
    });
    describe('setListByPage', function(){ // what should I test here? setMap uses this functionality and it is already tested
        it('should change current map page1 entry and notify', function(){
            var newList = ['comp20'];

            this.classLogic.setListByPage('page1', newList);

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(newList);
        });
        it('should set non unique list as a unique list', function(){
            var nonUniqueList = ['comp20', 'comp20', 'comp21'];
            var uniqueList = ['comp20', 'comp21'];

            this.classLogic.setListByPage('page1', nonUniqueList);

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(uniqueList);
        });
        it('should notify once about page1 list change', function(){
            var newList = ['comp20'];
            this.commandListener = jasmine.createSpy('commandListener');
            this.W.Commands.registerCommandAndListener('WEditorCommands.DeletedComponentsListUpdated', this, this.commandListener);

            this.classLogic.setListByPage('page1', newList);

            expect(this.commandListener).toHaveBeenCalledXTimes(1);
        });
    });
    describe('getMap', function(){
        it('should return the current map', function(){
            var result = this.classLogic.getMap();

            expect(result).toBeEquivalentTo(this.mockMap);
        });
    });
    describe('getListByPage', function(){
        it('should return the current map page1 entry', function(){
            var result = this.classLogic.getListByPage('page1');

            expect(result).toBeEquivalentTo(this.mockMap['page1']);
        });
    });
    describe('updateListByPage', function(){
        beforeEach(function(){
            var comp1Data = {
                componentType: 'comp1Type',
                id: 'comp1Id',
                skin: 'comp1Skin',
                styleId: 'comp1StyleId',
                type: 'Component'
            };
            var comp2Data = {
                componentType: 'comp2Type',
                id: 'comp2Id',
                skin: 'comp2Skin',
                styleId: 'comp2StyleId',
                type: 'Component'
            };
            this.compDataListMock = [comp1Data, comp2Data];
        });
        it('should add the passed componentList to the current map page1 entry', function(){
            var expectedNewList = this.classLogic.getListByPage('page1').concat(['comp1Id', 'comp2Id']);

            this.classLogic.updateListByPage('page1', this.compDataListMock);

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(expectedNewList);
        });
    });
    describe('validateMap', function(){
        it("should set map with components existing in main but not in secondary, which aren't mobile only or not recommended", function(){
            spyOn(this.classLogic, '_getSerializedStructureComponents').andCallFake(function(structName){
                if (structName === 'main') {
                    return this.mainStructCompsMock;
                }
                return this.secondaryStructCompsMock;
            }.bind(this));
            spyOn(this.classLogic, '_getHiddenMobileOnlyComponentIdMap').andReturn(this.HiddenMobileOnlyMock);
            spyOn(this.classLogic, '_filterComponentIdListFromNotReadyForMobile');

            this.classLogic.validateMap('main', 'secondary');

            expect(this.classLogic.getMap()).toBeEquivalentTo(this.mockMap);
        });
    });
    describe('removeFromMap', function(){
        it('should remove passed components from the current map entry, according to components page', function(){
            this.classLogic.removeFromMap(['comp2']);

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(['comp1']);
        });
    });
    describe('removeFromListByPage', function(){
        it('should remove passed components from the current map page1 entry', function(){
            this.classLogic.removeFromListByPage(['comp2'], 'page1');

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(['comp1']);
        });
    });
    describe('populateMapWithStructureDifferences', function(){
        it("should set map with components existing in main but not in secondary", function(){

            this.classLogic.populateMapWithStructureDifferences(this.desktopStructureMock, this.mobileStructureMock, true);

            expect(this.classLogic.getMap()).toBeEquivalentTo(this.mockMap);
        });
    });
    describe('populateListByPageWithStructureDifferences', function(){
        it("should set page1 list with components existing in main but not in secondary", function(){
            spyOn(this.classLogic._layoutAlgorithms, 'getComponentsExistingInWebsiteButNotInMobile').andReturn(this.mockMap);

            this.classLogic.populateListByPageWithStructureDifferences('page1', this.desktopStructureMock, this.mobileStructureMock, true);

            expect(this.classLogic.getListByPage('page1')).toBeEquivalentTo(this.mockMap['page1']);
        });
    });
    describe('setLastReaddedComponent', function(){
        it('should set last readded Component', function(){
            var someCompId = '12345';
            this.classLogic.setLastReaddedComponent(someCompId);

            expect(this.classLogic._lastReaddComponent).toBe(someCompId);
        });
    });
    describe('getLastReaddedComponent', function(){
        it('should return last readded Component', function(){
            var someCompId = '12345';
            this.classLogic.setLastReaddedComponent(someCompId);

            expect(this.classLogic.getLastReaddedComponent()).toBe(someCompId);
        });
    });
});