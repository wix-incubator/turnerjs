describe('MultipleViewerHandler', function(){
    testRequire()
        .classes('wysiwyg.editor.managers.preview.MultipleViewersHandler')
        .resources('W.Preview');
    beforeEach(function(){
        this.classLogic = new this.MultipleViewersHandler(this.W.Preview);
        this.classLogic._viewersInfo = {
            'MOBILE': {
                lastStructure: {},
                deletedComponents: {
                    getListByPage: function(){},
                    populateListByPageWithStructureDifferences: function(){},
                    updateListByPage: function(){}
                },
                siteStructureSerializer: {
                    _getSerializedStructure: function(){}
                }
            },
            'DESKTOP': {
                siteStructureSerializer: {
                    _getSerializedStructure: function(){}
                },
                isMain: true,
                deletedComponents: null,
                lastStructure: null
            }
        };
        this.deletedComponents = this.classLogic._viewersInfo['MOBILE'].deletedComponents;
        this.desktopStructureMock = {
            'masterPage': {'a':1},
            'pages':{
                'page1': {'p':1},
                'page2': {'p':2},
                'page3': {'p': 3}
            }
        };
        this.mobileStructureMock = {
            'masterPage': {'a':1},
            'pages':{
                'page1': {'p':1}
            }
        };
        this.viewersInfoObject = this.classLogic._viewersInfo;
    });
    describe('getSerializedStructure', function(){
        beforeEach(function(){
            this.viewersInfoObject['MOBILE'].lastStructure = this.mobileStructureMock;
            spyOn(this.classLogic, '_getDataResolver').andReturn({
                getSerializedPageStructureSync: jasmine.createSpy('getSerializedPageStructureSync').andCallFake(function(viewerName, pageId) {
                    var serializedPagesMock = {'page2': {'p':2}, 'page3': {'p':3}};
                    return (viewerName === 'MOBILE') ?  serializedPagesMock[pageId] : {};
                })
            });
            spyOn(this.classLogic, '_getViewerLoadedPageIds').andCallFake(function(viewerName){
                if (viewerName === 'MOBILE') {
                    return ['page1'];
                }
                return ['page1', 'page2', 'page3']
            });

        });
        describe('before mobile pages were visited', function(){
            beforeEach(function(){
                spyOn(this.viewersInfoObject['DESKTOP'].siteStructureSerializer, '_getSerializedStructure').andReturn(this.desktopStructureMock);
                spyOn(this.viewersInfoObject['MOBILE'].siteStructureSerializer, '_getSerializedStructure').andReturn(null);
            });

            it('should return the serialized pages according to those who were visited in desktop', function(){
                var res = this.classLogic.getSerializedStructure('MOBILE');

                var mobileSerializedPageIds = _.sortBy(_.keys(res.pages));
                var desktopSerializedPageIds = _.sortBy(_.keys(this.desktopStructureMock.pages));
                expect(mobileSerializedPageIds).toBeEquivalentTo(desktopSerializedPageIds);

            });
        });
        describe('after page1 was visited in mobile and then deleted in desktop', function(){
            beforeEach(function(){
                this.classLogic._deletedPages = ['page1'];
                this.desktopStructureAfterPageDeletion = _.clone(this.desktopStructureMock);
                delete this.desktopStructureAfterPageDeletion.pages['page1'];

                spyOn(this.viewersInfoObject['DESKTOP'].siteStructureSerializer, '_getSerializedStructure').andReturn(this.desktopStructureAfterPageDeletion);
                spyOn(this.viewersInfoObject['MOBILE'].siteStructureSerializer, '_getSerializedStructure').andReturn(this.mobileStructureMock);
            });

            it('should return the serialized pages, ignoring deleted pages', function(){
                var expectedResult = _.sortBy(_.keys(this.desktopStructureAfterPageDeletion.pages));

                var desktopSerializedStructure = this.classLogic.getSerializedStructure('DESKTOP');

                var actualResult = _.sortBy(_.keys(desktopSerializedStructure.pages));
                expect(actualResult).toBeEquivalentTo(expectedResult);
            });
        });
        describe('when there is no mobile structure', function(){
            beforeEach(function(){
                spyOn(this.viewersInfoObject['DESKTOP'].siteStructureSerializer, '_getSerializedStructure').andReturn(this.desktopStructureMock);
                spyOn(this.viewersInfoObject['MOBILE'].siteStructureSerializer, '_getSerializedStructure').andReturn(null);
                this.viewersInfoObject['MOBILE'].lastStructure = null;
            });
            it('should return null', function(){
                var res = this.classLogic.getSerializedStructure('MOBILE');

                expect(res).toBeNull();
            });
        });
        describe('when some of the mobile pages were loaded but no mobile page is rendered', function(){
            beforeEach(function(){
                spyOn(this.viewersInfoObject['DESKTOP'].siteStructureSerializer, '_getSerializedStructure').andReturn(this.desktopStructureMock);
                spyOn(this.viewersInfoObject['MOBILE'].siteStructureSerializer, '_getSerializedStructure').andReturn(null);
            });
            it('should return mobile lastStructure', function(){
                var res = this.classLogic.getSerializedStructure('MOBILE');

                expect(res).toBeEquivalentTo(this.viewersInfoObject['MOBILE'].lastStructure);
            });
        });
//        describe('after adding a page', function(){});
    });
    describe('_getMissingSerializedPages', function(){
        beforeEach(function(){
            this.dataResolver = {getSerializedPageStructureSync: function(){}};
            spyOn(this.classLogic, '_getDataResolver').andReturn(this.dataResolver);
        });

        describe('from mobile viewer', function(){
            describe("when there's no change in page structure", function(){
                beforeEach(function(){
                    spyOn(this.dataResolver, 'getSerializedPageStructureSync').andCallFake(function(viewerName, pageId){
                        return this.desktopStructureMock.pages[pageId];
                    }.bind(this));
                    spyOn(this.classLogic, '_getViewerLoadedPageIds').andReturn(['page1', 'page2', 'page3']);
                });
                it('should return the diff between desktopStructureMock and mobileStructureMock', function(){
                    var expectedResult = {
                        'page2': {'p':2},
                        'page3': {'p':3}
                    };

                    var res = this.classLogic._getMissingSerializedPages('MOBILE', this.mobileStructureMock);

                    expect(res).toBeEquivalentTo(expectedResult);
                });
            });
            describe("after page was added", function(){
                beforeEach(function(){
                    this.desktopStructureMock.pages['page4'] = {p:4};
                    spyOn(this.dataResolver, 'getSerializedPageStructureSync').andCallFake(function(viewerName, pageId){
                        if (pageId === 'page4') {
                            return null;
                        }
                        return this.desktopStructureMock.pages[pageId];
                    }.bind(this));
                    spyOn(this.classLogic, '_getViewerLoadedPageIds').andReturn(['page1', 'page2', 'page3']);
                });
                it("should ignore page", function(){
                    var expectedResult = {
                        'page2': {'p':2},
                        'page3': {'p':3}
                    };

                    var res = this.classLogic._getMissingSerializedPages('MOBILE', this.mobileStructureMock);

                    expect(res).toBeEquivalentTo(expectedResult);
                });
            });
            describe("after page was deleted", function(){
                beforeEach(function(){
                    delete this.desktopStructureMock.pages['page1'];
                    this.classLogic._deletedPages = ['page1'];
                    spyOn(this.dataResolver, 'getSerializedPageStructureSync').andCallFake(function(viewerName, pageId){
                        return this.desktopStructureMock.pages[pageId];
                    }.bind(this));
                    spyOn(this.classLogic, '_getViewerLoadedPageIds').andReturn(['page2', 'page3']);
                });

                it("should ignore page", function(){
                    var expectedResult = {
                        'page2': {'p':2},
                        'page3': {'p':3}
                    };

                    var res = this.classLogic._getMissingSerializedPages('MOBILE', this.mobileStructureMock);

                    expect(res).toBeEquivalentTo(expectedResult);
                });
            });
        });

        describe('from desktop viewer', function(){
            describe("when page doesn't exist in server", function(){
                beforeEach(function(){
                    delete this.desktopStructureMock.pages['page1'];
                    spyOn(this.classLogic, '_getViewerLoadedPageIds').andReturn(['page1']);
                    spyOn(this.dataResolver, 'getSerializedPageStructureSync').andReturn(null);
                });
                it("should throw an error", function(){
                    var that = this;
                    expect(function(){that.classLogic._getMissingSerializedPages('DESKTOP', that.desktopStructureMock)})
                        .toThrow('Page page1 exists in mobile structure but not in desktop');
                });
            });
        });
    });
    describe('different loaded pages between viewers', function(){
        beforeEach(function(){
            spyOn(this.classLogic, 'getSerializedStructure').andReturn({});
            spyOn(this.classLogic, '_getViewerLoadedPageIds').andCallFake(function(viewerName){
                if (viewerName === 'MOBILE') {
                    return ['page1'];
                }
                return ['page1', 'page2', 'page3']
            });
        });
        describe('page loading', function(){
            beforeEach(function(){
                spyOn(this.deletedComponents, 'populateListByPageWithStructureDifferences');
            });
            describe("page that's visited for the first time", function(){
                beforeEach(function(){
                    spyOn(this.deletedComponents, 'getListByPage').andReturn(null);
                });
                it('should update this page deleted component list', function(){
                    this.classLogic._onPageChange('page1');

                    expect(this.deletedComponents.populateListByPageWithStructureDifferences).toHaveBeenCalled();
                });
                it("should trigger 'pageChanged' event", function(){
                    this._pageChangedHandler = jasmine.createSpy('handler');
                    this.classLogic.on('pageChanged', this, this._pageChangedHandler);

                    this.classLogic._onPageChange('page1');

                    expect(this._pageChangedHandler).toHaveBeenCalled();
                });
            });
            describe("page that was already visited", function(){
                beforeEach(function(){
                    spyOn(this.deletedComponents, 'getListByPage').andReturn([]);
                });
                it('should update this page deleted component list', function(){
                    this.classLogic._onPageChange('page1');

                    expect(this.deletedComponents.populateListByPageWithStructureDifferences).not.toHaveBeenCalled();
                });
                it("should trigger 'pageChanged' event", function(){
                    this._pageChangedHandler = jasmine.createSpy('handler');
                    this.classLogic.on('pageChanged', this, this._pageChangedHandler);

                    this.classLogic._onPageChange('page1');

                    expect(this._pageChangedHandler).toHaveBeenCalled();
                });
            });
        });
        describe('getViewerModePageDeletedComponents', function(){
            beforeEach(function(){
                spyOn(this.deletedComponents, 'getListByPage').andReturn(['comp1', 'comp2']);
            });
            describe('mobile mode', function(){
                it('should return page1 hidden component list', function(){
                    var ret = this.classLogic.getViewerModePageDeletedComponents('page1', 'MOBILE');

                    expect(ret).toBeEquivalentTo(['comp1', 'comp2']);
                });
            });
            describe('desktop mode', function(){
                it('should return an empty array', function(){
                    var ret = this.classLogic.getViewerModePageDeletedComponents('page1', 'DESKTOP');

                    expect(ret).toBeEquivalentTo([]);
                });
            })
        });
        describe('component deletion', function(){
            beforeEach(function(){
                spyOn(this.deletedComponents, 'updateListByPage');
            });
            describe('mobile mode', function(){
                beforeEach(function(){
                    spyOn(this.classLogic, '_getCurrentViewerName').andReturn('MOBILE');
                });
                it('should update the deleted component list when omitDeletedListUpdate is false', function(){
                    this.compDeletionEventData = {
                        omitDeletedListUpdate: false,
                        isMasterPageComp: true,
                        componentData: {}
                    };

                    this.classLogic._onCompDeleted(this.compDeletionEventData);

                    expect(this.deletedComponents.updateListByPage).toHaveBeenCalledWith('masterPage', {});
                });
                it('should not update deleted component list when omitDeletedListUpdate is true', function(){
                    this.compDeletionEventData = {
                        omitDeletedListUpdate: true,
                        isMasterPageComp: true,
                        componentData: {}
                    };

                    this.classLogic._onCompDeleted(this.compDeletionEventData);

                    expect(this.deletedComponents.updateListByPage).not.toHaveBeenCalled();
                });
            });
            describe('desktop mode', function(){
                beforeEach(function(){
                    spyOn(this.classLogic, '_getCurrentViewerName').andReturn('DESKTOP');
                });
                it('should not update deleted component list', function(){
                    this.compDeletionEventData = {
                        omitDeletedListUpdate: false,
                        isMasterPageComp: true,
                        componentData: {}
                    };

                    this.classLogic._onCompDeleted(this.compDeletionEventData);

                    expect(this.deletedComponents.updateListByPage).not.toHaveBeenCalled();
                });
            });
        });

    });
});